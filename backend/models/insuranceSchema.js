import mongoose from "mongoose";

const insuranceSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
    },
    providerName: {
      type: String,
      required: [true, "Provider Name Is Required!"],
    },
    policyNumber: {
      type: String,
      required: [true, "Policy Number Is Required!"],
    },
    groupNumber: {
      type: String,
    },
    validFrom: {
      type: Date,
      required: [true, "Valid From Date Is Required!"],
    },
    validTo: {
      type: Date,
      required: [true, "Valid To Date Is Required!"],
    },
    coverageAmount: {
      type: Number,
      required: [true, "Coverage Amount Is Required!"],
    },
    usedAmount: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Expired", "Cancelled"],
      default: "Active",
    },
  },
  { timestamps: true }
);

export const Insurance = mongoose.model("Insurance", insuranceSchema);
