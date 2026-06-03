import { Router } from "express";
import {
  analytics,
  analyzeHeaders,
  bulkRules,
  bulkScan,
  createScan,
  exportScan,
  feedbackRules,
  getScan,
  listRules,
  listScans,
  scanRules,
  submitScanFeedback,
  uploadScan,
  previewUrl
} from "../controllers/scan.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { upload } from "../middleware/upload.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect);
router.get("/", listRules, validate, listScans);
router.get("/analytics", analytics);
router.post("/", scanRules, validate, createScan);
router.post("/bulk", bulkRules, validate, bulkScan);
router.post("/preview", previewUrl);
router.post("/headers/analyze", analyzeHeaders);
router.post("/upload", upload.single("file"), uploadScan);
router.get("/:id", getScan);
router.patch("/:id/feedback", feedbackRules, validate, submitScanFeedback);
router.get("/:id/export", exportScan);

export default router;
