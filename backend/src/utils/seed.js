import dotenv from "dotenv";
import { connectDB } from "../config/db.js";
import User from "../models/User.js";

dotenv.config();

await connectDB();
await User.deleteOne({ email: "admin@phishguard.dev" });
await User.create({
  name: "Security Admin",
  email: "admin@phishguard.dev",
  password: "AdminPass123",
  role: "admin"
});
console.log("Seeded admin@phishguard.dev / AdminPass123");
process.exit(0);

