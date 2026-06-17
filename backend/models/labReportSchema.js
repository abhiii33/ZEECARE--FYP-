import mongoose from "mongoose";

const labReportSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
    },
    orderedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Ordered By Is Required!"],
    },
    departmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
    },
    testName: {
      type: String,
      required: [true, "Test Name Is Required!"],
    },
    testCategory: {
      type: String,
    },
    result: {
      type: String,
    },
    referenceRange: {
      type: String,
    },
    interpretation: {
      type: String,
    },
    status: {
      type: String,
      enum: [
        "Ordered",
        "SampleCollected",
        "Processing",
        "Completed",
        "Cancelled",
      ],
      default: "Ordered",
    },
    reportFileUrl: {
      type: String,
    },
    orderedDate: {
      type: Date,
      default: Date.now,
    },
    completedDate: {
      type: Date,
    },
  },
  { timestamps: true }
);

export const LabReport = mongoose.model("LabReport", labReportSchema);
