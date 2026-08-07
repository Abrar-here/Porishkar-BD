import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

// Temporary model to read and modify raw MongoDB data
const WasteReport = mongoose.model(
  "WasteReport",
  new mongoose.Schema({}, { strict: false }),
  "wastereports"
);

async function runMigration() {
  try {
    const mongoUri = process.env.MONGO_URI || process.env.DATABASE_URL;

    if (!mongoUri) {
      console.error("❌ Error: MONGO_URI is missing in your .env file!");
      process.exit(1);
    }

    await mongoose.connect(mongoUri);
    console.log("Connected to MongoDB for migration...");

    const reports = await WasteReport.find({});
    let updatedCount = 0;

    for (const report of reports) {
      if (report.description) {
        // Regex extracts date (YYYY-MM-DD) and time (03:04 AM) from description string
        const match = report.description.match(
          /Scheduled for (\d{4}-\d{2}-\d{2})(?: at (\d{2}:\d{2}\s?[AP]M))?/i
        );

        if (match) {
          const dateStr = match[1];
          const timeStr = match[2] || "09:00 AM";

          // Construct proper date object
          const parsedDate = new Date(`${dateStr} ${timeStr}`);

          if (!isNaN(parsedDate.getTime())) {
            report.pickupDate = parsedDate;
            report.pickupTime = timeStr;
            await report.save();
            updatedCount++;
            console.log(
              `✅ Updated ${report.caseReference || report._id} -> Date: ${parsedDate.toISOString()}, Time: ${timeStr}`
            );
          }
        }
      }
    }

    console.log(`\n🎉 Migration complete! Updated ${updatedCount} records in MongoDB.`);
  } catch (err) {
    console.error("❌ Migration failed:", err);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

runMigration();