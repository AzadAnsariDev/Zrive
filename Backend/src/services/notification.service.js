import notificationModel from "../models/notification.model.js";

export const createUserNotification = async ({
  user,
  title,
  message,
  type = "general",
  orderId = null,
  url = "/orders",
}) => {
  try {
    if (!user || !title || !message) return null;

    return await notificationModel.create({
      user,
      title,
      message,
      type,
      orderId,
      url,
      expiresAt: new Date(Date.now() + 12 * 60 * 60 * 1000),
    });
  } catch (err) {
    console.error("[Notification] Could not save notification:", err.message);
    return null;
  }
};