import WasteReport from "../models/WasteReport.js";

export const getCollectorPerformance = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const dateFilter = {};
    if (startDate || endDate) {
      dateFilter.updatedAt = {};
      if (startDate) dateFilter.updatedAt.$gte = new Date(startDate);
      if (endDate) dateFilter.updatedAt.$lte = new Date(endDate);
    }

    const performanceData = await WasteReport.aggregate([
      { $match: { ...dateFilter, assignedCollector: { $exists: true, $ne: null } } }, 
      {
        $group: {
          _id: "$assignedCollector", 
          totalCompleted: {
            $sum: { $cond: [{ $eq: ["$status", "Resolved"] }, 1, 0] },
          },
          disputedCount: {
            $sum: { $cond: [{ $eq: ["$isDisputed", true] }, 1, 0] },
          },
      
        },
      },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "collectorInfo",
        },
      },
      { $unwind: "$collectorInfo" },
      {
        $project: {
          collectorId: "$_id",
          name: "$collectorInfo.name",
          email: "$collectorInfo.email",
          totalCompleted: 1,
          disputedCount: 1,
          compositeScore: {
            $subtract: [
              { $multiply: ["$totalCompleted", 10] },
              {
                $add: [
                  { $multiply: ["$disputedCount", 15] },
                ],
              },
            ],
          },
        },
      },
      { $sort: { compositeScore: -1 } },
    ]);

    res.status(200).json(performanceData);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch performance data", error: err.message });
  }
};