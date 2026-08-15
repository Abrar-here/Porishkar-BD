import "./src/config/env.js";
import app from "./src/app.js";
import connectDB from "./src/config/db.js";
import { seedBadges } from "./src/services/ecoPointsService.js";

const PORT = process.env.PORT || 5000;

connectDB().then(async () => {
  await seedBadges();
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});