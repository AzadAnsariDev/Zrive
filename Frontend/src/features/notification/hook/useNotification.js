import { useDispatch } from "react-redux";
import {
  setNotifications,
  setNotificationsLoading,
  markNotificationRead,
  removeNotification,
  clearNotifications,
} from "../state/notificationSlice";
import {
  getNotifications,
  markNotificationAsRead,
  deleteNotification,
  deleteAllNotifications,
} from "../services/notification.api";

const useNotification = () => {
  const dispatch = useDispatch();

  const handleGetNotifications = async () => {
    dispatch(setNotificationsLoading(true));
    try {
      const result = await getNotifications();
      dispatch(setNotifications(result));
      return result;
    } catch (err) {
      return null;
    } finally {
      dispatch(setNotificationsLoading(false));
    }
  };

  const handleMarkAsRead = async (notificationId) => {
    dispatch(markNotificationRead(notificationId));
    try {
      return await markNotificationAsRead(notificationId);
    } catch (err) {
      handleGetNotifications();
      return null;
    }
  };

  const handleDeleteNotification = async (notificationId) => {
    dispatch(removeNotification(notificationId));
    try {
      return await deleteNotification(notificationId);
    } catch (err) {
      handleGetNotifications();
      return null;
    }
  };

  const handleDeleteAllNotifications = async () => {
    dispatch(clearNotifications());
    try {
      return await deleteAllNotifications();
    } catch (err) {
      handleGetNotifications();
      return null;
    }
  };

  return {
    handleGetNotifications,
    handleMarkAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
  };
};

export default useNotification;