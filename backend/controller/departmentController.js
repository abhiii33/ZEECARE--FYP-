import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Department } from "../models/departmentSchema.js";

export const createDepartment = catchAsyncErrors(async (req, res) => {
  const department = await Department.create(req.body);
  res.status(201).json({ success: true, message: "Department created", department });
});

export const getAllDepartments = catchAsyncErrors(async (req, res) => {
  const departments = await Department.find({ status: "Active" })
    .populate("headDoctorId", "firstName lastName");
  res.status(200).json({ success: true, departments });
});

export const updateDepartment = catchAsyncErrors(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
  if (!department) return next(new ErrorHandler("Department not found", 404));
  res.status(200).json({ success: true, message: "Department updated", department });
});

export const deleteDepartment = catchAsyncErrors(async (req, res, next) => {
  const department = await Department.findByIdAndUpdate(req.params.id, { status: "Inactive" }, { new: true });
  if (!department) return next(new ErrorHandler("Department not found", 404));
  res.status(200).json({ success: true, message: "Department deactivated", department });
});
