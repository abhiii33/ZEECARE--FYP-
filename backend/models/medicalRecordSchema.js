import mongoose from "mongoose";

const medicalRecordSchema = new mongoose.Schema(
  {
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
    appointmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Appointment",
    },
    visitDate: {
      type: Date,
      required: [true, "Visit Date Is Required!"],
      default: Date.now,
    },
    chiefComplaint: {
      type: String,
      required: [true, "Chief Complaint Is Required!"],
    },
    diagnosis: {
      type: String,
    },
    symptoms: {
      type: String,
    },
    treatment: {
      type: String,
    },
    clinicalNotes: {
      type: String,
    },
    followUpInstructions: {
      type: String,
    },
    followUpDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const MedicalRecord = mongoose.model(
  "MedicalRecord",
  medicalRecordSchema
);
