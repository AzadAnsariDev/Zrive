import { setError, setLoading } from "../../auth/state/authSlice"
import { createProduct, getProductDetail, getProducts, getSellerProducts } from "../services/product.api"
import {useDispatch} from 'react-redux'
import { setCreateLoading, setFetchLoading, setProducts, setSellerProduct } from "../state/productSlice"
import { Trophy } from "lucide-react"

export const useProduct = ()=>{

    const dispacth = useDispatch()
    const handleCreateProduct = async (formData)=>{
        dispacth(setCreateLoading(true))
        try{
            const result = await createProduct(formData)
            return result
        }catch(err){
            console.log(err)
            dispacth(setError(err.message))
        }finally{
            dispacth(setCreateLoading(false))
        }
    }

    const handleGetSellerProducts = async ()=>{
        dispacth(setFetchLoading(true))
        try{
            const result = await getSellerProducts()
            dispacth(setSellerProducts(result.products))
            return result.products
        }catch(err){
            console.log(err)
            dispacth(setError(err.message))
        }finally{
            dispacth(setFetchLoading(false))
        }
    }
    const handleGetProducts = async ()=>{
        dispacth(setFetchLoading(true))
        try{
            const result = await getProducts()
            dispacth(setProducts(result.products))
            return result.products
        }catch(err){
            console.log(err)
            dispacth(setError(err.message))
        }finally{
            dispacth(setFetchLoading(false))
        }
    }

    const handleGetProductDetail = async (productId)=>{
        dispacth(setFetchLoading(true))
        try{
            const result = await getProductDetail(productId)
            return result.product
        }catch(err){
            console.log(err)
            dispacth(setError(err.message))
        }finally{
            dispacth(setFetchLoading(false))
        }
    }

    return{
        handleCreateProduct,
        handleGetSellerProducts,
        handleGetProducts,
        handleGetProductDetail
    }
}
