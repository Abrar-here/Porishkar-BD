import mongoose from "mongoose";

const wasteReportSchema = new mongoose.Schema(
  {
    reportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedCollector: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    category: {
      type: String,
      enum: [
        "Household",
        "Industrial",
        "Medical",
        "Construction",
        "Water Body Pollution",
      ],
      required: [true, "Issue category is required"],
    },
    description: {
      type: String,
      required: [true, "Description is required"],
      trim: true,
    },
    location: {
      lat: { type: Number, required: [true, "Latitude is required"] },
      lng: { type: Number, required: [true, "Longitude is required"] },
      address: {
        type: String,
        required: [true, "Address is required"],
        trim: true,
      },
    },

    collectorLocation: {
      lat: { type: Number, default: null },
      lng: { type: Number, default: null },
      updatedAt: { type: Date, default: null },
    },
    // Optional — F05 fills these, F01 does not
    pickupDate: {
      type: Date,
      default: null,
    },
    pickupTime: {
      type: String,
      trim: true,
      default: null,
    },
    // F06 — manual sequence position within a collector's route, set
    // when a supervisor reorders stops. null until first assigned a
    // position; the route endpoint falls back to nearest-neighbor
    // ordering for any stop that doesn't have one yet.
    routeOrder: {
      type: Number,
      default: null,
    },
    // F04 — set to true when an admin escalates a hotspot cluster
    // this report belongs to. Surfaces the report as high-priority
    // elsewhere in the admin tooling (e.g. route views, report lists).
    isPriority: {
      type: Boolean,
      default: false,
    },

    images: {
      type: [String],
      default: [],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: "A report can have at most 5 photos",
      },
    },
    caseReference: {
      type: String,
      unique: true,
    },
    status: {
      type: String,
      enum: [
        "Reported",
        "Assigned",
        "Collector En Route",
        "Cleanup In Progress",
        "Resolved",
        "Closed",
        "Cancelled",
        "Under Investigation",
      ],
      default: "Reported",
    },
    // F08 proof of collection (maisara) - Moved INSIDE schema fields block
    proofOfCollection: {
      imageUrl: { type: String, default: null },
      uploadedAt: { type: Date, default: null },
      location: {
        latitude: { type: Number, default: null },
        longitude: { type: Number, default: null },
      },
    },
    isDisputed: {
      type: Boolean,
      default: false,
    },
    disputeDetails: {
      reason: { type: String, default: "" },
      raisedAt: { type: Date, default: null },
      status: {
        type: String,
        enum: ["Pending", "Under Investigation", "Resolved", "Dismissed"],
        default: "Pending",
      },
    },
    // ─── F02: Issue Priority & Auto-Categorization Engine ──────────────
    estimatedVolume: {
      type: String,
      enum: ["Small", "Medium", "Large"],
      default: "Medium",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Low",
    },
    // true once an admin has manually overridden the system-suggested
    // priority — kept separate from priorityHistory so the UI can
    // quickly show "this was manually adjusted" without reading the log
    priorityOverridden: {
      type: Boolean,
      default: false,
    },
    // Every priority change (the initial auto-assignment, plus any
    // admin override) gets appended here — this is the "activity log"
    // the assignment describes.
    priorityHistory: {
      type: [
        {
          priority: { type: String, required: true },
          changedBy: {
            type: String,
            enum: ["system", "admin"],
            required: true,
          },
          reason: { type: String, default: "" },
          changedAt: { type: Date, default: Date.now },
        },
      ],
      default: [],
    },
  },
  {
    timestamps: true,
  },
);

const WasteReport = mongoose.model("WasteReport", wasteReportSchema);
export default WasteReport;
