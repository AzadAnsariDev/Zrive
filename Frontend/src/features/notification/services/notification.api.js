import axios from "axios";

const notificationApi = axios.create({
  baseURL: "/api/notification",
  withCredentials: true,
});

export const getNotifications = async () => {
  const response = await notificationApi.get("/");
  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await notificationApi.patch(`/${notificationId}/read`);
  return response.data;
};

export const deleteNotification = async (notificationId) => {
  const response = await notificationApi.delete(`/${notificationId}`);
  return response.data;
};

export const deleteAllNotifications = async () => {
  const response = await notificationApi.delete("/");
  return response.data;
};