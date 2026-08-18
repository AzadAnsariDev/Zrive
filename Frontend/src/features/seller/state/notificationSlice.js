import { createSlice } from '@reduxjs/toolkit'

export const notificationSlice = createSlice({
    name: 'notification',
    initialState: {
        // Audio alarm settings (in-app, tab must be open)
        alarmMuted: localStorage.getItem('sellerAlarmMuted') === 'true' || false,
        
        // Push notification settings (works offline, tab closed, mobile)
        pushNotificationsEnabled: localStorage.getItem('sellerPushNotifications') !== 'false', // true by default
        pushPermissionStatus: 'default', // 'granted', 'denied', 'default', 'unsupported'
        
        recentOrders: [],
        unreadOrdersCount: 0
    },
    reducers: {
        toggleAlarmMute: (state) => {
            state.alarmMuted = !state.alarmMuted
            localStorage.setItem('sellerAlarmMuted', state.alarmMuted.toString())
        },
        setAlarmMuted: (state, action) => {
            state.alarmMuted = action.payload
            localStorage.setItem('sellerAlarmMuted', action.payload.toString())
        },
        togglePushNotifications: (state) => {
            state.pushNotificationsEnabled = !state.pushNotificationsEnabled
            localStorage.setItem('sellerPushNotifications', state.pushNotificationsEnabled.toString())
        },
        setPushNotificationsEnabled: (state, action) => {
            state.pushNotificationsEnabled = action.payload
            localStorage.setItem('sellerPushNotifications', action.payload.toString())
        },
        setPushPermissionStatus: (state, action) => {
            state.pushPermissionStatus = action.payload
        },
        addRecentOrder: (state, action) => {
            // Add to front of array, keep only last 10
            state.recentOrders = [action.payload, ...state.recentOrders].slice(0, 10)
            state.unreadOrdersCount += 1
        },
        clearRecentOrders: (state) => {
            state.recentOrders = []
            state.unreadOrdersCount = 0
        }
    }
})

export const { 
    toggleAlarmMute, 
    setAlarmMuted, 
    togglePushNotifications,
    setPushNotificationsEnabled,
    setPushPermissionStatus,
    addRecentOrder, 
    clearRecentOrders 
} = notificationSlice.actions
export default notificationSlice.reducer
