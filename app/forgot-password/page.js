"use client";

import { useState } from "react";
import Link from "next/link";
import { apiFetch } from "@/lib/client-api";

export default function ForgotPage() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg("");
    try {
      const data = await apiFetch("/api/auth/forgot-password", {
        method: "POST",
        body: JSON.stringify({ email }),
      });
      setMsg(data.message || "Check your email.");
    } catch {
      setMsg("If an account exists, a reset link was sent.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="card w-full max-w-md">
        <h1 className="mb-4 text-xl font-semibold">Forgot password</h1>
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input
            type="email"
            required
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Sending…" : "Send reset link"}
          </button>
        </form>
        {msg && <p className="mt-3 text-sm text-slate-400">{msg}</p>}
        <Link href="/login" className="mt-4 block text-sm text-solar-400">
          Back to login
        </Link>
      </div>
    </div>
  );
}
