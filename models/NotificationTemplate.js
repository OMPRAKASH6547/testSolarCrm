import mongoose from "mongoose";

const NotificationTemplateSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true },
    name: { type: String, required: true },
    emailSubject: { type: String, default: "" },
    emailBody: { type: String, default: "" },
    whatsappBody: { type: String, default: "" },
  },
  { timestamps: true }
);

export default mongoose.models.NotificationTemplate ||
  mongoose.model("NotificationTemplate", NotificationTemplateSchema);
