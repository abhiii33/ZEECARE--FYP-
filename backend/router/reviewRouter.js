import express from "express";
import {
  isAdminAuthenticated, isPatientAuthenticated,
} from "../middlewares/auth.js";
import {
  createReview, getDoctorReviews, getAllReviews, updateReviewStatus,
} from "../controller/reviewController.js";

const router = express.Router();

router.post("/", isPatientAuthenticated, createReview);
router.get("/doctor/:doctorId", getDoctorReviews);
router.get("/", isAdminAuthenticated, getAllReviews);
router.put("/:id/status", isAdminAuthenticated, updateReviewStatus);

export default router;
