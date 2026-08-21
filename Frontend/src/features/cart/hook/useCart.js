import { useDispatch } from "react-redux"
import { decrementItem, removeItem, setFetchLoading, setItems, setCartDetails } from "../../cart/state/cartSlice"
import { addToCart, getCart, removeCartItem } from "../services/cart.api"

const useCart = ()=>{
    const dispatch = useDispatch()

    const handleAddToCart = async(productId, variantId)=>{
        const result = await addToCart(productId, variantId)
        await handleGetCart()
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
            dispatch(setItems(result.cart?.items || []))
            dispatch(setCartDetails({
                totalPrice: result.cart?.totalPrice || 0,
                currency: result.cart?.currency || "INR"
            }))
            console.log(result.cart?.items)
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