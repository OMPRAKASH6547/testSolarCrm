import { cookies } from "next/headers";
import { connectDB } from "@/lib/db";
import { verifyToken } from "@/lib/auth";
import User from "@/models/User";

export async function getSession() {
  const cookieStore = await cookies();
  const token = cookieStore.get("token")?.value;
  if (!token) return null;
  const payload = verifyToken(token);
  if (!payload?.userId) return null;
  await connectDB();
  const user = await User.findById(payload.userId).select("-password").lean();
  if (!user) return null;
  // RSC → Client Components: ObjectId/Date must be plain values, not BSON instances
  return JSON.parse(JSON.stringify(user));
}
