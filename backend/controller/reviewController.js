import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Review } from "../models/reviewSchema.js";

export const createReview = catchAsyncErrors(async (req, res, next) => {
  const { doctorId, appointmentId, rating, comment } = req.body;
  const existing = await Review.findOne({ patientId: req.user._id, appointmentId });
  if (existing) return next(new ErrorHandler("You already reviewed this appointment", 400));
  const review = await Review.create({
    patientId: req.user._id, doctorId, appointmentId, rating, comment,
  });
  res.status(201).json({ success: true, message: "Review submitted", review });
});

export const getDoctorReviews = catchAsyncErrors(async (req, res) => {
  const reviews = await Review.find({ doctorId: req.params.doctorId, status: "Published" })
    .populate("patientId", "firstName lastName")
    .sort({ createdAt: -1 });
  const avgRating = reviews.length > 0
    ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
    : 0;
  res.status(200).json({ success: true, reviews, avgRating: parseFloat(avgRating), totalReviews: reviews.length });
});

export const getAllReviews = catchAsyncErrors(async (req, res) => {
  const reviews = await Review.find()
    .populate("patientId", "firstName lastName")
    .populate("doctorId", "firstName lastName doctorDepartment")
    .sort({ createdAt: -1 });
  res.status(200).json({ success: true, reviews });
});

export const updateReviewStatus = catchAsyncErrors(async (req, res, next) => {
  const review = await Review.findByIdAndUpdate(req.params.id, { status: req.body.status }, { new: true });
  if (!review) return next(new ErrorHandler("Review not found", 404));
  res.status(200).json({ success: true, message: "Review status updated", review });
});
