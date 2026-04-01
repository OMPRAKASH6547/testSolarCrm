import Lead from "@/models/Lead";
import {
  requireAuth,
  requireAdmin,
  jsonError,
  jsonOk,
  adminHasPermission,
  isAdminRole,
} from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid id");
  const lead = await Lead.findById(id).lean();
  if (!lead) return jsonError("Not found", 404);
  if (r.user.role === "staff" && String(lead.assignedTo) !== String(r.user._id)) {
    return jsonError("Forbidden", 403);
  }
  return jsonOk({ lead });
}

export async function PATCH(request, { params }) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid id");
  const lead = await Lead.findById(id);
  if (!lead) return jsonError("Not found", 404);
  if (r.user.role === "staff") {
    if (String(lead.assignedTo) !== String(r.user._id)) {
      return jsonError("Forbidden", 403);
    }
  } else if (!isAdminRole(r.user.role)) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const allowed = [
    "customerName",
    "mobile",
    "city",
    "pincode",
    "requirementKw",
    "customerType",
    "otherDetails",
    "status",
    "followUpDate",
    "address",
    "visited",
    "visitDate",
    "quotationFile",
    "notes",
    "assignedTo",
  ];
  for (const k of allowed) {
    if (body[k] !== undefined) lead[k] = body[k];
  }
  await lead.save();
  return jsonOk({ lead: lead.toObject() });
}

export async function DELETE(request, { params }) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "assignLeads")) {
    return jsonError("Forbidden", 403);
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid id");
  await Lead.deleteOne({ _id: id });
  return jsonOk({ ok: true });
}
