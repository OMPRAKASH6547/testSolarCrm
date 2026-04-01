import mongoose from "mongoose";

const ExpenseSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    amount: { type: Number, required: true, min: 0 },
    kind: { type: String, enum: ["fixed", "percent"], default: "fixed" },
    percentOf: { type: String, default: "" },
    description: { type: String, default: "" },
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", default: null },
    expenseDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

ExpenseSchema.index({ userId: 1, expenseDate: -1 });

export default mongoose.models.Expense || mongoose.model("Expense", ExpenseSchema);
