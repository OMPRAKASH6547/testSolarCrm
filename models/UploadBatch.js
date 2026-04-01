import mongoose from "mongoose";

const UploadBatchSchema = new mongoose.Schema(
  {
    name: { type: String, default: "upload" },
    totalRows: { type: Number, default: 0 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export default mongoose.models.UploadBatch || mongoose.model("UploadBatch", UploadBatchSchema);
