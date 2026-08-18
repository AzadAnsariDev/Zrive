/**
 * Socket.io Service - Frontend * Handles real-time connection and event listeners for sellers and buyers
 */

import { io } from 'socket.io-client'

let socket = null

/**
 * Connect to Socket.io server
 */
export const connectSocket = (userId, role = 'user') => {
    if (!userId) return null

    const SERVER_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000'

    if (socket && socket.connected) {
        console.log('[Socket Client] Already connected, re-joining room')
        socket.emit('join-room', userId.toString())
        if (role === 'seller' || role === 'basic_seller') {
            socket.emit('seller-login', userId.toString())
        } else {
            socket.emit('user-login', userId.toString())
        }
        return socket
    }

    // Always discard a disconnected socket left behind by a previous logout.
    // This guarantees that a fresh login gets a fresh connection and room join.
    if (socket) {
        socket.removeAllListeners()
        socket.disconnect()
        socket = null
    }

    socket = io(SERVER_URL, {
        withCredentials: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: 10
    })

    socket.on('connect', () => {
        console.log('[Socket Client] Connected:', socket.id)
        socket.emit('join-room', userId.toString())
        if (role === 'seller' || role === 'basic_seller') {
            socket.emit('seller-login', userId.toString())
        } else {
            socket.emit('user-login', userId.toString())
        }
    })

    socket.on('disconnect', (reason) => {
        console.log('[Socket Client] Disconnected:', reason)
    })

    socket.on('connect_error', (error) => {
        console.error('[Socket Client] Connection error:', error.message)
    })

    return socket
}

/**
 * Disconnect socket and leave rooms
 */
export const disconnectSocket = (userId) => {
    if (!socket) return

    console.log('[Socket Client] Disconnecting')
    if (userId) {
        socket.emit('seller-logout', userId.toString())
        socket.emit('user-logout', userId.toString())
    }
    socket.disconnect()
    socket = null
}

/**
 * Listen for new order events (seller)
 * @param {Function} callback - Called with order data when new order arrives
 */
export const onNewOrder = (callback) => {
    if (!socket) return

    socket.on('new-order', (orderData) => {
        console.log('[Socket Client] New order event received:', orderData)
        callback(orderData)
    })
}

/**
 * Remove new order listener
 */
export const offNewOrder = () => {
    if (!socket) return
    socket.off('new-order')
}

/**
 * Listen for buyer order events (order-placed, order-shipped, order-delivered, etc.)
 */
export const onBuyerOrderEvents = (callback) => {
    if (!socket) return

    const events = ['order-placed', 'order-shipped', 'order-delivered', 'order-rejected', 'order-cancelled']
    events.forEach(eventName => {
        socket.on(eventName, (data) => {
            console.log(`[Socket Client] Buyer event '${eventName}':`, data)
            callback({ eventName, ...data })
        })
    })
}

/**
 * Remove buyer order events listeners
 */
export const offBuyerOrderEvents = () => {
    if (!socket) return
    const events = ['order-placed', 'order-shipped', 'order-delivered', 'order-rejected', 'order-cancelled']
    events.forEach(eventName => {
        socket.off(eventName)
    })
}

/**
 * Get current socket instance
 */
export const getSocket = () => socket

/**
 * Check if socket is connected
 */
export const isSocketConnected = () => socket && socket.connected
