import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
    connectSocket,
    disconnectSocket,
    onNewOrder,
    offNewOrder,
    isSocketConnected
} from '../services/socket.service.js'
import {
    showSellerAlarmNotification,
    areNotificationsEnabled,
    playAlarmAudio,
    triggerTestPushBackend
} from '../services/push-notification.service.js'
import { addRecentOrder } from '../state/notificationSlice.js'
import { toast } from 'sonner'

/**
 * Custom hook for managing socket connections and seller alarms
 * @param {string} sellerId - Seller's user ID
 */
export const useSellerSocket = (sellerId) => {
    const dispatch = useDispatch()
    const navigate = useNavigate()
    const { alarmMuted, pushNotificationsEnabled } = useSelector(state => state.notification)

    useEffect(() => {
        if (!sellerId) return

        // Connect socket when component mounts
        connectSocket(sellerId, 'seller')

        // Listen for new orders
        onNewOrder((orderData) => {
            console.log('[useSellerSocket] New order received:', orderData)

            // 1. Add to redux store
            dispatch(addRecentOrder(orderData))

            const orderAmount = orderData.orderAmount
                ? `₹${Number(orderData.orderAmount).toLocaleString('en-IN')}`
                : ''
            const buyerLocation = orderData.buyerLocation ? ` from ${orderData.buyerLocation}` : ''

            // 2. Show in-app toast notification
            toast.success(`🚨 New Order! ${orderAmount}${buyerLocation}`, {
                duration: 8000,
                action: {
                    label: 'View Order',
                    onClick: () => navigate(`/seller/orders/${orderData.orderId}`)
                }
            })

            // 3. Play loud alarm sound (5 seconds) if not muted
            // Plays whether tab is active or in the background
            if (!alarmMuted) {
                playAlarmAudio(5)
            }

            // 4. Show Chrome / browser notification
            if (pushNotificationsEnabled && areNotificationsEnabled()) {
                showSellerAlarmNotification(orderData)
            }
        })

        // Cleanup on unmount
        return () => {
            offNewOrder()
            disconnectSocket(sellerId)
        }
    }, [sellerId, alarmMuted, pushNotificationsEnabled, dispatch, navigate])

    /**
     * Manually trigger test alarm sound
     */
    const testAlarm = () => {
        playAlarmAudio(5)
        toast.info('🔔 Testing 5-second alarm sound...')
    }

    /**
     * Test Chrome push notification (both foreground and background push)
     */
    const testPush = async () => {
        // 1. Direct browser notification
        showSellerAlarmNotification({
            orderId: 'TEST-9921',
            orderAmount: 2499,
            buyerLocation: 'Mumbai'
        })
        // 2. Trigger backend Web Push
        const res = await triggerTestPushBackend()
        if (res.sent) {
            toast.success('📱 Test push notification sent!')
        } else {
            toast.info(res.message || 'Push test triggered')
        }
    }

    return { testAlarm, testPush, isConnected: isSocketConnected() }
}

export default useSellerSocket
