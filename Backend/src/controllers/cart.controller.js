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

    cart.items.push({
        product: productId,
        variant: variantId,
        quantity: quantity,
        price: product.price
    })

    await cart.save()

    res.status(201).json({
        message: "Items added in cart successfully",
        success: true
    })
}


export const getCart = async (req, res) => {
    const filter = req.user ? { user: req.user.id } : { guestId: req.guestId }
    let cart = await cartModel.findOne(filter).populate("items.product")

    if (!cart) {
        cart = await cartModel.create({ ...filter, items: [] })
    }

    return res.status(200).json({
        message: "Cart fetched successfully",
        success: true,
        cart
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

    if(cart.items[itemIndex].quantity > 1 && action === "decrement"){
        cart.items[itemIndex].quantity--
        await cart.save()
        return res.status(200).json({
            message : "Item quantity decremented successfully",
            action,
            itemIndex
        })
    }


    if(action === "remove"){
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