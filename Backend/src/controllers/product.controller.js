import productModel from "../models/product.model.js"
import userModel from "../models/user.model.js"
import sellerModel from "../models/seller.model.js"
import { uploadFiles } from "../services/storage.service.js"

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency, status, category, variants } = req.body
        const shippingDefaults = req.parsedShippingDefaults

        const sellerProfile = await sellerModel.findOne({ userId: req.user.id })
        if (!sellerProfile) {
            return res.status(403).json({
                message: "Seller profile not found. Please complete seller registration.",
                success: false
            })
        }

        let parsedVariants
        try {
            parsedVariants = JSON.parse(variants)
        } catch {
            return res.status(400).json({
                message: "Invalid variants data",
                success: false
            })
        }

        if (!Array.isArray(parsedVariants) || parsedVariants.length === 0) {
            return res.status(400).json({
                message: "At least one variant is required",
                success: false
            })
        }

        const generalFiles = req.files.filter(f => f.fieldname === "images")
        const images = await Promise.all(generalFiles.map(async (file) => {
            return await uploadFiles({
                buffer: file.buffer,
                fileName: file.originalname,
            })
        }))

        const variantsWithImages = await Promise.all(parsedVariants.map(async (variant, index) => {
            const variantFiles = req.files.filter(f => f.fieldname === `variantImages_${index}`)

            if (variantFiles.length === 0) {
                throw new Error(`Images are required for variant ${index + 1}`)
            }

            const variantImages = await Promise.all(variantFiles.map(async (file) => {
                return await uploadFiles({
                    buffer: file.buffer,
                    fileName: file.originalname,
                })
            }))

            const variantAmount = variant.price?.amount ?? variant.priceAmount ?? priceAmount;
            const variantCurrency = variant.price?.currency || priceCurrency || "INR";

            const isFilled = (v) => v !== undefined && v !== null && v !== ''

            const variantWeight = isFilled(variant.weight)
                ? Number(variant.weight)
                : shippingDefaults.weight

            const variantDimensions = {
                length: isFilled(variant.dimensions?.length)
                    ? Number(variant.dimensions.length)
                    : shippingDefaults.dimensions.length,
                width: isFilled(variant.dimensions?.width)
                    ? Number(variant.dimensions.width)
                    : shippingDefaults.dimensions.width,
                height: isFilled(variant.dimensions?.height)
                    ? Number(variant.dimensions.height)
                    : shippingDefaults.dimensions.height,
            }

            const built = {
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                stock: variant.stock,
                price: {
                    amount: Number(variantAmount),
                    currency: variantCurrency
                },
                images: variantImages,
                weight: variantWeight,
                dimensions: variantDimensions,
            }

            return built
        }))

        const product = await productModel.create({
            title,
            description,
            seller: sellerProfile._id,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            },
            status,
            category,
            images,
            shippingDefaults,
            variants: variantsWithImages
        })

        res.status(201).json({
            message: "Product created successfully",
            success: true,
            product
        })

    } catch (err) {
        res.status(400).json({
            message: err.message,
            success: false
        })
    }
}

export const getSellerProduct = async (req, res) => {
    const sellerProfile = await sellerModel.findOne({ userId: req.user.id })
    if (!sellerProfile) {
        return res.status(200).json({
            message: "All products fetched successfully",
            products: []
        })
    }

    const products = await productModel.find({ seller: sellerProfile._id })

    res.status(200).json({
        message: "All products fetched successfully",
        products
    })
}

export const getProducts = async (req, res) => {
    const { search } = req.query

    const bannedUsers = await userModel.find({ isBanned: true }).select("_id")
    const bannedUserIds = bannedUsers.map(s => s._id)
    const bannedSellerProfiles = await sellerModel.find({ userId: { $in: bannedUserIds } }).select("_id")
    const bannedSellerIds = bannedSellerProfiles.map(s => s._id)

    const filter = { seller: { $nin: bannedSellerIds } }

    // search optional hai — agar nahi diya to bilkul pehle jaisa behavior
    if (search && search.trim()) {
        const regex = new RegExp(search.trim(), "i")
        filter.$or = [
            { title: regex },
            { description: regex },
            { category: regex }
        ]
    }

    const products = await productModel.find(filter)

    res.status(200).json({
        message: "All products fetched succesfully",
        products
    })
}

// Lightweight, fast endpoint — sirf navbar ke live-search dropdown ke liye.
// getProducts se alag isliye kyunki ye kam fields select karta hai aur
// result count limit karta hai (dropdown me 8 se zyada dikhana bhi nahi chahiye).
export const searchProducts = async (req, res) => {
    try {
        const { q } = req.query

        if (!q || !q.trim()) {
            return res.status(200).json({
                message: "No search query provided",
                success: true,
                products: []
            })
        }

        const bannedUsers = await userModel.find({ isBanned: true }).select("_id")
        const bannedUserIds = bannedUsers.map(s => s._id)
        const bannedSellerProfiles = await sellerModel.find({ userId: { $in: bannedUserIds } }).select("_id")
        const bannedSellerIds = bannedSellerProfiles.map(s => s._id)

        const regex = new RegExp(q.trim(), "i")

        const products = await productModel.find({
            seller: { $nin: bannedSellerIds },
            $or: [
                { title: regex },
                { description: regex },
                { category: regex }
            ]
        })
            .select("title price images category variants")
            .limit(8)

        res.status(200).json({
            message: "Search results fetched successfully",
            success: true,
            products
        })
    } catch (err) {
        res.status(500).json({
            message: err.message,
            success: false
        })
    }
}

export const getProductDetail = async (req, res) => {
    const { productId } = req.params
    const product = await productModel.findById(productId).populate({
        path: "seller",
        populate: { path: "userId", select: "isBanned" }
    })

    if (!product) {
        return res.status(404).json({
            message: "Product Not Found",
            success: false
        })
    }

    if (product.seller?.userId?.isBanned) {
        return res.status(404).json({
            message: "Product Not Found",
            success: false
        })
    }

    res.status(200).json({
        message: "Product fetched succesfully",
        product
    })
}

export const addNewVariant = async (req, res) => {
    try {
        const { productId } = req.params
        const sellerProfile = await sellerModel.findOne({ userId: req.user.id })

        if (!sellerProfile) {
            return res.status(403).json({
                message: "Seller profile not found",
                success: false
            })
        }

        const product = await productModel.findOne({
            _id: productId,
            seller: sellerProfile._id
        })

        if (!product) {
            return res.status(404).json({
                message: "No product found",
                success: false
            })
        }

        const { size, stock, color, priceAmount, priceCurrency, price, sku } = req.body
        const files = req.files

        let images = []

        if (!files || files.length === 0) {
            return res.status(400).json({
                message: "At least one image is required to add a variant",
                success: false
            })
        }

        images = await Promise.all(
            files.map(async (file) => {
                return await uploadFiles({
                    buffer: file.buffer,
                    fileName: file.originalname
                })
            })
        )

        const variantAmount = price?.amount ?? priceAmount ?? product.price.amount;
        const variantCurrency = price?.currency || priceCurrency || product.price.currency || "INR";

        const variant = {
            size,
            stock,
            color,
            price: {
                amount: Number(variantAmount),
                currency: variantCurrency
            },
            sku,
            images
        }

        product.variants.push(variant)

        await product.save()

        res.status(201).json({
            message: "New variant added successfully",
            success: true,
            product
        })

    } catch (err) {
        res.status(400).json({
            message: err.message,
            success: false
        })
    }
}