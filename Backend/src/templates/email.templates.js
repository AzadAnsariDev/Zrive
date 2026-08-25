/**
 * Email Templates for ZRIVE
 * All templates use inline CSS for email client compatibility
 * Business Rule: Buyer must NEVER know about seller confirmation/acceptance
 */

const baseStyles = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
  line-height: 1.6;
  color: #333;
`

const containerStyles = `
  ${baseStyles}
  max-width: 600px;
  margin: 0 auto;
  background-color: #ffffff;
  border: 1px solid #eaeaea;
  border-radius: 8px;
  overflow: hidden;
`

const headerStyles = `
  background-color: #111;
  color: #fff;
  padding: 24px;
  text-align: center;
`

const contentStyles = `
  padding: 24px;
`

const footerStyles = `
  background-color: #fafafa;
  border-top: 1px solid #eaeaea;
  padding: 16px 24px;
  font-size: 12px;
  color: #666;
  text-align: center;
`

const buttonStyles = `
  display: inline-block;
  background-color: #111;
  color: #fff;
  padding: 12px 24px;
  border-radius: 6px;
  text-decoration: none;
  font-weight: bold;
  font-size: 14px;
  margin: 16px 0;
`

// Buyer email templates
export const welcomeEmailTemplate = (user) => {
  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">Welcome to ZRIVE!</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hi <strong>${user.username}</strong>,</p>
          <p>Welcome aboard! We're thrilled to have you as part of the ZRIVE community.</p>
          <p>With ZRIVE, you can:</p>
          <ul style="color: #333;">
            <li>Discover thousands of products from trusted sellers</li>
            <li>Enjoy secure payments and hassle-free returns</li>
            <li>Track your orders in real-time</li>
            <li>Leave reviews and help other shoppers</li>
          </ul>
          <p>Ready to start shopping? Visit our marketplace now!</p>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}" style="${buttonStyles}">Start Shopping</a>
          </p>
          <p>If you have any questions, feel free to reach out to our support team.</p>
          <p>Happy shopping!<br><strong>Team ZRIVE</strong></p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE. All rights reserved.
        </div>
      </body>
    </html>
  `
}

export const orderConfirmationTemplate = (order) => {
  const items = (order.orderItems || [])
    .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eaeaea; text-align: center;">x${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eaeaea; text-align: right;">₹${item.price.amount.toLocaleString('en-IN')}</td>
      </tr>
    `)
    .join('')

  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">Order Confirmed ✓</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hi,</p>
          <p>Great news! Your order has been confirmed and will be prepared shortly.</p>
          
          <div style="background-color: #fafafa; padding: 16px; border-radius: 6px; margin: 16px 0;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Order Details</p>
            <p style="margin: 4px 0;">Order ID: <strong>#${order._id}</strong></p>
            <p style="margin: 4px 0;">Placed on: <strong>${new Date(order.createdAt).toLocaleDateString('en-IN')}</strong></p>
          </div>

          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; text-align: left; font-weight: bold;">Product</th>
                <th style="padding: 8px; text-align: center; font-weight: bold;">Qty</th>
                <th style="padding: 8px; text-align: right; font-weight: bold;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items}
              <tr style="background-color: #f9f9f9; font-weight: bold;">
                <td colspan="2" style="padding: 8px; text-align: right;">Total:</td>
                <td style="padding: 8px; text-align: right;">₹${order.sellerAmount.amount.toLocaleString('en-IN')}</td>
              </tr>
            </tbody>
          </table>

          <div style="background-color: #eaf5ee; padding: 12px; border-radius: 6px; border-left: 4px solid #287a4b; margin: 16px 0;">
            <p style="margin: 0; color: #287a4b; font-weight: bold;">✓ Delivery within 3-5 business days</p>
          </div>

          <p>You'll receive updates as your order progresses. You can track your order anytime in your account.</p>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="${buttonStyles}">Track Order</a>
          </p>
          <p>Thank you for shopping with ZRIVE!</p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE. All rights reserved.
        </div>
      </body>
    </html>
  `
}

