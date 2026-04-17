import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import dotenv from "dotenv";

dotenv.config();

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// --- 1. Avatar (Profile Image) Storage ---
const avatarStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eventhub/avatars",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    transformation: [{ width: 400, height: 400, crop: "limit" }],
  },
});

// --- 2. Event Banner Storage ---
const bannerStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: "eventhub/banners",
    allowed_formats: ["jpg", "jpeg", "png", "webp"],
    // Banners are wider, so we use a different transformation limit
    transformation: [{ width: 1200, height: 600,crop: "limit" }],
  },
});

// Create and export the specific upload middlewares
export const uploadAvatar = multer({ storage: avatarStorage });
export const uploadBanner = multer({ storage: bannerStorage });