import UploadBatch from "@/models/UploadBatch";
import Lead from "@/models/Lead";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "uploadCsv")) {
    return jsonError("Forbidden", 403);
  }
  const batches = await UploadBatch.find().sort({ createdAt: -1 }).limit(100).lean();
  const withCounts = await Promise.all(
    batches.map(async (b) => {
      const total = await Lead.countDocuments({ uploadBatchId: b._id });
      const unassigned = await Lead.countDocuments({ uploadBatchId: b._id, assignedTo: null });
      return { ...b, leadCount: total, unassigned };
    })
  );
  return jsonOk({ batches: withCounts });
}
