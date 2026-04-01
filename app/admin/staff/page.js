"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

const permKeys = [
  ["manageStaff", "Manage staff"],
  ["uploadCsv", "CSV upload"],
  ["assignLeads", "Assign leads"],
  ["finalizeDeals", "Finalize deals"],
  ["managePayments", "Payments / expenses view"],
  ["manageInventory", "Inventory"],
  ["viewAnalytics", "Analytics"],
  ["sendNotifications", "Notifications"],
];

export default function StaffPage() {
  const [users, setUsers] = useState([]);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "staff",
    phone: "",
    permissions: {},
  });
  const [editing, setEditing] = useState(null);

  async function load() {
    try {
      const data = await apiFetch("/api/users");
      setUsers(data.users || []);
    } catch (e) {
      setError(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function createUser(e) {
    e.preventDefault();
    setError("");
    try {
      await apiFetch("/api/users", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          permissions: form.role === "admin" ? form.permissions : {},
        }),
      });
      setForm({
        name: "",
        email: "",
        password: "",
        role: "staff",
        phone: "",
        permissions: {},
      });
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  async function saveEdit(e) {
    e.preventDefault();
    if (!editing) return;
    try {
      await apiFetch(`/api/users/${editing._id}`, {
        method: "PATCH",
        body: JSON.stringify({
          name: editing.name,
          phone: editing.phone,
          role: editing.role,
          permissions: editing.permissions,
          loginOtpEnabled: editing.loginOtpEnabled,
          password: editing.newPassword || undefined,
        }),
      });
      setEditing(null);
      load();
    } catch (e) {
      setError(e.message);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Staff management</h1>
      {error && <p className="mb-3 text-sm text-red-400">{error}</p>}

      <div className="card mb-8 max-w-xl">
        <h2 className="mb-3 font-semibold">Add staff / admin</h2>
        <form onSubmit={createUser} className="flex flex-col gap-2 text-sm">
          <input
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            type="email"
            placeholder="Email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <input
            type="password"
            placeholder="Password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <input
            placeholder="Phone (WhatsApp)"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
          />
          <select
            value={form.role}
            onChange={(e) => setForm({ ...form, role: e.target.value })}
          >
            <option value="staff">Staff</option>
            <option value="admin">Admin</option>
          </select>
          {form.role === "admin" && (
            <div className="grid gap-2 border border-slate-700 p-2">
              <p className="text-xs text-slate-500">Admin permissions</p>
              {permKeys.map(([k, label]) => (
                <label key={k} className="flex items-center gap-2 text-xs">
                  <input
                    type="checkbox"
                    checked={!!form.permissions[k]}
                    onChange={(e) =>
                      setForm({
                        ...form,
                        permissions: { ...form.permissions, [k]: e.target.checked },
                      })
                    }
                  />
                  {label}
                </label>
              ))}
            </div>
          )}
          <button type="submit" className="btn-primary mt-2">
            Create account
          </button>
        </form>
      </div>

      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full min-w-[640px] text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-3">Name</th>
              <th className="p-3">Email</th>
              <th className="p-3">Role</th>
              <th className="p-3">Phone</th>
              <th className="p-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u) => (
              <tr key={u._id} className="border-t border-slate-800">
                <td className="p-3">{u.name}</td>
                <td className="p-3">{u.email}</td>
                <td className="p-3">{u.role}</td>
                <td className="p-3">{u.phone || "—"}</td>
                <td className="p-3">
                  <button
                    type="button"
                    className="text-solar-400 hover:underline"
                    onClick={() => setEditing({ ...u, newPassword: "" })}
                  >
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editing && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
          <div className="card max-h-[90vh] w-full max-w-lg overflow-y-auto">
            <h3 className="mb-3 font-semibold">Edit user</h3>
            <form onSubmit={saveEdit} className="flex flex-col gap-2 text-sm">
              <input
                value={editing.name}
                onChange={(e) => setEditing({ ...editing, name: e.target.value })}
              />
              <input
                value={editing.phone || ""}
                onChange={(e) => setEditing({ ...editing, phone: e.target.value })}
              />
              <select
                value={editing.role}
                onChange={(e) => setEditing({ ...editing, role: e.target.value })}
              >
                <option value="staff">Staff</option>
                <option value="admin">Admin</option>
              </select>
              <label className="flex items-center gap-2 text-xs">
                <input
                  type="checkbox"
                  checked={!!editing.loginOtpEnabled}
                  onChange={(e) =>
                    setEditing({ ...editing, loginOtpEnabled: e.target.checked })
                  }
                />
                Email OTP on login
              </label>
              <input
                type="password"
                placeholder="New password (optional)"
                value={editing.newPassword || ""}
                onChange={(e) => setEditing({ ...editing, newPassword: e.target.value })}
              />
              {editing.role === "admin" && (
                <div className="grid gap-2 border border-slate-700 p-2">
                  {permKeys.map(([k, label]) => (
                    <label key={k} className="flex items-center gap-2 text-xs">
                      <input
                        type="checkbox"
                        checked={!!editing.permissions?.[k]}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            permissions: {
                              ...editing.permissions,
                              [k]: e.target.checked,
                            },
                          })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
              )}
              <div className="flex gap-2">
                <button type="submit" className="btn-primary">
                  Save
                </button>
                <button type="button" className="btn-secondary" onClick={() => setEditing(null)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
