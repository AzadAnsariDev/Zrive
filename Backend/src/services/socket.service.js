/**
 * Socket.io Service - emit events to connected sellers
 * Handles real-time notifications for seller alarms
 */

let io = null

/**
 * Initialize socket.io instance (called from server.js after io is set up)
 * @param {Server} socketInstance - Socket.io server instance
 */
export const initializeSocketService = (socketInstance) => {
    io = socketInstance
    console.log('[Socket Service] Initialized with io instance')
}

/**
 * Emit new-order event to a specific seller
 * Fails silently - never blocks business logic
 * @param {string} sellerId - Seller user ID
 * @param {Object} orderData - Order object with details
 * @returns {Promise<boolean>} - true if emitted, false if failed
 */
export const emitNewOrderToSeller = async (sellerId, orderData) => {
    try {
        if (!io) {
            console.warn('[Socket Service] io instance not initialized')
            return false
        }

        if (!sellerId) {
            console.error('[Socket Service] sellerId is required')
            return false
        }

        // Emit to seller's room (keyed by sellerId)
        io.to(sellerId).emit('new-order', {
            orderId: orderData._id,
            orderAmount: orderData.sellerAmount?.amount,
            itemsCount: orderData.orderItems?.length,
            buyerLocation: orderData.shippingAddress?.city,
            timestamp: new Date()
        })

        console.log('[Socket Service] new-order emitted to seller:', sellerId)
        return true
    } catch (err) {
        // Always fail silently
        console.error('[Socket Service] Failed to emit new-order:', {
            sellerId,
            error: err.message
        })
        return false
    }
}

/**
 * Broadcast an event to a specific seller's room
 * @param {string} sellerId - Seller user ID
 * @param {string} eventName - Event name
 * @param {Object} data - Event data
 * @returns {Promise<boolean>}
 */
export const emitToSeller = async (sellerId, eventName, data) => {
    try {
        if (!io || !sellerId || !eventName) {
            return false
        }

        const room = sellerId.toString()
        io.to(room).emit(eventName, data)
        console.log('[Socket Service] Event emitted to seller:', { sellerId: room, eventName })
        return true
    } catch (err) {
        console.error('[Socket Service] Failed to emit event to seller:', {
            sellerId,
            eventName,
            error: err.message
        })
        return false
    }
}

/**
 * Emit order update event to a specific buyer/user
 * @param {string} userId - Buyer user ID
 * @param {string} eventName - Event name (e.g. 'order-placed', 'order-shipped', 'order-delivered')
 * @param {Object} orderData - Order details
 * @returns {Promise<boolean>}
 */
export const emitOrderUpdateToUser = async (userId, eventName, orderData) => {
    try {
        if (!io || !userId || !eventName) {
            return false
        }

        const room = userId.toString()
        io.to(room).emit(eventName, {
            orderId: orderData._id,
            orderStatus: orderData.orderStatus,
            itemsCount: orderData.orderItems?.length,
            orderAmount: orderData.sellerAmount?.amount,
            eventName,
            timestamp: new Date()
        })

        console.log(`[Socket Service] ${eventName} emitted to user:`, room)
        return true
    } catch (err) {
        console.error(`[Socket Service] Failed to emit ${eventName} to user:`, {
            userId,
            error: err.message
        })
        return false
    }
}

/**
 * Broadcast an event to a specific user's room
 * @param {string} userId - User ID
 * @param {string} eventName - Event name
 * @param {Object} data - Event data
 * @returns {Promise<boolean>}
 */
export const emitToUser = async (userId, eventName, data) => {
    try {
        if (!io || !userId || !eventName) {
            return false
        }

        const room = userId.toString()
        io.to(room).emit(eventName, data)
        console.log('[Socket Service] Event emitted to user:', { userId: room, eventName })
        return true
    } catch (err) {
        console.error('[Socket Service] Failed to emit event to user:', {
            userId,
            eventName,
            error: err.message
        })
        return false
    }
}

