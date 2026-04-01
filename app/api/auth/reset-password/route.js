import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import crypto from "crypto";

export async function POST(request) {
  try {
    await connectDB();
    const { token, password } = await request.json();
    if (!token || !password) return jsonError("Token and password are required");
    const hash = crypto.createHash("sha256").update(token).digest("hex");
    const user = await User.findOne({
      resetToken: hash,
      resetExpires: { $gt: new Date() },
    }).select("+resetToken +resetExpires");
    if (!user) return jsonError("Invalid or expired token", 400);
    user.password = await hashPassword(password);
    user.resetToken = undefined;
    user.resetExpires = undefined;
    await user.save();
    return jsonOk({ message: "Password updated" });
  } catch (e) {
    console.error(e);
    return jsonError(e.message || "Server error", 500);
  }
}
