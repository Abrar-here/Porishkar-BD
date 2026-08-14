import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import listingRoutes from "./routes/listingRoutes.js";
import centreRoutes from "./routes/centreRoutes.js";
const app = express();

app.use(cors());
app.use(express.json());
app.use("/api/listings", listingRoutes);
app.use("/api/centres", centreRoutes);

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PorishkarBD API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

export default app;
