import config from './src/config/config.js'
import { connectToDB } from './src/config/database.js'
import app from './src/app.js'
import { startOrderTimeoutCron } from './src/jobs/orderTimeout.job.js'
import { startSellerUnbanCron } from './src/jobs/sellerUnban.job.js'
import { startRefundRetryCron } from './src/jobs/retryRefund.job.js'
import { Server } from 'socket.io'
import { initializeSocketService } from './src/services/socket.service.js'

const PORT = config.PORT || "5000"

let io

const startServer = async () => {
    await connectToDB()

    const server = app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`)
        startOrderTimeoutCron()
        startSellerUnbanCron()
        startRefundRetryCron()
    })

    io = new Server(server, {
        cors: {
            origin: config.CLIENT_URL || "http://localhost:5173",
            credentials: true
        }
    })

    initializeSocketService(io)
    console.log('[Socket.io] Initialized and listening')

    // Handle real-time room subscriptions for buyers and sellers
    io.on('connection', (socket) => {
        console.log(`[Socket.io] User connected: ${socket.id}`)

        socket.on('join-room', (userId) => {
            if (userId) {
                const room = userId.toString()
                socket.join(room)
                console.log(`[Socket.io] User ${room} joined room via join-room`)
            }
        })

        socket.on('seller-login', (sellerId) => {
            if (sellerId) {
                const room = sellerId.toString()
                socket.join(room)
                console.log(`[Socket.io] Seller ${room} joined their room`)
            }
        })

        socket.on('user-login', (userId) => {
            if (userId) {
                const room = userId.toString()
                socket.join(room)
                console.log(`[Socket.io] Buyer ${room} joined their room`)
            }
        })

        socket.on('seller-logout', (sellerId) => {
            if (sellerId) {
                const room = sellerId.toString()
                socket.leave(room)
                console.log(`[Socket.io] Seller ${room} left their room`)
            }
        })

        socket.on('user-logout', (userId) => {
            if (userId) {
                const room = userId.toString()
                socket.leave(room)
                console.log(`[Socket.io] User ${room} left their room`)
            }
        })

        socket.on('disconnect', () => {
            console.log(`[Socket.io] User disconnected: ${socket.id}`)
        })
    })
}

startServer()

export { io }


