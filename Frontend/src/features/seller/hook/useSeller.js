import { useDispatch } from 'react-redux'
import { setAllOrders, setCurrentOrder, setApplication, setLoading, setError } from '../state/sellerSlice'
import {
    getSellerOrders, getSellerOrderById, acceptOrder, rejectOrder,
    createBasicSellerApplication, submitVerificationDetails, getMySellerApplication
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

            // user.role just changed to "basic_seller" on the backend —
            // refresh Redux's user so Protected/dashboard checks see it now.
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

    return {
        handleGetSellerOrders,
        handleGetOrderById,
        handleAcceptOrder,
        handleRejectOrder,
        handleGetMyApplication,
        handleCreateBasicApplication,
        handleSubmitVerification,
    }
}

export default useSeller