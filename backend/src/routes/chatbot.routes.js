import { Router } from "express";
import { chat, chatbotRules } from "../controllers/chatbot.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.use(protect);
router.post("/", chatbotRules, validate, chat);

export default router;

