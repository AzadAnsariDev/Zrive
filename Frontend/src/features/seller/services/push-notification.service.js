/**
 * Push Notification Service - Frontend
 * Handles browser notifications, Web Push (works offline/tab closed), and Audio Alarms
 */

import axios from 'axios'

// Helper: convert urlBase64 to Uint8Array for VAPID key
function urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4)
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
    const rawData = window.atob(base64)
    const outputArray = new Uint8Array(rawData.length)
    for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i)
    }
    return outputArray
}

/**
 * Register service worker for background push notifications
 */
export const registerServiceWorker = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('[Push Notifications] Service Workers not supported in this browser')
        return null
    }

    try {
        const registration = await navigator.serviceWorker.register('/service-worker.js', {
            scope: '/'
        })
        console.log('[Push Notifications] Service Worker registered:', registration.scope)
        return registration
    } catch (err) {
        console.error('[Push Notifications] Service Worker registration failed:', err)
        return null
    }
}

/**
 * Request browser notification permission
 */
export const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
        console.log('[Push Notifications] Notifications not supported in this browser')
        return false
    }

    if (Notification.permission === 'granted') {
        return true
    }

    try {
        const permission = await Notification.requestPermission()
        console.log('[Push Notifications] Permission response:', permission)
        return permission === 'granted'
    } catch (err) {
        console.error('[Push Notifications] Permission request error:', err)
        return false
    }
}

/**
 * Subscribe browser to Web Push and save subscription on backend
 * This allows receiving notifications even when the browser tab is completely CLOSED.
 */
export const subscribeToPushNotifications = async () => {
    try {
        const hasPermission = await requestNotificationPermission()
        if (!hasPermission) {
            console.warn('[Push Notifications] Permission not granted')
            return { success: false, reason: 'permission_denied' }
        }

        const registration = await navigator.serviceWorker.ready
        if (!registration.pushManager) {
            console.warn('[Push Notifications] PushManager not available')
            return { success: false, reason: 'push_manager_unavailable' }
        }

        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BFHt0xR1UqLVDSJjbtCPMTKzLB0G7uKCl5CocJpx25Sqk_-eMJyfz5IL30xQd2LU-wi8cloYZyylickEvbPMK9A'
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey)

        let subscription = await registration.pushManager.getSubscription()
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
            })
        }

        console.log('[Push Notifications] Web Push subscription acquired:', subscription)

        // Save subscription to backend
        const response = await axios.post('/api/auth/push-subscription', {
            subscription: subscription.toJSON()
        }, { withCredentials: true })

        return { success: true, data: response.data }
    } catch (err) {
        console.error('[Push Notifications] Failed to subscribe to Web Push:', err)
        return { success: false, error: err.message }
    }
}

/**
 * Silently sync the current push subscription to the backend on every page load.
 *
 * When the user revokes + re-grants notification permission the browser issues
 * a brand-new endpoint.  If we don't call this on load the backend still holds
 * the old (now dead) endpoint and push delivery silently fails until the user
 * manually toggles the button.
 *
 * This is safe to call unconditionally: if permission isn't granted it's a no-op.
 */
export const silentlyRefreshPushSubscription = async () => {
    try {
        if (!('Notification' in window) || Notification.permission !== 'granted') return
        if (!('serviceWorker' in navigator) || !('PushManager' in window)) return

        const registration = await navigator.serviceWorker.ready
        if (!registration.pushManager) return

        const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY || 'BFHt0xR1UqLVDSJjbtCPMTKzLB0G7uKCl5CocJpx25Sqk_-eMJyfz5IL30xQd2LU-wi8cloYZyylickEvbPMK9A'
        const convertedKey = urlBase64ToUint8Array(vapidPublicKey)

        let subscription = await registration.pushManager.getSubscription()

        // No subscription exists — create a fresh one (happens after revoke+re-grant)
        if (!subscription) {
            subscription = await registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
            })
            console.log('[Push Notifications] Fresh subscription created after permission reset')
        }

        // Always upsert to backend so it has the latest endpoint
        await axios.post('/api/auth/push-subscription', {
            subscription: subscription.toJSON()
        }, { withCredentials: true })
        console.log('[Push Notifications] Subscription synced to backend on page load')
    } catch (err) {
        // Silent fail — this is a background refresh, never block the UI
        console.warn('[Push Notifications] Silent refresh failed:', err.message)
    }
}


