"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { apiFetch } from "@/lib/client-api";

const links = [
  { href: "/staff", label: "Today’s Leads" },
  { href: "/staff/expenses", label: "My Expenses" },
];

export default function StaffShell({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex min-h-screen flex-col md:flex-row">
      <aside className="border-b border-slate-800 bg-slate-900/90 p-4 md:w-52 md:border-b-0 md:border-r">
        <div className="mb-4 text-lg font-semibold text-solar-400">SolarPro</div>
        <nav className="flex gap-2 md:flex-col">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 text-sm ${
                pathname === l.href ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 text-xs text-slate-500">
          <p className="text-slate-300">{user?.name}</p>
          <button type="button" onClick={logout} className="btn-secondary mt-2 w-full md:w-auto">
            Log out
          </button>
        </div>
      </aside>
      <main className="flex-1 overflow-auto p-4">{children}</main>
    </div>
  );
}
