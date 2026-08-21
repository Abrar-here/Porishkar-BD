import WasteReport from "../models/WasteReport.js";

// Rough division boundaries for Bangladesh, used only to let admins
// filter the heatmap — not stored on reports directly, computed from
// coordinates on read. Approximate bounding boxes, good enough for
// filtering purposes without needing a full geocoding lookup per report.
const DIVISIONS = {
  Dhaka: { latMin: 23.4, latMax: 24.4, lngMin: 89.9, lngMax: 90.9 },
  Chittagong: { latMin: 21.0, latMax: 23.5, lngMin: 91.0, lngMax: 92.5 },
  Rajshahi: { latMin: 24.0, latMax: 25.5, lngMin: 88.0, lngMax: 89.5 },
  Khulna: { latMin: 21.5, latMax: 23.5, lngMin: 88.5, lngMax: 89.9 },
  Sylhet: { latMin: 24.0, latMax: 25.2, lngMin: 91.3, lngMax: 92.5 },
  Barisal: { latMin: 21.8, latMax: 23.2, lngMin: 89.9, lngMax: 90.9 },
  Rangpur: { latMin: 25.0, latMax: 26.5, lngMin: 88.5, lngMax: 89.9 },
  Mymensingh: { latMin: 24.3, latMax: 25.5, lngMin: 89.9, lngMax: 91.0 },
};

const getDivisionForPoint = (lat, lng) => {
  for (const [name, box] of Object.entries(DIVISIONS)) {
    if (
      lat >= box.latMin &&
      lat <= box.latMax &&
      lng >= box.lngMin &&
      lng <= box.lngMax
    ) {
      return name;
    }
  }
  return "Unknown";
};

// @desc    Heatmap points for all citizen-reported issues. Public —
//          no auth required, matches "publicly accessible" in the doc.
//          Optional filters (admin-only on the frontend) narrow by
//          division and time window.
// @route   GET /api/heatmap/points
// @access  Public
export const getHeatmapPoints = async (req, res) => {
  try {
    const { division, days } = req.query;

    const filter = {};

    if (days) {
      const since = new Date();
      since.setDate(since.getDate() - parseInt(days, 10));
      filter.createdAt = { $gte: since };
    }

    // Only lat/lng/status needed — no personal data goes into a
    // publicly accessible response.
    let reports = await WasteReport.find(filter).select(
      "location status createdAt",
    );

    if (division) {
      reports = reports.filter(
        (r) => getDivisionForPoint(r.location.lat, r.location.lng) === division,
      );
    }

    const points = reports.map((r) => ({
      lat: r.location.lat,
      lng: r.location.lng,
      // Unresolved reports weigh more heavily in the heatmap, since
      // they represent active problems, not closed cases.
      intensity: ["Resolved", "Closed", "Cancelled"].includes(r.status)
        ? 0.4
        : 1,
    }));

    res.status(200).json({
      points,
      totalPoints: points.length,
      availableDivisions: Object.keys(DIVISIONS),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Detect hotspot clusters — geographic areas with more than 5
//          unresolved reports within 500m over the last 30 days.
//          Matches the doc's escalation-trigger logic, surfaced here
//          as read-only info rather than an actual alert dispatch
//          (which would need a notifications system).
// @route   GET /api/heatmap/hotspots
// @access  Private (admin)
export const getHotspots = async (req, res) => {
  try {
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const unresolvedStatuses = [
      "Reported",
      "Assigned",
      "Collector En Route",
      "Cleanup In Progress",
    ];

    const reports = await WasteReport.find({
      status: { $in: unresolvedStatuses },
      createdAt: { $gte: thirtyDaysAgo },
    }).select("location caseReference category createdAt");

    // Same Haversine helper used elsewhere in the platform.
    const calculateDistance = (lat1, lng1, lat2, lng2) => {
      const R = 6371;
      const dLat = ((lat2 - lat1) * Math.PI) / 180;
      const dLng = ((lng2 - lng1) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) ** 2 +
        Math.cos((lat1 * Math.PI) / 180) *
          Math.cos((lat2 * Math.PI) / 180) *
          Math.sin(dLng / 2) ** 2;
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c * 1000; // meters
    };

    const hotspots = [];
    const checked = new Set();

    for (const report of reports) {
      if (checked.has(report._id.toString())) continue;

      const nearby = reports.filter(
        (r) =>
          calculateDistance(
            report.location.lat,
            report.location.lng,
            r.location.lat,
            r.location.lng,
          ) <= 500,
      );

      if (nearby.length > 5) {
        nearby.forEach((r) => checked.add(r._id.toString()));
        hotspots.push({
          centerLat: report.location.lat,
          centerLng: report.location.lng,
          reportCount: nearby.length,
          caseReferences: nearby.map((r) => r.caseReference),
        });
      }
    }

    res.status(200).json({ hotspots, thresholdMet: hotspots.length > 0 });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Escalate a cluster of reports — marks them as priority so
//          they surface elsewhere in the admin tooling (routes, report
//          lists). This is the concrete action an admin takes in
//          response to seeing a hotspot, closing the loop on the
//          doc's "escalation alert" requirement.
// @route   PUT /api/heatmap/escalate
// @access  Private (admin)
export const escalateCluster = async (req, res) => {
  try {
    const { caseReferences } = req.body;

    if (!Array.isArray(caseReferences) || caseReferences.length === 0) {
      return res.status(400).json({
        message: "caseReferences must be a non-empty array",
      });
    }

    const result = await WasteReport.updateMany(
      { caseReference: { $in: caseReferences } },
      { isPriority: true },
    );

    res.status(200).json({
      message: `${result.modifiedCount} report(s) marked as priority`,
      modifiedCount: result.modifiedCount,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
