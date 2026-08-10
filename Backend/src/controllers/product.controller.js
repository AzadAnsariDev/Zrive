import productModel from "../models/product.model.js"
import userModel from "../models/user.model.js"
import { uploadFiles } from "../services/storage.service.js"

export const createProduct = async (req, res) => {
    try {
        const { title, description, priceAmount, priceCurrency, status, category, variants } = req.body
        const shippingDefaults = req.parsedShippingDefaults   // ⬅️ CHANGE 1: validator ne already parse kar diya hai

        const seller = req.user

        // variants frontend se JSON string ke form mein aayega
        // e.g. '[{"size":"M","color":"Black","sku":"...","stock":"10"}, {...}]'
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

        // general product images (fieldname = "images")
        const generalFiles = req.files.filter(f => f.fieldname === "images")
        const images = await Promise.all(generalFiles.map(async (file) => {
            return await uploadFiles({
                buffer: file.buffer,
                fileName: file.originalname,
            })
        }))

        // har variant ke liye uske index-wise images nikalo aur upload karo
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

            const built = {
                size: variant.size,
                color: variant.color,
                sku: variant.sku,
                stock: variant.stock,
                price: {
                    amount: Number(variantAmount),
                    currency: variantCurrency
                },
                images: variantImages
            }

            return built
        }))

        const product = await productModel.create({
            title,
            description,
            seller,
            price: {
                amount: priceAmount,
                currency: priceCurrency || "INR"
            },
            status,
            category,
            images,
            shippingDefaults,   // ⬅️ CHANGE 2: product level pe save
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
    const seller = req.user

    const products = await productModel.find({ seller: seller._id })

    res.status(200).json({
        message: "All products fetched successfully",
        products
    })
}

export const getProducts = async (req, res) => {
    const bannedSellers = await userModel.find({ isBanned: true }).select("_id")
    const bannedSellerIds = bannedSellers.map(s => s._id)

    const products = await productModel.find({
        seller: { $nin: bannedSellerIds }
    })

    res.status(200).json({
        message: "All products fetched succesfully",
        products
    })
}

export const getProductDetail = async (req, res) => {
    const { productId } = req.params
    const product = await productModel.findById(productId).populate("seller", "isBanned")

    if (!product) {
        return res.status(404).json({
            message: "Product Not Found",
            success: false
        })
    }

    if (product.seller?.isBanned) {
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
        console.log(productId)

        const product = await productModel.findOne({
            _id: productId,
            seller: req.user.id
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
