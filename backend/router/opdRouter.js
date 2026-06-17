import express from "express";
import {
  isAdminAuthenticated, isDoctorAuthenticated, isPatientAuthenticated, isAuthenticated,
} from "../middlewares/auth.js";
import {
  registerOPD, getOPDQueue, callNextPatient, updateOPDStatus,
  skipPatient, getOPDDailyReport, getMyOPDBookings,
} from "../controller/opdController.js";

const router = express.Router();

router.post("/register", isPatientAuthenticated, registerOPD);
router.get("/queue", isAuthenticated, getOPDQueue);
router.get("/my-bookings", isPatientAuthenticated, getMyOPDBookings);
router.put("/call-next", isDoctorAuthenticated, callNextPatient);
router.put("/update/:id", isAuthenticated, updateOPDStatus);
router.put("/skip/:id", isDoctorAuthenticated, skipPatient);
router.get("/daily-report", isAuthenticated, getOPDDailyReport);

export default router;
