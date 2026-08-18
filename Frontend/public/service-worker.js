// service-worker.js
// Handles background Push Notifications and alarms when tab/browser is closed

const DEFAULT_TAG = 'zrive-notification'

self.addEventListener('install', (event) => {
    self.skipWaiting()
    console.log('[Service Worker] Installed')
})

self.addEventListener('activate', (event) => {
    event.waitUntil(clients.claim())
    console.log('[Service Worker] Activated and controlling clients')
})

// Background Sync - Check for new orders when tab is closed
self.addEventListener('sync', (event) => {
    console.log('[Service Worker] Background sync triggered:', event.tag)

    if (event.tag === 'sync-seller-orders') {
        event.waitUntil(
            checkNewOrdersAndNotify()
                .catch(err => console.error('[Service Worker] Sync error:', err))
        )
    }
})

/**
 * Check for new orders via API and show notification if found
 */
async function checkNewOrdersAndNotify() {
    try {
        const response = await fetch('/api/seller/pending-orders', {
            credentials: 'include' // Send cookies for auth
        })

        if (!response.ok) return

        const data = await response.json()
        const orders = data.orders || []

        if (orders.length > 0) {
            // Get most recent order
            const latestOrder = orders[0]

            const options = {
                body: `₹${Number(latestOrder.sellerAmount?.amount || 0).toLocaleString('en-IN')} ${latestOrder.shippingAddress?.city ? `from ${latestOrder.shippingAddress.city}` : ''}`,
                icon: '/vite.svg',
                badge: '/vite.svg',
                tag: 'zrive-seller-alarm',
                requireInteraction: true,
                vibrate: [500, 150, 500, 150, 500],
                data: {
                    orderId: latestOrder._id,
                    url: `/seller/orders/${latestOrder._id}`,
                    timestamp: Date.now()
                },
                actions: [
                    { action: 'view-order', title: '📋 View Order' },
                    { action: 'dismiss', title: 'Dismiss' }
                ]
            }

            await self.registration.showNotification('🚨 New Order!', options)
            console.log('[Service Worker] Notification shown for order:', latestOrder._id)
        }
    } catch (err) {
        console.error('[Service Worker] checkNewOrdersAndNotify error:', err)
    }
}

// Handle push notifications delivered from Backend web-push
self.addEventListener('push', (event) => {
    console.log('[Service Worker] Push event received:', event)

    let payload = {
        title: '🚨 New Order Received!',
        body: 'You have received a new order on ZRIVE.',
        tag: DEFAULT_TAG,
        url: '/seller/orders',
        isAlarm: true,
    }

    if (event.data) {
        try {
            payload = { ...payload, ...event.data.json() }
        } catch (e) {
            try {
                payload.body = event.data.text()
            } catch (err) {}
        }
    }

    const isAlarm = payload.isAlarm || payload.tag === 'zrive-seller-alarm'
    const targetUrl = payload.url || (payload.data && payload.data.url) || '/seller'

    const options = {
        body: payload.body,
        icon: '/vite.svg',
        badge: '/vite.svg',
        tag: payload.tag || DEFAULT_TAG,
        requireInteraction: isAlarm, // Seller order alarms remain visible until clicked
        renotify: isAlarm,
        silent: false,
        vibrate: isAlarm
            ? [500, 150, 500, 150, 500, 150, 800] // Pulsing alarm vibration pattern
            : [200, 100, 200],
        data: {
            url: targetUrl,
            orderId: payload.orderId || (payload.data && payload.data.orderId),
            timestamp: Date.now(),
        },
        actions: [
            {
                action: 'view-order',
                title: 'View Details',
            },
            {
                action: 'dismiss',
                title: 'Dismiss',
            }
        ]
    }

    event.waitUntil(
        self.registration.showNotification(payload.title, options)
    )
})

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
    console.log('[Service Worker] Notification clicked, action:', event.action)
    event.notification.close()

    if (event.action === 'dismiss') {
        return
    }

    const urlToOpen = event.notification.data?.url || '/seller'

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
            // Check if tab with target URL or same domain is already open
            for (let i = 0; i < windowClients.length; i++) {
                const client = windowClients[i]
                if ('focus' in client) {
                    if (client.url.includes(urlToOpen) || client.url.includes(self.location.origin)) {
                        client.navigate(urlToOpen)
                        return client.focus()
                    }
                }
            }
            // If no window is open, open a new one
            if (clients.openWindow) {
                return clients.openWindow(urlToOpen)
            }
        })
    )
})

self.addEventListener('notificationclose', (event) => {
    console.log('[Service Worker] Notification closed')
})

self.addEventListener('message', (event) => {
    if (event.data && event.data.type === 'SKIP_WAITING') {
        self.skipWaiting()
    }
})
