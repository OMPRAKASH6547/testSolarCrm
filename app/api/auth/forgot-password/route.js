import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { sendEmail } from "@/lib/notifications";
import crypto from "crypto";

export async function POST(request) {
  try {
    await connectDB();
    const { email } = await request.json();
    if (!email) return jsonError("Email is required");
    const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
    if (!user) {
      return jsonOk({ message: "If an account exists, a reset link was sent." });
    }
    const raw = crypto.randomBytes(32).toString("hex");
    user.resetToken = crypto.createHash("sha256").update(raw).digest("hex");
    user.resetExpires = new Date(Date.now() + 60 * 60 * 1000);
    await user.save();
    const base = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
    const link = `${base}/reset-password?token=${raw}`;
    await sendEmail({
      to: user.email,
      subject: "Reset your SolarPro CRM password",
      html: `<p>Click to reset: <a href="${link}">${link}</a></p><p>Expires in 1 hour.</p>`,
    });
    return jsonOk({ message: "If an account exists, a reset link was sent." });
  } catch (e) {
    console.error(e);
    return jsonError(e.message || "Server error", 500);
  }
}
