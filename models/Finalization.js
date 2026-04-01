import mongoose from "mongoose";

const FinalizationSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true, unique: true },
    solarPanelMakeModel: { type: String, default: "" },
    paymentType: { type: String, enum: ["Cash", "Loan", ""], default: "" },
    systemType: { type: String, enum: ["On-Grid", "Off-Grid", "Hybrid", ""], default: "" },
    deliveryDate: { type: Date, default: null },
    installationDate: { type: Date, default: null },
    netMetering: { type: Boolean, default: false },
    subsidyApplied: { type: Boolean, default: false },
    paymentBreakdown: {
      firstPayment: { type: Number, default: 0 },
      finalPayment: { type: Number, default: 0 },
      balance: { type: Number, default: 0 },
    },
    remarks: { type: String, default: "" },
    finalizedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.Finalization || mongoose.model("Finalization", FinalizationSchema);
