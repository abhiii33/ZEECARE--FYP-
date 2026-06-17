import mongoose from "mongoose";
import validator from "validator";

const wardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Ward Name Is Required!"],
      minLength: [2, "Ward Name Must Contain At Least 2 Characters!"],
    },
    departmentId: {
      type: mongoose.Schema.ObjectId,
      ref: "Department",
    },
    wardType: {
      type: String,
      required: [true, "Ward Type Is Required!"],
      enum: [
        "General",
        "SemiPrivate",
        "Private",
        "ICU",
        "NICU",
        "Pediatric",
        "Maternity",
        "Isolation",
      ],
    },
    totalBeds: {
      type: Number,
      default: 0,
    },
    floor: {
      type: Number,
      required: [true, "Floor Number Is Required!"],
    },
    nurseStation: {
      type: String,
    },
    dailyRate: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ["Active", "Maintenance", "Closed"],
      default: "Active",
    },
  },
  { timestamps: true }
);

wardSchema.index({ wardType: 1 });
wardSchema.index({ status: 1 });
wardSchema.index({ departmentId: 1 });
wardSchema.index({ floor: 1 });

export const Ward = mongoose.model("Ward", wardSchema);
