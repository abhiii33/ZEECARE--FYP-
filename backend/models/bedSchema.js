import mongoose from "mongoose";
import validator from "validator";

const bedSchema = new mongoose.Schema(
  {
    wardId: {
      type: mongoose.Schema.ObjectId,
      ref: "Ward",
      required: [true, "Ward Id Is Required!"],
    },
    bedNumber: {
      type: String,
      required: [true, "Bed Number Is Required!"],
    },
    bedType: {
      type: String,
      enum: ["Standard", "Electric", "Bariatric", "Pediatric", "ICU"],
      default: "Standard",
    },
    status: {
      type: String,
      enum: ["Available", "Occupied", "Reserved", "Maintenance", "Cleaning"],
      default: "Available",
    },
    features: {
      type: String,
    },
    lastSanitized: {
      type: Date,
    },
  },
  { timestamps: true }
);

bedSchema.index({ wardId: 1, status: 1 });
bedSchema.index({ status: 1 });
bedSchema.index({ wardId: 1, bedNumber: 1 });

export const Bed = mongoose.model("Bed", bedSchema);
