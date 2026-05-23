import { body } from "express-validator";
import User from "../models/User.js";
import ThreatLog from "../models/ThreatLog.js";
import { sendThreatAlert } from "../services/email.service.js";
import { createPlainToken, hashToken, minutesFromNow } from "../utils/securityTokens.js";
import { publicUser, signToken } from "../utils/token.js";

export const registerRules = [
  body("name").trim().isLength({ min: 2 }).withMessage("Name is required"),
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
];

export const loginRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required"),
  body("password").notEmpty().withMessage("Password is required")
];

export const forgotPasswordRules = [
  body("email").isEmail().normalizeEmail().withMessage("Valid email is required")
];

export const resetPasswordRules = [
  body("token").notEmpty().withMessage("Reset token is required"),
  body("password").isLength({ min: 8 }).withMessage("Password must be at least 8 characters")
];

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email is already registered" });

    const verificationToken = createPlainToken();
    const user = await User.create({
      name,
      email,
      password,
      emailVerificationToken: hashToken(verificationToken),
      emailVerificationExpires: minutesFromNow(60)
    });
    const verificationLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${verificationToken}`;
    sendThreatAlert({
      to: user.email,
      subject: "Verify your PhishGuard account",
      text: `Verify your email using this link: ${verificationLink}`
    }).catch(() => {});
    await ThreatLog.create({ user: user._id, event: "user_registered", severity: "low", ip: req.ip });
    res.status(201).json({
      token: signToken(user),
      user: publicUser(user),
      verificationToken: process.env.NODE_ENV === "production" ? undefined : verificationToken
    });
  } catch (error) {
    next(error);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({ message: "Invalid credentials" });
    }
    if (user.blocked) return res.status(403).json({ message: "Your account is blocked" });

    user.lastLoginAt = new Date();
    await user.save();
    await ThreatLog.create({ user: user._id, event: "user_login", severity: "low", ip: req.ip });
    res.json({ token: signToken(user), user: publicUser(user) });
  } catch (error) {
    next(error);
  }
}

export async function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

export async function forgotPassword(req, res, next) {
  try {
    const user = await User.findOne({ email: req.body.email }).select("+passwordResetToken +passwordResetExpires");
    if (user) {
      const token = createPlainToken();
      user.passwordResetToken = hashToken(token);
      user.passwordResetExpires = minutesFromNow(20);
      await user.save();
      const resetLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/reset-password/${token}`;
      sendThreatAlert({
        to: user.email,
        subject: "Reset your PhishGuard password",
        text: `Reset your password using this link: ${resetLink}`
      }).catch(() => {});
      return res.json({
        message: "If the account exists, a reset link has been sent.",
        resetToken: process.env.NODE_ENV === "production" ? undefined : token
      });
    }
    res.json({ message: "If the account exists, a reset link has been sent." });
  } catch (error) {
    next(error);
  }
}

export async function resetPassword(req, res, next) {
  try {
    const tokenHash = hashToken(req.body.token);
    const user = await User.findOne({
      passwordResetToken: tokenHash,
      passwordResetExpires: { $gt: new Date() }
    }).select("+passwordResetToken +passwordResetExpires +password");
    if (!user) return res.status(400).json({ message: "Reset token is invalid or expired" });

    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();
    await ThreatLog.create({ user: user._id, event: "password_reset", severity: "medium", ip: req.ip });
    res.json({ message: "Password reset successful" });
  } catch (error) {
    next(error);
  }
}

export async function verifyEmail(req, res, next) {
  try {
    const tokenHash = hashToken(req.params.token);
    const user = await User.findOne({
      emailVerificationToken: tokenHash,
      emailVerificationExpires: { $gt: new Date() }
    }).select("+emailVerificationToken +emailVerificationExpires");
    if (!user) return res.status(400).json({ message: "Verification token is invalid or expired" });

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();
    await ThreatLog.create({ user: user._id, event: "email_verified", severity: "low", ip: req.ip });
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    next(error);
  }
}

export async function resendVerification(req, res, next) {
  try {
    if (req.user.emailVerified) return res.json({ message: "Email is already verified" });
    const token = createPlainToken();
    req.user.emailVerificationToken = hashToken(token);
    req.user.emailVerificationExpires = minutesFromNow(60);
    await req.user.save();
    const verificationLink = `${process.env.CLIENT_URL || "http://localhost:5173"}/verify-email/${token}`;
    sendThreatAlert({
      to: req.user.email,
      subject: "Verify your PhishGuard account",
      text: `Verify your email using this link: ${verificationLink}`
    }).catch(() => {});
    res.json({
      message: "Verification email sent",
      verificationToken: process.env.NODE_ENV === "production" ? undefined : token
    });
  } catch (error) {
    next(error);
  }
}
