import mongoose from "mongoose";
import validator from "validator";

const doctorLeaveSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Doctor Id Is Required!"],
    },
    leaveDate: {
      type: Date,
      required: [true, "Leave Date Is Required!"],
    },
    leaveType: {
      type: String,
      enum: ["Sick", "Personal", "Conference", "Holiday"],
      default: "Personal",
    },
    reason: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
    },
    approvedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

doctorLeaveSchema.index({ doctorId: 1, leaveDate: 1 });
doctorLeaveSchema.index({ status: 1 });
doctorLeaveSchema.index({ leaveDate: 1 });

export const DoctorLeave = mongoose.model("DoctorLeave", doctorLeaveSchema);
