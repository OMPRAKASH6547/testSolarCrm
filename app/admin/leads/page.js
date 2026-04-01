"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function AllLeadsPage() {
  const [leads, setLeads] = useState([]);
  const [filter, setFilter] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const q = filter ? `?status=${encodeURIComponent(filter)}` : "";
        const data = await apiFetch(`/api/leads${q}`);
        setLeads(data.leads || []);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, [filter]);

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">All leads</h1>
      <div className="mb-4 flex gap-2">
        <select value={filter} onChange={(e) => setFilter(e.target.value)}>
          <option value="">All statuses</option>
          <option value="new">New</option>
          <option value="assigned">Assigned</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
          <option value="installed">Installed</option>
          <option value="not_interested">Not interested</option>
        </select>
      </div>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[900px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">Mobile</th>
              <th className="p-2">City</th>
              <th className="p-2">kW</th>
              <th className="p-2">Type</th>
              <th className="p-2">Status</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l._id} className="border-t border-slate-800">
                <td className="p-2">{l.customerName}</td>
                <td className="p-2">{l.mobile}</td>
                <td className="p-2">{l.city}</td>
                <td className="p-2">{l.requirementKw}</td>
                <td className="p-2">{l.customerType}</td>
                <td className="p-2">{l.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
