import Expense from "@/models/Expense";
import { requireAuth, requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

export async function GET(request) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  if (r.user.role !== "staff") {
    return jsonError("Forbidden", 403);
  }
  const expenses = await Expense.find({ userId: r.user._id })
    .sort({ expenseDate: -1 })
    .limit(200)
    .lean();
  return jsonOk({ expenses });
}

export async function POST(request) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  if (r.user.role !== "staff") {
    return jsonError("Only staff can log expenses", 403);
  }
  const body = await request.json();
  const { amount, kind, percentOf, description, leadId, expenseDate } = body;
  if (amount == null || Number(amount) < 0) return jsonError("Valid amount required");
  const exp = await Expense.create({
    userId: r.user._id,
    amount: Number(amount),
    kind: kind === "percent" ? "percent" : "fixed",
    percentOf: percentOf || "",
    description: description || "",
    leadId: leadId || null,
    expenseDate: expenseDate ? new Date(expenseDate) : new Date(),
  });
  return jsonOk({ expense: exp });
}
