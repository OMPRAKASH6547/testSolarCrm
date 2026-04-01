import InventoryItem from "@/models/InventoryItem";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageInventory")) {
    return jsonError("Forbidden", 403);
  }
  const items = await InventoryItem.find().sort({ name: 1 }).lean();
  return jsonOk({ items });
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageInventory")) {
    return jsonError("Forbidden", 403);
  }
  const body = await request.json();
  const item = await InventoryItem.create({
    name: body.name,
    sku: body.sku || "",
    category: body.category || "other",
    quantity: Number(body.quantity || 0),
    unit: body.unit || "pcs",
    minStock: Number(body.minStock || 0),
  });
  return jsonOk({ item });
}
