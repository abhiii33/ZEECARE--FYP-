import express from "express";
import {
  isAdminAuthenticated, isDoctorAuthenticated, isPatientAuthenticated, isAuthenticated,
} from "../middlewares/auth.js";
import {
  createRecord, getPatientRecords, getMyRecords, updateRecord,
  createPrescription, getPatientPrescriptions, getMyPrescriptions,
  updatePrescriptionStatus, dispenseMedicine,
  createLabReport, getPatientLabReports, getMyLabReports, updateLabReport,
} from "../controller/medicalRecordController.js";

const router = express.Router();

// Medical Records
router.post("/", isDoctorAuthenticated, createRecord);
router.get("/patient/:patientId", isDoctorAuthenticated, getPatientRecords);
router.get("/my-records", isPatientAuthenticated, getMyRecords);
router.put("/:id", isDoctorAuthenticated, updateRecord);

// Prescriptions
router.post("/prescriptions", isDoctorAuthenticated, createPrescription);
router.get("/prescriptions/patient/:patientId", isDoctorAuthenticated, getPatientPrescriptions);
router.get("/prescriptions/my", isPatientAuthenticated, getMyPrescriptions);
router.put("/prescriptions/:id/status", isAuthenticated, updatePrescriptionStatus);
router.put("/prescriptions/dispense", isAuthenticated, dispenseMedicine);

// Lab Reports
router.post("/lab-reports", isDoctorAuthenticated, createLabReport);
router.get("/lab-reports/patient/:patientId", isDoctorAuthenticated, getPatientLabReports);
router.get("/lab-reports/my", isPatientAuthenticated, getMyLabReports);
router.put("/lab-reports/:id", isDoctorAuthenticated, updateLabReport);

export default router;
