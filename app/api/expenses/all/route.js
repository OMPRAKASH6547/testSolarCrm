import Expense from "@/models/Expense";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "managePayments")) {
    return jsonError("Forbidden", 403);
  }
  const expenses = await Expense.find()
    .populate("userId", "name email")
    .populate("leadId", "customerName mobile")
    .sort({ expenseDate: -1 })
    .limit(500)
    .lean();
  return jsonOk({ expenses });
}
