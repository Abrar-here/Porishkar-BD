import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import multer from "multer";

// Configure Cloudinary — called explicitly after dotenv has loaded
const configureCloudinary = () => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
};

configureCloudinary();

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "waste-reports",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 1200, quality: "auto", crop: "limit" }],
  },
});

export const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
});







// ==========================================
// Fahim's PART - F09 Marketplace Listings
// Do not remove THIS
// ==========================================

const marketplaceStorage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "marketplace-listings",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [
      { width: 1200, quality: "auto", crop: "limit" }
    ],
  },
});

export const marketplaceUpload = multer({
  storage: marketplaceStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});

export default cloudinary;

