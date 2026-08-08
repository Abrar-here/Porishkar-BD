import mongoose from "mongoose";

// Generic atomic counter — one document per key (e.g. "caseReference-2026")
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});

const Counter = mongoose.model("Counter", counterSchema);

export default Counter;
