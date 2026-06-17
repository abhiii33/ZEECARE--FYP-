import express from "express";
import { isAdminAuthenticated, isAuthenticated } from "../middlewares/auth.js";
import {
  getMyNotifications, markAsRead, markAllAsRead,
  createNotification, sendAnnouncement, deleteNotification,
} from "../controller/notificationController.js";

const router = express.Router();

router.get("/", isAuthenticated, getMyNotifications);
router.put("/:id/read", isAuthenticated, markAsRead);
router.put("/read-all", isAuthenticated, markAllAsRead);
router.post("/", isAdminAuthenticated, createNotification);
router.post("/announce", isAdminAuthenticated, sendAnnouncement);
router.delete("/:id", isAuthenticated, deleteNotification);

export default router;
