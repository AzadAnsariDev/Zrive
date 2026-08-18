/**
 * Order Notification Service
 * Handles sending emails and socket events for order events
 * All functions fail silently - never block business logic
 */

import { sendEmail } from './email.service.js'
import {
    orderConfirmationTemplate,
    orderShippedTemplate,
    orderDeliveredTemplate,
    orderIssueRefundTemplate,
    orderCancelledTemplate,
    sellerNewOrderTemplate,
    sellerOrderCancelledTemplate
} from '../templates/email.templates.js'
import { emitNewOrderToSeller, emitOrderUpdateToUser } from './socket.service.js'
import { sendPushNotificationToUser } from './push-notification.service.js'
import userModel from '../models/user.model.js'
import sellerModel from '../models/seller.model.js'

/**
 * Send all notifications when an order is placed (buyer + seller emails + sockets + background push)
 * @param {Object} order - Order document
 */
export const notifyOrderPlaced = async (order) => {
    try {
        if (!order || !order._id) {
            console.error('[Order Notification] Invalid order')
            return
        }

        const buyerId = order.user?.toString()
        const sellerProfile = await sellerModel.findById(order.seller).select('userId')
        const sellerId = sellerProfile?.userId?.toString()
        const orderShortId = order._id.toString().slice(-8)
        const orderAmount = order.sellerAmount?.amount || 0
        const buyerCity = order.shippingAddress?.city || 'Customer'

        // Fetch buyer email
        const buyer = await userModel.findById(order.user, { email: 1 })
        if (!buyer) {
            console.error('[Order Notification] Buyer not found:', order.user)
            return
        }

        // Fetch seller email
        const seller = sellerId ? await userModel.findById(sellerId, { email: 1 }) : null
        if (!seller) {
            console.error('[Order Notification] Seller not found:', order.seller)
            return
        }

        // 1. Send buyer confirmation email (non-blocking)
        sendEmail({
            to: buyer.email,
            subject: 'Your Order Confirmed - Order #' + orderShortId,
            html: orderConfirmationTemplate(order)
        }).catch(err => console.error('[Order Notification] Buyer email error:', err.message))

        // 2. Send seller new order email (non-blocking)
        sendEmail({
            to: seller.email,
            subject: 'New Order Received - Action Required! - Order #' + orderShortId,
            html: sellerNewOrderTemplate(order)
        }).catch(err => console.error('[Order Notification] Seller email error:', err.message))

        // 3. Emit real-time socket alarm to seller (for open tabs)
        emitNewOrderToSeller(sellerId, order)

        // 4. Emit real-time socket confirmation to buyer (for open tabs)
        emitOrderUpdateToUser(buyerId, 'order-placed', order)

        // 5. Send Web Push to SELLER (works even if seller tab/browser is CLOSED)
        sendPushNotificationToUser(sellerId, {
            title: `🚨 NEW ORDER RECEIVED! ₹${orderAmount.toLocaleString('en-IN')}`,
            body: `Order #${orderShortId} from ${buyerCity} · Tap to view & fulfill`,
            tag: 'zrive-seller-alarm',
            isAlarm: true,
            orderId: order._id,
            url: `/seller/orders/${order._id}`,
            data: {
                orderId: order._id,
                url: `/seller/orders/${order._id}`,
            }
        }).catch(err => console.error('[Order Notification] Seller WebPush error:', err.message))

        // 6. Send Web Push to BUYER (works even if buyer tab/browser is CLOSED)
        sendPushNotificationToUser(buyerId, {
            title: '🎉 Order Confirmed!',
            body: `Your order #${orderShortId} has been placed successfully and is being prepared.`,
            tag: 'zrive-buyer-notification',
            orderId: order._id,
            url: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                url: `/orders/${order._id}`,
            }
        }).catch(err => console.error('[Order Notification] Buyer WebPush error:', err.message))

    } catch (err) {
        console.error('[Order Notification] Error in notifyOrderPlaced:', err.message)
    }
}

/**
 * Send notification when order is shipped
 * @param {Object} order - Order document
 */
export const notifyOrderShipped = async (order) => {
    try {
        const buyerId = order.user?.toString()
        const orderShortId = order._id.toString().slice(-8)

        const buyer = await userModel.findById(order.user, { email: 1 })
        if (buyer) {
            sendEmail({
                to: buyer.email,
                subject: 'Your Order Has Shipped! 📦 - Order #' + orderShortId,
                html: orderShippedTemplate(order)
            }).catch(err => console.error('[Order Notification] Shipped email error:', err.message))
        }

        // Real-time socket
        emitOrderUpdateToUser(buyerId, 'order-shipped', order)

        // Web push (works offline/closed tab)
        sendPushNotificationToUser(buyerId, {
            title: '📦 Order Shipped!',
            body: `Your order #${orderShortId} is on the way!`,
            tag: 'zrive-buyer-notification',
            orderId: order._id,
            url: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                url: `/orders/${order._id}`,
            }
        }).catch(err => console.error('[Order Notification] Shipped WebPush error:', err.message))

    } catch (err) {
        console.error('[Order Notification] Error in notifyOrderShipped:', err.message)
    }
}

