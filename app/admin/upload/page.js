"use client";

import { useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function UploadPage() {
  const [file, setFile] = useState(null);
  const [name, setName] = useState("");
  const [msg, setMsg] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    if (!file) return;
    setLoading(true);
    setErr("");
    setMsg("");
    try {
      const form = new FormData();
      form.append("file", file);
      if (name) form.append("name", name);
      const data = await apiFetch("/api/leads/upload", { method: "POST", body: form });
      setMsg(`Imported ${data.imported} leads. Batch ID: ${data.batchId}`);
      setFile(null);
    } catch (e) {
      setErr(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Bulk CSV upload</h1>
      <p className="mb-6 max-w-2xl text-sm text-slate-400">
        Columns: Customer name, Mobile, City, Pincode, Requirement (kW), Customer type (Domestic /
        Commercial), Other details. Header row required.
      </p>
      <div className="mb-4">
        <a href="/api/leads/sample-csv" download className="btn-secondary inline-block">
          Download sample CSV
        </a>
      </div>
      <div className="card max-w-md">
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            placeholder="Batch name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <input type="file" accept=".csv" onChange={(e) => setFile(e.target.files?.[0] || null)} />
          {err && <p className="text-sm text-red-400">{err}</p>}
          {msg && <p className="text-sm text-solar-400">{msg}</p>}
          <button type="submit" className="btn-primary" disabled={loading || !file}>
            {loading ? "Uploading…" : "Upload"}
          </button>
        </form>
      </div>
    </div>
  );
}
