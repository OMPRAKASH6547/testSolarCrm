"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/staff", label: "Staff" },
  { href: "/admin/upload", label: "CSV Upload" },
  { href: "/admin/assign", label: "Assign Leads" },
  { href: "/admin/leads", label: "All Leads" },
  { href: "/admin/done", label: "Done & Finalize" },
  { href: "/admin/expenses", label: "Expenses" },
  { href: "/admin/inventory", label: "Inventory" },
  { href: "/admin/analytics", label: "Analytics" },
  { href: "/admin/notifications", label: "Notifications" },
];

export default function AdminShell({ children, user }) {
  const pathname = usePathname();
  const router = useRouter();
  const [navOpen, setNavOpen] = useState(false);

  useEffect(() => {
    setNavOpen(false);
  }, [pathname]);

  useEffect(() => {
    if (!navOpen) return;
    const onKey = (e) => {
      if (e.key === "Escape") setNavOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [navOpen]);

  useEffect(() => {
    if (navOpen) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [navOpen]);

  async function logout() {
    await apiFetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  return (
    <div className="flex min-h-[100dvh] bg-slate-950">
      {navOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm md:hidden"
          onClick={() => setNavOpen(false)}
        />
      )}

      <aside
        id="admin-nav-drawer"
        className={[
          "fixed inset-y-0 left-0 z-50 flex w-56 max-w-[85vw] shrink-0 flex-col border-r border-slate-800 bg-slate-900 p-4 shadow-2xl",
          "transition-transform duration-200 ease-out",
          navOpen ? "translate-x-0" : "-translate-x-full",
          "md:static md:z-auto md:max-w-none md:translate-x-0 md:shadow-none",
        ].join(" ")}
      >
        <div className="mb-6 text-lg font-semibold text-solar-400">SolarPro CRM</div>
        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto text-sm">
          {links.map((l) => (
            <Link
              key={l.href}
              href={l.href}
              className={`rounded-lg px-3 py-2 ${
                pathname === l.href ? "bg-slate-800 text-white" : "text-slate-400 hover:bg-slate-800/60"
              }`}
            >
              {l.label}
            </Link>
          ))}
        </nav>
        <div className="mt-6 border-t border-slate-800 pt-4 text-xs text-slate-500">
          <p className="font-medium text-slate-300">{user?.name}</p>
          <p className="truncate">{user?.email}</p>
          <button type="button" onClick={logout} className="btn-secondary mt-3 w-full">
            Log out
          </button>
        </div>
      </aside>

      <main className="flex min-h-0 flex-1 flex-col bg-slate-950">
        <header className="sticky top-0 z-30 flex items-center gap-3 border-b border-slate-800/80 bg-slate-950/95 px-4 py-3 backdrop-blur supports-[backdrop-filter]:bg-slate-950/80 md:hidden">
          <button
            type="button"
            aria-expanded={navOpen}
            aria-controls="admin-nav-drawer"
            aria-label={navOpen ? "Close menu" : "Open menu"}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-slate-600 bg-slate-800 text-slate-100 hover:bg-slate-700"
            onClick={() => setNavOpen((o) => !o)}
          >
            {navOpen ? (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>
          <span className="min-w-0 flex-1 truncate font-semibold text-solar-400">SolarPro CRM</span>
          <button type="button" onClick={logout} className="btn-secondary shrink-0 text-xs">
            Log out
          </button>
        </header>
        <div className="flex-1 overflow-auto p-4 md:p-8">{children}</div>
      </main>
    </div>
  );
}
