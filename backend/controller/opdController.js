import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { OpdBooking } from "../models/opdBookingSchema.js";

export const registerOPD = catchAsyncErrors(async (req, res, next) => {
  const { departmentId, doctorId, shiftType, symptoms, priority } = req.body;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const lastToken = await OpdBooking.findOne({
    bookingDate: { $gte: today, $lt: tomorrow },
    departmentId,
    shiftType: shiftType || "Morning",
  }).sort({ tokenNumber: -1 });
  const tokenNumber = lastToken ? lastToken.tokenNumber + 1 : 1;
  const booking = await OpdBooking.create({
    patientId: req.user._id,
    departmentId,
    doctorId,
    tokenNumber,
    bookingDate: new Date(),
    shiftType: shiftType || "Morning",
    symptoms,
    priority: priority || "Normal",
    status: "Registered",
  });
  res.status(201).json({ success: true, message: `OPD registered. Token #${tokenNumber}`, booking });
});

export const getOPDQueue = catchAsyncErrors(async (req, res) => {
  const { departmentId, date, shiftType } = req.query;
  const filter = {};
  if (departmentId) filter.departmentId = departmentId;
  if (shiftType) filter.shiftType = shiftType;
  const targetDate = date ? new Date(date) : new Date();
  targetDate.setHours(0, 0, 0, 0);
  const nextDay = new Date(targetDate);
  nextDay.setDate(nextDay.getDate() + 1);
  filter.bookingDate = { $gte: targetDate, $lt: nextDay };
  const queue = await OpdBooking.find(filter)
    .populate("patientId", "firstName lastName phone gender DOB")
    .populate("doctorId", "firstName lastName")
    .sort({ priority: -1, tokenNumber: 1 });
  res.status(200).json({ success: true, queue });
});

export const callNextPatient = catchAsyncErrors(async (req, res, next) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const current = await OpdBooking.findOne({
    doctorId: req.user._id,
    bookingDate: { $gte: today, $lt: tomorrow },
    status: "InConsultation",
  });
  if (current) {
    current.status = "Completed";
    current.consultEndTime = new Date();
    await current.save();
  }
  const next_patient = await OpdBooking.findOne({
    doctorId: req.user._id,
    bookingDate: { $gte: today, $lt: tomorrow },
    status: { $in: ["Registered", "Waiting"] },
  }).sort({ priority: -1, tokenNumber: 1 });
  if (!next_patient) {
    return res.status(200).json({ success: true, message: "No more patients in queue", patient: null });
  }
  next_patient.status = "InConsultation";
  next_patient.consultStartTime = new Date();
  await next_patient.save();
  const populated = await OpdBooking.findById(next_patient._id)
    .populate("patientId", "firstName lastName phone gender DOB NIC");
  res.status(200).json({ success: true, message: `Token #${next_patient.tokenNumber} called`, patient: populated });
});

export const updateOPDStatus = catchAsyncErrors(async (req, res, next) => {
  const booking = await OpdBooking.findById(req.params.id);
  if (!booking) return next(new ErrorHandler("OPD booking not found", 404));
  booking.status = req.body.status;
  if (req.body.status === "Waiting") booking.checkInTime = new Date();
  if (req.body.status === "InConsultation") booking.consultStartTime = new Date();
  if (req.body.status === "Completed") booking.consultEndTime = new Date();
  await booking.save();
  res.status(200).json({ success: true, message: "Status updated", booking });
});

export const skipPatient = catchAsyncErrors(async (req, res, next) => {
  const booking = await OpdBooking.findById(req.params.id);
  if (!booking) return next(new ErrorHandler("Booking not found", 404));
  booking.status = "Skipped";
  await booking.save();
  res.status(200).json({ success: true, message: "Patient skipped", booking });
});

export const getOPDDailyReport = catchAsyncErrors(async (req, res) => {
  const date = req.query.date ? new Date(req.query.date) : new Date();
  date.setHours(0, 0, 0, 0);
  const nextDay = new Date(date);
  nextDay.setDate(nextDay.getDate() + 1);
  const bookings = await OpdBooking.find({ bookingDate: { $gte: date, $lt: nextDay } });
  const total = bookings.length;
  const completed = bookings.filter((b) => b.status === "Completed").length;
  const waiting = bookings.filter((b) => ["Registered", "Waiting"].includes(b.status)).length;
  const skipped = bookings.filter((b) => b.status === "Skipped").length;
  const inConsultation = bookings.filter((b) => b.status === "InConsultation").length;
  const completedBookings = bookings.filter((b) => b.consultStartTime && b.consultEndTime);
  const avgWaitTime = completedBookings.length > 0
    ? Math.round(completedBookings.reduce((sum, b) => sum + (b.consultStartTime - b.createdAt) / 60000, 0) / completedBookings.length)
    : 0;
  res.status(200).json({
    success: true,
    report: { date: date.toISOString().split("T")[0], total, completed, waiting, inConsultation, skipped, avgWaitTime },
  });
});

export const getMyOPDBookings = catchAsyncErrors(async (req, res) => {
  const bookings = await OpdBooking.find({ patientId: req.user._id })
    .populate("doctorId", "firstName lastName")
    .sort({ bookingDate: -1 });
  res.status(200).json({ success: true, bookings });
});
