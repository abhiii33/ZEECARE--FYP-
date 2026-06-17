import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { MedicalRecord } from "../models/medicalRecordSchema.js";
import { Prescription } from "../models/prescriptionSchema.js";
import { LabReport } from "../models/labReportSchema.js";

export const createRecord = catchAsyncErrors(async (req, res) => {
  const record = await MedicalRecord.create({ ...req.body, doctorId: req.user._id });
  res.status(201).json({ success: true, message: "Medical record created", record });
});

export const getPatientRecords = catchAsyncErrors(async (req, res) => {
  const records = await MedicalRecord.find({ patientId: req.params.patientId })
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ visitDate: -1 });
  res.status(200).json({ success: true, records });
});

export const getMyRecords = catchAsyncErrors(async (req, res) => {
  const records = await MedicalRecord.find({ patientId: req.user._id })
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ visitDate: -1 });
  res.status(200).json({ success: true, records });
});

export const updateRecord = catchAsyncErrors(async (req, res, next) => {
  const record = await MedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!record) return next(new ErrorHandler("Record not found", 404));
  res.status(200).json({ success: true, message: "Record updated", record });
});

export const createPrescription = catchAsyncErrors(async (req, res) => {
  const prescription = await Prescription.create({ ...req.body, doctorId: req.user._id });
  res.status(201).json({ success: true, message: "Prescription created", prescription });
});

export const getPatientPrescriptions = catchAsyncErrors(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.params.patientId })
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ prescriptionDate: -1 });
  res.status(200).json({ success: true, prescriptions });
});

export const getMyPrescriptions = catchAsyncErrors(async (req, res) => {
  const prescriptions = await Prescription.find({ patientId: req.user._id })
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ prescriptionDate: -1 });
  res.status(200).json({ success: true, prescriptions });
});

export const updatePrescriptionStatus = catchAsyncErrors(async (req, res, next) => {
  const prescription = await Prescription.findById(req.params.id);
  if (!prescription) return next(new ErrorHandler("Prescription not found", 404));
  prescription.status = req.body.status;
  if (req.body.pharmacyNotes) prescription.pharmacyNotes = req.body.pharmacyNotes;
  await prescription.save();
  res.status(200).json({ success: true, message: "Prescription updated", prescription });
});

export const dispenseMedicine = catchAsyncErrors(async (req, res, next) => {
  const { prescriptionId, itemIndex } = req.body;
  const prescription = await Prescription.findById(prescriptionId);
  if (!prescription) return next(new ErrorHandler("Prescription not found", 404));
  if (!prescription.items[itemIndex]) return next(new ErrorHandler("Item not found", 404));
  prescription.items[itemIndex].isDispensed = true;
  const allDispensed = prescription.items.every((item) => item.isDispensed);
  if (allDispensed) prescription.status = "Completed";
  await prescription.save();
  res.status(200).json({ success: true, message: "Medicine dispensed", prescription });
});

export const createLabReport = catchAsyncErrors(async (req, res) => {
  const report = await LabReport.create({ ...req.body, orderedBy: req.user._id });
  res.status(201).json({ success: true, message: "Lab report ordered", report });
});

export const getPatientLabReports = catchAsyncErrors(async (req, res) => {
  const reports = await LabReport.find({ patientId: req.params.patientId })
    .populate("orderedBy", "firstName lastName")
    .sort({ orderedDate: -1 });
  res.status(200).json({ success: true, reports });
});

export const getMyLabReports = catchAsyncErrors(async (req, res) => {
  const reports = await LabReport.find({ patientId: req.user._id })
    .populate("orderedBy", "firstName lastName")
    .sort({ orderedDate: -1 });
  res.status(200).json({ success: true, reports });
});

export const updateLabReport = catchAsyncErrors(async (req, res, next) => {
  const report = await LabReport.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!report) return next(new ErrorHandler("Lab report not found", 404));
  if (req.body.status === "Completed" && !report.completedDate) {
    report.completedDate = new Date();
    await report.save();
  }
  res.status(200).json({ success: true, message: "Lab report updated", report });
});
