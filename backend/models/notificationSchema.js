import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "User Id Is Required!"],
    },
    title: {
      type: String,
      required: [true, "Notification Title Is Required!"],
    },
    body: {
      type: String,
      required: [true, "Notification Body Is Required!"],
    },
    type: {
      type: String,
      enum: [
        "Appointment",
        "OPD",
        "LabResult",
        "Prescription",
        "Payment",
        "System",
        "Announcement",
      ],
      required: [true, "Notification Type Is Required!"],
    },
    channel: {
      type: String,
      enum: ["InApp", "Email", "SMS", "Push"],
      default: "InApp",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    actionUrl: {
      type: String,
    },
  },
  { timestamps: true }
);

notificationSchema.index({ userId: 1, isRead: 1, createdAt: -1 });

export const Notification = mongoose.model("Notification", notificationSchema);
