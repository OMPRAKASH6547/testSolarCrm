"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await apiFetch("/api/auth/register", {
        method: "POST",
        body: JSON.stringify({ name, email, password }),
      });
      router.push("/admin");
      router.refresh();
    } catch (err) {
      setError(err.message || "Registration not allowed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="card w-full max-w-md">
        <h1 className="mb-1 text-xl font-semibold text-solar-400">Create Super Admin</h1>
        <p className="mb-4 text-sm text-slate-400">
          Only works when no users exist. After that, admins create staff accounts.
        </p>
        {error && <p className="mb-3 text-sm text-red-400">{error}</p>}
        <form onSubmit={onSubmit} className="flex flex-col gap-3">
          <input placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} required />
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <button type="submit" className="btn-primary" disabled={loading}>
            {loading ? "Creating…" : "Create account"}
          </button>
        </form>
        <Link href="/login" className="mt-4 block text-center text-sm text-slate-500 hover:text-solar-400">
          Back to login
        </Link>
      </div>
    </div>
  );
}
