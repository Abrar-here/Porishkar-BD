import WasteReport from "../models/WasteReport.js";
import Listing from "../models/Listing.js";
import PointActivity from "../models/PointActivity.js";

// Groups a date field into day/week/month buckets for a bar/line chart.
// Uses MongoDB's own date operators so the grouping happens in the
// database, not by pulling every document into Node and looping.
const buildDateGrouping = (granularity, dateField) => {
  switch (granularity) {
    case "week":
      // ISO week number + year, so weeks don't collide across years
      return {
        year: { $isoWeekYear: `$${dateField}` },
        week: { $isoWeek: `$${dateField}` },
      };
    case "month":
      return {
        year: { $year: `$${dateField}` },
        month: { $month: `$${dateField}` },
      };
    case "day":
    default:
      return {
        year: { $year: `$${dateField}` },
        month: { $month: `$${dateField}` },
        day: { $dayOfMonth: `$${dateField}` },
      };
  }
};

// Parses ?startDate=YYYY-MM-DD&endDate=YYYY-MM-DD from the query string
// into a Mongo-friendly date range filter. Defaults to "all time" if
// either is missing, rather than rejecting the request.
const parseDateRange = (req) => {
  const { startDate, endDate } = req.query;
  const filter = {};
  if (startDate) filter.$gte = new Date(startDate);
  if (endDate) {
    const end = new Date(endDate);
    end.setHours(23, 59, 59, 999); // include the whole end day
    filter.$lte = end;
  }
  return Object.keys(filter).length > 0 ? filter : null;
};

// @desc    Platform-wide analytics summary for the admin dashboard,
//          filterable by an optional date range.
// @route   GET /api/analytics/summary
// @access  Private (admin)
export const getAnalyticsSummary = async (req, res) => {
  try {
    const { granularity = "day" } = req.query;
    const dateRange = parseDateRange(req);

    const reportDateFilter = dateRange ? { createdAt: dateRange } : {};
    const listingDateFilter = dateRange ? { createdAt: dateRange } : {};
    const pointDateFilter = dateRange ? { createdAt: dateRange } : {};

    // ── Stat summary row ─────────────────────────────
    const [totalReports, resolvedReports, activeListings, totalPointsIssued] =
      await Promise.all([
        WasteReport.countDocuments(reportDateFilter),
        WasteReport.countDocuments({
          ...reportDateFilter,
          status: { $in: ["Resolved", "Closed"] },
        }),
        Listing.countDocuments({ ...listingDateFilter, status: "Active" }),
        PointActivity.aggregate([
          { $match: pointDateFilter },
          { $group: { _id: null, total: { $sum: "$points" } } },
        ]),
      ]);

    // ── Reports over time (bar chart) ────────────────
    const reportsOverTime = await WasteReport.aggregate([
      { $match: reportDateFilter },
      {
        $group: {
          _id: buildDateGrouping(granularity, "createdAt"),
          count: { $sum: 1 },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    // ── Collection completion rate over time (line chart) ────
    // For each time bucket: what fraction of reports created in that
    // bucket ended up Resolved/Closed.
    const completionOverTime = await WasteReport.aggregate([
      { $match: reportDateFilter },
      {
        $group: {
          _id: buildDateGrouping(granularity, "createdAt"),
          total: { $sum: 1 },
          resolved: {
            $sum: {
              $cond: [{ $in: ["$status", ["Resolved", "Closed"]] }, 1, 0],
            },
          },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1, "_id.day": 1, "_id.week": 1 } },
    ]);

    // ── Recycling listings by material type (doughnut chart) ────
    const listingsByMaterial = await Listing.aggregate([
      { $match: listingDateFilter },
      { $group: { _id: "$materialType", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    // ── Eco points issued by activity type (bar chart) ────
    // Labeled honestly — this platform doesn't yet have a redemption
    // feature, so this shows what's actually being earned, not
    // "issued vs redeemed."
    const pointsByActivity = await PointActivity.aggregate([
      { $match: pointDateFilter },
      {
        $group: {
          _id: "$activityType",
          totalPoints: { $sum: "$points" },
          count: { $sum: 1 },
        },
      },
      { $sort: { totalPoints: -1 } },
    ]);

    res.status(200).json({
      summary: {
        totalReports,
        resolvedReports,
        activeListings,
        totalPointsIssued: totalPointsIssued[0]?.total || 0,
      },
      reportsOverTime,
      completionOverTime,
      listingsByMaterial,
      pointsByActivity,
      granularity,
      dateRange: dateRange || null,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Export the currently-filtered analytics summary as a CSV
//          file, for government reporting or external analysis.
// @route   GET /api/analytics/export
// @access  Private (admin)
export const exportAnalyticsCsv = async (req, res) => {
  try {
    const dateRange = parseDateRange(req);
    const reportDateFilter = dateRange ? { createdAt: dateRange } : {};

    const [totalReports, resolvedReports, byCategory] = await Promise.all([
      WasteReport.countDocuments(reportDateFilter),
      WasteReport.countDocuments({
        ...reportDateFilter,
        status: { $in: ["Resolved", "Closed"] },
      }),
      WasteReport.aggregate([
        { $match: reportDateFilter },
        { $group: { _id: "$category", count: { $sum: 1 } } },
      ]),
    ]);

    const rows = [
      ["Metric", "Value"],
      ["Total Reports", totalReports],
      ["Resolved Reports", resolvedReports],
      [
        "Completion Rate",
        totalReports > 0
          ? `${((resolvedReports / totalReports) * 100).toFixed(1)}%`
          : "N/A",
      ],
      [],
      ["Category", "Count"],
      ...byCategory.map((c) => [c._id, c.count]),
    ];

    const csv = rows.map((row) => row.join(",")).join("\n");

    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="analytics-summary-${new Date().toISOString().slice(0, 10)}.csv"`,
    );
    res.status(200).send(csv);
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
