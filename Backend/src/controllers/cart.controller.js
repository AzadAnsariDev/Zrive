import { stockOfVariant } from "../dao/product.dao.js"
import cartModel from "../models/cart.model.js"
import productModel from "../models/product.model.js"

export const addToCart = async (req, res)=>{
    const userId = req.user.id

    const {productId, variantId}  = req.params

    const { quantity = 1 } = req.body

    const product = await productModel.findOne({
        _id: productId,
        "variants._id" : variantId
    })

    const stock = await stockOfVariant(productId, variantId)

    if(!product){
        return res.status(404).json({
            message: "Product or variant not found",
            success : false
        })
    }

    let cart = await cartModel.findOne({user : userId}) || await cartModel.create({user : userId})

    const isItemAlreadyInCart = cart.items.some(item => item.product.toString() === productId.toString() && item.variant?.toString() === variantId.toString() )

    if(isItemAlreadyInCart){
        const quantityInCart = cart.items.find(item => item.product.toString() === productId && item.variant?.toString() === variantId.toString()).quantity

        if(quantityInCart + quantity > stock){
            return res.status(400).json({
                message: "You can only add ${stock - quantityInCart} more items",
                success: false
            })
        }

        await cartModel.findOneAndUpdate(
            {user: userId, "items.product" : productId, "items.variant": variantId},
            {$inc : { "items.$.quantity" : quantity }  },
            {new : true}
        )

        return res.status(200).json({
            message : "Cart updated successfully",
            success: true
        })
    }

    if(quantity > stock){
        return res.status(400).json({
            message: `You can only add ${stock} more items in cart`,
            success: false
        })
    }

    cart.items.push({
        product : productId,
        variant: variantId,
        quantity: quantity,
        price: product.price
    })

    await cart.save()

    res.status(201).json({
        message : "Items added in cart successfully",
        success: true
    })
} 


export const getCart = async (req, res)=>{
    const userId = req.user.id
    let cart = await cartModel.findOne({user: userId}).populate("items.product") 

    if(!cart){
        await cartModel.create({user: userId})
    }

    return res.status(200).json({
        message : "Cart fetched successfully",
        success: true,
        cart
    })
}
