"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function AdminExpensesPage() {
  const now = new Date();
  const defaultMonth = String(now.getMonth() + 1).padStart(2, "0");
  const defaultYear = String(now.getFullYear());

  const [leads, setLeads] = useState([]);
  const [report, setReport] = useState(null);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  const [filter, setFilter] = useState({
    mode: "month", // range | month | year
    from: now.toISOString().slice(0, 10),
    to: now.toISOString().slice(0, 10),
    month: defaultMonth, // 01..12
    year: defaultYear,
  });

  const [form, setForm] = useState({
    amount: "",
    kind: "fixed",
    percentOf: "",
    description: "",
    leadId: "", // optional
    expenseDate: now.toISOString().slice(0, 10),
  });

  useEffect(() => {
    (async () => {
      try {
        // Only installed deals make sense for profit calculations
        const data = await apiFetch("/api/leads?status=installed");
        setLeads(data.leads || []);
      } catch {
        // Optional; profit report still works without a lead select
      }
    })();
  }, []);

  async function loadReport() {
    setLoading(true);
    setErr("");
    try {
      const params = new URLSearchParams();
      params.set("mode", filter.mode);
      if (filter.mode === "range") {
        params.set("from", filter.from);
        params.set("to", filter.to);
      }
      if (filter.mode === "month") {
        params.set("month", filter.month);
        params.set("year", filter.year);
      }
      if (filter.mode === "year") {
        params.set("year", filter.year);
      }
      const data = await apiFetch(`/api/admin/expenses/report?${params.toString()}`);
      setReport(data);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReport();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function submitExpense(e) {
    e.preventDefault();
    setErr("");

    try {
      await apiFetch("/api/admin/expenses", {
        method: "POST",
        body: JSON.stringify({
          amount: form.amount,
          kind: form.kind,
          percentOf: form.percentOf,
          description: form.description,
          leadId: form.leadId || null,
          expenseDate: form.expenseDate || new Date().toISOString().slice(0, 10),
        }),
      });

      setForm({
        amount: "",
        kind: "fixed",
        percentOf: "",
        description: "",
        leadId: "",
        expenseDate: new Date().toISOString().slice(0, 10),
      });
      await loadReport();
    } catch (e2) {
      setErr(e2.message);
    }
  }

  const installations = report?.installations || [];
  const expenses = report?.expenses || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="mb-2 text-2xl font-bold">Admin expenses & Installation profit</h1>
        <p className="text-sm text-slate-400">
          Add daily expenses, filter by date range / monthly / yearly, and see profit per installed installation.
        </p>
        {err && <p className="mt-2 text-sm text-red-400">{err}</p>}
      </div>

      <form onSubmit={submitExpense} className="card max-w-3xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="flex-1">
            <label className="text-xs text-slate-500">Amount</label>
            <input
              type="number"
              required
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              placeholder="1000"
            />
          </div>

          <div className="w-40">
            <label className="text-xs text-slate-500">Type</label>
            <select value={form.kind} onChange={(e) => setForm({ ...form, kind: e.target.value })}>
              <option value="fixed">Fixed</option>
              <option value="percent">Percent</option>
            </select>
          </div>

          {form.kind === "percent" && (
            <div className="w-52">
              <label className="text-xs text-slate-500">Percent of</label>
              <input
                value={form.percentOf}
                onChange={(e) => setForm({ ...form, percentOf: e.target.value })}
                placeholder="e.g. 25000 (order value)"
              />
            </div>
          )}

          <div className="flex-1">
            <label className="text-xs text-slate-500">Description</label>
            <input
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="Traveling / Stationary / Other"
            />
          </div>

          <div className="w-44">
            <label className="text-xs text-slate-500">Expense date</label>
            <input
              type="date"
              value={form.expenseDate}
              onChange={(e) => setForm({ ...form, expenseDate: e.target.value })}
            />
          </div>

          <div className="min-w-[220px] flex-1">
            <label className="text-xs text-slate-500">Installation (optional)</label>
            <select
              value={form.leadId}
              onChange={(e) => setForm({ ...form, leadId: e.target.value })}
            >
              <option value="">General expense (not tied to one installation)</option>
              {leads.map((l) => (
                <option key={l._id} value={l._id}>
                  {l.customerName} ({l.mobile})
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="submit" className="btn-primary">
            Add expense
          </button>
          <button type="button" className="btn-secondary" onClick={() => loadReport()} disabled={loading}>
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </form>

      <div className="card max-w-5xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <div className="w-44">
            <label className="text-xs text-slate-500">Filter mode</label>
            <select value={filter.mode} onChange={(e) => setFilter({ ...filter, mode: e.target.value })}>
              <option value="range">Date range</option>
              <option value="month">Monthly</option>
              <option value="year">Yearly</option>
            </select>
          </div>

          {filter.mode === "range" && (
            <>
              <div className="flex-1">
                <label className="text-xs text-slate-500">From</label>
                <input type="date" value={filter.from} onChange={(e) => setFilter({ ...filter, from: e.target.value })} />
              </div>
              <div className="flex-1">
                <label className="text-xs text-slate-500">To</label>
                <input type="date" value={filter.to} onChange={(e) => setFilter({ ...filter, to: e.target.value })} />
              </div>
            </>
          )}

          {filter.mode === "month" && (
            <>
              <div className="w-44">
                <label className="text-xs text-slate-500">Month</label>
                <select value={filter.month} onChange={(e) => setFilter({ ...filter, month: e.target.value })}>
                  {Array.from({ length: 12 }).map((_, i) => {
                    const m = String(i + 1).padStart(2, "0");
                    return (
                      <option key={m} value={m}>
                        {m}
                      </option>
                    );
                  })}
                </select>
              </div>
              <div className="w-52">
                <label className="text-xs text-slate-500">Year</label>
                <input
                  type="number"
                  value={filter.year}
                  onChange={(e) => setFilter({ ...filter, year: e.target.value })}
                />
              </div>
            </>
          )}

          {filter.mode === "year" && (
            <div className="w-52">
              <label className="text-xs text-slate-500">Year</label>
              <input
                type="number"
                value={filter.year}
                onChange={(e) => setFilter({ ...filter, year: e.target.value })}
              />
            </div>
          )}

          <div className="sm:ml-auto">
            <button type="button" className="btn-primary" onClick={loadReport} disabled={loading}>
              Apply filter
            </button>
          </div>
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Money received" value={report?.totals?.totalReceived ?? "—"} />
          <Stat label="Total expenses" value={report?.totals?.totalExpense ?? "—"} />
          <Stat label="Profit" value={report?.totals?.totalProfit ?? "—"} />
          <Stat label="General expenses (overhead)" value={report?.totals?.overheadExpense ?? "—"} />
        </div>
      </div>

      <div className="card max-w-5xl">
        <h2 className="mb-3 font-semibold">Profit per installed installation</h2>
        {installations.length === 0 ? (
          <p className="text-sm text-slate-500">No installed installations found for this filter.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[900px] text-left text-sm">
              <thead className="bg-slate-900/80 text-slate-400">
                <tr>
                  <th className="p-3">Customer</th>
                  <th className="p-3">Installed date</th>
                  <th className="p-3">Money received</th>
                  <th className="p-3">Expenses (this installation)</th>
                  <th className="p-3">Profit</th>
                </tr>
              </thead>
              <tbody>
                {installations.map((x) => {
                  return (
                    <tr key={x.leadId} className="border-t border-slate-800">
                      <td className="p-3">
                        <div className="font-medium">{x.customerName}</div>
                        {x.mobile ? <div className="text-xs text-slate-500">{x.mobile}</div> : null}
                      </td>
                      <td className="p-3">
                        {x.installationDate ? new Date(x.installationDate).toLocaleDateString() : "—"}
                      </td>
                      <td className="p-3">{x.received}</td>
                      <td className="p-3">{x.leadExpense}</td>
                      <td className="p-3 font-semibold text-solar-400">{x.profit}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value }) {
  return (
    <div className="card border-slate-700/60">
      <p className="text-xs uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-solar-400">{value}</p>
    </div>
  );
}
