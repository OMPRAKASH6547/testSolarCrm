"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function StaffExpensesPage() {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState({
    amount: "",
    kind: "fixed",
    percentOf: "",
    description: "",
  });
  const [err, setErr] = useState("");

  async function load() {
    try {
      const data = await apiFetch("/api/expenses");
      setRows(data.expenses || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function submit(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/expenses", {
        method: "POST",
        body: JSON.stringify(form),
      });
      setForm({ amount: "", kind: "fixed", percentOf: "", description: "" });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 className="mb-4 text-2xl font-bold">My expenses</h1>
      {err && <p className="text-sm text-red-400">{err}</p>}
      <div className="card mb-6 max-w-md">
        <form onSubmit={submit} className="flex flex-col gap-2 text-sm">
          <input
            type="number"
            placeholder="Amount"
            required
            value={form.amount}
            onChange={(e) => setForm({ ...form, amount: e.target.value })}
          />
          <select
            value={form.kind}
            onChange={(e) => setForm({ ...form, kind: e.target.value })}
          >
            <option value="fixed">Fixed</option>
            <option value="percent">Percent of value</option>
          </select>
          <input
            placeholder="Reference (e.g. order value label)"
            value={form.percentOf}
            onChange={(e) => setForm({ ...form, percentOf: e.target.value })}
          />
          <textarea
            placeholder="Description"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            Log expense
          </button>
        </form>
      </div>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-2">Amount</th>
              <th className="p-2">Kind</th>
              <th className="p-2">Description</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x._id} className="border-t border-slate-800">
                <td className="p-2">{x.amount}</td>
                <td className="p-2">{x.kind}</td>
                <td className="p-2">{x.description}</td>
                <td className="p-2">
                  {x.expenseDate ? new Date(x.expenseDate).toLocaleDateString() : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
