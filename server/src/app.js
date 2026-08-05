import express from "express";
import cors from "cors";
import authRoutes from "./routes/authRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "PorishkarBD API is running" });
});

app.use("/api/auth", authRoutes);
app.use("/api/reports", reportRoutes);

export default app;
