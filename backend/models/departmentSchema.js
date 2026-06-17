import mongoose from "mongoose";
import validator from "validator";

const departmentSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Department Name Is Required!"],
      unique: true,
    },
    description: {
      type: String,
    },
    icon: {
      type: String,
    },
    headDoctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
    },
    floorNumber: {
      type: Number,
    },
    contactPhone: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Active", "Inactive"],
      default: "Active",
    },
  },
  { timestamps: true }
);

departmentSchema.index({ name: 1 });
departmentSchema.index({ status: 1 });

export const Department = mongoose.model("Department", departmentSchema);
