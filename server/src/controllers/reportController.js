import WasteReport from "../models/WasteReport.js";
import { sendSms } from "../services/smsService.js";

// 4 hours in milliseconds
const FOUR_HOURS_MS = 4 * 60 * 60 * 1000;

/**
 * Helper: Checks if the report is locked (less than 4 hours until pickup date)
 * @param {Date|string} pickupDate 
 * @returns {boolean} true if locked (cannot modify), false if eligible
 */
const isWithinFourHourCutoff = (pickupDate) => {
  if (!pickupDate) return true;
  const pickupTime = new Date(pickupDate).getTime();
  const now = Date.now();
  // Locked if time remaining is strictly less than 4 hours (or already past)
  return (pickupTime - now) < FOUR_HOURS_MS;
};

/**
 * Helper: generate a unique case reference scoped to the current year
 * Example: PBD-2026-00042
 *
 * Uses the highest existing reference number for the year (not a raw count),
 * so it stays correct even with seeded data, deleted reports, or numbers
 * that don't perfectly match creation order.
 */
const generateCaseReference = async () => {
  const year = new Date().getFullYear();
  const prefix = `PBD-${year}-`;

  const lastReport = await WasteReport.findOne({
    caseReference: { $regex: `^${prefix}` },
  }).sort({ caseReference: -1 });

  let nextNumber = 1;
  if (lastReport) {
    const lastNumber = parseInt(lastReport.caseReference.split("-").pop(), 10);
    if (!isNaN(lastNumber)) {
      nextNumber = lastNumber + 1;
    }
  }

  const padded = String(nextNumber).padStart(5, "0");
  return `${prefix}${padded}`;
};

// @desc    Create a new waste report
// @route   POST /api/reports
// @access  Private (citizen only)
export const createReport = async (req, res) => {
  try {
    const { category, description, location, pickupDate, pickupTime } = req.body;

    if (!category || !description || !location || !pickupDate || !pickupTime) {
      return res.status(400).json({
        message: "Category, description, location, pickup date, and pickup time are required.",
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

    // Parse and validate the selected pickup date & time
    const parsedPickupDate = new Date(pickupDate);
    if (isNaN(parsedPickupDate.getTime())) {
      return res.status(400).json({ message: "Invalid pickup date format provided." });
    }

    // Guard: Block creation if the requested slot is inside the 4-hour window
    if (isWithinFourHourCutoff(parsedPickupDate)) {
      return res.status(400).json({
        message: "Pickups must be scheduled at least 4 hours in advance.",
      });
    }

    const images = req.files ? req.files.map((file) => file.path) : [];

    // Retry a few times in the rare case two people submit at the exact
    // same instant and land on the same generated reference (E11000).
    let report;
    let attempts = 0;
    while (attempts < 3) {
      try {
        const caseReference = await generateCaseReference();
        report = await WasteReport.create({
          reportedBy: req.user._id,
          category,
          description,
          location: parsedLocation,
          images,
          caseReference,
          pickupDate: parsedPickupDate,
          pickupTime: pickupTime, // 👈 Saved as explicit string (e.g., "09:00 AM")
        });
        break;
      } catch (createError) {
        const isDuplicateRef =
          createError.code === 11000 &&
          createError.keyPattern?.caseReference;
        attempts += 1;
        if (!isDuplicateRef || attempts >= 3) {
          throw createError;
        }
        // otherwise loop again with a freshly generated reference
      }
    }

    const caseReference = report.caseReference;

    // Send a booking confirmation SMS. Wrapped separately so an SMS failure
    // never blocks the booking itself from succeeding.
    const smsMessage = `Booking confirmed! Your pickup (Ref: ${caseReference}) is scheduled for ${parsedPickupDate.toDateString()} at ${pickupTime}.`;
    try {
      await sendSms(req.user.phone, smsMessage);
    } catch (smsError) {
      console.error("Booking confirmation SMS failed:", smsError.message);
    }

    res.status(201).json({
      message: "Report submitted successfully",
      // DEMO-ONLY: surfacing the SMS text in the API response so it can be
      // shown directly in the UI instead of a real phone. Remove this field
      // before any real deployment with a live SMS provider.
      smsPreview: smsMessage,
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

// @desc    Cancel a pickup request (Must be >= 4 hours before pickup)
// @route   PUT /api/reports/:id/cancel
// @access  Private (citizen only)
export const cancelReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Pickup request not found." });
    }

    if (report.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    if (report.status === "Closed" || report.status === "Cancelled" || report.status === "Completed") {
      return res.status(400).json({ message: `Cannot cancel a report that is already ${report.status.toLowerCase()}.` });
    }

    if (isWithinFourHourCutoff(report.pickupDate)) {
      return res.status(400).json({
        message: "Action locked: Bookings can only be canceled up to 4 hours prior to the scheduled pickup window.",
      });
    }

    report.status = "Cancelled";
    await report.save();

    res.status(200).json({ message: "Pickup canceled successfully without penalty", report });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

// @desc    Reschedule a pickup request (Must be >= 4 hours before pickup)
// @route   PUT /api/reports/:id/reschedule
// @access  Private (citizen only)
export const rescheduleReport = async (req, res) => {
  try {
    const newDate = req.body.newDate || req.body.pickupDate || req.body.scheduledDate;
    const newTime = req.body.pickupTime || req.body.newTime;

    if (!newDate) {
      return res.status(400).json({ message: "New pickup date is required." });
    }

    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Pickup request not found." });
    }

    if (report.reportedBy.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized action." });
    }

    if (report.status === "Closed" || report.status === "Cancelled" || report.status === "Completed") {
      return res.status(400).json({ message: `Cannot reschedule a report that is already ${report.status.toLowerCase()}.` });
    }

    if (isWithinFourHourCutoff(report.pickupDate)) {
      return res.status(400).json({
        message: "Action locked: Bookings can only be rescheduled up to 4 hours prior to the scheduled pickup window.",
      });
    }

    if (isWithinFourHourCutoff(newDate)) {
      return res.status(400).json({
        message: "Invalid date: The new pickup date must be at least 4 hours from now.",
      });
    }

    report.pickupDate = new Date(newDate);
    if (newTime) {
      report.pickupTime = newTime; // Update time if provided
    }
    
    await report.save();

    res.status(200).json({ message: "Pickup rescheduled successfully", report });
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
      "name email phone"
    );

    if (!report) {
      return res.status(404).json({ message: "Report not found" });
    }

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

// @desc    Get all unassigned reported pickups (for Collectors)
// @route   GET /api/reports/available
// @access  Private (Collector)
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

// @desc    Collector accepts a pickup request
// @route   PUT /api/reports/:id/accept
// @access  Private (Collector)
export const acceptReport = async (req, res) => {
  try {
    const report = await WasteReport.findById(req.params.id);

    if (!report) {
      return res.status(404).json({ message: "Pickup request not found." });
    }

    if (report.status !== "Reported") {
      return res.status(400).json({ message: "This request is no longer available." });
    }

    report.status = "Assigned";
    report.assignedCollector = req.user._id;
    await report.save();

    res.status(200).json({
      message: "Pickup assigned to you successfully!",
      report,
    });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};

export const getAssignedReports = async (req, res) => {
  try {
    const reports = await WasteReport.find({
      assignedCollector: req.user._id, // 👈 Matched with acceptReport!
    })
      .populate("reportedBy", "name phone email")
      .sort({ updatedAt: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message });
  }
};