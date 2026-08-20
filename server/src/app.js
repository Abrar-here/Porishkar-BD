import express from "express";
import cors from "cors";

import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import centreRoutes from "./routes/centreRoutes.js";

import bidRoutes from "./routes/bidRoutes.js";

import ecoPointsRoutes from "./routes/ecoPointsRoutes.js";
import leaderboardRoutes from "./routes/leaderboardRoutes.js";
import badgeRoutes from "./routes/badgeRoutes.js";


const app = express();


app.use(cors());

app.use(express.json());


// Marketplace
app.use("/api/listings", listingRoutes);


// Recycling Centres
app.use("/api/centres", centreRoutes);


// Eco Points & Gamification
app.use("/api/ecopoints", ecoPointsRoutes);

app.use("/api/leaderboard", leaderboardRoutes);

app.use("/api/badges", badgeRoutes);


// Bid & Offer System (F10)
app.use("/api/bids", bidRoutes);


// Health check
app.get("/api/health", (req, res) => {

  res.json({
    status: "ok",
    message: "PorishkarBD API is running"
  });

});


// Authentication
app.use("/api/auth", authRoutes);


// Reports
app.use("/api/reports", reportRoutes);


export default app;