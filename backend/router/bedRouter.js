import express from "express";
import { isAdminAuthenticated, isAuthenticated } from "../middlewares/auth.js";
import {
  createWard, getAllWards, updateWard, createBed, getAllBeds,
  updateBedStatus, getBedOccupancyStats, allocateBed, dischargeBed,
  getAllAllocations, transferBed,
} from "../controller/bedController.js";

const router = express.Router();

router.get("/wards", isAuthenticated, getAllWards);
router.post("/wards", isAdminAuthenticated, createWard);
router.put("/wards/:id", isAdminAuthenticated, updateWard);
router.get("/", isAuthenticated, getAllBeds);
router.post("/", isAdminAuthenticated, createBed);
router.put("/:id/status", isAdminAuthenticated, updateBedStatus);
router.get("/occupancy", isAdminAuthenticated, getBedOccupancyStats);
router.post("/allocate", isAdminAuthenticated, allocateBed);
router.put("/discharge/:id", isAdminAuthenticated, dischargeBed);
router.get("/allocations", isAdminAuthenticated, getAllAllocations);
router.post("/transfer", isAdminAuthenticated, transferBed);

export default router;
