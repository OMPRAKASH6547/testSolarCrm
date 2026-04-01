import mongoose from "mongoose";

const CallLogSchema = new mongoose.Schema(
  {
    leadId: { type: mongoose.Schema.Types.ObjectId, ref: "Lead", required: true },
    staffId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    callDate: { type: Date, default: Date.now },
    callStatus: {
      type: String,
      enum: ["Interested", "Not Interested", "CNR", "Busy"],
      required: true,
    },
    followUpDate: { type: Date, default: null },
    previousCallDate: { type: Date, default: null },
    customerType: { type: String, enum: ["Domestic", "Commercial", ""], default: "" },
    requirementKw: { type: String, default: "" },
    visited: { type: Boolean, default: false },
    visitDate: { type: Date, default: null },
    address: {
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
      houseNo: { type: String, default: "" },
      landmark: { type: String, default: "" },
      mapsLink: { type: String, default: "" },
    },
    quotationFile: { type: String, default: "" },
    notes: { type: String, default: "" },
    submitStatus: { type: String, enum: ["pending", "done"], default: "pending" },
  },
  { timestamps: true }
);

CallLogSchema.index({ leadId: 1, createdAt: -1 });

export default mongoose.models.CallLog || mongoose.model("CallLog", CallLogSchema);
