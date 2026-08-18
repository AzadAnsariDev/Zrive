import nodemailer from 'nodemailer'
import config from '../config/config.js'

// Initialize transporter with Gmail config
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: config.EMAIL_USER,
        pass: config.EMAIL_PASS
    }
})

// Verify transporter at startup (non-blocking)
transporter.verify((err, success) => {
    if (err) {
        console.error('[Email Service] Verification failed:', err.message)
    } else {
        console.log('[Email Service] Ready to send emails')
    }
})

/**
 * Send email - non-blocking, never throws
 * @param {Object} options - { to, subject, html }
 * @returns {Promise<boolean>} - true if sent, false if failed
 */
export const sendEmail = async ({ to, subject, html }) => {
    try {
        if (!to || !subject || !html) {
            console.error('[Email Service] Missing required fields:', { to, subject, html: html ? 'provided' : 'missing' })
            return false
        }

        const mailOptions = {
            from: config.EMAIL_FROM,
            to,
            subject,
            html
        }

        const info = await transporter.sendMail(mailOptions)
        console.log('[Email Service] Sent:', { to, subject, messageId: info.messageId })
        return true
    } catch (err) {
        // Always fail silently - never block business logic
        console.error('[Email Service] Failed to send email:', {
            to,
            subject,
            error: err.message
        })
        return false
    }
}
