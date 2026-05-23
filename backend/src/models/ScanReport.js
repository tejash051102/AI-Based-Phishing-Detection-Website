import mongoose from "mongoose";

const scanReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    type: { type: String, enum: ["url", "text", "file"], required: true },
    input: { type: String, required: true },
    normalizedInput: { type: String },
    verdict: { type: String, enum: ["safe", "suspicious", "phishing"], required: true },
    threatScore: { type: Number, min: 0, max: 100, required: true },
    probability: { type: Number, min: 0, max: 1, required: true },
    indicators: [{ type: String }],
    aiDetails: { type: mongoose.Schema.Types.Mixed },
    reputation: { type: mongoose.Schema.Types.Mixed },
    fileName: { type: String },
    fileBatchId: { type: String },
    extractedFromFile: { type: Boolean, default: false },
    sourceLabel: { type: String },
    sourceIp: { type: String },
    userFeedback: {
      label: { type: String, enum: ["accurate", "false_positive", "false_negative"] },
      note: { type: String, maxlength: 500 },
      submittedAt: { type: Date }
    },
    status: { type: String, enum: ["completed", "reviewed", "dismissed"], default: "completed" }
  },
  { timestamps: true }
);

scanReportSchema.index({ user: 1, createdAt: -1 });
scanReportSchema.index({ verdict: 1, threatScore: -1 });
scanReportSchema.index({ input: "text", normalizedInput: "text" });

export default mongoose.model("ScanReport", scanReportSchema);
