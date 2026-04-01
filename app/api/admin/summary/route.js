import Lead from "@/models/Lead";
import CallLog from "@/models/CallLog";
import { requireAdmin, jsonError, jsonOk, isAdminRole } from "@/lib/api-helpers";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!isAdminRole(r.user.role)) return jsonError("Forbidden", 403);

  const today = new Date();
  const t0 = startOfDay(today);
  const t1 = endOfDay(today);

  const [totalLeads, todaysCalls, installed] = await Promise.all([
    Lead.countDocuments(),
    CallLog.countDocuments({ callDate: { $gte: t0, $lte: t1 } }),
    Lead.countDocuments({ status: "installed" }),
  ]);

  const conversionRate = totalLeads ? (installed / totalLeads) * 100 : 0;

  return jsonOk({
    totalLeads,
    todaysCalls,
    conversionRate,
    installedCount: installed,
  });
}
