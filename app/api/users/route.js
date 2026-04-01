import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageStaff")) {
    return jsonError("Forbidden", 403);
  }
  const users = await User.find({ role: { $in: ["admin", "staff"] } })
    .select("-password")
    .sort({ createdAt: -1 })
    .lean();
  return jsonOk({ users });
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageStaff")) {
    return jsonError("Forbidden", 403);
  }
  try {
    const body = await request.json();
    const {
      name,
      email,
      password,
      role,
      phone,
      permissions,
    } = body;
    if (!name || !email || !password) {
      return jsonError("Name, email, and password are required");
    }
    if (!["admin", "staff"].includes(role || "staff")) {
      return jsonError("Invalid role");
    }
    const exists = await User.findOne({ email: email.toLowerCase() });
    if (exists) return jsonError("Email already exists");
    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: await hashPassword(password),
      role: role || "staff",
      phone: phone || "",
      permissions: permissions || {},
    });
    return jsonOk({
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        permissions: user.permissions,
      },
    });
  } catch (e) {
    console.error(e);
    return jsonError(e.message || "Server error", 500);
  }
}
