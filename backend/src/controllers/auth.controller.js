import { body } from "express-validator";
import User from "../models/User.js";
import ThreatLog from "../models/ThreatLog.js";
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

export async function register(req, res, next) {
  try {
    const { name, email, password } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(409).json({ message: "Email is already registered" });

    const user = await User.create({ name, email, password });
    await ThreatLog.create({ user: user._id, event: "user_registered", severity: "low", ip: req.ip });
    res.status(201).json({ token: signToken(user), user: publicUser(user) });
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

