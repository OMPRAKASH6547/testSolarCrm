import Purchase from "@/models/Purchase";
import InventoryItem from "@/models/InventoryItem";
import { requireAdmin, jsonError, jsonOk, adminHasPermission } from "@/lib/api-helpers";
import { saveUploadBuffer } from "@/lib/upload-local";

export async function GET(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageInventory")) {
    return jsonError("Forbidden", 403);
  }
  const purchases = await Purchase.find()
    .populate("items.inventoryItemId")
    .sort({ purchaseDate: -1 })
    .limit(200)
    .lean();
  return jsonOk({ purchases });
}

export async function POST(request) {
  const r = await requireAdmin(request);
  if (r.error) return r.error;
  if (!adminHasPermission(r.user, "manageInventory")) {
    return jsonError("Forbidden", 403);
  }

  const contentType = request.headers.get("content-type") || "";
  let vendor;
  let billNumber;
  let purchaseDate;
  let amount;
  let items = [];
  let notes = "";
  let billFile = "";

  if (contentType.includes("multipart/form-data")) {
    const form = await request.formData();
    vendor = form.get("vendor");
    billNumber = form.get("billNumber") || "";
    purchaseDate = form.get("purchaseDate");
    amount = form.get("amount");
    notes = form.get("notes") || "";
    const itemsJson = form.get("items");
    if (itemsJson) {
      try {
        items = JSON.parse(String(itemsJson));
      } catch {
        items = [];
      }
    }
    const bf = form.get("bill");
    if (bf && typeof bf.arrayBuffer === "function") {
      const buf = Buffer.from(await bf.arrayBuffer());
      billFile = await saveUploadBuffer(buf, bf.name || "bill.pdf");
    }
  } else {
    const body = await request.json();
    vendor = body.vendor;
    billNumber = body.billNumber;
    purchaseDate = body.purchaseDate;
    amount = body.amount;
    items = body.items || [];
    notes = body.notes || "";
    billFile = body.billFile || "";
  }

  if (!vendor) return jsonError("Vendor is required");

  const purchase = await Purchase.create({
    vendor,
    billNumber,
    purchaseDate: purchaseDate ? new Date(purchaseDate) : new Date(),
    amount: Number(amount || 0),
    billFile,
    items: items.map((i) => ({
      inventoryItemId: i.inventoryItemId,
      quantity: Number(i.quantity || 0),
      rate: Number(i.rate || 0),
    })),
    notes,
    createdBy: r.user._id,
  });

  for (const line of purchase.items) {
    if (line.inventoryItemId && line.quantity) {
      await InventoryItem.findByIdAndUpdate(line.inventoryItemId, {
        $inc: { quantity: line.quantity },
      });
    }
  }

  return jsonOk({ purchase });
}
