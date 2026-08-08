import mongoose from "mongoose";

const listingSchema = new mongoose.Schema(
  {
    seller: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
      default: "",
    },

    materialType: {
      type: String,
      required: true,
      enum: [
        "Plastic",
        "Paper",
        "Metal",
        "Glass",
        "Electronic Waste",
        "Textile",
      ],
    },

    quantity: {
      value: {
        type: Number,
        required: true,
        min: 0.01,
      },

      unit: {
        type: String,
        required: true,
        enum: ["kg", "ton", "piece", "bag"],
      },
    },

    condition: {
      type: String,
      required: true,
      enum: ["Clean", "Soiled", "Mixed"],
    },

    listingType: {
      type: String,
      enum: ["Sale", "Donation"],
      default: "Sale",
    },

    askingPrice: {
      type: Number,
      min: 0,
      default: null,
    },

    pickupAddress: {
      fullAddress: {
        type: String,
        required: true,
      },

      district: {
        type: String,
        required: true,
      },

      division: {
        type: String,
        required: true,
      },
    },

    images: [
      {
        url: {
          type: String,
        },

        publicId: {
          type: String,
        },
      },
    ],

    status: {
      type: String,
      enum: ["Active", "Sold", "Expired", "Cancelled"],
      default: "Active",
    },
  },
  {
    timestamps: true,
  }
);

const Listing = mongoose.model("Listing", listingSchema);

export default Listing;