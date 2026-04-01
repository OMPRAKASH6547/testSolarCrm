import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { verifyPassword, signToken } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { sendEmail } from "@/lib/notifications";
import crypto from "crypto";

function issueAuthResponse(user) {
  const token = signToken({ userId: user._id.toString() });
  const res = jsonOk({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      permissions: user.permissions,
    },
    token,
  });
  res.cookies.set("token", token, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
  return res;
}

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { email, password, otp } = body;
    if (!email) return jsonError("Email is required");

    const user = await User.findOne({ email: email.toLowerCase() }).select(
      "+password +otpCode +otpExpires +loginOtpEnabled"
    );
    if (!user) return jsonError("Invalid credentials", 401);

    // Step 2: OTP verification (after password was accepted in step 1)
    if (user.loginOtpEnabled && otp != null && String(otp).trim() !== "") {
      if (!user.otpCode || !user.otpExpires || user.otpExpires < new Date()) {
        return jsonError("OTP expired or missing", 401);
      }
      if (String(otp).trim() !== String(user.otpCode)) {
        return jsonError("Invalid OTP", 401);
      }
      user.otpCode = undefined;
      user.otpExpires = undefined;
      await user.save();
      return issueAuthResponse(user);
    }

    if (!password) return jsonError("Password is required");

    if (!(await verifyPassword(password, user.password))) {
      return jsonError("Invalid credentials", 401);
    }

    // Step 1: optional email OTP before session
    if (user.loginOtpEnabled) {
      const code = String(crypto.randomInt(100000, 999999));
      user.otpCode = code;
      user.otpExpires = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await sendEmail({
        to: user.email,
        subject: "SolarPro CRM login code",
        html: `<p>Your OTP is <strong>${code}</strong>. Valid for 10 minutes.</p>`,
      });
      return jsonOk({ needsOtp: true, message: "OTP sent to your email" });
    }

    return issueAuthResponse(user);
  } catch (e) {
    console.error(e);
    return jsonError(e.message || "Server error", 500);
  }
}
