import jwt from 'jsonwebtoken'
import config from '../config/config.js'
import adminModel from '../models/admin.model.js'

export const authenticateAdmin = async (req, res, next) => {
    const token = req.cookies.adminToken

    if (!token) {
        return res.status(401).json({
            message: "Unauthorized Access",
            success: false
        })
    }

    try {
        const decoded = jwt.verify(token, config.ADMIN_JWT_SECRET)
        const admin = await adminModel.findById(decoded.id)

        if (!admin) {
            return res.status(401).json({
                message: "Unauthorized Access",
                success: false
            })
        }
        
        if (admin.blacklistedTokens.includes(token)) {
            return res.status(401).json({ message: "Session expired, please login again", success: false })
        }

        req.admin = { id: admin._id, email: admin.email }
        next()
    } catch (err) {
        return res.status(401).json({
            message: "Invalid or expired token",
            success: false
        })
    }
}