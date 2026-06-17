import express from "express";
import {
  isAdminAuthenticated, isDoctorAuthenticated, isAuthenticated,
} from "../middlewares/auth.js";
import {
  createSchedule, getDoctorSchedule, updateSchedule, deleteSchedule,
  getAvailableSlots, applyLeave, getAllLeaves, updateLeaveStatus, getDoctorLeaves,
} from "../controller/scheduleController.js";

const router = express.Router();

router.get("/availability", getAvailableSlots);
router.get("/doctor/:doctorId", getDoctorSchedule);
router.get("/doctor/:doctorId/leaves", getDoctorLeaves);
router.post("/create", isDoctorAuthenticated, createSchedule);
router.post("/admin/create", isAdminAuthenticated, createSchedule);
router.put("/update/:id", isDoctorAuthenticated, updateSchedule);
router.delete("/delete/:id", isDoctorAuthenticated, deleteSchedule);
router.post("/leave/apply", isDoctorAuthenticated, applyLeave);
router.get("/leaves", isAdminAuthenticated, getAllLeaves);
router.put("/leave/:id/status", isAdminAuthenticated, updateLeaveStatus);

export default router;
