import mongoose from "mongoose";

const PurchaseSchema = new mongoose.Schema(
  {
    vendor: { type: String, required: true, trim: true },
    billNumber: { type: String, default: "" },
    purchaseDate: { type: Date, default: Date.now },
    amount: { type: Number, default: 0, min: 0 },
    billFile: { type: String, default: "" },
    items: [
      {
        inventoryItemId: { type: mongoose.Schema.Types.ObjectId, ref: "InventoryItem" },
        quantity: { type: Number, default: 0 },
        rate: { type: Number, default: 0 },
      },
    ],
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Purchase || mongoose.model("Purchase", PurchaseSchema);
