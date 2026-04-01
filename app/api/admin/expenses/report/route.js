import Expense from "@/models/Expense";
import Finalization from "@/models/Finalization";
import Lead from "@/models/Lead";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import { endOfDay, startOfDay } from "date-fns";

function toDateOrNull(s) {
  if (!s) return null;
  const d = new Date(s);
  if (Number.isNaN(d.getTime())) return null;
  return d;
}

function computeRange(query) {
  const modeRaw = String(query.mode || "range").toLowerCase();
  // Some users typed "early" meaning "yearly"
  const mode = modeRaw === "early" ? "year" : modeRaw;

  if (mode === "month") {
    const month = Number(query.month);
    const year = Number(query.year);
    if (!month || !year) throw new Error("month and year are required for month mode");
    const start = startOfDay(new Date(year, month - 1, 1));
    const end = endOfDay(new Date(year, month, 0));
    return { mode, start, end };
  }

  if (mode === "year") {
    const year = Number(query.year);
    if (!year) throw new Error("year is required for year mode");
    const start = startOfDay(new Date(year, 0, 1));
    const end = endOfDay(new Date(year, 11, 31));
    return { mode, start, end };
  }

  // range (default)
  const startD = toDateOrNull(query.from);
  const endD = toDateOrNull(query.to);
  if (!startD || !endD) throw new Error("from and to are required for range mode");
  const start = startOfDay(startD);
  const end = endOfDay(endD);
  if (start > end) throw new Error("from must be <= to");
  return { mode, start, end };
}

function sumArray(arr) {
  return arr.reduce((acc, x) => acc + (Number(x.amount) || 0), 0);
}

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "managePayments")) {
    return jsonError("Forbidden", 403);
  }

  const { searchParams } = new URL(request.url);
  const query = Object.fromEntries(searchParams.entries());

  let range;
  try {
    range = computeRange(query);
  } catch (e) {
    return jsonError(e.message || "Invalid date range");
  }

  const { start, end } = range;

  // 1) Installed/Finalized deals in range
  const finalizations = await Finalization.find({
    installationDate: { $gte: start, $lte: end },
  })
    .sort({ installationDate: -1 })
    .lean();

  const leadIdStrings = [...new Set(finalizations.map((f) => (f.leadId ? String(f.leadId) : ""))).values()].filter(Boolean);

  const leads = leadIdStrings.length
    ? await Lead.find({ _id: { $in: leadIdStrings } })
        .select("customerName mobile city")
        .lean()
    : [];
  const leadById = new Map(leads.map((l) => [String(l._id), l]));

  // 2) Expenses in range
  const expenses = await Expense.find({
    expenseDate: { $gte: start, $lte: end },
  })
    .populate("userId", "name email")
    .lean();

  const leadExpensesByLeadId = new Map();
  const overheadExpenses = [];

  for (const e of expenses) {
    const leadId = e.leadId ? String(e.leadId) : null;
    if (!leadId) {
      overheadExpenses.push(e);
      continue;
    }
    leadExpensesByLeadId.set(leadId, (leadExpensesByLeadId.get(leadId) || 0) + (Number(e.amount) || 0));
  }

  const overheadTotal = sumArray(overheadExpenses);

  const installations = finalizations.map((f) => {
    const leadId = f.leadId ? String(f.leadId) : "";
    const received =
      Number(f.paymentBreakdown?.firstPayment || 0) + Number(f.paymentBreakdown?.finalPayment || 0);
    const leadExpense = leadExpensesByLeadId.get(leadId) || 0;
    const profit = received - leadExpense;
    const lead = leadById.get(leadId);

    return {
      leadId,
      customerName: lead?.customerName || "—",
      mobile: lead?.mobile || "",
      city: lead?.city || "",
      installationDate: f.installationDate || null,
      received,
      leadExpense,
      profit,
    };
  });

  const totalReceived = installations.reduce((acc, x) => acc + (Number(x.received) || 0), 0);
  const totalLeadExpense = installations.reduce((acc, x) => acc + (Number(x.leadExpense) || 0), 0);
  const totalExpense = totalLeadExpense + overheadTotal;
  const totalProfit = totalReceived - totalExpense;

  return jsonOk({
    range: { start, end, mode: range.mode },
    totals: {
      totalReceived,
      totalLeadExpense,
      overheadExpense: overheadTotal,
      totalExpense,
      totalProfit,
    },
    // Include expenses list so UI can show per-installation breakdown
    expenses: expenses.map((e) => ({
      _id: e._id ? String(e._id) : "",
      userId: e.userId ? { name: e.userId.name, email: e.userId.email } : null,
      leadId: e.leadId ? String(e.leadId) : null,
      amount: Number(e.amount) || 0,
      kind: e.kind,
      percentOf: e.percentOf || "",
      description: e.description || "",
      expenseDate: e.expenseDate,
    })),
    installations,
  });
}

