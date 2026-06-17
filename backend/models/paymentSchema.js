import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    invoiceId: {
      type: mongoose.Schema.ObjectId,
      ref: "Invoice",
      required: [true, "Invoice Id Is Required!"],
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Patient Id Is Required!"],
    },
    amount: {
      type: Number,
      required: [true, "Payment Amount Is Required!"],
    },
    method: {
      type: String,
      enum: ["Cash", "Card", "UPI", "NetBanking", "Insurance", "Wallet"],
      required: [true, "Payment Method Is Required!"],
    },
    transactionId: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "Success", "Failed", "Refunded"],
      default: "Pending",
    },
    paymentDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const Payment = mongoose.model("Payment", paymentSchema);