/**
 * Send notification when order is delivered
 * @param {Object} order - Order document
 */
export const notifyOrderDelivered = async (order) => {
    try {
        const buyerId = order.user?.toString()
        const orderShortId = order._id.toString().slice(-8)

        const buyer = await userModel.findById(order.user, { email: 1 })
        if (buyer) {
            sendEmail({
                to: buyer.email,
                subject: 'Your Order Has Arrived! 🎉 - Order #' + orderShortId,
                html: orderDeliveredTemplate(order)
            }).catch(err => console.error('[Order Notification] Delivered email error:', err.message))
        }

        // Real-time socket
        emitOrderUpdateToUser(buyerId, 'order-delivered', order)

        // Web push (works offline/closed tab)
        sendPushNotificationToUser(buyerId, {
            title: '🎉 Order Delivered!',
            body: `Your order #${orderShortId} has been delivered. Enjoy your purchase!`,
            tag: 'zrive-buyer-notification',
            orderId: order._id,
            url: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                url: `/orders/${order._id}`,
            }
        }).catch(err => console.error('[Order Notification] Delivered WebPush error:', err.message))

    } catch (err) {
        console.error('[Order Notification] Error in notifyOrderDelivered:', err.message)
    }
}

/**
 * Send apology/refund email when seller rejects order
 * CRITICAL: No mention of seller, generic apology only
 * @param {Object} order - Order document
 */
export const notifyOrderRejected = async (order) => {
    try {
        const buyerId = order.user?.toString()
        const orderShortId = order._id.toString().slice(-8)

        const buyer = await userModel.findById(order.user, { email: 1 })
        if (buyer) {
            sendEmail({
                to: buyer.email,
                subject: 'Order Update: Refund Initiated - Order #' + orderShortId,
                html: orderIssueRefundTemplate(order)
            }).catch(err => console.error('[Order Notification] Rejected email error:', err.message))
        }

        // Real-time socket
        emitOrderUpdateToUser(buyerId, 'order-rejected', order)

        // Web push
        sendPushNotificationToUser(buyerId, {
            title: 'Order Update: Refund Initiated',
            body: `We could not fulfill order #${orderShortId}. A full refund has been initiated.`,
            tag: 'zrive-buyer-notification',
            orderId: order._id,
            url: `/orders/${order._id}`,
            data: {
                orderId: order._id,
                url: `/orders/${order._id}`,
            }
        }).catch(err => console.error('[Order Notification] Rejected WebPush error:', err.message))

    } catch (err) {
        console.error('[Order Notification] Error in notifyOrderRejected:', err.message)
    }
}

/**
 * Send notification when buyer cancels order
 * @param {Object} order - Order document
 */
export const notifyOrderCancelled = async (order) => {
    try {
        const buyerId = order.user?.toString()
        const sellerProfile = await sellerModel.findById(order.seller).select('userId')
        const sellerId = sellerProfile?.userId?.toString()
        const orderShortId = order._id.toString().slice(-8)

        // Notify buyer email
        const buyer = await userModel.findById(order.user, { email: 1 })
        if (buyer) {
            sendEmail({
                to: buyer.email,
                subject: 'Order Cancellation Confirmed - Order #' + orderShortId,
                html: orderCancelledTemplate(order)
            }).catch(err => console.error('[Order Notification] Buyer cancel email error:', err.message))
        }

        // Notify seller email
        const seller = sellerId ? await userModel.findById(sellerId, { email: 1 }) : null
        if (seller) {
            sendEmail({
                to: seller.email,
                subject: 'Order Cancelled - Order #' + orderShortId,
                html: sellerOrderCancelledTemplate(order)
            }).catch(err => console.error('[Order Notification] Seller cancel email error:', err.message))
        }

        // Real-time sockets
        emitOrderUpdateToUser(buyerId, 'order-cancelled', order)
        emitOrderUpdateToUser(sellerId, 'order-cancelled', order)

        // Web push to seller
        sendPushNotificationToUser(sellerId, {
            title: 'Order Cancelled',
            body: `Order #${orderShortId} has been cancelled by the buyer.`,
            tag: 'zrive-seller-alarm',
            orderId: order._id,
            url: `/seller/orders/${order._id}`,
            data: {
                orderId: order._id,
                url: `/seller/orders/${order._id}`,
            }
        }).catch(err => console.error('[Order Notification] Seller cancel WebPush error:', err.message))

    } catch (err) {
        console.error('[Order Notification] Error in notifyOrderCancelled:', err.message)
    }
}

