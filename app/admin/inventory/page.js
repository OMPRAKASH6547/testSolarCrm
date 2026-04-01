"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/client-api";

export default function InventoryPage() {
  const [items, setItems] = useState([]);
  const [purchases, setPurchases] = useState([]);
  const [form, setForm] = useState({
    name: "",
    sku: "",
    category: "panel",
    quantity: 0,
    unit: "pcs",
  });
  const [purchaseForm, setPurchaseForm] = useState({
    vendor: "",
    amount: "",
    itemsJson: "[]",
  });
  const [err, setErr] = useState("");

  async function load() {
    try {
      const [i, p] = await Promise.all([
        apiFetch("/api/inventory/items"),
        apiFetch("/api/inventory/purchases"),
      ]);
      setItems(i.items || []);
      setPurchases(p.purchases || []);
    } catch (e) {
      setErr(e.message);
    }
  }

  useEffect(() => {
    load();
  }, []);

  async function addItem(e) {
    e.preventDefault();
    try {
      await apiFetch("/api/inventory/items", { method: "POST", body: JSON.stringify(form) });
      setForm({ name: "", sku: "", category: "panel", quantity: 0, unit: "pcs" });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  async function addPurchase(e) {
    e.preventDefault();
    try {
      let items;
      try {
        items = JSON.parse(purchaseForm.itemsJson || "[]");
      } catch {
        items = [];
      }
      await apiFetch("/api/inventory/purchases", {
        method: "POST",
        body: JSON.stringify({
          vendor: purchaseForm.vendor,
          amount: purchaseForm.amount,
          items,
        }),
      });
      load();
    } catch (e) {
      setErr(e.message);
    }
  }

  return (
    <div>
      <h1 className="mb-6 text-2xl font-bold">Inventory & purchases</h1>
      {err && <p className="mb-2 text-sm text-red-400">{err}</p>}

      <div className="card mb-6 max-w-xl">
        <h2 className="mb-2 font-semibold">Add stock item</h2>
        <form onSubmit={addItem} className="flex flex-col gap-2 text-sm">
          <input
            placeholder="Name"
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            placeholder="SKU"
            value={form.sku}
            onChange={(e) => setForm({ ...form, sku: e.target.value })}
          />
          <select
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value })}
          >
            <option value="panel">Panel</option>
            <option value="inverter">Inverter</option>
            <option value="structure">Structure</option>
            <option value="wire">Wire</option>
            <option value="other">Other</option>
          </select>
          <input
            type="number"
            placeholder="Initial qty"
            value={form.quantity}
            onChange={(e) => setForm({ ...form, quantity: e.target.value })}
          />
          <input
            placeholder="Unit"
            value={form.unit}
            onChange={(e) => setForm({ ...form, unit: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            Save item
          </button>
        </form>
      </div>

      <div className="card mb-6 max-w-xl">
        <h2 className="mb-2 font-semibold">Record purchase (JSON lines)</h2>
        <p className="mb-2 text-xs text-slate-500">
          Paste a JSON array of line items with inventoryItemId (Mongo id), quantity, and rate.
        </p>
        <form onSubmit={addPurchase} className="flex flex-col gap-2 text-sm">
          <input
            placeholder="Vendor"
            required
            value={purchaseForm.vendor}
            onChange={(e) => setPurchaseForm({ ...purchaseForm, vendor: e.target.value })}
          />
          <input
            placeholder="Total amount"
            value={purchaseForm.amount}
            onChange={(e) => setPurchaseForm({ ...purchaseForm, amount: e.target.value })}
          />
          <textarea
            rows={4}
            value={purchaseForm.itemsJson}
            onChange={(e) => setPurchaseForm({ ...purchaseForm, itemsJson: e.target.value })}
          />
          <button type="submit" className="btn-primary">
            Add purchase & stock in
          </button>
        </form>
      </div>

      <h2 className="mb-2 font-semibold">Stock</h2>
      <div className="mb-8 overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-2">Name</th>
              <th className="p-2">SKU</th>
              <th className="p-2">Category</th>
              <th className="p-2">Qty</th>
            </tr>
          </thead>
          <tbody>
            {items.map((it) => (
              <tr key={it._id} className="border-t border-slate-800">
                <td className="p-2">{it.name}</td>
                <td className="p-2">{it.sku}</td>
                <td className="p-2">{it.category}</td>
                <td className="p-2">
                  {it.quantity} {it.unit}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <h2 className="mb-2 font-semibold">Recent purchases</h2>
      <div className="overflow-x-auto rounded-xl border border-slate-800">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-900/80 text-slate-400">
            <tr>
              <th className="p-2">Vendor</th>
              <th className="p-2">Amount</th>
              <th className="p-2">Date</th>
            </tr>
          </thead>
          <tbody>
            {purchases.map((p) => (
              <tr key={p._id} className="border-t border-slate-800">
                <td className="p-2">{p.vendor}</td>
                <td className="p-2">{p.amount}</td>
                <td className="p-2">
                  {p.purchaseDate ? new Date(p.purchaseDate).toLocaleDateString() : ""}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
