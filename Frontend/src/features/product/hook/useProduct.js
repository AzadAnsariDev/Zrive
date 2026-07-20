import { setError, setLoading } from "../../auth/state/authSlice"
import { createProduct } from "../services/product.api"
import {useDispatch} from 'react-redux'

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

    return{
        handleCreateProduct
    }
}