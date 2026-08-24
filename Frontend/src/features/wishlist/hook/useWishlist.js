import { useDispatch, useSelector } from "react-redux"
import {
    setWishlist,
    addVariantSku,
    removeVariantSku,
    setFetchLoading,
    setCreateLoading,
    setError
} from "../state/wishlistSlice"
import { addToWishlist, removeFromWishlist, getWishlist } from "../services/wishlist.service"

const useWishlist = () => {
    const dispatch = useDispatch()
    const user = useSelector((state) => state.auth?.user)
    const variantSkus = useSelector((state) => state.wishlist.variantSkus)

    const handleGetWishlist = async () => {
        if (!user) return
        dispatch(setFetchLoading(true))
        try {
            const result = await getWishlist()
            dispatch(setWishlist({
                items: result.items || [],
                variantSkus: result.variantSkus || []
            }))
            return result
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message))
        } finally {
            dispatch(setFetchLoading(false))
        }
    }

    const handleAddToWishlist = async (productId, variantSku) => {
        // optimistic — heart fills instantly
        dispatch(addVariantSku(variantSku))
        dispatch(setCreateLoading(true))
        try {
            const result = await addToWishlist(productId, variantSku)
            return result
        } catch (err) {
            // resync with server truth instead of hand-rolling a rollback
            dispatch(setError(err.response?.data?.message || err.message))
            handleGetWishlist()
        } finally {
            dispatch(setCreateLoading(false))
        }
    }

    const handleRemoveFromWishlist = async (variantSku) => {
        // optimistic — heart empties instantly
        dispatch(removeVariantSku(variantSku))
        dispatch(setCreateLoading(true))
        try {
            const result = await removeFromWishlist(variantSku)
            return result
        } catch (err) {
            dispatch(setError(err.response?.data?.message || err.message))
            handleGetWishlist()
        } finally {
            dispatch(setCreateLoading(false))
        }
    }

    // convenience wrapper — the caller (ProductCard etc.) already knows
    // whether this sku is wishlisted since it reads variantSkus to render
    // the heart, so it just tells us which way to flip
    const handleToggleWishlist = (productId, variantSku) => {
        const isWishlisted = variantSkus.includes(variantSku)
        if (isWishlisted) {
            return handleRemoveFromWishlist(variantSku)
        }
        return handleAddToWishlist(productId, variantSku)
    }

    return {
        handleGetWishlist,
        handleAddToWishlist,
        handleRemoveFromWishlist,
        handleToggleWishlist
    }
}

export default useWishlist