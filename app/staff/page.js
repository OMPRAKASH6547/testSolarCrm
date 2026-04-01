"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import CallModal from "@/components/CallModal";

export default function StaffHomePage() {
  const [leads, setLeads] = useState([]);
  const [doneLeads, setDoneLeads] = useState([]);
  const [modalLead, setModalLead] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    try {
      const data = await apiFetch("/api/leads/today");
      setLeads(data.leads || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function loadDone() {
    try {
      const data = await apiFetch("/api/leads?status=done");
      setDoneLeads(data.leads || []);
    } catch (e) {
      // Keep the main error display for today leads; done list can fail silently.
    }
  }

  useEffect(() => {
    load();
    loadDone();
  }, []);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Today’s leads</h1>
      <p className="mb-6 text-sm text-slate-400">
        Assigned leads due for follow-up. Tap Call to log outcome and details.
      </p>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[960px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-2">Customer</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">kW</th>
              <th className="p-2">Type</th>
              <th className="p-2">City</th>
              <th className="p-2">Status</th>
              <th className="p-2">Follow-up</th>
              <th className="p-2" />
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l._id} className="border-t border-slate-800">
                <td className="p-2">{l.customerName}</td>
                <td className="p-2">
                  <a className="text-solar-400" href={`tel:${l.mobile}`}>
                    {l.mobile}
                  </a>
                </td>
                <td className="p-2">{l.requirementKw}</td>
                <td className="p-2">{l.customerType}</td>
                <td className="p-2">{l.city}</td>
                <td className="p-2">{l.status}</td>
                <td className="p-2">
                  {l.followUpDate ? new Date(l.followUpDate).toLocaleDateString() : "—"}
                </td>
                <td className="p-2">
                  <button
                    type="button"
                    className="btn-primary py-1 text-xs"
                    onClick={() => setModalLead(l)}
                  >
                    Call now
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <CallModal
        lead={modalLead}
        open={!!modalLead}
        onClose={() => setModalLead(null)}
        onSaved={load}
      />

      <div className="mt-10">
        <h2 className="mb-2 text-xl font-bold">Done leads (waiting for admin finalize)</h2>
        <p className="mb-4 text-sm text-slate-400">
          These leads were submitted by you. Admin finalize will move them to Installed.
        </p>
        <div className="overflow-x-auto rounded-xl border border-slate-800">
          <table className="w-full min-w-[900px] text-left text-sm">
            <thead className="bg-slate-900/80 text-slate-400">
              <tr>
                <th className="p-2">Customer</th>
                <th className="p-2">Mobile</th>
                <th className="p-2">kW</th>
                <th className="p-2">City</th>
                <th className="p-2">Submitted by</th>
              </tr>
            </thead>
            <tbody>
              {doneLeads.length === 0 ? (
                <tr>
                  <td className="p-3 text-sm text-slate-500" colSpan={5}>
                    No done leads awaiting finalize.
                  </td>
                </tr>
              ) : (
                doneLeads.map((l) => (
                  <tr key={l._id} className="border-t border-slate-800">
                    <td className="p-2">{l.customerName}</td>
                    <td className="p-2">
                      <a className="text-solar-400" href={`tel:${l.mobile}`}>
                        {l.mobile}
                      </a>
                    </td>
                    <td className="p-2">{l.requirementKw}</td>
                    <td className="p-2">{l.city}</td>
                    <td className="p-2">{l.assignedTo?.name || "You"}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
