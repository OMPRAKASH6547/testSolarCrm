import nodemailer from "nodemailer";

let transporter;

function getTransporter() {
  if (transporter) return transporter;
  const host = process.env.SMTP_HOST;
  const port = Number(process.env.SMTP_PORT || 587);
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  if (!host || !user) return null;
  transporter = nodemailer.createTransport({
    host,
    port,
    secure: port === 465,
    auth: { user, pass },
  });
  return transporter;
}

export async function sendEmail({ to, subject, html, text }) {
  const t = getTransporter();
  if (!t) {
    console.warn("[email] SMTP not configured; skipping send to", to);
    return { ok: false, skipped: true };
  }
  const from = process.env.SMTP_FROM || process.env.SMTP_USER;
  await t.sendMail({ from, to, subject, html, text });
  return { ok: true };
}

export async function sendWhatsAppText({ toPhoneE164, body }) {
  const token = process.env.WHATSAPP_TOKEN;
  const phoneId = process.env.WHATSAPP_PHONE_ID;
  if (!token || !phoneId) {
    console.warn("[whatsapp] WHATSAPP_TOKEN or WHATSAPP_PHONE_ID missing; skipping");
    return { ok: false, skipped: true };
  }
  const digits = String(toPhoneE164).replace(/\D/g, "");
  const to = digits.startsWith("91") && digits.length > 10 ? digits : `91${digits.replace(/^0+/, "")}`;
  const url = `https://graph.facebook.com/v21.0/${phoneId}/messages`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      messaging_product: "whatsapp",
      to,
      type: "text",
      text: { preview_url: false, body: String(body).slice(0, 4096) },
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error("[whatsapp] API error", res.status, data);
    return { ok: false, error: data };
  }
  return { ok: true, data };
}

export async function notifyUserChannels(user, { subject, emailBody, whatsappBody }) {
  const results = [];
  if (user?.email && emailBody) {
    results.push(await sendEmail({ to: user.email, subject, html: emailBody }));
  }
  if (user?.phone && whatsappBody) {
    results.push(await sendWhatsAppText({ toPhoneE164: user.phone, body: whatsappBody }));
  }
  return results;
}
