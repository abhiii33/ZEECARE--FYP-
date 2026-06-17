import mongoose from "mongoose";

const prescriptionItemSchema = new mongoose.Schema(
  {
    medicineName: {
      type: String,
      required: [true, "Medicine Name Is Required!"],
    },
    dosage: {
      type: String,
      required: [true, "Dosage Is Required!"],
    },
    frequency: {
      type: String,
      required: [true, "Frequency Is Required!"],
    },
    durationDays: {
      type: Number,
      required: [true, "Duration Days Is Required!"],
    },
    instructions: {
      type: String,
    },
    quantity: {
      type: Number,
      default: 1,
    },
    isDispensed: {
      type: Boolean,
      default: false,
    },
  },
  { _id: true }
);

const prescriptionSchema = new mongoose.Schema(
  {
    medicalRecordId: {
      type: mongoose.Schema.ObjectId,
      ref: "MedicalRecord",
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
    },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Doctor Id Is Required!"],
    },
    prescriptionDate: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: ["Active", "Completed", "Cancelled"],
      default: "Active",
    },
    pharmacyNotes: {
      type: String,
    },
    items: [prescriptionItemSchema],
  },
  { timestamps: true }
);

export const Prescription = mongoose.model("Prescription", prescriptionSchema);
