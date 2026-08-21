import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "inAppNotification",
  initialState: { items: [], unreadCount: 0, loading: false },
  reducers: {
    setNotifications: (state, action) => {
      state.items = action.payload.notifications || action.payload.items || [];
      state.unreadCount = action.payload.unreadCount ??
        state.items.filter((notification) => !notification.isRead).length;
    },
    setNotificationsLoading: (state, action) => {
      state.loading = action.payload;
    },
    markNotificationRead: (state, action) => {
      const notification = state.items.find((item) => item._id === action.payload);
      if (notification && !notification.isRead) {
        notification.isRead = true;
        state.unreadCount = Math.max(0, state.unreadCount - 1);
      }
    },
    removeNotification: (state, action) => {
      const index = state.items.findIndex((item) => item._id === action.payload);
      if (index === -1) return;
      if (!state.items[index].isRead) state.unreadCount = Math.max(0, state.unreadCount - 1);
      state.items.splice(index, 1);
    },
    clearNotifications: (state) => {
      state.items = [];
      state.unreadCount = 0;
    },
  },
});

export const {
  setNotifications,
  setNotificationsLoading,
  markNotificationRead,
  removeNotification,
  clearNotifications,
} = notificationSlice.actions;

export default notificationSlice.reducer;