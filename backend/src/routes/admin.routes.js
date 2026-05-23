import { Router } from "express";
import { adminOverview, allScans, threatMap, toggleBlockUser, users } from "../controllers/admin.controller.js";
import { authorize, protect } from "../middleware/auth.middleware.js";

const router = Router();

router.use(protect, authorize("admin"));
router.get("/overview", adminOverview);
router.get("/threat-map", threatMap);
router.get("/scans", allScans);
router.get("/users", users);
router.patch("/users/:id/block", toggleBlockUser);

export default router;
