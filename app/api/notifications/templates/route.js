import NotificationTemplate from "@/models/NotificationTemplate";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

const DEFAULTS = [
  {
    key: "followup",
    name: "Follow-up reminder",
    emailSubject: "Follow-up: Solar installation",
    emailBody: "<p>Hi {{name}}, this is a reminder for your solar enquiry.</p>",
    whatsappBody: "Hi {{name}}, reminder for your solar follow-up.",
  },
  {
    key: "quotation",
    name: "Quotation sent",
    emailSubject: "Your solar quotation",
    emailBody: "<p>Hi {{name}}, please find your quotation attached.</p>",
    whatsappBody: "Hi {{name}}, your quotation has been shared on email.",
  },
  {
    key: "installation",
    name: "Installation confirmation",
    emailSubject: "Installation scheduled",
    emailBody: "<p>Hi {{name}}, your installation is confirmed.</p>",
    whatsappBody: "Hi {{name}}, installation confirmed.",
  },
  {
    key: "payment_due",
    name: "Payment due",
    emailSubject: "Payment reminder",
    emailBody: "<p>Hi {{name}}, this is a payment reminder.</p>",
    whatsappBody: "Hi {{name}}, payment reminder for your solar order.",
  },
];

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "sendNotifications")) {
    return jsonError("Forbidden", 403);
  }
  await (await import("@/lib/db")).connectDB();
  let list = await NotificationTemplate.find().lean();
  if (!list.length) {
    await NotificationTemplate.insertMany(DEFAULTS);
    list = await NotificationTemplate.find().lean();
  }
  return jsonOk({ templates: list });
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "sendNotifications")) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const t = await NotificationTemplate.findOneAndUpdate(
    { key: body.key },
    {
      $set: {
        name: body.name,
        emailSubject: body.emailSubject,
        emailBody: body.emailBody,
        whatsappBody: body.whatsappBody,
      },
    },
    { upsert: true, new: true }
  );
  return jsonOk({ template: t });
}
