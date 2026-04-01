import Lead from "@/models/Lead";
import User from "@/models/User";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "assignLeads")) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const { batchId, staffIds } = body;
  if (!batchId || !mongoose.isValidObjectId(batchId)) {
    return jsonError("Valid batchId is required");
  }
  if (!Array.isArray(staffIds) || !staffIds.length) {
    return jsonError("staffIds required");
  }
  const validStaff = staffIds.filter((id) => mongoose.isValidObjectId(id));
  if (!validStaff.length) return jsonError("No valid staff ids");

  const leads = await Lead.find({
    uploadBatchId: batchId,
    assignedTo: null,
  }).sort({ rowIndex: 1 });

  const counts = await Promise.all(
    validStaff.map(async (id) => ({
      id,
      count: await Lead.countDocuments({ assignedTo: id, status: { $ne: "installed" } }),
    }))
  );

  let idx = 0;
  for (const lead of leads) {
    counts.sort((a, b) => a.count - b.count);
    const pick = counts[0];
    lead.assignedTo = pick.id;
    lead.status = "assigned";
    await lead.save();
    pick.count += 1;
    idx += 1;
  }
  return jsonOk({ assigned: idx });
}
