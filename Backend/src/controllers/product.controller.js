import productModel from "../models/product.model.js"
import { uploadFiles } from "../services/storage.service.js"

export const createProduct = async (req, res) =>{

    const {title, description, priceAmount, priceCurrency} = req.body

    const seller = req.user

    const images = await Promise.all(req.files.map(async (file)=>{
        return await uploadFiles({
            buffer: file.buffer,
            fileName: file.originalname,
        })
    }))

    const product = await productModel.create({
        title, 
        description,
        seller,
        price:{
            amount : priceAmount,
            currency: priceCurrency || "INR"
        },
        images
    })

    res.status(201).json({
        message: "Product created successfully",
        success: true,
        product
    })
}

export const getSellerProduct = async (req, res)=>{
    const seller = req.user

    const products = await productModel.find({seller: seller._id})

    res.status(200).json({
        message: "All products fetched successfully",
        products
    })
}

