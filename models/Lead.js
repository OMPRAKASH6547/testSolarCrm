import mongoose from "mongoose";

const LeadSchema = new mongoose.Schema(
  {
    customerName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, trim: true },
    email: { type: String, trim: true, default: "" },
    city: { type: String, default: "", trim: true },
    pincode: { type: String, default: "", trim: true },
    requirementKw: { type: String, default: "" },
    customerType: { type: String, enum: ["Domestic", "Commercial", ""], default: "" },
    otherDetails: { type: String, default: "" },
    uploadBatchId: { type: mongoose.Schema.Types.ObjectId, ref: "UploadBatch" },
    rowIndex: { type: Number, default: 0 },
    assignedTo: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
    status: {
      type: String,
      enum: [
        "new",
        "assigned",
        "in_progress",
        "done",
        "installed",
        "not_interested",
        "lost",
      ],
      default: "new",
    },
    followUpDate: { type: Date, default: null },
    lastCallAt: { type: Date, default: null },
    address: {
      city: { type: String, default: "" },
      pincode: { type: String, default: "" },
      houseNo: { type: String, default: "" },
      landmark: { type: String, default: "" },
      mapsLink: { type: String, default: "" },
    },
    visited: { type: Boolean, default: false },
    visitDate: { type: Date, default: null },
    quotationFile: { type: String, default: "" },
    notes: { type: String, default: "" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

LeadSchema.index({ assignedTo: 1, followUpDate: 1 });
LeadSchema.index({ mobile: 1 });
LeadSchema.index({ status: 1 });

export default mongoose.models.Lead || mongoose.model("Lead", LeadSchema);
