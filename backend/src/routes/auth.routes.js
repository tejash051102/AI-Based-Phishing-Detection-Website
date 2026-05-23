import { Router } from "express";
import {
  forgotPassword,
  forgotPasswordRules,
  login,
  loginRules,
  me,
  register,
  registerRules,
  resendVerification,
  resetPassword,
  resetPasswordRules,
  verifyEmail
} from "../controllers/auth.controller.js";
import { protect } from "../middleware/auth.middleware.js";
import { validate } from "../middleware/validate.middleware.js";

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", protect, me);
router.post("/forgot-password", forgotPasswordRules, validate, forgotPassword);
router.post("/reset-password", resetPasswordRules, validate, resetPassword);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", protect, resendVerification);

export default router;
