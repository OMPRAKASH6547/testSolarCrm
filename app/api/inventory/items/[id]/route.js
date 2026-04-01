import InventoryItem from "@/models/InventoryItem";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import mongoose from "mongoose";

export async function PATCH(request, { params }) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageInventory")) {
    return jsonError("Forbidden", 403);
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid id");
  const body = await request.json();
  const item = await InventoryItem.findById(id);
  if (!item) return jsonError("Not found", 404);
  if (body.name) item.name = body.name;
  if (body.sku != null) item.sku = body.sku;
  if (body.category) item.category = body.category;
  if (body.quantity != null) item.quantity = Number(body.quantity);
  if (body.unit) item.unit = body.unit;
  if (body.minStock != null) item.minStock = Number(body.minStock);
  await item.save();
  return jsonOk({ item });
}

export async function DELETE(request, { params }) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageInventory")) {
    return jsonError("Forbidden", 403);
  }
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError("Invalid id");
  await InventoryItem.deleteOne({ _id: id });
  return jsonOk({ ok: true });
}
