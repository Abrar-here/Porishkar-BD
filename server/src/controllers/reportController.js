import WasteReport from "../models/WasteReport.js";
import Counter from "../models/Counter.js";
import { sendSms } from "../services/smsService.js";
import { awardPoints } from "../services/ecoPointsService.js";
import User from "../models/User.js";
import {
  calculatePriority,
  NEARBY_RADIUS_KM,
  UNRESOLVED_STATUSES,
} from "../services/priorityService.js";
import { notifyUser, ALERT_TYPES } from "../services/notificationService.js";
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

const isWithinFourHourCutoff = (pickupDate) => {
  if (!pickupDate) return true;
  const pickupTime = new Date(pickupDate).getTime();
  const now = Date.now();
  return pickupTime - now < FOUR_HOURS_MS;
};

// Atomically increments a per-year counter, so numbers never repeat —
// even if reports get deleted or two reports are created at the same instant.
const generateCaseReference = async () => {
  const year = new Date().getFullYear();
  const counterId = `caseReference-${year}`;

  let counter = await Counter.findById(counterId);
  if (!counter) {
    // First time this counter is used — seed it from the highest existing
    // caseReference for this year so we don't repeat numbers already in use.
    const prefix = `PBD-${year}-`;
    const latest = await WasteReport.findOne({
      caseReference: { $regex: `^${prefix}` },
    }).sort({ caseReference: -1 });

    const startSeq = latest
      ? parseInt(latest.caseReference.slice(prefix.length), 10) || 0
      : 0;

    // Atomic upsert — safe even if two requests race to seed at once.
    await Counter.findOneAndUpdate(
      { _id: counterId },
      { $setOnInsert: { seq: startSeq } },
      { upsert: true },
    );
  }

  counter = await Counter.findOneAndUpdate(
    { _id: counterId },
    { $inc: { seq: 1 } },
    { new: true },
  );

  const padded = String(counter.seq).padStart(5, "0");
  return `PBD-${year}-${padded}`;
};

// ─── F02: counts unresolved reports within NEARBY_RADIUS_KM of a point.
// Reuses the same Haversine distance function already defined below in
// this file for route optimization (calculateDistance) — no new
// geospatial index needed since report volumes are small.
const countNearbyUnresolvedReports = async (lat, lng) => {
  const candidates = await WasteReport.find({
    status: { $in: UNRESOLVED_STATUSES },
    "location.lat": { $exists: true },
    "location.lng": { $exists: true },
  }).select("location");

  return candidates.filter(
    (r) =>
      calculateDistance(lat, lng, r.location.lat, r.location.lng) <=
      NEARBY_RADIUS_KM,
  ).length;
};

