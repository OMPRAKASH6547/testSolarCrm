import Lead from "@/models/Lead";
import { requireStaff, jsonError, jsonOk } from "@/lib/api-helpers";
import { startOfDay, endOfDay } from "date-fns";

export async function GET(request) {
  const r = await requireStaff(request);
  if (r.error) return r.error;
  const { searchParams } = new URL(request.url);
  const dayStr = searchParams.get("date");
  const day = dayStr ? new Date(dayStr) : new Date();
  const start = startOfDay(day);
  const end = endOfDay(day);

  const leads = await Lead.find({
    assignedTo: r.user._id,
    status: { $nin: ["installed", "not_interested", "lost"] },
    $or: [
      { followUpDate: { $gte: start, $lte: end } },
      { followUpDate: null },
      { followUpDate: { $lte: end } },
    ],
  })
    .sort({ followUpDate: 1 })
    .limit(500)
    .lean();

  return jsonOk({ leads, date: day.toISOString() });
}
