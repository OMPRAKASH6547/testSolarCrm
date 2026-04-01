import { requireAuth } from "@/lib/api-helpers";

export async function GET(request) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  const u = r.user;
  return Response.json({
    user: {
      id: u._id,
      name: u.name,
      email: u.email,
      phone: u.phone,
      role: u.role,
      permissions: u.permissions || {},
      loginOtpEnabled: u.loginOtpEnabled,
    },
  });
}
