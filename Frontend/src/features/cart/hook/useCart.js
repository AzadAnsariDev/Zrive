import { useDispatch } from "react-redux"
import { setFetchLoading, setItems } from "../../cart/state/cartSlice"
import { addToCart, getCart } from "../services/cart.api"

const useCart = ()=>{
    const dispatch = useDispatch()


    const handleAddToCart = async(productId, variantId)=>{
        const result = await addToCart(productId, variantId)
        return result
    }

    const handleGetCart = async ()=>{
        dispatch(setFetchLoading(true))
        try{
            const result = await getCart()
            dispatch(setItems(result.cart.items))
            console.log(result.cart.items)
            return result
        }catch(err){
           console.log(err)
        }finally{
          dispatch(setFetchLoading(false))
        }
    }

    return{
        handleAddToCart,
        handleGetCart
    }
}

export default useCart