import WasteReport from "../models/WasteReport.js";

// Helper: generate a unique case reference like PBD-2026-00042
const generateCaseReference = async () => {
  const year = new Date().getFullYear();
  const count = await WasteReport.countDocuments();
  const padded = String(count + 1).padStart(5, "0");
  return `PBD-${year}-${padded}`;
};

// @desc    Create a new waste report
// @route   POST /api/reports
// @access  Private (citizen only)
export const createReport = async (req, res) => {
  try {
    const { category, description, location } = req.body;

    // 1. Validate required fields
    if (!category || !description || !location) {
      return res.status(400).json({
        message: "Category, description, and location are required",
      });
    }

    // location comes as a JSON string from multipart/form-data
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

    // 2. Collect uploaded image URLs from Cloudinary
    // req.files is populated by the multer middleware
    const images = req.files ? req.files.map((file) => file.path) : [];

    // 3. Generate the case reference
    const caseReference = await generateCaseReference();

    // 4. Create the report
    const report = await WasteReport.create({
      reportedBy: req.user._id,
      category,
      description,
      location: parsedLocation,
      images,
      caseReference,
    });

    res.status(201).json({
      message: "Report submitted successfully",
      report: {
        id: report._id,
        caseReference: report.caseReference,
        category: report.category,
        description: report.description,
        location: report.location,
        images: report.images,
        status: report.status,
        createdAt: report.createdAt,
      },
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};
// @desc    Get all reports by the logged-in citizen
// @route   GET /api/reports/my
// @access  Private (citizen only)
export const getMyReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({ reportedBy: req.user._id }).sort({
      createdAt: -1,
    });

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get a single report by ID
// @route   GET /api/reports/:id
// @access  Private
export const getReportById = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id).populate(
      "reportedBy",
      "name email phone",
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

    // Only the citizen who made it or an admin can view it
    if (
      report.reportedBy._id.toString() !== req.user._id.toString() &&
      req.user.role !== "admin"
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    res.status(200).json({ report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Get ALL reports (admin only)
// @route   GET /api/reports
// @access  Private (admin only)
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
