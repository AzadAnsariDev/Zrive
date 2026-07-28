import { useDispatch } from "react-redux"
import { decrementItem, removeItem, setFetchLoading, setItems } from "../../cart/state/cartSlice"
import { addToCart, getCart, removeCartItem } from "../services/cart.api"

const useCart = ()=>{
    const dispatch = useDispatch()

    const handleAddToCart = async(productId, variantId)=>{
        const result = await addToCart(productId, variantId)
        return result
    }

    const handleRemoveCartItem = async(productId, variantId, action)=>{
        const result = await removeCartItem(productId, variantId, action)
        if(action === "decrement"){
            dispatch(decrementItem(result.itemIndex))
        }else if (action === "remove"){
            dispatch(removeItem(result.itemIndex))
        }
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
        handleGetCart,
        handleRemoveCartItem
    }
}

export default useCart