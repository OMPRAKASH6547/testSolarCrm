import { connectDB } from "@/lib/db";
import User from "@/models/User";
import { hashPassword, signToken } from "@/lib/auth";
import { jsonError, jsonOk } from "@/lib/api-helpers";
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    await connectDB();
    const body = await request.json();
    const { name, email, password } = body;
    if (!name || !email || !password) {
      return jsonError("Name, email, and password are required");
    }
    const count = await User.countDocuments();
    const role = count === 0 ? "super_admin" : null;
    if (count > 0) {
      return jsonError(
        "Public registration is disabled. Ask your administrator for an account.",
        403
      );
    }
    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return jsonError("Email already registered");
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      role,
      permissions: {
        manageStaff: true,
        uploadCsv: true,
        assignLeads: true,
        finalizeDeals: true,
        managePayments: true,
        manageInventory: true,
        viewAnalytics: true,
        sendNotifications: true,
      },
    });
    const token = signToken({ userId: user._id.toString() });
    const res = jsonOk({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
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
  } catch (e) {
    console.error(e);
    return jsonError(e.message || "Server error", 500);
  }
}
