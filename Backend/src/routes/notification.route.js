import express from "express";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../controllers/notification.controller.js";
import { authenticateUser } from "../middlewares/auth.middleware.js";

const notificationRouter = express.Router();

notificationRouter.use(authenticateUser);
notificationRouter.get("/", getNotifications);
notificationRouter.patch("/:notificationId/read", markNotificationAsRead);
notificationRouter.delete("/:notificationId", deleteNotification);
notificationRouter.delete("/", deleteAllNotifications);

export default notificationRouter;