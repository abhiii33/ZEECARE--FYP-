import mongoose from "mongoose";
import validator from "validator";

const bedAllocationSchema = new mongoose.Schema(
  {
    bedId: {
      type: mongoose.Schema.ObjectId,
      ref: "Bed",
      required: [true, "Bed Id Is Required!"],
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
    },
    admittedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    doctorInCharge: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    admissionDate: {
      type: Date,
      required: [true, "Admission Date Is Required!"],
      default: Date.now,
    },
    expectedDischarge: {
      type: Date,
    },
    actualDischarge: {
      type: Date,
    },
    admissionReason: {
      type: String,
      required: [true, "Admission Reason Is Required!"],
    },
    dischargeNotes: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Discharged", "Transferred"],
      default: "Active",
    },
  },
  { timestamps: true }
);

bedAllocationSchema.index({ bedId: 1, status: 1 });
bedAllocationSchema.index({ patientId: 1 });
bedAllocationSchema.index({ status: 1 });
bedAllocationSchema.index({ doctorInCharge: 1, status: 1 });
bedAllocationSchema.index({ admissionDate: 1 });

export const BedAllocation = mongoose.model(
  "BedAllocation",
  bedAllocationSchema
);
