import Finalization from "@/models/Finalization";
import Lead from "@/models/Lead";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "finalizeDeals")) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const { leadId, ...rest } = body;
  if (!leadId) return jsonError("leadId is required");

  const lead = await Lead.findById(leadId);
  if (!lead) return jsonError("Lead not found", 404);
  if (lead.status !== "done") {
    return jsonError("Lead must be in Done status before finalization", 400);
  }

  const doc = await Finalization.findOneAndUpdate(
    { leadId },
    {
      $set: {
        solarPanelMakeModel: rest.solarPanelMakeModel || "",
        paymentType: rest.paymentType || "",
        systemType: rest.systemType || "",
        deliveryDate: rest.deliveryDate ? new Date(rest.deliveryDate) : null,
        installationDate: rest.installationDate ? new Date(rest.installationDate) : null,
        netMetering: Boolean(rest.netMetering),
        subsidyApplied: Boolean(rest.subsidyApplied),
        paymentBreakdown: {
          firstPayment: Number(rest.paymentBreakdown?.firstPayment || 0),
          finalPayment: Number(rest.paymentBreakdown?.finalPayment || 0),
          balance: Number(rest.paymentBreakdown?.balance || 0),
        },
        remarks: rest.remarks || "",
        finalizedBy: r.user._id,
      },
    },
    { upsert: true, new: true }
  );

  lead.status = "installed";
  await lead.save();

  return jsonOk({ finalization: doc, lead });
}
