import { Router } from "express";
import { publicQuickScan, quickScanRules } from "../controllers/public.controller.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/quick-scan", quickScanRules, validate, publicQuickScan);

export default router;
