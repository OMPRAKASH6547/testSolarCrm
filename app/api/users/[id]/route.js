import User from "@/models/User";
import { hashPassword } from "@/lib/auth";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageStaff")) {
    return jsonError("Forbidden", 403);
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid id");
  const body = await request.json();
  const user = await User.findById(id);
  if (!user) return jsonError("Not found", 404);
  if (user.role === "super_admin") return jsonError("Cannot modify super admin", 403);
  if (body.name) user.name = body.name;
  if (body.phone != null) user.phone = body.phone;
  if (body.role && ["admin", "staff"].includes(body.role)) user.role = body.role;
  if (body.permissions && typeof body.permissions === "object") {
    const cur = user.permissions ? user.permissions.toObject?.() || user.permissions : {};
    user.permissions = { ...cur, ...body.permissions };
  }
  if (body.password) user.password = await hashPassword(body.password);
  if (typeof body.loginOtpEnabled === "boolean") user.loginOtpEnabled = body.loginOtpEnabled;
  await user.save();
  return jsonOk({
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      permissions: user.permissions,
      loginOtpEnabled: user.loginOtpEnabled,
    },
  });
}

export async function DELETE(request, { params }) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageStaff")) {
    return jsonError("Forbidden", 403);
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid id");
  const user = await User.findById(id);
  if (!user) return jsonError("Not found", 404);
  if (user.role === "super_admin") return jsonError("Cannot delete super admin", 403);
  await User.deleteOne({ _id: id });
  return jsonOk({ ok: true });
}
