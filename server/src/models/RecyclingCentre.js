import mongoose from "mongoose";

const recyclingCentreSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Centre name is required"],
      trim: true,
    },
    address: {
      type: String,
      required: [true, "Address is required"],
      trim: true,
    },
    location: {
      lat: { type: Number, required: [true, "Latitude is required"] },
      lng: { type: Number, required: [true, "Longitude is required"] },
    },
    // Matches the same enum used in Listing.js (F09) for consistency
    // across the platform — same six material types from the
    // requirements doc.
    acceptedMaterials: {
      type: [String],
      enum: [
        "Plastic",
        "Paper",
        "Metal",
        "Glass",
        "Electronic Waste",
        "Textile",
      ],
      required: [true, "At least one accepted material is required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "At least one accepted material is required",
      },
    },
    hours: {
      open: { type: String, default: "9:00 AM" },
      close: { type: String, default: "6:00 PM" },
    },
    phone: {
      type: String,
      trim: true,
      default: null,
    },
    averageRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
    },
    totalRatings: {
      type: Number,
      default: 0,
    },
    // Tracks which citizens have already rated this centre, so each
    // person can only rate once. Stores just the user ID — no need
    // for a full subdocument since we don't display individual ratings.
    ratedBy: {
      type: [mongoose.Schema.Types.ObjectId],
      ref: "User",
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
);

const RecyclingCentre = mongoose.model(
  "RecyclingCentre",
  recyclingCentreSchema,
);

export default RecyclingCentre;
