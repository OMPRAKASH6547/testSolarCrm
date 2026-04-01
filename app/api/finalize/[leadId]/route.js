import Finalization from "@/models/Finalization";
import { requireAuth, jsonError, jsonOk, isAdminRole } from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function GET(request, { params }) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  const { leadId } = await params;
  if (!mongoose.isValidObjectId(leadId)) return jsonError("Invalid id");
  const fin = await Finalization.findOne({ leadId }).lean();
  if (!fin && !isAdminRole(r.user.role)) return jsonError("Not found", 404);
  return jsonOk({ finalization: fin });
}
