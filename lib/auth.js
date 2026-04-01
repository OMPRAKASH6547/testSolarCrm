import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "change-me-in-production";

export function hashPassword(password) {
  return bcrypt.hash(password, 12);
}

export function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export function signToken(payload, expiresIn = "7d") {
  return jwt.sign(payload, JWT_SECRET, { expiresIn });
}

export function verifyToken(token) {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch {
    return null;
  }
}

export function getTokenFromRequest(request) {
  const auth = request.headers.get("authorization");
  if (auth?.startsWith("Bearer ")) return auth.slice(7);
  const cookie = request.cookies.get("token")?.value;
  return cookie || null;
}

export async function getAuthUser(request) {
  const token = getTokenFromRequest(request);
  if (!token) return null;
  const decoded = verifyToken(token);
  if (!decoded?.userId) return null;
  const { default: User } = await import("@/models/User");
  await (await import("@/lib/db")).connectDB();
  const user = await User.findById(decoded.userId).select("-password").lean();
  return user;
}
