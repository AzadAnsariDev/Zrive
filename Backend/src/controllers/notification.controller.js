import notificationModel from "../models/notification.model.js";

export const getNotifications = async (req, res) => {
  try {
    const notifications = await notificationModel
      .find({ user: req.user.id, expiresAt: { $gt: new Date() } })
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      notifications,
      unreadCount: notifications.filter((notification) => !notification.isRead).length,
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not fetch notifications" });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    const notification = await notificationModel.findOneAndUpdate(
      { _id: req.params.notificationId, user: req.user.id },
      { isRead: true },
      { new: true }
    );

    if (!notification) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, notification });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not update notification" });
  }
};

export const deleteNotification = async (req, res) => {
  try {
    const deleted = await notificationModel.findOneAndDelete({
      _id: req.params.notificationId,
      user: req.user.id,
    });

    if (!deleted) {
      return res.status(404).json({ success: false, message: "Notification not found" });
    }

    return res.status(200).json({ success: true, message: "Notification deleted" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not delete notification" });
  }
};

export const deleteAllNotifications = async (req, res) => {
  try {
    await notificationModel.deleteMany({ user: req.user.id });
    return res.status(200).json({ success: true, message: "Notifications cleared" });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Could not clear notifications" });
  }
};