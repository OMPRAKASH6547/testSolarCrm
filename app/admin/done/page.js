"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";
import FinalizeModal from "@/components/FinalizeModal";

export default function DonePage() {
  const [leads, setLeads] = useState([]);
  const [modal, setModal] = useState(null);
  const [err, setErr] = useState("");

  async function load() {
    try {
      const data = await apiFetch("/api/leads?status=done");
      setLeads(data.leads || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">Done leads — finalize installation</h1>
      <p className="mb-4 text-sm text-slate-400">
        Leads marked Done by staff appear here. Finalize to move them to Installed.
      </p>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[800px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-2">Customer</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">City</th>
              <th className="p-2">kW</th>
              <th className="p-2">Staff</th>
              <th className="p-2">Action</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l._id} className="border-t border-slate-800">
                <td className="p-2">{l.customerName}</td>
                <td className="p-2">{l.mobile}</td>
                <td className="p-2">{l.city}</td>
                <td className="p-2">{l.requirementKw}</td>
                <td className="p-2">{l.assignedTo?.name || "—"}</td>
                <td className="p-2">
                  <button
                    type="button"
                    className="btn-primary py-1 text-xs"
                    onClick={() => setModal(l)}
                  >
                    Finalize
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <FinalizeModal
        lead={modal}
        open={!!modal}
        onClose={() => setModal(null)}
        onDone={load}
      />
    </div>
  );
}
