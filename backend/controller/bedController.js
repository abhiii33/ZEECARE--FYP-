import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Ward } from "../models/wardSchema.js";
import { Bed } from "../models/bedSchema.js";
import { BedAllocation } from "../models/bedAllocationSchema.js";

export const createWard = catchAsyncErrors(async (req, res, next) => {
  const { name, departmentId, wardType, totalBeds, floor, nurseStation, dailyRate } = req.body;
  const ward = await Ward.create({ name, departmentId, wardType, totalBeds, floor, nurseStation, dailyRate });
  res.status(201).json({ success: true, message: "Ward created successfully", ward });
});

export const getAllWards = catchAsyncErrors(async (req, res) => {
  const wards = await Ward.find().populate("departmentId", "name");
  res.status(200).json({ success: true, wards });
});

export const updateWard = catchAsyncErrors(async (req, res, next) => {
  const ward = await Ward.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!ward) return next(new ErrorHandler("Ward not found", 404));
  res.status(200).json({ success: true, message: "Ward updated", ward });
});

export const createBed = catchAsyncErrors(async (req, res, next) => {
  const { wardId, bedNumber, bedType, features } = req.body;
  const ward = await Ward.findById(wardId);
  if (!ward) return next(new ErrorHandler("Ward not found", 404));
  const bed = await Bed.create({ wardId, bedNumber, bedType, features });
  await Ward.findByIdAndUpdate(wardId, { $inc: { totalBeds: 1 } });
  res.status(201).json({ success: true, message: "Bed created successfully", bed });
});

export const getAllBeds = catchAsyncErrors(async (req, res) => {
  const { wardId, status } = req.query;
  const filter = {};
  if (wardId) filter.wardId = wardId;
  if (status) filter.status = status;
  const beds = await Bed.find(filter).populate("wardId", "name wardType floor");
  res.status(200).json({ success: true, beds });
});

export const updateBedStatus = catchAsyncErrors(async (req, res, next) => {
  const { status } = req.body;
  const bed = await Bed.findByIdAndUpdate(req.params.id, { status }, { new: true, runValidators: true });
  if (!bed) return next(new ErrorHandler("Bed not found", 404));
  res.status(200).json({ success: true, message: "Bed status updated", bed });
});

export const getBedOccupancyStats = catchAsyncErrors(async (req, res) => {
  const beds = await Bed.find();
  const total = beds.length;
  const available = beds.filter((b) => b.status === "Available").length;
  const occupied = beds.filter((b) => b.status === "Occupied").length;
  const reserved = beds.filter((b) => b.status === "Reserved").length;
  const maintenance = beds.filter((b) => b.status === "Maintenance").length;
  const cleaning = beds.filter((b) => b.status === "Cleaning").length;
  const occupancyRate = total > 0 ? ((occupied / total) * 100).toFixed(1) : 0;
  res.status(200).json({
    success: true,
    stats: { total, available, occupied, reserved, maintenance, cleaning, occupancyRate },
  });
});

export const allocateBed = catchAsyncErrors(async (req, res, next) => {
  const { bedId, patientId, doctorInCharge, admissionReason, expectedDischarge } = req.body;
  const bed = await Bed.findById(bedId);
  if (!bed) return next(new ErrorHandler("Bed not found", 404));
  if (bed.status !== "Available") return next(new ErrorHandler("Bed is not available", 400));
  const allocation = await BedAllocation.create({
    bedId, patientId, admittedBy: req.user._id, doctorInCharge, admissionReason, expectedDischarge,
  });
  bed.status = "Occupied";
  await bed.save();
  res.status(201).json({ success: true, message: "Bed allocated successfully", allocation });
});

export const dischargeBed = catchAsyncErrors(async (req, res, next) => {
  const allocation = await BedAllocation.findById(req.params.id);
  if (!allocation) return next(new ErrorHandler("Allocation not found", 404));
  if (allocation.status !== "Active") return next(new ErrorHandler("Patient already discharged", 400));
  allocation.actualDischarge = new Date();
  allocation.dischargeNotes = req.body.dischargeNotes || "";
  allocation.status = "Discharged";
  await allocation.save();
  await Bed.findByIdAndUpdate(allocation.bedId, { status: "Cleaning" });
  res.status(200).json({ success: true, message: "Patient discharged successfully", allocation });
});

export const getAllAllocations = catchAsyncErrors(async (req, res) => {
  const { status } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const allocations = await BedAllocation.find(filter)
    .populate("bedId", "bedNumber status")
    .populate("patientId", "firstName lastName phone")
    .populate("doctorInCharge", "firstName lastName")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, allocations });
});

export const transferBed = catchAsyncErrors(async (req, res, next) => {
  const { allocationId, newBedId, reason } = req.body;
  const allocation = await BedAllocation.findById(allocationId);
  if (!allocation || allocation.status !== "Active")
    return next(new ErrorHandler("Active allocation not found", 404));
  const newBed = await Bed.findById(newBedId);
  if (!newBed || newBed.status !== "Available")
    return next(new ErrorHandler("Target bed is not available", 400));
  await Bed.findByIdAndUpdate(allocation.bedId, { status: "Cleaning" });
  newBed.status = "Occupied";
  await newBed.save();
  allocation.bedId = newBedId;
  await allocation.save();
  res.status(200).json({ success: true, message: "Patient transferred successfully", allocation });
});
