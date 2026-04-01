import Lead from "@/models/Lead";
import { requireAuth, requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

export async function GET(request) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");
  const assignedTo = searchParams.get("assignedTo");
  const q = {};
  if (status) q.status = status;
  if (r.user.role === "staff") {
    q.assignedTo = r.user._id;
  } else if (assignedTo) {
    q.assignedTo = assignedTo;
  }

  // UI needs to show who submitted/assigned the lead.
  const query = Lead.find(q)
    .sort({ createdAt: -1 })
    .limit(500);

  query.populate("assignedTo", "name");

  const leads = await query.lean();
  return jsonOk({ leads });
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "uploadCsv")) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const lead = await Lead.create({
    ...body,
    createdBy: r.user._id,
    status: body.status || "new",
  });
  return jsonOk({ lead });
}
