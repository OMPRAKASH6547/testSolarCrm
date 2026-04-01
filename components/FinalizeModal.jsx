"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function FinalizeModal({ lead, open, onClose, onDone }) {
  const [form, setForm] = useState({
    solarPanelMakeModel: "",
    paymentType: "Cash",
    systemType: "On-Grid",
    deliveryDate: "",
    installationDate: "",
    netMetering: false,
    subsidyApplied: false,
    firstPayment: "",
    finalPayment: "",
    balance: "",
    remarks: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!open || !lead) return null;

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await apiFetch("/api/finalize", {
        method: "POST",
        body: JSON.stringify({
          leadId: lead._id,
          solarPanelMakeModel: form.solarPanelMakeModel,
          paymentType: form.paymentType,
          systemType: form.systemType,
          deliveryDate: form.deliveryDate || null,
          installationDate: form.installationDate || null,
          netMetering: form.netMetering,
          subsidyApplied: form.subsidyApplied,
          paymentBreakdown: {
            firstPayment: form.firstPayment,
            finalPayment: form.finalPayment,
            balance: form.balance,
          },
          remarks: form.remarks,
        }),
      });
      onDone?.();
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
      <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <h2 className="mb-4 text-lg font-semibold">Finalize — {lead.customerName}</h2>
        {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
        <form onSubmit={submit} className="flex flex-col gap-2 text-sm">
          <input
            placeholder="Solar panel make & model"
            value={form.solarPanelMakeModel}
            onChange={(e) => setForm({ ...form, solarPanelMakeModel: e.target.value })}
          />
          <select
            value={form.paymentType}
            onChange={(e) => setForm({ ...form, paymentType: e.target.value })}
          >
            <option>Cash</option>
            <option>Loan</option>
          </select>
          <select
            value={form.systemType}
            onChange={(e) => setForm({ ...form, systemType: e.target.value })}
          >
            <option>On-Grid</option>
            <option>Off-Grid</option>
            <option>Hybrid</option>
          </select>
          <label className="flex flex-col gap-1">
            Structure / delivery date
            <input
              type="date"
              value={form.deliveryDate}
              onChange={(e) => setForm({ ...form, deliveryDate: e.target.value })}
            />
          </label>
          <label className="flex flex-col gap-1">
            Installation date
            <input
              type="date"
              value={form.installationDate}
              onChange={(e) => setForm({ ...form, installationDate: e.target.value })}
            />
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.netMetering}
              onChange={(e) => setForm({ ...form, netMetering: e.target.checked })}
            />
            Net metering
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.subsidyApplied}
              onChange={(e) => setForm({ ...form, subsidyApplied: e.target.checked })}
            />
            Subsidy applied
          </label>
          <div className="grid grid-cols-3 gap-2">
            <input
              placeholder="First payment"
              type="number"
              value={form.firstPayment}
              onChange={(e) => setForm({ ...form, firstPayment: e.target.value })}
            />
            <input
              placeholder="Final payment"
              type="number"
              value={form.finalPayment}
              onChange={(e) => setForm({ ...form, finalPayment: e.target.value })}
            />
            <input
              placeholder="Balance"
              type="number"
              value={form.balance}
              onChange={(e) => setForm({ ...form, balance: e.target.value })}
            />
          </div>
          <textarea
            placeholder="Remarks"
            rows={3}
            value={form.remarks}
            onChange={(e) => setForm({ ...form, remarks: e.target.value })}
          />
          <div className="flex gap-2">
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? "Saving…" : "Finalize & mark installed"}
            </button>
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
