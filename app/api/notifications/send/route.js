import Lead from "@/models/Lead";
import User from "@/models/User";
import NotificationTemplate from "@/models/NotificationTemplate";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import { notifyUserChannels } from "@/lib/notifications";
import mongoose from "mongoose";

function applyTemplate(str, vars) {
  if (!str) return "";
  let out = str;
  for (const [k, v] of Object.entries(vars)) {
    out = out.split(`{{${k}}}`).join(String(v ?? ""));
  }
  return out;
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "sendNotifications")) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const { templateKey, leadId, staffId, extraVars, toEmail } = body;
  if (!templateKey) return jsonError("templateKey required");

  const tpl = await NotificationTemplate.findOne({ key: templateKey });
  if (!tpl) return jsonError("Template not found", 404);

  let vars = { name: "", ...extraVars };
  let contact = { email: "", phone: "" };

  if (leadId && mongoose.isValidObjectId(leadId)) {
    const lead = await Lead.findById(leadId).lean();
    if (lead) {
      vars = {
        ...vars,
        name: lead.customerName,
        city: lead.city,
        mobile: lead.mobile,
      };
      contact.email = toEmail || lead.email || extraVars?.email || "";
      contact.phone = lead.mobile;
    }
  }
  if (staffId && mongoose.isValidObjectId(staffId)) {
    const u = await User.findById(staffId).lean();
    if (u) {
      vars.name = u.name;
      contact.email = u.email;
      contact.phone = u.phone;
    }
  }

  const subject = applyTemplate(tpl.emailSubject, vars);
  const emailBody = applyTemplate(tpl.emailBody, vars);
  const whatsappBody = applyTemplate(tpl.whatsappBody, vars);

  const results = await notifyUserChannels(
    { email: contact.email, phone: contact.phone },
    { subject, emailBody, whatsappBody }
  );

  return jsonOk({ results, subject, preview: { emailBody, whatsappBody } });
}
