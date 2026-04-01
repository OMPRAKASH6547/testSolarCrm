"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function AssignPage() {
  const [batches, setBatches] = useState([]);
  const [users, setUsers] = useState([]);
  const [batchId, setBatchId] = useState("");
  const [ranges, setRanges] = useState([{ staffId: "", from: 0, to: 14 }]);
  const [staffIds, setStaffIds] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [b, u] = await Promise.all([apiFetch("/api/leads/batches"), apiFetch("/api/users")]);
        setBatches(b.batches || []);
        setUsers((u.users || []).filter((x) => x.role === "staff"));
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  function addRange() {
    setRanges([...ranges, { staffId: "", from: 0, to: 0 }]);
  }

  async function assignRanges(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    try {
      const data = await apiFetch("/api/leads/assign", {
        method: "POST",
        body: JSON.stringify({
          batchId,
          ranges: ranges.map((r) => ({
            staffId: r.staffId,
            from: Number(r.from),
            to: Number(r.to),
          })),
        }),
      });
      setMsg(`Updated ${data.updated} leads.`);
    } catch (e) {
      setErr(e.message);
    }
  }

  async function autoAssign(e) {
    e.preventDefault();
    setErr("");
    setMsg("");
    const ids = staffIds
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    try {
      const data = await apiFetch("/api/leads/auto-assign", {
        method: "POST",
        body: JSON.stringify({ batchId, staffIds: ids }),
      });
      setMsg(`Auto-assigned ${data.assigned} leads.`);
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Smart lead assignment</h1>
      {err && <p className="mb-2 text-sm text-red-400">{err}</p>}
      {msg && <p className="mb-2 text-sm text-solar-400">{msg}</p>}

      <div className="card mb-6 max-w-xl">
        <label className="mb-2 block text-sm text-slate-400">Upload batch</label>
        <select
          className="mb-4 w-full"
          value={batchId}
          onChange={(e) => setBatchId(e.target.value)}
        >
          <option value="">Select batch</option>
          {batches.map((b) => (
            <option key={b._id} value={b._id}>
              {b.name} — {b.leadCount} leads ({b.unassigned} unassigned)
            </option>
          ))}
        </select>

        <h2 className="mb-2 font-semibold">Assign by row ranges</h2>
        <form onSubmit={assignRanges} className="flex flex-col gap-3">
          {ranges.map((r, i) => (
            <div key={i} className="flex flex-wrap gap-2">
              <select
                value={r.staffId}
                onChange={(e) => {
                  const next = [...ranges];
                  next[i].staffId = e.target.value;
                  setRanges(next);
                }}
              >
                <option value="">Staff</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>
                    {u.name}
                  </option>
                ))}
              </select>
              <input
                type="number"
                className="w-24"
                placeholder="From"
                value={r.from}
                onChange={(e) => {
                  const next = [...ranges];
                  next[i].from = e.target.value;
                  setRanges(next);
                }}
              />
              <input
                type="number"
                className="w-24"
                placeholder="To"
                value={r.to}
                onChange={(e) => {
                  const next = [...ranges];
                  next[i].to = e.target.value;
                  setRanges(next);
                }}
              />
            </div>
          ))}
          <button type="button" className="btn-secondary text-xs" onClick={addRange}>
            + Add range
          </button>
          <button type="submit" className="btn-primary">
            Apply ranges
          </button>
        </form>
      </div>

      <div className="card max-w-xl">
        <h2 className="mb-2 font-semibold">Auto-assign by workload</h2>
        <p className="mb-3 text-xs text-slate-500">
          Comma-separated staff user IDs (copy from Staff page or DB).
        </p>
        <form onSubmit={autoAssign} className="flex flex-col gap-2">
          <textarea
            placeholder="staffId1, staffId2"
            value={staffIds}
            onChange={(e) => setStaffIds(e.target.value)}
            rows={2}
          />
          <button type="submit" className="btn-primary">
            Balance workload
          </button>
        </form>
      </div>
    </div>
  );
}
