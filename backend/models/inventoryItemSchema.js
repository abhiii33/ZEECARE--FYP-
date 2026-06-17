import mongoose from "mongoose";

const inventoryItemSchema = new mongoose.Schema(
  {
    categoryId: {
      type: mongoose.Schema.ObjectId,
      ref: "InventoryCategory",
      required: [true, "Category Id Is Required!"],
    },
    name: {
      type: String,
      required: [true, "Item Name Is Required!"],
    },
    sku: {
      type: String,
      unique: true,
    },
    description: {
      type: String,
    },
    unit: {
      type: String,
      required: [true, "Unit Is Required!"],
      default: "pcs",
    },
    quantity: {
      type: Number,
      required: [true, "Quantity Is Required!"],
      default: 0,
    },
    minStock: {
      type: Number,
      default: 10,
    },
    maxStock: {
      type: Number,
      default: 1000,
    },
    unitPrice: {
      type: Number,
      default: 0,
    },
    supplier: {
      type: String,
    },
    storageLocation: {
      type: String,
    },
    status: {
      type: String,
      enum: ["InStock", "LowStock", "OutOfStock", "Discontinued"],
      default: "InStock",
    },
  },
  { timestamps: true }
);

inventoryItemSchema.pre("save", function (next) {
  if (this.quantity === 0) {
    this.status = "OutOfStock";
  } else if (this.quantity <= this.minStock) {
    this.status = "LowStock";
  } else {
    this.status = "InStock";
  }
  next();
});

export const InventoryItem = mongoose.model(
  "InventoryItem",
  inventoryItemSchema
);
