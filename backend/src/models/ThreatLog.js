import mongoose from "mongoose";

const threatLogSchema = new mongoose.Schema(
  {
    scan: { type: mongoose.Schema.Types.ObjectId, ref: "ScanReport" },
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    event: { type: String, required: true },
    severity: { type: String, enum: ["low", "medium", "high", "critical"], default: "low" },
    metadata: { type: mongoose.Schema.Types.Mixed },
    ip: { type: String },
    userAgent: { type: String }
  },
  { timestamps: true }
);

threatLogSchema.index({ createdAt: -1 });
threatLogSchema.index({ severity: 1 });

export default mongoose.model("ThreatLog", threatLogSchema);

