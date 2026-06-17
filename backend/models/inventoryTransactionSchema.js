import mongoose from "mongoose";

const inventoryTransactionSchema = new mongoose.Schema(
  {
    itemId: {
      type: mongoose.Schema.ObjectId,
      ref: "InventoryItem",
    },
    medicineId: {
      type: mongoose.Schema.ObjectId,
      ref: "Medicine",
    },
    type: {
      type: String,
      enum: ["StockIn", "StockOut", "Adjustment", "Return", "Expired"],
      required: [true, "Transaction Type Is Required!"],
    },
    quantity: {
      type: Number,
      required: [true, "Quantity Is Required!"],
    },
    reason: {
      type: String,
    },
    performedBy: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Performed By Is Required!"],
    },
    departmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
    },
    patientId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    referenceNo: {
      type: String,
    },
    transactionDate: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

export const InventoryTransaction = mongoose.model(
  "InventoryTransaction",
  inventoryTransactionSchema
);
