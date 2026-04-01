import CallLog from "@/models/CallLog";
import Lead from "@/models/Lead";
import { requireAuth, jsonError, jsonOk } from "@/lib/api-helpers";
import { saveUploadBuffer } from "@/lib/upload-local";

function fullAddressOk(addr) {
  if (!addr) return false;
  const city = String(addr.city || "").trim();
  const pincode = String(addr.pincode || "").trim();
  const houseNo = String(addr.houseNo || "").trim();
  return Boolean(city && pincode && houseNo);
}

export async function POST(request) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  if (r.user.role !== "staff") {
    return jsonError("Only staff can log calls", 403);
  }

  const contentType = request.headers.get("content-type") || "";
  let leadId;
  let payload = {};

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    leadId = form.get("leadId");
    const qf = form.get("quotation");
    if (qf && typeof qf.arrayBuffer === "function") {
      const buf = Buffer.from(await qf.arrayBuffer());
      payload.quotationFile = await saveUploadBuffer(buf, qf.name || "q.pdf");
    }
    payload.callStatus = form.get("callStatus");
    payload.followUpDate = form.get("followUpDate") || null;
    payload.customerType = form.get("customerType") || "";
    payload.requirementKw = form.get("requirementKw") || "";
    payload.visited = form.get("visited") === "true" || form.get("visited") === "on";
    payload.visitDate = form.get("visitDate") || null;
    payload.notes = form.get("notes") || "";
    payload.submitStatus = form.get("submitStatus") || "pending";
    payload.address = {
      city: form.get("address.city") || "",
      pincode: form.get("address.pincode") || "",
      houseNo: form.get("address.houseNo") || "",
      landmark: form.get("address.landmark") || "",
      mapsLink: form.get("address.mapsLink") || "",
    };
  } else {
    const body = await request.json();
    leadId = body.leadId;
    payload = body;
  }

  if (!leadId) return jsonError("leadId is required");

  const lead = await Lead.findById(leadId);
  if (!lead) return jsonError("Lead not found", 404);
  if (String(lead.assignedTo) !== String(r.user._id)) {
    return jsonError("Forbidden", 403);
  }

  const prev = await CallLog.findOne({ leadId }).sort({ callDate: -1 });

  const submitStatus = payload.submitStatus === "done" ? "done" : "pending";
  if (submitStatus === "done") {
    const vis = Boolean(payload.visited);
    const addrOk = fullAddressOk(payload.address || lead.address);
    if (!vis || !addrOk) {
      return jsonError(
        "Done requires Visited = Yes and full address (house no., city, pincode)",
        400
      );
    }
  }

  const log = await CallLog.create({
    leadId,
    staffId: r.user._id,
    callDate: new Date(),
    callStatus: payload.callStatus || "CNR",
    followUpDate: payload.followUpDate ? new Date(payload.followUpDate) : null,
    previousCallDate: prev?.callDate || null,
    customerType: payload.customerType || lead.customerType,
    requirementKw: payload.requirementKw || lead.requirementKw,
    visited: Boolean(payload.visited),
    visitDate: payload.visitDate ? new Date(payload.visitDate) : null,
    address: payload.address || {},
    quotationFile: payload.quotationFile || "",
    notes: payload.notes || "",
    submitStatus,
  });

  lead.lastCallAt = new Date();
  if (payload.followUpDate) lead.followUpDate = new Date(payload.followUpDate);
  lead.customerType = payload.customerType || lead.customerType;
  lead.requirementKw = payload.requirementKw || lead.requirementKw;
  lead.visited = Boolean(payload.visited);
  lead.visitDate = payload.visitDate ? new Date(payload.visitDate) : lead.visitDate;
  lead.address = { ...lead.address?.toObject?.() || lead.address, ...payload.address };
  if (payload.quotationFile) lead.quotationFile = payload.quotationFile;
  lead.notes = payload.notes ?? lead.notes;

  if (["Interested", "Not Interested", "CNR", "Busy"].includes(payload.callStatus)) {
    if (payload.callStatus === "Not Interested") {
      lead.status = "not_interested";
    } else if (submitStatus === "done") {
      lead.status = "done";
    } else {
      lead.status = "in_progress";
    }
  }

  await lead.save();

  return jsonOk({ callLog: log, lead });
}

export async function GET(request) {
  const r = await requireAuth(request);
  if (r.error) return r.error;
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get("leadId");
  if (!leadId) return jsonError("leadId required");
  const lead = await Lead.findById(leadId);
  if (!lead) return jsonError("Not found", 404);
  if (r.user.role === "staff" && String(lead.assignedTo) !== String(r.user._id)) {
    return jsonError("Forbidden", 403);
  }
  const logs = await CallLog.find({ leadId }).sort({ createdAt: -1 }).lean();
  return jsonOk({ logs });
}
