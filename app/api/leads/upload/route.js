import { parse } from "csv-parse/sync";
import { connectDB } from "@/lib/db";
import Lead from "@/models/Lead";
import UploadBatch from "@/models/UploadBatch";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

function normalizeRow(row) {
  const keys = Object.keys(row);
  const lower = {};
  for (const k of keys) {
    lower[k.trim().toLowerCase()] = row[k];
  }
  const customerName =
    lower["customer name"] ||
    lower["name"] ||
    lower["customername"] ||
    "";
  const mobile =
    lower["mobile"] ||
    lower["phone"] ||
    lower["mobile number"] ||
    "";
  const city = lower["city"] || "";
  const pincode = lower["pincode"] || lower["pin"] || "";
  const requirementKw =
    lower["requirement"] ||
    lower["requirement (kw)"] ||
    lower["kw"] ||
    "";
  const customerType = (lower["customer type"] || lower["type"] || "").trim();
  const typeNorm =
    customerType.toLowerCase() === "commercial"
      ? "Commercial"
      : customerType.toLowerCase() === "domestic"
        ? "Domestic"
        : "";
  const otherDetails = lower["other details"] || lower["notes"] || lower["remarks"] || "";
  const email = lower["email"] || lower["e-mail"] || "";
  return {
    customerName: String(customerName).trim(),
    email: String(email).trim(),
    mobile: String(mobile).replace(/\s/g, ""),
    city: String(city).trim(),
    pincode: String(pincode).trim(),
    requirementKw: String(requirementKw).trim(),
    customerType: typeNorm,
    otherDetails: String(otherDetails).trim(),
  };
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "uploadCsv")) {
    return jsonError("Forbidden", 403);
  }
  try {
    await connectDB();
    const form = await request.formData();
    const file = form.get("file");
    if (!file || typeof file.arrayBuffer !== "function") {
      return jsonError("CSV file is required");
    }
    const buf = Buffer.from(await file.arrayBuffer());
    const text = buf.toString("utf-8");
    const records = parse(text, {
      columns: true,
      skip_empty_lines: true,
      trim: true,
    });
    const batch = await UploadBatch.create({
      name: form.get("name") || `upload-${new Date().toISOString()}`,
      totalRows: records.length,
      createdBy: r.user._id,
    });
    const leads = [];
    let rowIndex = 0;
    for (const row of records) {
      const n = normalizeRow(row);
      if (!n.customerName && !n.mobile) continue;
      leads.push({
        ...n,
        uploadBatchId: batch._id,
        rowIndex,
        status: "new",
        createdBy: r.user._id,
      });
      rowIndex += 1;
    }
    if (leads.length) await Lead.insertMany(leads);
    await UploadBatch.findByIdAndUpdate(batch._id, { totalRows: leads.length });
    return jsonOk({ imported: leads.length, batchId: batch._id });
  } catch (e) {
    console.error(e);
    return jsonError(e.message || "Upload failed", 500);
  }
}
