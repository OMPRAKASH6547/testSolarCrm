import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { getAuthUser } from "@/lib/auth";

export function jsonOk(data, status = 200) {
  return NextResponse.json(data, { status });
}

export function jsonError(message, status = 400) {
  return NextResponse.json({ error: message }, { status });
}

export async function requireAuth(request) {
  await connectDB();
  const user = await getAuthUser(request);
  if (!user) return { error: jsonError("Unauthorized", 401) };
  return { user };
}

export function isAdminRole(role) {
  return role === "admin" || role === "super_admin";
}

export async function requireAdmin(request) {
  const r = await requireAuth(request);
  if (r.error) return r;
  if (!isAdminRole(r.user.role)) return { error: jsonError("Forbidden", 403) };
  return r;
}

export async function requireStaff(request) {
  const r = await requireAuth(request);
  if (r.error) return r;
  if (r.user.role !== "staff") return { error: jsonError("Forbidden", 403) };
  return r;
}

export function parsePermissions(permissions) {
  if (!permissions || typeof permissions !== "object") return {};
  return permissions;
}

export function adminHasPermission(user, key) {
  if (user.role === "super_admin") return true;
  if (user.role !== "admin") return false;
  return Boolean(user.permissions?.[key]);
}
