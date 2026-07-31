import mongoose from "mongoose"
import { stockOfVariant } from "../dao/product.dao.js"
import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"

export const addToCart = async (req, res) => {
    const { productId, variantId } = req.params

    const { quantity = 1 } = req.body

    const filter = req.user ? { user: req.user.id } : { guestId: req.guestId }

    const product = await productModel.findOne({
        _id: productId,
        "variants._id": variantId
    })

    const stock = await stockOfVariant(productId, variantId)

    if (!product) {
        return res.status(404).json({
            message: "Product or variant not found",
            success: false
        })
    }

    let cart = await cartModel.findOne(filter) || await cartModel.create({ ...filter, items: [] })

    const isItemAlreadyInCart = cart.items.some(item => item.product.toString() === productId.toString() && item.variant?.toString() === variantId.toString())

    if (isItemAlreadyInCart) {
        const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId.toString()).quantity

        if (quantityInCart + quantity > stock) {
            return res.status(400).json({
                message: "You can only add ${stock - quantityInCart} more items",
                success: false
            })
        }

        await cartModel.findOneAndUpdate(
            { ...filter, "items.product": productId, "items.variant": variantId },
            { $inc: { "items.$.quantity": quantity } },
            { new: true }
        )

        return res.status(200).json({
            message: "Cart updated successfully",
            success: true
        })
    }

    if (quantity > stock) {
        return res.status(400).json({
            message: `You can only add ${stock} more items in cart`,
            success: false
        })
    }

    const variantObj = product.variants.id?.(variantId) || product.variants.find(v => v._id.toString() === variantId.toString())

    cart.items.push({
        product: productId,
        variant: variantId,
        quantity: quantity,
        price: variantObj?.price || product.price
    })

    await cart.save()

    res.status(201).json({
        message: "Items added in cart successfully",
        success: true
    })
}

export const getCartDetails = async (filter) => {
    const aggregatedCart = await cartModel.aggregate(
        [
            {
                $match: filter
            },
            { $unwind: { path: '$items' } },
            {
                $lookup: {
                    from: 'products',
                    localField: 'items.product',
                    foreignField: '_id',
                    as: 'items.product'
                }
            },
            { $unwind: { path: '$items.product' } },
            {
                $unwind: { path: '$items.product.variants' }
            },
            {
                $match: {
                    $expr: {
                        $eq: [
                            '$items.product.variants._id',
                            '$items.variant'
                        ]
                    }
                }
            },
            {
                $addFields: {
                    itemUnitPrice: {
                        $ifNull: [
                            '$items.product.variants.price.amount',
                            '$items.product.variants.priceOverride',
                            '$items.product.price.amount',
                            '$items.price.amount',
                            0
                        ]
                    },
                    itemCurrency: {
                        $ifNull: [
                            '$items.product.variants.price.currency',
                            '$items.product.price.currency',
                            '$items.price.currency',
                            'INR'
                        ]
                    }
                }
            },
            {
                $addFields: {
                    itemPrice: {
                        price: {
                            $multiply: [
                                '$itemUnitPrice',
                                '$items.quantity'
                            ]
                        },
                        currency: '$itemCurrency'
                    }
                }
            },
            {
                $addFields: {
                    'items.unitPrice': '$itemUnitPrice',
                    'items.currency': '$itemCurrency'
                }
            },
            {
                $group: {
                    _id: '$_id',
                    totalPrice: { $sum: '$itemPrice.price' },
                    currency: {
                        $first: '$itemPrice.currency'
                    },
                    items: { $push: '$items' }
                }
            }
        ],
        { maxTimeMS: 60000, allowDiskUse: true }
    )

    return aggregatedCart[0] || null
}


export const getCart = async (req, res) => {
    const filter = req.user ? { user: new mongoose.Types.ObjectId(req.user.id) } : { guestId: req.guestId }

    let existingCart = await cartModel.findOne(filter);

    if (!existingCart) {
        existingCart = await cartModel.create({
            ...filter,
            items: []
        });
    }

    if (!existingCart.items || existingCart.items.length === 0) {
        return res.status(200).json({
            message: "Cart fetched successfully",
            success: true,
            cart: {
                _id: existingCart._id,
                user: existingCart.user,
                guestId: existingCart.guestId,
                items: [],
                totalPrice: 0,
                currency: "INR"
            }
        })
    }

    const aggregatedCart = await getCartDetails(filter)

    if (!aggregatedCart || aggregatedCart.length === 0) {
        return res.status(200).json({
            message: "Cart fetched successfully",
            success: true,
            cart: {
                _id: existingCart._id,
                user: existingCart.user,
                guestId: existingCart.guestId,
                items: [],
                totalPrice: 0,
                currency: "INR"
            }
        })
    }

    return res.status(200).json({
        message: "Cart fetched successfully",
        success: true,
        cart: aggregatedCart
    })
}

export const removeCartItem = async (req, res) => {
    const { productId, variantId } = req.params;

    const { action } = req.body
    const filter = req.user
        ? { user: req.user.id }
        : { guestId: req.guestId };

    const cart = await cartModel.findOne(filter);

    if (!cart) {
        return res.status(404).json({
            message: "Cart not found",
            success: false
        });
    }

    const itemIndex = cart.items.findIndex(
        i =>
            i.product.toString() === productId &&
            i.variant.toString() === variantId
    );

    if (itemIndex === -1) {
        return res.status(404).json({
            message: "No such item found in cart",
            success: false
        });
    }

    if (cart.items[itemIndex].quantity > 1 && action === "decrement") {
        cart.items[itemIndex].quantity--
        await cart.save()
        return res.status(200).json({
            message: "Item quantity decremented successfully",
            action,
            itemIndex
        })
    }


    if (action === "remove") {
        cart.items.splice(itemIndex, 1);
        await cart.save();

        res.status(200).json({
            message: "Item removed from cart successfully",
            success: true,
            action,
            itemIndex
        });
    }
};