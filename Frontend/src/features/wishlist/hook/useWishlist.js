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
        // Optimistic UI update: mark wishlisted immediately
        dispatch(addVariantSku(variantSku))
        dispatch(setCreateLoading(true))
        try {
            const result = await addToWishlist(productId, variantSku)
            return result
        } catch (err) {
            // Resync state with backend on failure
            dispatch(setError(err.response?.data?.message || err.message))
            handleGetWishlist()
        } finally {
            dispatch(setCreateLoading(false))
        }
    }

    const handleRemoveFromWishlist = async (variantSku) => {
        // Optimistic UI update: unmark immediately
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