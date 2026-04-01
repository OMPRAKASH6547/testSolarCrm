import Lead from "@/models/Lead";
import { requireAdmin, jsonError, adminHasPermission } from "@/lib/api-helpers";
import * as XLSX from "xlsx";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "viewAnalytics")) {
    return jsonError("Forbidden", 403);
  }

  const { searchParams } = new URL(request.url);
  const format = searchParams.get("format") || "xlsx";

  const leads = await Lead.find()
    .populate("assignedTo", "name email")
    .sort({ createdAt: -1 })
    .limit(5000)
    .lean();

  const rows = leads.map((l) => ({
    customerName: l.customerName,
    mobile: l.mobile,
    city: l.city,
    pincode: l.pincode,
    requirementKw: l.requirementKw,
    customerType: l.customerType,
    status: l.status,
    assignedTo: l.assignedTo?.name || "",
    followUpDate: l.followUpDate ? new Date(l.followUpDate).toISOString() : "",
    createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : "",
  }));

  if (format === "csv") {
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv",
        "Content-Disposition": 'attachment; filename="leads-export.csv"',
      },
    });
  }

  const ws = XLSX.utils.json_to_sheet(rows);
  const wb = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(wb, ws, "Leads");
  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" });
  return new Response(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": 'attachment; filename="leads-export.xlsx"',
    },
  });
}
