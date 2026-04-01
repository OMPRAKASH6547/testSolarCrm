import mongoose from "mongoose";

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    phone: { type: String, trim: true, default: "" },
    role: {
      type: String,
      enum: ["super_admin", "admin", "staff"],
      default: "staff",
    },
    permissions: {
      manageStaff: { type: Boolean, default: false },
      uploadCsv: { type: Boolean, default: false },
      assignLeads: { type: Boolean, default: false },
      finalizeDeals: { type: Boolean, default: false },
      managePayments: { type: Boolean, default: false },
      manageInventory: { type: Boolean, default: false },
      viewAnalytics: { type: Boolean, default: false },
      sendNotifications: { type: Boolean, default: false },
    },
    otpCode: { type: String, select: false },
    otpExpires: { type: Date, select: false },
    resetToken: { type: String, select: false },
    resetExpires: { type: Date, select: false },
    loginOtpEnabled: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export default mongoose.models.User || mongoose.model("User", UserSchema);
