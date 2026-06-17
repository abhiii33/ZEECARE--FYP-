import mongoose from "mongoose";
import validator from "validator";

const opdBookingSchema = new mongoose.Schema(
  {
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
    },
    departmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
    },
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    tokenNumber: {
      type: Number,
      required: [true, "Token Number Is Required!"],
    },
    bookingDate: {
      type: Date,
      required: [true, "Booking Date Is Required!"],
    },
    shiftType: {
      type: String,
      enum: ["Morning", "Evening"],
      default: "Morning",
    },
    status: {
      type: String,
      enum: [
        "Registered",
        "Waiting",
        "InConsultation",
        "Completed",
        "Skipped",
        "Cancelled",
      ],
      default: "Registered",
    },
    priority: {
      type: String,
      enum: ["Normal", "Emergency"],
      default: "Normal",
    },
    symptoms: {
      type: String,
    },
    checkInTime: {
      type: Date,
    },
    consultStartTime: {
      type: Date,
    },
    consultEndTime: {
      type: Date,
    },
  },
  { timestamps: true }
);

opdBookingSchema.index({ bookingDate: 1, doctorId: 1 });
opdBookingSchema.index({ patientId: 1 });
opdBookingSchema.index({ bookingDate: 1, departmentId: 1 });
opdBookingSchema.index({ status: 1 });
opdBookingSchema.index({ bookingDate: 1, tokenNumber: 1 });

export const OpdBooking = mongoose.model("OpdBooking", opdBookingSchema);
