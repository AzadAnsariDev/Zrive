import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { useAuth } from '../features/auth/hook/useAuth'
import { RouterProvider } from 'react-router'
import router from '../router/routes'
import { Toaster, toast } from 'sonner'
import {
  connectSocket,
  disconnectSocket,
  onNewOrder,
  offNewOrder,
  onBuyerOrderEvents,
  offBuyerOrderEvents
} from '../features/seller/services/socket.service'
import {
  registerServiceWorker,
  setupNotificationListeners,
  showSellerAlarmNotification,
  showBuyerOrderNotification,
  playAlarmAudio,
  areNotificationsEnabled,
  silentlyRefreshPushSubscription
} from '../features/seller/services/push-notification.service'
import { addRecentOrder } from '../features/seller/state/notificationSlice'

const App = () => {
  const { handleGetMe } = useAuth()
  const dispatch = useDispatch()
  const { user } = useSelector((state) => state.auth)
  const { alarmMuted, pushNotificationsEnabled } = useSelector((state) => state.notification)
  const userId = user?._id || user?.id
  const userRole = user?.role

  useEffect(() => {
    handleGetMe()
    // Enforce default light theme across the application
    document.documentElement.classList.remove('dark')
    localStorage.removeItem('zrive_theme')
    localStorage.removeItem('seller_theme')
    localStorage.removeItem('zrive-theme')

    // Register service worker on initial load
    registerServiceWorker().then((reg) => {
      if (reg) {
        setupNotificationListeners()
      }
    })
  }, [])

  // Silently re-sync push subscription to backend on every page load.
  // Covers the revoke + re-grant scenario: browser issues a new endpoint after
  // re-grant, so we must upsert it immediately without requiring the user to
  // manually toggle the notification button again.
  useEffect(() => {
    if (!user) return
    silentlyRefreshPushSubscription()
  }, [user])

  // Manage Real-time Sockets & Notifications for Logged-in Users (Seller + Buyer)
  useEffect(() => {
    if (!userId) return

    const isSeller = userRole === 'seller' || userRole === 'basic_seller'

    // Connect socket for the user
    connectSocket(userId, userRole)

    if (isSeller) {
      // Seller listener for new incoming orders
      onNewOrder((orderData) => {
        dispatch(addRecentOrder(orderData))

        const amount = orderData.orderAmount
          ? `₹${Number(orderData.orderAmount).toLocaleString('en-IN')}`
          : ''
        const location = orderData.buyerLocation ? ` from ${orderData.buyerLocation}` : ''

        toast.success(`🚨 New Order! ${amount}${location}`, {
          duration: 8000,
        })

        // Play loud 5-second alarm sound if not muted
        if (!alarmMuted) {
          playAlarmAudio(5)
        }

        // Show direct browser notification if tab is open
        if (pushNotificationsEnabled && areNotificationsEnabled()) {
          showSellerAlarmNotification(orderData)
        }
      })
    } else {
      // Buyer listener for order updates
      onBuyerOrderEvents((data) => {
        const orderShortId = (data.orderId || '').toString().slice(-8)
        let message = `🎉 Order Confirmed! #${orderShortId}`

        if (data.eventName === 'order-shipped') {
          message = `📦 Order #${orderShortId} has shipped!`
        } else if (data.eventName === 'order-delivered') {
          message = `🎉 Order #${orderShortId} has been delivered!`
        } else if (data.eventName === 'order-rejected') {
          message = `Order #${orderShortId} update: Refund initiated.`
        } else if (data.eventName === 'order-cancelled') {
          message = `Order #${orderShortId} cancelled.`
        }

        toast.success(message, { duration: 6000 })

        if (areNotificationsEnabled()) {
          showBuyerOrderNotification(data, data.eventName)
        }
      })
    }

    return () => {
      offNewOrder()
      offBuyerOrderEvents()
      disconnectSocket(userId)
    }
  }, [userId, userRole, alarmMuted, pushNotificationsEnabled, dispatch])

  return (
    <>
      <Toaster
        position="top-center"
        richColors
        closeButton
        duration={3500}
        theme="light"
        toastOptions={{
          style: {
            fontFamily: 'inherit',
            fontSize: '13px',
            borderRadius: '8px',
          },
        }}
      />
      <RouterProvider router={router} />
    </>
  )
}

export default App