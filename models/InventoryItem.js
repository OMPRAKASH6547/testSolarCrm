import mongoose from "mongoose";

const InventoryItemSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    sku: { type: String, default: "", trim: true },
    category: {
      type: String,
      enum: ["panel", "inverter", "structure", "wire", "other"],
      default: "other",
    },
    quantity: { type: Number, default: 0, min: 0 },
    unit: { type: String, default: "pcs" },
    minStock: { type: Number, default: 0 },
  },
  { timestamps: true }
);

InventoryItemSchema.index({ sku: 1 });

export default mongoose.models.InventoryItem || mongoose.model("InventoryItem", InventoryItemSchema);