/**
 * Unsubscribe from Web Push
 */
export const unsubscribeFromPushNotifications = async () => {
    try {
        if (!('serviceWorker' in navigator)) return false
        const registration = await navigator.serviceWorker.ready
        const subscription = await registration.pushManager.getSubscription()
        if (subscription) {
            const endpoint = subscription.endpoint
            await subscription.unsubscribe()
            await axios.post('/api/auth/push-subscription/unsubscribe', { endpoint }, { withCredentials: true })
            console.log('[Push Notifications] Successfully unsubscribed')
        }
        return true
    } catch (err) {
        console.error('[Push Notifications] Error unsubscribing:', err)
        return false
    }
}

/**
 * Trigger a backend test push notification
 */
export const triggerTestPushBackend = async () => {
    try {
        const res = await axios.post('/api/auth/push-subscription/test', {}, { withCredentials: true })
        return res.data
    } catch (err) {
        console.error('[Push Notifications] Test push error:', err)
        return { success: false, message: err.response?.data?.message || err.message }
    }
}

/**
 * Show a browser notification (foreground/direct)
 * Sanitizes options to avoid Chrome TypeError when actions are passed to new Notification()
 */
export const showNotification = async (title, options = {}) => {
    if (!('Notification' in window)) return false
    if (Notification.permission !== 'granted') return false

    try {
        if ('serviceWorker' in navigator) {
            const registration = await navigator.serviceWorker.ready
            if (registration && registration.showNotification) {
                await registration.showNotification(title, {
                    icon: '/vite.svg',
                    badge: '/vite.svg',
                    ...options
                })
                return true
            }
        }

        // Direct fallback: sanitize options (strip 'actions' which Chrome forbids on direct Notification)
        const directOptions = { ...options }
        delete directOptions.actions

        new Notification(title, {
            icon: '/vite.svg',
            ...directOptions
        })
        return true
    } catch (err) {
        console.error('[Push Notifications] Error showing direct notification:', err)
        return false
    }
}

/**
 * Show seller alarm notification
 */
export const showSellerAlarmNotification = (orderData) => {
    const amount = orderData.orderAmount ? `₹${Number(orderData.orderAmount).toLocaleString('en-IN')}` : ''
    const location = orderData.buyerLocation ? ` from ${orderData.buyerLocation}` : ''
    const title = `🚨 NEW ORDER! ${amount}`

    return showNotification(title, {
        body: `Order #${(orderData.orderId || '').toString().slice(-8)}${location} · Tap to view`,
        tag: 'zrive-seller-alarm',
        requireInteraction: true,
        data: {
            orderId: orderData.orderId,
            url: `/seller/orders/${orderData.orderId}`
        },
        actions: [
            { action: 'view', title: 'View Order' },
            { action: 'dismiss', title: 'Dismiss' }
        ]
    })
}

/**
 * Show buyer order notification
 */
export const showBuyerOrderNotification = (orderData, eventName = 'order-placed') => {
    const orderShortId = (orderData.orderId || '').toString().slice(-8)
    let title = '🎉 Order Confirmed!'
    let body = `Your order #${orderShortId} is confirmed and is being prepared.`

    if (eventName === 'order-shipped') {
        title = '📦 Order Shipped!'
        body = `Your order #${orderShortId} is on the way!`
    } else if (eventName === 'order-delivered') {
        title = '🎉 Order Delivered!'
        body = `Your order #${orderShortId} has arrived!`
    } else if (eventName === 'order-rejected') {
        title = 'Order Update'
        body = `Refund initiated for order #${orderShortId}.`
    } else if (eventName === 'order-cancelled') {
        title = 'Order Cancelled'
        body = `Your order #${orderShortId} has been cancelled.`
    }

    return showNotification(title, {
        body,
        tag: 'zrive-buyer-notification',
        data: {
            orderId: orderData.orderId,
            url: `/orders/${orderData.orderId}`
        }
    })
}

/**
 * Check if notifications are enabled and granted
 */
export const areNotificationsEnabled = () => {
    return 'Notification' in window && Notification.permission === 'granted'
}

/**
 * Get notification permission status
 */
