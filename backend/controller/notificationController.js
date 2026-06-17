import { catchAsyncErrors } from "../middlewares/catchAsyncErrors.js";
import ErrorHandler from "../middlewares/error.js";
import { Notification } from "../models/notificationSchema.js";

export const getMyNotifications = catchAsyncErrors(async (req, res) => {
  const { unreadOnly } = req.query;
  const filter = { userId: req.user._id };
  if (unreadOnly === "true") filter.isRead = false;
  const notifications = await Notification.find(filter).sort({ createdAt: -1 }).limit(50);
  const unreadCount = await Notification.countDocuments({ userId: req.user._id, isRead: false });
  res.status(200).json({ success: true, notifications, unreadCount });
});

export const markAsRead = catchAsyncErrors(async (req, res, next) => {
  const notification = await Notification.findOneAndUpdate(
    { _id: req.params.id, userId: req.user._id },
    { isRead: true },
    { new: true }
  );
  if (!notification) return next(new ErrorHandler("Notification not found", 404));
  res.status(200).json({ success: true, message: "Marked as read", notification });
});

export const markAllAsRead = catchAsyncErrors(async (req, res) => {
  await Notification.updateMany({ userId: req.user._id, isRead: false }, { isRead: true });
  res.status(200).json({ success: true, message: "All notifications marked as read" });
});

export const createNotification = catchAsyncErrors(async (req, res) => {
  const notification = await Notification.create(req.body);
  res.status(201).json({ success: true, notification });
});

export const sendAnnouncement = catchAsyncErrors(async (req, res) => {
  const { title, body, targetRole } = req.body;
  const { User } = await import("../models/userSchema.js");
  const filter = {};
  if (targetRole && targetRole !== "All") filter.role = targetRole;
  const users = await User.find(filter).select("_id");
  const notifications = users.map((u) => ({
    userId: u._id, title, body, type: "Announcement", channel: "InApp",
  }));
  await Notification.insertMany(notifications);
  res.status(201).json({ success: true, message: `Announcement sent to ${users.length} users` });
});

export const deleteNotification = catchAsyncErrors(async (req, res, next) => {
  const notification = await Notification.findOneAndDelete({ _id: req.params.id, userId: req.user._id });
  if (!notification) return next(new ErrorHandler("Notification not found", 404));
  res.status(200).json({ success: true, message: "Notification deleted" });
});
