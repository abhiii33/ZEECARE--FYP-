import mongoose from "mongoose";

const inventoryCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category Name Is Required!"],
      unique: true,
    },
    description: {
      type: String,
    },
    type: {
      type: String,
      enum: ["MedicalSupply", "Medicine", "Equipment", "Consumable", "PPE", "Lab"],
      required: [true, "Category Type Is Required!"],
    },
  },
  { timestamps: true }
);

export const InventoryCategory = mongoose.model(
  "InventoryCategory",
  inventoryCategorySchema
);