// ─── F01: no pickupDate/pickupTime needed ──────────────────
export const createReport = async (req, res) => {
  try {
    const { category, description, location, estimatedVolume } = req.body;

    if (!category || !description || !location) {
      return res.status(400).json({
        message: "Category, description, and location are required",
      });
    }

    let parsedLocation;
    try {
      parsedLocation =
        typeof location === "string" ? JSON.parse(location) : location;
    } catch {
      return res.status(400).json({ message: "Invalid location format" });
    }

    if (!parsedLocation.lat || !parsedLocation.lng || !parsedLocation.address) {
      return res.status(400).json({
        message: "Location must include lat, lng, and address",
      });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];
    const caseReference = await generateCaseReference();

    // F02: work out how urgent this report is before saving it
    const volume = ["Small", "Medium", "Large"].includes(estimatedVolume)
      ? estimatedVolume
      : "Medium";
    const nearbyCount = await countNearbyUnresolvedReports(
      parsedLocation.lat,
      parsedLocation.lng,
    );
    const { priority } = calculatePriority({
      category,
      estimatedVolume: volume,
      nearbyCount,
    });

    const report = await WasteReport.create({
      reportedBy: req.user._id,
      category,
      description,
      location: parsedLocation,
      images,
      caseReference,
      estimatedVolume: volume,
      priority,
      priorityHistory: [{ priority, changedBy: "system" }],
    });

    let ecoPointsResult = null;
    try {
      ecoPointsResult = await awardPoints(req.user._id, "report_waste");
    } catch (pointsError) {
      console.error("Eco points award failed:", pointsError.message);
    }

    res.status(201).json({
      message: "Report submitted successfully",
      ecoPoints: ecoPointsResult
        ? {
            pointsEarned: ecoPointsResult.activity.points,
            newBalance: ecoPointsResult.newBalance,
          }
        : null,
      report: {
        id: report._id,
        caseReference: report.caseReference,
        category: report.category,
        description: report.description,
        location: report.location,
        images: report.images,
        status: report.status,
        estimatedVolume: report.estimatedVolume,
        priority: report.priority,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// ─── F05: requires pickupDate/pickupTime ──────────────────
export const createPickupRequest = async (req, res) => {
  try {
    const { category, description, location, pickupDate, pickupTime, estimatedVolume } =
      req.body;

    if (!category || !description || !location || !pickupDate || !pickupTime) {
      return res.status(400).json({
        message:
          "Category, description, location, pickup date, and pickup time are required.",
      });
    }

    let parsedLocation;
    try {
      parsedLocation =
        typeof location === "string" ? JSON.parse(location) : location;
    } catch {
      return res.status(400).json({ message: "Invalid location format" });
    }

    if (!parsedLocation.lat || !parsedLocation.lng || !parsedLocation.address) {
      return res.status(400).json({
        message: "Location must include lat, lng, and address",
      });
    }

    const parsedPickupDate = new Date(pickupDate);
    if (isNaN(parsedPickupDate.getTime())) {
      return res.status(400).json({ message: "Invalid pickup date format." });
    }

    if (isWithinFourHourCutoff(parsedPickupDate)) {
      return res.status(400).json({
        message: "Pickups must be scheduled at least 4 hours in advance.",
      });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];
    const caseReference = await generateCaseReference();

    // F02: same priority calculation as F01's createReport
    const volume = ["Small", "Medium", "Large"].includes(estimatedVolume)
      ? estimatedVolume
      : "Medium";
    const nearbyCount = await countNearbyUnresolvedReports(
      parsedLocation.lat,
      parsedLocation.lng,
    );
    const { priority } = calculatePriority({
      category,
      estimatedVolume: volume,
      nearbyCount,
    });

    const report = await WasteReport.create({
      reportedBy: req.user._id,
      category,
      description,
      location: parsedLocation,
      images,
      caseReference,
      pickupDate: parsedPickupDate,
      pickupTime,
      estimatedVolume: volume,
      priority,
      priorityHistory: [{ priority, changedBy: "system" }],
    });

    const smsMessage = `Booking confirmed! Your pickup (Ref: ${caseReference}) is scheduled for ${parsedPickupDate.toDateString()} at ${pickupTime}.`;
    try {
      await sendSms(req.user.phone, smsMessage);
    } catch (smsError) {
      console.error("Booking confirmation SMS failed:", smsError.message);
    }

    // F15: pickup confirmation notification (in-app + email)
    try {
      await notifyUser(req.user._id, ALERT_TYPES.PICKUP_CONFIRMATION, {
        title: "Pickup booking confirmed",
        message: `Your pickup (Ref: ${caseReference}) is scheduled for ${parsedPickupDate.toDateString()} at ${pickupTime}.`,
        link: "/my-reports",
        emailHtml: `<h2>Booking confirmed</h2><p>Your pickup (Ref: <strong>${caseReference}</strong>) is scheduled for <strong>${parsedPickupDate.toDateString()} at ${pickupTime}</strong>.</p>`,
      });
    } catch (notifyError) {
      console.error("Pickup confirmation notification failed:", notifyError.message);
    }

    let ecoPointsResult = null;
    try {
      ecoPointsResult = await awardPoints(req.user._id, "report_waste");
    } catch (pointsError) {
      console.error("Eco points award failed:", pointsError.message);
    }

    res.status(201).json({
      message: "Report submitted successfully",
      smsPreview: smsMessage,
      ecoPoints: ecoPointsResult
        ? {
            pointsEarned: ecoPointsResult.activity.points,
            newBalance: ecoPointsResult.newBalance,
          }
        : null,
      report: {
        id: report._id,
        caseReference: report.caseReference,
        category: report.category,
        description: report.description,
        location: report.location,
        images: report.images,
        status: report.status,
        pickupDate: report.pickupDate,
        pickupTime: report.pickupTime,
        estimatedVolume: report.estimatedVolume,
        priority: report.priority,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getMyReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({
      reportedBy: req.user._id,
    }).sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAllReports = async (req, res) => {
  try {
    const reports = await WasteReport.find()
      .populate("reportedBy", "name email")
      .sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const cancelReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Pickup request not found." });
    if (report.reportedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized action." });
    if (["Closed", "Cancelled", "Completed"].includes(report.status))
      return res.status(400).json({
        message: `Cannot cancel a report that is already ${report.status.toLowerCase()}.`,
      });
    if (isWithinFourHourCutoff(report.pickupDate))
      return res.status(400).json({
        message:
          "Action locked: Bookings can only be canceled up to 4 hours prior to the scheduled pickup window.",
      });
    report.status = "Cancelled";
    await report.save();
    res.status(200).json({
      message: "Pickup canceled successfully without penalty",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const rescheduleReport = async (req, res) => {
  try {
    const newDate =
      req.body.newDate || req.body.pickupDate || req.body.scheduledDate;
    const newTime = req.body.pickupTime || req.body.newTime;
    if (!newDate)
      return res.status(400).json({ message: "New pickup date is required." });
    const report = await WasteReport.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Pickup request not found." });
    if (report.reportedBy.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Unauthorized action." });
    if (["Closed", "Cancelled", "Completed"].includes(report.status))
      return res.status(400).json({
        message: `Cannot reschedule a report that is already ${report.status.toLowerCase()}.`,
      });
    if (isWithinFourHourCutoff(report.pickupDate))
      return res.status(400).json({
        message:
          "Action locked: Bookings can only be rescheduled up to 4 hours prior to the scheduled pickup window.",
      });
    if (isWithinFourHourCutoff(newDate))
      return res.status(400).json({
        message:
          "Invalid date: The new pickup date must be at least 4 hours from now.",
      });
    report.pickupDate = new Date(newDate);
    if (newTime) report.pickupTime = newTime;
    await report.save();
    res
      .status(200)
      .json({ message: "Pickup rescheduled successfully", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getReportById = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id).populate(
      "reportedBy",
      "name email phone",
    );
    if (!report) return res.status(404).json({ message: "Report not found" });
    if (
      report.reportedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    )
      return res.status(403).json({ message: "Not authorized" });
    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAvailableReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({ status: "Reported" })
      .populate("reportedBy", "name phone email")
      .sort({ createdAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const acceptReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);
    if (!report)
      return res.status(404).json({ message: "Pickup request not found." });
    if (report.status !== "Reported")
      return res
        .status(400)
        .json({ message: "This request is no longer available." });
    report.status = "Assigned";
    report.assignedCollector = req.user._id;
    await report.save();

    // F15: two separate notifications — the collector gets a "new
    // assignment" ping, the citizen gets a "status update"
    try {
      await notifyUser(req.user._id, ALERT_TYPES.NEW_ASSIGNMENT, {
        title: "New pickup assigned to you",
        message: `You've been assigned pickup ${report.caseReference}.`,
        link: "/dashboard?tab=assigned",
      });
      await notifyUser(report.reportedBy, ALERT_TYPES.REPORT_STATUS_UPDATE, {
        title: "Your report has been assigned",
        message: `A collector has been assigned to your report ${report.caseReference}.`,
        link: "/my-reports",
      });
    } catch (notifyError) {
      console.error("Assignment notification failed:", notifyError.message);
    }

    res
      .status(200)
      .json({ message: "Pickup assigned to you successfully!", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAssignedReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({ assignedCollector: req.user._id })
      .populate("reportedBy", "name phone email")
      .sort({ updatedAt: -1 });
    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//Maisara : F08
// Controller function to complete pickup with proof
export const completePickupWithProof = async (req, res) => {
  try {
    const { reportId } = req.params;
    const { latitude, longitude } = req.body;

    if (!req.file) {
      return res
        .status(400)
        .json({ message: "Proof photo is required to complete the pickup." });
    }

    const report = await WasteReport.findById(reportId);
    if (!report) {
      return res
        .status(404)
        .json({ message: "Report/Pickup request not found." });
    }

    // Save proof details
    report.proofOfCollection = {
      imageUrl: req.file.path, // Cloudinary secure URL
      uploadedAt: new Date(),
      location: {
        latitude: latitude ? parseFloat(latitude) : null,
        longitude: longitude ? parseFloat(longitude) : null,
      },
    };

        report.status = "Resolved"; // or "Resolved" depending on your app standard
    await report.save();

    // F15: let the citizen know their report was resolved. The eco
    // points credit below triggers its own separate notification.
    try {
      await notifyUser(report.reportedBy, ALERT_TYPES.REPORT_STATUS_UPDATE, {
        title: "Your pickup has been completed",
        message: `Report ${report.caseReference} has been marked resolved, with photo proof of collection.`,
        link: "/my-reports",
      });
    } catch (notifyError) {
      console.error("Completion notification failed:", notifyError.message);
    }

    // Eco points go to the CITIZEN who requested the pickup, not the
    // collector — the collector is only the one triggering the event.
    let ecoPointsResult = null;
    try {
      ecoPointsResult = await awardPoints(report.reportedBy, "complete_pickup");
    } catch (pointsError) {
      console.error("Eco points award failed:", pointsError.message);
    }

    res.status(200).json({
      message: "Pickup completed successfully with proof of collection.",
      report,
      citizenEcoPoints: ecoPointsResult
        ? {
            pointsEarned: ecoPointsResult.activity.points,
            newBalance: ecoPointsResult.newBalance,
          }
        : null,
    });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to upload proof.", error: error.message });
  }
};

// 1. Citizen raises dispute within 24h
export const raiseDispute = async (req, res) => {
  try {
    const { reason } = req.body;
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    if (!report.proofOfCollection?.imageUrl && report.status !== "Completed") {
      return res
        .status(400)
        .json({ message: "Cannot dispute a report without completion proof." });
    }

    // Check 24-hour limit
    const uploadedAt = new Date(
      report.proofOfCollection?.uploadedAt || report.updatedAt,
    ).getTime();
    const TWENTY_FOUR_HOURS = 24 * 60 * 60 * 1000;

    if (Date.now() - uploadedAt > TWENTY_FOUR_HOURS) {
      return res.status(400).json({
        message:
          "Dispute window closed. Disputes must be filed within 24 hours of completion.",
      });
    }

    report.isDisputed = true;
    report.status = "Under Investigation"; // Locks the case
    report.disputeDetails = {
      reason: reason || "Citizen disputed completion proof.",
      raisedAt: new Date(),
      status: "Under Investigation",
    };

    await report.save();
    return res
      .status(200)
      .json({ message: "Dispute submitted successfully.", report });
  } catch (err) {
    return res
      .status(500)
      .json({ message: "Error filing dispute: " + err.message });
  }
};

// 2. Admin fetch case details + Collector's Contact Info (F08)
export const getInvestigationDetails = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id)
      .populate("reportedBy", "name email phone")
      .populate("assignedCollector", "name email phone");

    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    return res.status(200).json({
      report,
      proofOfCollection: report.proofOfCollection,
      collectorInfo: report.assignedCollector
        ? {
            name: report.assignedCollector.name,
            email: report.assignedCollector.email,
            phone: report.assignedCollector.phone,
          }
        : null,
    });
  } catch (err) {
    return res.status(500).json({
      message: "Failed to fetch investigation details: " + err.message,
    });
  }
};

// ─── F06: Route Optimisation ──────────────────────────────

// Same Haversine formula used in F12's centreController — distance in
// km between two lat/lng points.
const calculateDistance = (lat1, lng1, lat2, lng2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

// Helper: greedy nearest-neighbor ordering. If a starting point is
// given (the collector's current location), the first stop chosen is
// whichever is nearest to that point — otherwise falls back to
// whatever order the stops array arrived in. Not a perfect "optimal
// route" (that's the Traveling Salesman Problem) — a simple, fast
// approximation, matching the doc's "grouping geographically adjacent
// pickups to minimise total travel distance."
const nearestNeighborOrder = (stops, startPoint = null) => {
  if (stops.length <= 1) return stops;

  const remaining = [...stops];
  let ordered;

  if (startPoint) {
    // Find whichever stop is nearest to the collector's actual
    // location, and start there instead of an arbitrary first entry.
    let nearestIndex = 0;
    let nearestDist = Infinity;
    remaining.forEach((stop, i) => {
      const dist = calculateDistance(
        startPoint.lat,
        startPoint.lng,
        stop.location.lat,
        stop.location.lng,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });
    ordered = [remaining.splice(nearestIndex, 1)[0]];
  } else {
    ordered = [remaining.shift()];
  }

  while (remaining.length > 0) {
    const last = ordered[ordered.length - 1];
    let nearestIndex = 0;
    let nearestDist = Infinity;

    remaining.forEach((stop, i) => {
      const dist = calculateDistance(
        last.location.lat,
        last.location.lng,
        stop.location.lat,
        stop.location.lng,
      );
      if (dist < nearestDist) {
        nearestDist = dist;
        nearestIndex = i;
      }
    });

    ordered.push(remaining.splice(nearestIndex, 1)[0]);
  }

  return ordered;
};

// @desc    Get a collector's route (their active, unresolved stops,
//          in sequence). Callable by the collector themselves or by
//          an admin/supervisor viewing any collector's route.
// @route   GET /api/reports/route/:collectorId
// @access  Private (collector viewing own route, or admin)
export const getCollectorRoute = async (req, res) => {
  try {
    const { collectorId } = req.params;

    // A collector may only view their own route; an admin may view any.
    if (
      req.user.role === "collector" &&
      req.user._id.toString() !== collectorId
    ) {
      return res.status(403).json({
        message: "Collectors can only view their own route",
      });
    }

    // Only stops that are still actionable belong on today's route —
    // resolved/cancelled/closed pickups are done, not part of the plan.
    const activeStatuses = [
      "Assigned",
      "Collector En Route",
      "Cleanup In Progress",
    ];

    const stops = await WasteReport.find({
      assignedCollector: collectorId,
      status: { $in: activeStatuses },
    }).populate("reportedBy", "name phone");

    // Fetch the collector's most recently reported location, if any —
    // used as the starting point for nearest-neighbor ordering instead
    // of an arbitrary database order.
    const collectorUser =
      await User.findById(collectorId).select("currentLocation");
    const startPoint =
      collectorUser?.currentLocation?.lat != null
        ? collectorUser.currentLocation
        : null;

    // Split into stops with a manual order already set (from a prior
    // supervisor reorder) and stops without one yet.
    const withOrder = stops
      .filter((s) => s.routeOrder !== null)
      .sort((a, b) => a.routeOrder - b.routeOrder);

    const withoutOrder = nearestNeighborOrder(
      stops.filter((s) => s.routeOrder === null),
      startPoint,
    );

    // Manually-ordered stops come first (a supervisor's explicit
    // sequencing takes priority), then the rest fall in behind using
    // the nearest-neighbor grouping.
    // Manually-ordered stops come first (a supervisor's explicit
    // sequencing takes priority), then the rest fall in behind using
    // the nearest-neighbor grouping.
    const route = [...withOrder, ...withoutOrder];

    // Total distance a collector would travel visiting these stops in
    // this exact order — lets an admin judge whether a manual reorder
    // actually helped or hurt, instead of guessing.
    let totalDistanceKm = 0;
    for (let i = 0; i < route.length - 1; i++) {
      totalDistanceKm += calculateDistance(
        route[i].location.lat,
        route[i].location.lng,
        route[i + 1].location.lat,
        route[i + 1].location.lng,
      );
    }

    res.status(200).json({
      route,
      totalDistanceKm: parseFloat(totalDistanceKm.toFixed(2)),
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Supervisor manually reorders a collector's stops.
//          Accepts an ordered array of report IDs and persists that
//          exact sequence.
// @route   PUT /api/reports/route/:collectorId/reorder
// @access  Private (admin)
export const reorderRoute = async (req, res) => {
  try {
    const { collectorId } = req.params;
    const { orderedReportIds } = req.body;

    if (!Array.isArray(orderedReportIds) || orderedReportIds.length === 0) {
      return res.status(400).json({
        message: "orderedReportIds must be a non-empty array of report IDs",
      });
    }

    // Confirm every ID in the list actually belongs to this collector,
    // so a supervisor can't accidentally (or maliciously) reorder
    // someone else's report into this collector's route.
    const reports = await WasteReport.find({
      _id: { $in: orderedReportIds },
      assignedCollector: collectorId,
    });

    if (reports.length !== orderedReportIds.length) {
      return res.status(400).json({
        message:
          "One or more report IDs do not belong to this collector's assigned stops",
      });
    }

        // Assign sequence positions in the order the supervisor specified.
    await Promise.all(
      orderedReportIds.map((reportId, index) =>
        WasteReport.findByIdAndUpdate(reportId, { routeOrder: index }),
      ),
    );

    // F15: let the collector know their route just changed
    try {
      await notifyUser(collectorId, ALERT_TYPES.ROUTE_UPDATE, {
        title: "Your route has been updated",
        message: `Your pickup order for ${orderedReportIds.length} stop(s) has been reorganized by an admin.`,
        link: "/dashboard?tab=assigned",
      });
    } catch (notifyError) {
      console.error("Route update notification failed:", notifyError.message);
    }

    res.status(200).json({ message: "Route reordered successfully" });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Clear a collector's manual route ordering, letting the
//          nearest-neighbor algorithm take over again on next fetch.
// @route   PUT /api/reports/route/:collectorId/reset
// @access  Private (admin)
export const resetRouteOrder = async (req, res) => {
  try {
    const { collectorId } = req.params;

    const activeStatuses = [
      "Assigned",
      "Collector En Route",
      "Cleanup In Progress",
    ];

    await WasteReport.updateMany(
      {
        assignedCollector: collectorId,
        status: { $in: activeStatuses },
      },
      { routeOrder: null },
    );

    res.status(200).json({
      message: "Route reset — the suggested order will be used again",
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Admin manually overrides a report's system-suggested priority.
//          Every override is appended to priorityHistory for a permanent
//          record of who changed it, from what, to what, and why.
// @route   PUT /api/reports/:id/priority
// @access  Private (admin)
export const overridePriority = async (req, res) => {
  try {
    const { priority, reason } = req.body;
    const validPriorities = ["Low", "Medium", "High", "Critical"];

    if (!priority || !validPriorities.includes(priority)) {
      return res.status(400).json({
        message: `priority must be one of: ${validPriorities.join(", ")}`,
      });
    }

    const report = await WasteReport.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    report.priority = priority;
    report.priorityOverridden = true;
    report.priorityHistory.push({
      priority,
      changedBy: "admin",
      admin: req.user._id,
      reason: reason || "",
    });

    await report.save();

    res.status(200).json({
      message: "Priority updated successfully",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get all reports for the admin priority queue, Critical first.
//          Reuses getAllReports' data but sorts by urgency instead of
//          just creation date.
// @route   GET /api/reports/priority-queue
// @access  Private (admin)
export const getPriorityQueue = async (req, res) => {
  try {
    const priorityOrder = { Critical: 0, High: 1, Medium: 2, Low: 3 };

    const reports = await WasteReport.find()
      .populate("reportedBy", "name email phone")
      .sort({ createdAt: -1 });

    // Sort in JS rather than the database — the priority order isn't
    // alphabetical, and the report volume here is small enough that
    // this is simpler than a $addFields/$switch aggregation.
    reports.sort(
      (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority],
    );

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

//F07: Maisara
export const updateCollectorLocation = async (req, res) => {
  try {
    const { lat, lng, status } = req.body;

    const updateData = {
      "collectorLocation.lat": lat,
      "collectorLocation.lng": lng,
      "collectorLocation.updatedAt": new Date(),
    };

    if (status) {
      updateData.status = status;
    }

    const report = await WasteReport.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    res.status(200).json({ success: true, report });
  } catch (error) {
    res.status(500).json({ message: "Error updating location", error: error.message });
  }
};