export const orderShippedTemplate = (order) => {
  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">Your Order is on the Way! 📦</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hi,</p>
          <p>Excellent news! Your order <strong>#${order._id}</strong> has been shipped and is on its way to you.</p>
          
          <div style="background-color: #edf3f6; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #536b7a;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #536b7a;">Shipment Details</p>
            <p style="margin: 4px 0; color: #536b7a;">Expected Delivery: 2-4 business days</p>
          </div>

          <p><strong>Items Shipped:</strong></p>
          <ul style="color: #333;">
            ${order.orderItems.map(item => `<li>${item.title} (Qty: ${item.quantity})</li>`).join('')}
          </ul>

          <p>You can track your shipment in real-time from your account dashboard.</p>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="${buttonStyles}">Track Shipment</a>
          </p>
          <p>Thank you for your patience!</p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE. All rights reserved.
        </div>
      </body>
    </html>
  `
}

export const orderDeliveredTemplate = (order) => {
  const reviewLink = `${process.env.CLIENT_URL}/orders/${order._id}`
  
  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">Your Order Delivered! 🎉</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hi,</p>
          <p>Your order <strong>#${order._id}</strong> has been delivered successfully.</p>
          
          <div style="background-color: #eaf5ee; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #287a4b;">
            <p style="margin: 0; color: #287a4b; font-weight: bold;">✓ Delivery Confirmed</p>
          </div>

          <p><strong>Items Delivered:</strong></p>
          <ul style="color: #333;">
            ${order.orderItems.map(item => `<li>${item.title} (Qty: ${item.quantity})</li>`).join('')}
          </ul>

          <div style="background-color: #fff9e6; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #b08d57;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #b08d57;">Help Others Find the Best Products</p>
            <p style="margin: 0; color: #666; font-size: 14px;">Share your experience by leaving a review. Your feedback helps other shoppers make informed decisions.</p>
          </div>

          <p style="text-align: center;">
            <a href="${reviewLink}" style="${buttonStyles}">Leave a Review</a>
          </p>

          <p>If you have any issues with your delivery, please don't hesitate to contact our support team.</p>
          <p>Thank you for shopping with ZRIVE!</p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE. All rights reserved.
        </div>
      </body>
    </html>
  `
}

export const orderIssueRefundTemplate = (order) => {
  const refundAmount = order.refund?.amount || order.sellerAmount.amount
  
  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">Order Update</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hi,</p>
          <p>We regret to inform you that something went wrong while processing your order <strong>#${order._id}</strong>.</p>
          
          <div style="background-color: #fcecec; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #c43d3d;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #c43d3d;">Refund Initiated</p>
            <p style="margin: 4px 0; color: #666; font-weight: bold;">Amount: ₹${refundAmount.toLocaleString('en-IN')}</p>
            <p style="margin: 4px 0; color: #666; font-size: 14px;">The refund will reflect in your original payment method within 5-7 business days.</p>
          </div>

          <p><strong>Order Details:</strong></p>
          <ul style="color: #333;">
            ${order.orderItems.map(item => `<li>${item.title}</li>`).join('')}
          </ul>

          <p>We sincerely apologize for the inconvenience caused. We're committed to making things right and would appreciate your feedback on this experience.</p>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/orders/${order._id}" style="${buttonStyles}">View Order</a>
          </p>
          <p>If you have any questions or concerns, please contact our support team immediately.</p>
          <p>We value your business and hope to serve you better next time!</p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE. All rights reserved.
        </div>
      </body>
    </html>
  `
}

export const orderCancelledTemplate = (order) => {
  const refundAmount = order.refund?.amount || order.sellerAmount.amount
  
  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">Order Cancellation Confirmed</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hi,</p>
          <p>Your order <strong>#${order._id}</strong> has been successfully cancelled as requested.</p>
          
          <div style="background-color: #edf3f6; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #536b7a;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Refund Details</p>
            <p style="margin: 4px 0;">Refund Amount: <strong>₹${refundAmount.toLocaleString('en-IN')}</strong></p>
            <p style="margin: 4px 0; font-size: 14px;">Expected in 5-7 business days</p>
          </div>

          <p><strong>Cancelled Items:</strong></p>
          <ul style="color: #333;">
            ${order.orderItems.map(item => `<li>${item.title} (Qty: ${item.quantity})</li>`).join('')}
          </ul>

          <p>You can place a new order anytime. We're here to help if you need anything else!</p>
          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}" style="${buttonStyles}">Continue Shopping</a>
          </p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE. All rights reserved.
        </div>
      </body>
    </html>
  `
}

