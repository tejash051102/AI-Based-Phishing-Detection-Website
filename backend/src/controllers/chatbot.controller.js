import { body } from "express-validator";
import { answerSecurityQuestion } from "../services/chatbot.service.js";

export const chatbotRules = [
  body("message").trim().isLength({ min: 2 }).withMessage("Message is required"),
  body("scanId").optional().isMongoId().withMessage("Invalid scan id")
];

export async function chat(req, res, next) {
  try {
    const reply = await answerSecurityQuestion({
      userId: req.user._id,
      message: req.body.message,
      scanId: req.body.scanId
    });
    res.json(reply);
  } catch (error) {
    next(error);
  }
}

