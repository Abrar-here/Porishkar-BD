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
  },
  {
    timestamps: true,
  },
);

const WasteReport = mongoose.model("WasteReport", wasteReportSchema);
export default WasteReport;
