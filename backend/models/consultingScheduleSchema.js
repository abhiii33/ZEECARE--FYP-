import mongoose from "mongoose";
import validator from "validator";

const consultingScheduleSchema = new mongoose.Schema(
  {
    doctorId: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Doctor Id Is Required!"],
    },
    dayOfWeek: {
      type: String,
      required: [true, "Day Of Week Is Required!"],
      enum: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"],
    },
    startTime: {
      type: String,
      required: [true, "Start Time Is Required!"],
    },
    endTime: {
      type: String,
      required: [true, "End Time Is Required!"],
    },
    slotDurationMinutes: {
      type: Number,
      default: 30,
    },
    maxPatientsPerSlot: {
      type: Number,
      default: 1,
    },
    scheduleType: {
      type: String,
      enum: ["Appointment", "OPD"],
      default: "Appointment",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    effectiveFrom: {
      type: Date,
    },
    effectiveTo: {
      type: Date,
    },
  },
  { timestamps: true }
);

consultingScheduleSchema.index({ doctorId: 1, dayOfWeek: 1 });
consultingScheduleSchema.index({ doctorId: 1, isActive: 1 });
consultingScheduleSchema.index({ scheduleType: 1 });

export const ConsultingSchedule = mongoose.model(
  "ConsultingSchedule",
  consultingScheduleSchema
);
