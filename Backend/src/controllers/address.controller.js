import addressModel from "../models/address.model.js"

export const createAddress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Please Login or register first",
                success: false
            })
        }

        const user = req.user.id

        const { fullName, addressLine1, addressLine2, city, state, pincode, phone, addressType, isDefault } = req.body

        const existingAddressCount = await addressModel.countDocuments({ user })

        const shouldBeDefault = existingAddressCount === 0 || isDefault === true

        if (shouldBeDefault && existingAddressCount > 0) {
            await addressModel.updateMany({ user }, { $set: { isDefault: false } })
        }

        const address = await addressModel.create({
            user,
            fullName,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            phone,
            addressType,
            isDefault: shouldBeDefault
        })

        res.status(201).json({
            message: "Address created successfully",
            success: true,
            address
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while creating address",
            success: false,
            error: error.message
        })
    }
}

export const updateAddress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Please Login or register first",
                success: false
            })
        }

        const user = req.user.id
        const { addressId } = req.params

        const address = await addressModel.findOne({ _id: addressId, user })

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                success: false
            })
        }

        const {
            fullName,
            addressLine1,
            addressLine2,
            city,
            state,
            pincode,
            phone,
            addressType,
            isDefault
        } = req.body

        if (fullName !== undefined) address.fullName = fullName
        if (addressLine1 !== undefined) address.addressLine1 = addressLine1
        if (addressLine2 !== undefined) address.addressLine2 = addressLine2
        if (city !== undefined) address.city = city
        if (state !== undefined) address.state = state
        if (pincode !== undefined) address.pincode = pincode
        if (phone !== undefined) address.phone = phone
        if (addressType !== undefined) address.addressType = addressType
        if (isDefault !== undefined) {
            if (isDefault === true) {
                await addressModel.updateMany(
                    { user, _id: { $ne: addressId } },
                    { $set: { isDefault: false } }
                )
            }
            address.isDefault = isDefault
        }

        await address.save()

        res.status(200).json({
            message: "Address updated successfully",
            success: true,
            address
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while updating address",
            success: false,
            error: error.message
        })
    }
}

export const getAllAddresses = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Please Login or register first",
                success: false
            })
        }

        const user = req.user.id

        // default address sabse upar, fir sabse naya pehle
        const addresses = await addressModel
            .find({ user })
            .sort({ isDefault: -1, createdAt: -1 })

        res.status(200).json({
            message: "Addresses fetched successfully",
            success: true,
            addresses
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while fetching addresses",
            success: false,
            error: error.message
        })
    }
}

export const getAddressById = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Please Login or register first",
                success: false
            })
        }

        const user = req.user.id
        const { addressId } = req.params

        const address = await addressModel.findOne({ _id: addressId, user })

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                success: false
            })
        }

        res.status(200).json({
            message: "Address fetched successfully",
            success: true,
            address
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while fetching address",
            success: false,
            error: error.message
        })
    }
}

export const deleteAddress = async (req, res) => {
    try {
        if (!req.user) {
            return res.status(401).json({
                message: "Please Login or register first",
                success: false
            })
        }

        const user = req.user.id
        const { addressId } = req.params

        const address = await addressModel.findOne({ _id: addressId, user })

        if (!address) {
            return res.status(404).json({
                message: "Address not found",
                success: false
            })
        }

        const wasDefault = address.isDefault

        await addressModel.deleteOne({ _id: addressId })

        // agar deleted address hi default tha, to koi aur address ko default banao
        if (wasDefault) {
            const nextAddress = await addressModel.findOne({ user }).sort({ createdAt: -1 })
            if (nextAddress) {
                nextAddress.isDefault = true
                await nextAddress.save()
            }
        }

        res.status(200).json({
            message: "Address deleted successfully",
            success: true
        })
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong while deleting address",
            success: false,
            error: error.message
        })
    }
}

