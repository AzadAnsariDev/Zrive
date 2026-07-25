import { addToCart } from "../services/cart.api"

const useCart = ()=>{

    const handleAddToCart = async(productId, variantId)=>{
        const result = await addToCart(productId, variantId)
        return result
    }


    return{
        handleAddToCart
    }
}

export default useCart