import mongoose from "mongoose";

const reviewSchema = new mongoose.Schema(
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
    rating: {
      type: Number,
      required: [true, "Rating Is Required!"],
      min: [1, "Rating Must Be At Least 1!"],
      max: [5, "Rating Must Not Exceed 5!"],
    },
    comment: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Published", "Hidden", "Flagged"],
      default: "Published",
    },
  },
  { timestamps: true }
);

reviewSchema.index({ doctorId: 1, createdAt: -1 });

export const Review = mongoose.model("Review", reviewSchema);
