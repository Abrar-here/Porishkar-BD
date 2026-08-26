import mongoose from "mongoose";

const recyclingCentreSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
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
    // Each review is a full record — who left it, their star rating,
    // an optional written comment, and a snapshot of their name so
    // display doesn't need a populate on every read. Replaces the old
    // averageRating/totalRatings/ratedBy trio; those are now computed
    // live from this array via virtuals below.
    reviews: {
      type: [
        {
          ratedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
          },
          rating: {
            type: Number,
            min: 1,
            max: 5,
            required: true,
          },
          comment: {
            type: String,
            trim: true,
            maxlength: 500,
            default: "",
          },
          reviewerName: {
            type: String,
            required: true,
          },
        },
      ],
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

// Computed live from reviews — never stored, so it can't drift out of
// sync with the actual review data the way a separately-stored
// averageRating/totalRatings pair could.
recyclingCentreSchema.virtual("averageRating").get(function () {
  if (!this.reviews || this.reviews.length === 0) return 0;
  const sum = this.reviews.reduce((acc, r) => acc + r.rating, 0);
  return parseFloat((sum / this.reviews.length).toFixed(1));
});

recyclingCentreSchema.virtual("totalRatings").get(function () {
  return this.reviews ? this.reviews.length : 0;
});

recyclingCentreSchema.set("toJSON", { virtuals: true });
recyclingCentreSchema.set("toObject", { virtuals: true });

const RecyclingCentre = mongoose.model(
  "RecyclingCentre",
  recyclingCentreSchema,
);

export default RecyclingCentre;