// Seller email templates
export const sellerNewOrderTemplate = (order) => {
  const items = (order.orderItems || [])
    .map(item => `
      <tr>
        <td style="padding: 8px; border-bottom: 1px solid #eaeaea;">${item.title}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eaeaea; text-align: center;">x${item.quantity}</td>
        <td style="padding: 8px; border-bottom: 1px solid #eaeaea; text-align: right;">₹${item.price.amount.toLocaleString('en-IN')}</td>
      </tr>
    `)
    .join('')

  const buyerName = order.shippingAddress?.name || 'Customer'
  const buyerCity = order.shippingAddress?.city || ''

  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">🎯 New Order Received!</h1>
        </div>
        <div style="${contentStyles}">
          <p>Great news!</p>
          <p>You have received a new order <strong>#${order._id}</strong>. Please review and accept it to confirm stock availability.</p>
          
          <div style="background-color: #edf3f6; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #536b7a;">
            <p style="margin: 0 0 8px 0; font-weight: bold; color: #536b7a;">Order Summary</p>
            <p style="margin: 4px 0;">Order Value: <strong>₹${order.sellerAmount.amount.toLocaleString('en-IN')}</strong></p>
            <p style="margin: 4px 0;">Delivery to: <strong>${buyerCity ? `${buyerName}, ${buyerCity}` : buyerName}</strong></p>
            <p style="margin: 4px 0; color: #c43d3d; font-weight: bold;">Action Deadline: 24 hours from order placement</p>
          </div>

          <p style="font-weight: bold; margin-bottom: 8px;">Order Items:</p>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <thead>
              <tr style="background-color: #f5f5f5;">
                <th style="padding: 8px; text-align: left; font-weight: bold;">Product</th>
                <th style="padding: 8px; text-align: center; font-weight: bold;">Qty</th>
                <th style="padding: 8px; text-align: right; font-weight: bold;">Price</th>
              </tr>
            </thead>
            <tbody>
              ${items}
            </tbody>
          </table>

          <div style="background-color: #fff9e6; padding: 12px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #b08d57;">
            <p style="margin: 0; color: #b08d57; font-size: 14px;"><strong>⏰ Action Required:</strong> Accept or reject this order within 24 hours from your seller dashboard.</p>
          </div>

          <p style="text-align: center;">
            <a href="${process.env.CLIENT_URL}/seller/orders/${order._id}" style="${buttonStyles}">Review Order</a>
          </p>

          <p><strong>Next Steps:</strong></p>
          <ol style="color: #333;">
            <li>Verify stock availability for all items</li>
            <li>Accept the order to confirm</li>
            <li>Pack and ship within 24 hours</li>
          </ol>

          <p>Questions? Contact our seller support team.</p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE Merchant Console. All rights reserved.
        </div>
      </body>
    </html>
  `
}

export const sellerOrderCancelledTemplate = (order) => {
  const refundAmount = order.refund?.amount || order.sellerAmount.amount
  
  return `
    <html>
      <body style="${containerStyles}">
        <div style="${headerStyles}">
          <h1 style="margin: 0; font-size: 24px;">Order Cancelled</h1>
        </div>
        <div style="${contentStyles}">
          <p>Hi,</p>
          <p>The order <strong>#${order._id}</strong> has been cancelled by the customer.</p>
          
          <div style="background-color: #edf3f6; padding: 16px; border-radius: 6px; margin: 16px 0; border-left: 4px solid #536b7a;">
            <p style="margin: 0 0 8px 0; font-weight: bold;">Cancellation Details</p>
            <p style="margin: 4px 0;">Order Value: <strong>₹${order.sellerAmount.amount.toLocaleString('en-IN')}</strong></p>
            <p style="margin: 4px 0;">Cancelled At: <strong>${new Date(order.cancelledAt).toLocaleDateString('en-IN')}</strong></p>
          </div>

          <p><strong>Items Cancelled:</strong></p>
          <ul style="color: #333;">
            ${order.orderItems.map(item => `<li>${item.title} (Qty: ${item.quantity})</li>`).join('')}
          </ul>

          <p>No action is required on your part. The customer will receive their refund within 5-7 business days.</p>
          <p>If you have any questions, please reach out to our seller support team.</p>
        </div>
        <div style="${footerStyles}">
          © ${new Date().getFullYear()} ZRIVE Merchant Console. All rights reserved.
        </div>
      </body>
    </html>
  `
}
