import { useDispatch } from 'react-redux'
import { setAllOrders, setCurrentOrder, setApplication, setLoading, setError } from '../state/sellerSlice'
import {
    getSellerOrders, getSellerOrderById, acceptOrder, rejectOrder,
    createBasicSellerApplication, submitVerificationDetails, getMySellerApplication,
    updateSellerProfile, subscribeSellerPlan, getSellerPayoutSummary
} from '../services/seller.api'
import { getMe } from '../../auth/services/auth.api'      
import { setUser } from '../../auth/state/authSlice'     

const useSeller = () => {
    const dispatch = useDispatch()

    const handleGetSellerOrders = async () => {
        dispatch(setLoading(true))
        try {
            const data = await getSellerOrders()
            dispatch(setAllOrders(data.orders))
            return data.orders
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleGetOrderById = async (orderId) => {
        dispatch(setLoading(true))
        try {
            const data = await getSellerOrderById(orderId)
            dispatch(setCurrentOrder(data.order))
            return data.order
        } catch (err) {
            dispatch(setError(err.message))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleAcceptOrder = async (orderId) => {
        dispatch(setLoading(true))
        try {
            await acceptOrder(orderId)
            await handleGetSellerOrders()
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleRejectOrder = async (orderId, reason, note) => {
        dispatch(setLoading(true))
        try {
            await rejectOrder(orderId, reason, note)
            await handleGetSellerOrders()
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleGetMyApplication = async () => {
        dispatch(setLoading(true))
        try {
            const data = await getMySellerApplication()
            dispatch(setApplication(data.seller))
            return data.seller
        } catch (err) {
            dispatch(setError(err.message))
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleCreateBasicApplication = async ({ brandName, businessEmail, businessPhone }) => {
        dispatch(setLoading(true))
        try {
            const data = await createBasicSellerApplication({ brandName, businessEmail, businessPhone })
            dispatch(setApplication(data.seller))

            const meData = await getMe()
            dispatch(setUser(meData.user))

            return true
        } catch (err) {
            dispatch(setError(err.message))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleSubmitVerification = async ({ panNumber, panPhoto, pickupAddress, payout }) => {
        dispatch(setLoading(true))
        try {
            const data = await submitVerificationDetails({ panNumber, panPhoto, pickupAddress, payout })
            dispatch(setApplication(data.seller))
            return true
        } catch (err) {
            dispatch(setError(err.message))
            return false
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleUpdateProfile = async (profileData) => {
        dispatch(setLoading(true))
        try {
            const data = await updateSellerProfile(profileData)
            dispatch(setApplication(data.seller))
            return data.seller
        } catch (err) {
            dispatch(setError(err.message))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleSubscribePlan = async (planKey) => {
        dispatch(setLoading(true))
        try {
            const data = await subscribeSellerPlan(planKey)
            await handleGetMyApplication()
            return data
        } catch (err) {
            dispatch(setError(err.message))
            throw err
        } finally {
            dispatch(setLoading(false))
        }
    }

    const handleGetPayoutSummary = async () => {
        try {
            const data = await getSellerPayoutSummary()
            return data.payoutInfo
        } catch (err) {
            console.error("Failed to fetch payout summary", err)
            return null
        }
    }

    return {
        handleGetSellerOrders,
        handleGetOrderById,
        handleAcceptOrder,
        handleRejectOrder,
        handleGetMyApplication,
        handleCreateBasicApplication,
        handleSubmitVerification,
        handleUpdateProfile,
        handleSubscribePlan,
        handleGetPayoutSummary,
    }
}

export default useSeller