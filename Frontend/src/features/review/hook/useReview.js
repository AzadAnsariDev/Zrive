import { useDispatch } from 'react-redux'
import { setError } from "../../auth/state/authSlice"
import {
    createReview,
    getProductReviews,
    checkEligibility,
    toggleHelpful,
    deleteReview
} from "../services/review.api"
import {
    setReviews,
    appendReviews,
    setPagination,
    setEligibility,
    updateHelpful,
    removeReview,
    setFetchLoading,
    setCreateLoading,
    setEligibilityLoading
} from "../state/reviewSlice"

export const useReview = () => {

    const dispacth = useDispatch()

    const handleCreateReview = async (productId, data) => {
        dispacth(setCreateLoading(true))
        try {
            const result = await createReview(productId, data)
            return result.review
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
            throw err
        } finally {
            dispacth(setCreateLoading(false))
        }
    }

    const handleGetProductReviews = async (productId, params = {}) => {
        dispacth(setFetchLoading(true))
        try {
            const result = await getProductReviews(productId, params)
            if (params.page && params.page > 1) {
                dispacth(appendReviews(result.reviews))
            } else {
                dispacth(setReviews(result.reviews))
            }
            dispacth(setPagination(result.pagination))
            return result
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
        } finally {
            dispacth(setFetchLoading(false))
        }
    }

    const handleCheckEligibility = async (productId) => {
        dispacth(setEligibilityLoading(true))
        try {
            const result = await checkEligibility(productId)
            dispacth(setEligibility(result))
            return result
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
        } finally {
            dispacth(setEligibilityLoading(false))
        }
    }

    const handleToggleHelpful = async (reviewId) => {
        try {
            const result = await toggleHelpful(reviewId)
            dispacth(updateHelpful({ reviewId, ...result }))
            return result
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
        }
    }

    const handleDeleteReview = async (reviewId) => {
        try {
            await deleteReview(reviewId)
            dispacth(removeReview(reviewId))
        } catch (err) {
            console.log(err)
            dispacth(setError(err.message))
        }
    }

    return {
        handleCreateReview,
        handleGetProductReviews,
        handleCheckEligibility,
        handleToggleHelpful,
        handleDeleteReview
    }
}