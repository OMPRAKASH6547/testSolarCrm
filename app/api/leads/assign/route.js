import Lead from "@/models/Lead";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "assignLeads")) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const { batchId, ranges } = body;
  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return jsonError("Valid batchId is required");
  }
  if (!Array.isArray(ranges) || !ranges.length) {
    return jsonError("ranges must be a non-empty array");
  }
  const leads = await Lead.find({ uploadBatchId: batchId }).sort({ rowIndex: 1 });
  let updated = 0;
  for (const range of ranges) {
    const { staffId, from, to } = range;
    if (!mongoose.isValidObjectId(staffId)) continue;
    const f = Number(from);
    const t = Number(to);
    if (Number.isNaN(f) || Number.isNaN(t)) continue;
    for (const lead of leads) {
      if (lead.rowIndex >= f && lead.rowIndex <= t) {
        lead.assignedTo = staffId;
        lead.status = "assigned";
        await lead.save();
        updated += 1;
      }
    }
  }
  return jsonOk({ updated });
}
