import Expense from "@/models/Expense";
import Lead from "@/models/Lead";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

function parseOptionalId(val) {
  if (val == null || val === "") return null;
  return String(val);
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "managePayments")) {
    return jsonError("Forbidden", 403);
  }

  const body = await request.json();
  const { amount, kind, percentOf, description, leadId, expenseDate } = body || {};

  if (amount == null || Number(amount) < 0) return jsonError("Valid amount required");

  const safeKind = kind === "percent" ? "percent" : "fixed";

  const resolvedLeadId = parseOptionalId(leadId);
  if (resolvedLeadId) {
    const lead = await Lead.findById(resolvedLeadId).select("_id").lean();
    if (!lead) return jsonError("Lead not found", 404);
  }

  const exp = await Expense.create({
    userId: r.user._id,
    amount: Number(amount),
    kind: safeKind,
    percentOf: percentOf || "",
    description: description || "",
    leadId: resolvedLeadId,
    expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
  });

  return jsonOk({ expense: exp.toObject ? exp.toObject() : exp });
}

