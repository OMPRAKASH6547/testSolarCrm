"use client";

import { useState, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

function ResetInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/auth/reset-password", {
        method: "POST",
        body: JSON.stringify({ token, password }),
      });
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="card w-full max-w-md">
      <h1 className="mb-4 text-xl font-semibold">Reset password</h1>
      {error && <p className="mb-2 text-sm text-red-400">{error}</p>}
      <form onSubmit={onSubmit} className="flex flex-col gap-3">
        <input
          type="password"
          required
          placeholder="New password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit" className="btn-primary" disabled={loading || !token}>
          {loading ? "Saving…" : "Update password"}
        </button>
      </form>
      <Link href="/login" className="mt-4 block text-sm text-solar-400">
        Login
      </Link>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <Suspense fallback={<div className="text-slate-400">Loading…</div>}>
        <ResetInner />
      </Suspense>
    </div>
  );
}