export const getNotificationPermissionStatus = () => {
    if (!('Notification' in window)) return 'unsupported'
    return Notification.permission // 'granted', 'denied', 'default'
}

/**
 * Setup notification message listeners from Service Worker
 */
export const setupNotificationListeners = () => {
    if (!('serviceWorker' in navigator)) return

    navigator.serviceWorker.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'NOTIFICATION_CLICK') {
            console.log('[Push Notifications] Notification clicked message received')
        }
    })
}

/**
 * Play a high-urgency, pulsating 5-second alarm sound using Web Audio API
 * Works across all browsers and auto-resumes AudioContext
 */
let sharedAudioContext = null

// Unlock AudioContext on first user interaction so sounds play freely in background
if (typeof window !== 'undefined') {
    const unlockAudio = () => {
        try {
            const AudioCtx = window.AudioContext || window.webkitAudioContext
            if (!AudioCtx) return
            if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
                sharedAudioContext = new AudioCtx()
            }
            if (sharedAudioContext && sharedAudioContext.state === 'suspended') {
                sharedAudioContext.resume().catch(() => {})
            }
        } catch (e) {}
    }
    window.addEventListener('click', unlockAudio, { once: false, passive: true })
    window.addEventListener('touchstart', unlockAudio, { once: false, passive: true })
}

export const playAlarmAudio = (durationSeconds = 5) => {
    try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext
        if (!AudioCtx) return

        if (!sharedAudioContext || sharedAudioContext.state === 'closed') {
            sharedAudioContext = new AudioCtx()
        }

        const startAlarm = () => {
            const now = sharedAudioContext.currentTime
        const totalDuration = durationSeconds
        const beepDuration = 0.18
        const beepInterval = 0.28
        const pulsesCount = Math.floor(totalDuration / beepInterval)

            for (let i = 0; i < pulsesCount; i++) {
            const startTime = now + (i * beepInterval)
            const osc = sharedAudioContext.createOscillator()
            const gain = sharedAudioContext.createGain()

            // Alternating two-tone alarm frequency for high urgency (880Hz / 1046Hz)
            osc.type = 'sine'
            osc.frequency.setValueAtTime(i % 2 === 0 ? 880 : 1046, startTime)

            gain.gain.setValueAtTime(0, startTime)
            gain.gain.linearRampToValueAtTime(0.35, startTime + 0.02)
            gain.gain.linearRampToValueAtTime(0.35, startTime + beepDuration - 0.03)
            gain.gain.linearRampToValueAtTime(0, startTime + beepDuration)

            osc.connect(gain)
            gain.connect(sharedAudioContext.destination)

            osc.start(startTime)
            osc.stop(startTime + beepDuration)
            }

            console.log('[Audio Alarm] 5-second rhythmic alarm scheduled successfully')
        }

        if (sharedAudioContext.state === 'suspended') {
            sharedAudioContext.resume().then(startAlarm).catch((error) => {
                console.error('[Audio Alarm] AudioContext resume failed:', error)
            })
        } else {
            startAlarm()
        }
    } catch (err) {
        console.error('[Audio Alarm] Error synthesizing alarm sound:', err)
    }
}

/**
 * Register background sync to check for new orders when tab is closed
 * Browser will periodically sync even when the tab is closed (if permission granted)
 */
export const registerBackgroundSync = async () => {
    if (!('serviceWorker' in navigator)) {
        console.log('[Background Sync] Service Workers not supported')
        return false
    }

    try {
        const registration = await navigator.serviceWorker.ready
        
        if (!registration.sync) {
            console.log('[Background Sync] Background Sync not supported in this browser')
            return false
        }

        // Register sync tag - browser will call this periodically
        await registration.sync.register('sync-seller-orders')
        console.log('[Background Sync] Registered background sync for seller orders')
        return true
    } catch (err) {
        console.error('[Background Sync] Error registering:', err)
        return false
    }
}

/**
 * Manually trigger background sync (for testing)
 */
export const triggerBackgroundSync = async () => {
    if (!('serviceWorker' in navigator)) return false

    try {
        const registration = await navigator.serviceWorker.ready
        if (!registration.sync) return false

        await registration.sync.register('sync-seller-orders')
        console.log('[Background Sync] Manually triggered sync')
        return true
    } catch (err) {
        console.error('[Background Sync] Error triggering:', err)
        return false
    }
}
