"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [otp, setOtp] = useState("");
  const [needsOtp, setNeedsOtp] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const body = { email, password };
      if (needsOtp && otp) body.otp = otp;
      const data = await apiFetch("/api/auth/login", {
        method: "POST",
        body: JSON.stringify(body),
      });
      if (data.needsOtp) {
        setNeedsOtp(true);
        setLoading(false);
        return;
      }
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 p-4">
      <div className="card w-full max-w-md border-slate-700">
        <h1 className="mb-1 text-2xl font-bold text-solar-400">SolarPro CRM</h1>
        <p className="mb-6 text-sm text-slate-400">Sign in to your account</p>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <form onSubmit={onSubmit} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            Email
            <input
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Password
            <input
              type="password"
              autoComplete="current-password"
              required={!needsOtp}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </label>
          {needsOtp && (
            <label className="flex flex-col gap-1 text-sm">
              Email OTP
              <input value={otp} onChange={(e) => setOtp(e.target.value)} placeholder="6-digit code" />
            </label>
          )}
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Signing in…" : "Sign in"}
          </button>
        </form>
        <div className="mt-4 flex justify-between text-xs text-slate-500">
          <Link href="/forgot-password" className="hover:text-solar-400">
            Forgot password?
          </Link>
          <Link href="/register" className="hover:text-solar-400">
            First-time setup
          </Link>
        </div>
      </div>
    </div>
  );
}
