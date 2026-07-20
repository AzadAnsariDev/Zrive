import { setError, setLoading } from "../../auth/state/authSlice"
import { createProduct, getProductList } from "../services/product.api"
import {useDispatch} from 'react-redux'
import { setSellerProduct } from "../state/productSlice"

export const useProduct = ()=>{

    const dispacth = useDispatch()

    const handleCreateProduct = async (formData)=>{
        dispacth(setLoading(true))
        try{
            const result = await createProduct(formData)
            return result
        }catch(err){
            console.log(err)
            dispacth(setError(err.message))
        }finally{
            dispacth(setLoading(false))
        }
    }

    const handleGetProductList = async ()=>{
        dispacth(setLoading(true))
        try{
            const result = await getProductList()
            console.log(result.products)
            dispacth(setSellerProduct(result.products))
            return result.products
        }catch(err){
            console.log(err)
            dispacth(setError(err.message))
        }finally{
            dispacth(setLoading(false))
        }
    }

    return{
        handleCreateProduct,
        handleGetProductList
    }
}
