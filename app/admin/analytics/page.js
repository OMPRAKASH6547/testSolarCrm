"use client";

import { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { apiFetch } from "@/lib/client-api";

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const a = await apiFetch("/api/analytics/overview");
        setData(a);
      } catch (e) {
        setErr(e.message);
      }
    })();
  }, []);

  const cityData =
    data?.cityDemand?.map((c) => ({ name: c._id, leads: c.count })) || [];

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Analytics & reports</h1>
      {err && <p className="mb-2 text-sm text-red-400">{err}</p>}
      {data && (
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="card">
            <p className="text-xs text-slate-500">Total leads</p>
            <p className="text-2xl font-semibold text-solar-400">{data.totalLeads}</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-500">Conversion</p>
            <p className="text-2xl font-semibold">{data.conversionRate?.toFixed(2)}%</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-500">Today’s calls</p>
            <p className="text-2xl font-semibold">{data.todaysCalls}</p>
          </div>
          <div className="card">
            <p className="text-xs text-slate-500">Pending finalize (Done)</p>
            <p className="text-2xl font-semibold">{data.donePendingFinalize}</p>
          </div>
        </div>
      )}
      {cityData.length > 0 && (
        <div className="card mb-8">
          <h2 className="mb-4 font-semibold">City-wise demand</h2>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cityData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" />
                <Tooltip contentStyle={{ background: "#1e293b", border: "1px solid #334155" }} />
                <Line type="monotone" dataKey="leads" stroke="#22c55e" strokeWidth={2} dot />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
      <div className="flex flex-wrap gap-3">
        <a
          className="btn-primary inline-block"
          href="/api/analytics/export?format=xlsx"
          target="_blank"
          rel="noreferrer"
        >
          Export Excel
        </a>
        <a
          className="btn-secondary inline-block"
          href="/api/analytics/export?format=csv"
          target="_blank"
          rel="noreferrer"
        >
          Export CSV
        </a>
      </div>
      <p className="mt-4 text-xs text-slate-500">
        Export uses your session cookie — open in same browser or download may fail auth.
      </p>
    </div>
  );
}
