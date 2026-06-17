import mongoose from "mongoose";

const medicineSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Medicine Name Is Required!"],
    },
    genericName: {
      type: String,
    },
    manufacturer: {
      type: String,
    },
    dosageForm: {
      type: String,
      enum: [
        "Tablet",
        "Capsule",
        "Syrup",
        "Injection",
        "Cream",
        "Drops",
        "Inhaler",
        "Ointment",
      ],
      required: [true, "Dosage Form Is Required!"],
    },
    strength: {
      type: String,
      required: [true, "Strength Is Required!"],
    },
    price: {
      type: Number,
      required: [true, "Price Is Required!"],
    },
    stock: {
      type: Number,
      required: [true, "Stock Is Required!"],
      default: 0,
    },
    minStock: {
      type: Number,
      default: 20,
    },
    batchNumber: {
      type: String,
    },
    manufactureDate: {
      type: Date,
    },
    expiryDate: {
      type: Date,
      required: [true, "Expiry Date Is Required!"],
    },
    requiresPrescription: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

export const Medicine = mongoose.model("Medicine", medicineSchema);
