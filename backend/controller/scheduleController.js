import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { ConsultingSchedule } from "../models/consultingScheduleSchema.js";
import { DoctorLeave } from "../models/doctorLeaveSchema.js";

export const createSchedule = catchAsyncErrors(async (req, res) => {
  const doctorId = req.user.role === "Doctor" ? req.user._id : req.body.doctorId;
  const schedule = await ConsultingSchedule.create({ ...req.body, doctorId });
  res.status(201).json({ success: true, message: "Schedule created", schedule });
});

export const getDoctorSchedule = catchAsyncErrors(async (req, res) => {
  const schedules = await ConsultingSchedule.find({
    doctorId: req.params.doctorId,
    isActive: true,
  }).sort({ dayOfWeek: 1 });
  res.status(200).json({ success: true, schedules });
});

export const updateSchedule = catchAsyncErrors(async (req, res, next) => {
  const schedule = await ConsultingSchedule.findByIdAndUpdate(req.params.id, req.body, {
    new: true, runValidators: true,
  });
  if (!schedule) return next(new ErrorHandler("Schedule not found", 404));
  res.status(200).json({ success: true, message: "Schedule updated", schedule });
});

export const deleteSchedule = catchAsyncErrors(async (req, res, next) => {
  const schedule = await ConsultingSchedule.findByIdAndDelete(req.params.id);
  if (!schedule) return next(new ErrorHandler("Schedule not found", 404));
  res.status(200).json({ success: true, message: "Schedule deleted" });
});

export const getAvailableSlots = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, date } = req.query;
  if (!doctorId || !date) return next(new ErrorHandler("doctorId and date are required", 400));
  const targetDate = new Date(date);
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const dayOfWeek = days[targetDate.getDay()];
  const leave = await DoctorLeave.findOne({
    doctorId,
    leaveDate: { $gte: new Date(date + "T00:00:00"), $lt: new Date(date + "T23:59:59") },
    status: "Approved",
  });
  if (leave) {
    return res.status(200).json({ success: true, available: false, message: "Doctor is on leave", slots: [] });
  }
  const schedules = await ConsultingSchedule.find({ doctorId, dayOfWeek, isActive: true });
  const slots = [];
  for (const sch of schedules) {
    const [startH, startM] = sch.startTime.split(":").map(Number);
    const [endH, endM] = sch.endTime.split(":").map(Number);
    const startMinutes = startH * 60 + startM;
    const endMinutes = endH * 60 + endM;
    for (let m = startMinutes; m < endMinutes; m += sch.slotDurationMinutes) {
      const h = Math.floor(m / 60);
      const min = m % 60;
      slots.push({
        time: `${String(h).padStart(2, "0")}:${String(min).padStart(2, "0")}`,
        type: sch.scheduleType,
        maxPatients: sch.maxPatientsPerSlot,
      });
    }
  }
  res.status(200).json({ success: true, available: true, slots });
});

export const applyLeave = catchAsyncErrors(async (req, res) => {
  const doctorId = req.user._id;
  const { leaveDate, leaveType, reason } = req.body;
  const leave = await DoctorLeave.create({ doctorId, leaveDate, leaveType, reason });
  res.status(201).json({ success: true, message: "Leave applied", leave });
});

export const getAllLeaves = catchAsyncErrors(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const leaves = await DoctorLeave.find(filter)
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ leaveDate: -1 });
  res.status(200).json({ success: true, leaves });
});

export const updateLeaveStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const leave = await DoctorLeave.findById(req.params.id);
  if (!leave) return next(new ErrorHandler("Leave not found", 404));
  leave.status = status;
  if (status === "Approved") leave.approvedBy = req.user._id;
  await leave.save();
  res.status(200).json({ success: true, message: `Leave ${status.toLowerCase()}`, leave });
});

export const getDoctorLeaves = catchAsyncErrors(async (req, res) => {
  const leaves = await DoctorLeave.find({ doctorId: req.params.doctorId }).sort({ leaveDate: -1 });
  res.status(200).json({ success: true, leaves });
});
