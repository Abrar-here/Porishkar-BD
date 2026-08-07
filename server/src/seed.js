import mongoose from "mongoose";
import dotenv from "dotenv";
import WasteReport from "./models/WasteReport.js"; 
import User from "./models/User.js"; 

dotenv.config();

const seedData = (userId) => [
  {
    reportedBy: userId,
    caseReference: "PBD-2026-04012",
    category: "Household",
    description: "Scheduled household waste collection and pickup",
    status: "Assigned",
    location: {
      lat: 23.7925,
      lng: 90.4078,
      address: "Gulshan-2, Dhaka",
    },
    createdAt: new Date("2026-10-28"),
  },
  {
    reportedBy: userId,
    caseReference: "PBD-2026-00312",
    category: "Household",
    description: "Plastic and recyclable waste disposal request",
    status: "Reported",
    location: {
      lat: 23.7937,
      lng: 90.4047,
      address: "Banani, Dhaka",
    },
    createdAt: new Date("2026-10-22"),
  },
  {
    reportedBy: userId,
    caseReference: "PBD-2026-00201",
    category: "Construction",
    description: "Metal scrap and construction cleanup completed",
    status: "Resolved",
    location: {
      lat: 23.7461,
      lng: 90.3742,
      address: "Dhanmondi, Dhaka",
    },
    createdAt: new Date("2026-07-11"),
  },
];

async function seedDatabase() {
  try {
    const mongoUri = process.env.MONGO_URI;
    if (!mongoUri) {
      throw new Error("MONGO_URI is missing in .env");
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB Atlas...");

    // Find registered user by email
    const user = await User.findOne({ email: "maisha.maisara@gmail.com" });

    if (!user) {
      console.log("❌ User maisha.maisara@g.bracu.ac.bd not found in DB!");
      console.log("Please make sure you have registered this user account first.");
      process.exit(1);
    }

    // Clear old test reports for this user
    await WasteReport.deleteMany({ reportedBy: user._id });

    // Insert valid reports matching your schema
    await WasteReport.insertMany(seedData(user._id));

    console.log(`✅ Success! Added 3 reports linked to User ID: ${user._id}`);
    process.exit(0);
  } catch (error) {
    console.error("❌ Seed Error:", error);
    process.exit(1);
  }
}

seedDatabase();