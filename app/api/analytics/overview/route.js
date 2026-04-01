import Lead from "@/models/Lead";
import CallLog from "@/models/CallLog";
import User from "@/models/User";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "viewAnalytics")) {
    return jsonError("Forbidden", 403);
  }

  const today = new Date();
  const t0 = startOfDay(today);
  const t1 = endOfDay(today);

  const totalLeads = await Lead.countDocuments();
  const installed = await Lead.countDocuments({ status: "installed" });
  const done = await Lead.countDocuments({ status: "done" });
  const todaysCalls = await CallLog.countDocuments({
    callDate: { $gte: t0, $lte: t1 },
  });
  const conversionRate = totalLeads ? (installed / totalLeads) * 100 : 0;

  const staffList = await User.find({ role: "staff" }).select("name email").lean();
  const staffPerf = await Promise.all(
    staffList.map(async (s) => {
      const assigned = await Lead.countDocuments({ assignedTo: s._id });
      const won = await Lead.countDocuments({ assignedTo: s._id, status: "installed" });
      const calls = await CallLog.countDocuments({ staffId: s._id });
      return {
        staffId: s._id,
        name: s.name,
        email: s.email,
        assigned,
        installed: won,
        calls,
        conversion: assigned ? (won / assigned) * 100 : 0,
      };
    })
  );

  const byCity = await Lead.aggregate([
    { $match: { city: { $nin: ["", null] } } },
    { $group: { _id: "$city", count: { $sum: 1 } } },
    { $sort: { count: -1 } },
    { $limit: 15 },
  ]);

  return jsonOk({
    totalLeads,
    todaysCalls,
    conversionRate,
    installedCount: installed,
    donePendingFinalize: done,
    staffPerformance: staffPerf,
    cityDemand: byCity,
  });
}
