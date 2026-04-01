"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function NotificationsPage() {
  const [templates, setTemplates] = useState([]);
  const [leads, setLeads] = useState([]);
  const [sendForm, setSendForm] = useState({
    templateKey: "followup",
    leadId: "",
    toEmail: "",
  });
  const [err, setErr] = useState("");
  const [msg, setMsg] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [t, l] = await Promise.all([
          apiFetch("/api/notifications/templates"),
          apiFetch("/api/leads"),
        ]);
        setTemplates(t.templates || []);
        setLeads(l.leads || []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  async function saveTpl(t) {
    try {
      await apiFetch("/api/notifications/templates", {
        method: "POST",
        body: JSON.stringify(t),
      });
      setMsg("Saved template");
    } catch (e) {
      setErr(e.message);
    }
  }

  async function send(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const data = await apiFetch("/api/notifications/send", {
        method: "POST",
        body: JSON.stringify({
          templateKey: sendForm.templateKey,
          leadId: sendForm.leadId || undefined,
          toEmail: sendForm.toEmail || undefined,
        }),
      });
      setMsg(`Sent. Channels: ${JSON.stringify(data.results)}`);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Notifications (email + WhatsApp)</h1>
      <p className="mb-6 text-sm text-slate-400">
        Configure SMTP and Meta WhatsApp Cloud API in environment variables. Templates support{" "}
        {"{{name}}"}, {"{{city}}"}, {"{{mobile}}"} placeholders.
      </p>
      {err && <p className="text-sm text-red-400">{err}</p>}
      {msg && <p className="text-sm text-solar-400">{msg}</p>}

      <div className="mb-8 space-y-6">
        {templates.map((tpl) => (
          <div key={tpl.key} className="card">
            <h2 className="mb-2 font-semibold">{tpl.name}</h2>
            <TemplateEditor tpl={tpl} onSave={saveTpl} />
          </div>
        ))}
      </div>

      <div className="card max-w-md">
        <h2 className="mb-2 font-semibold">Send to lead</h2>
        <form onSubmit={send} className="flex flex-col gap-2 text-sm">
          <select
            value={sendForm.templateKey}
            onChange={(e) => setSendForm({ ...sendForm, templateKey: e.target.value })}
          >
            {templates.map((t) => (
              <option key={t.key} value={t.key}>
                {t.name}
              </option>
            ))}
          </select>
          <select
            value={sendForm.leadId}
            onChange={(e) => setSendForm({ ...sendForm, leadId: e.target.value })}
          >
            <option value="">Select lead (optional)</option>
            {leads.map((l) => (
              <option key={l._id} value={l._id}>
                {l.customerName} — {l.mobile}
              </option>
            ))}
          </select>
          <input
            placeholder="Customer email (optional override)"
            value={sendForm.toEmail}
            onChange={(e) => setSendForm({ ...sendForm, toEmail: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            Send notification
          </button>
        </form>
      </div>
    </div>
  );
}

function TemplateEditor({ tpl, onSave }) {
  const [t, setT] = useState(tpl);
  return (
    <div className="flex flex-col gap-2 text-sm">
      <input value={t.name} onChange={(e) => setT({ ...t, name: e.target.value })} />
      <input
        placeholder="Email subject"
        value={t.emailSubject}
        onChange={(e) => setT({ ...t, emailSubject: e.target.value })}
      />
      <textarea
        rows={3}
        placeholder="Email HTML"
        value={t.emailBody}
        onChange={(e) => setT({ ...t, emailBody: e.target.value })}
      />
      <textarea
        rows={2}
        placeholder="WhatsApp body"
        value={t.whatsappBody}
        onChange={(e) => setT({ ...t, whatsappBody: e.target.value })}
      />
      <button type="button" className="btn-secondary w-fit" onClick={() => onSave(t)}>
        Save template
      </button>
    </div>
  );
}
