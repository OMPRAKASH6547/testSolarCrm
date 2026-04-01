"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from "recharts";
import { apiFetch } from "@/lib/client-api";

export default function AdminOverviewPage() {
  const [summary, setSummary] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const s = await apiFetch("/api/admin/summary");
        setSummary(s);
      } catch (e) {
        setErr(e.message);
      }
      try {
        const a = await apiFetch("/api/analytics/overview");
        setAnalytics(a);
      } catch {
        /* optional permission */
      }
    })();
  }, []);

  const staffData =
    analytics?.staffPerformance?.map((x) => ({
      name: x.name?.split(" ")[0] || "Staff",
      conv: Math.round(x.conversion * 10) / 10,
      calls: x.calls,
    })) || [];

  return (
    <div className="pb-8">
      <h1 className="mb-6 text-2xl font-bold text-white">Dashboard</h1>
      {err && <p className="mb-2 text-sm text-amber-400">{err}</p>}
      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Total leads" value={summary?.totalLeads ?? "—"} />
        <Stat label="Today’s calls" value={summary?.todaysCalls ?? "—"} />
        <Stat
          label="Conversion rate"
          value={
            summary?.conversionRate != null ? `${summary.conversionRate.toFixed(1)}%` : "—"
          }
        />
        <Stat label="Installed" value={summary?.installedCount ?? "—"} />
      </div>
      <div className="card border-slate-700/60">
        <h2 className="mb-1 font-semibold text-slate-200">Staff performance</h2>
        <p className="mb-4 text-sm text-slate-500">Conversion % by staff (needs assigned leads and outcomes)</p>
        {staffData.length > 0 ? (
          <div className="h-72 w-full min-h-[18rem]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                <XAxis dataKey="name" stroke="#94a3b8" fontSize={12} />
                <YAxis stroke="#94a3b8" fontSize={12} />
                <Tooltip
                  contentStyle={{ background: "#1e293b", border: "1px solid #334155" }}
                  labelStyle={{ color: "#e2e8f0" }}
                />
                <Bar dataKey="conv" fill="#22c55e" name="Conversion %" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        ) : (
          <div className="flex min-h-[12rem] flex-col items-center justify-center rounded-lg border border-dashed border-slate-600/80 bg-slate-900/40 px-4 py-10 text-center">
            <p className="text-sm text-slate-400">No staff performance data yet.</p>
            <p className="mt-2 max-w-md text-xs text-slate-500">
              Add staff, assign leads, and log call outcomes — charts appear here when there is data.
            </p>
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
