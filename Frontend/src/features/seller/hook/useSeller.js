import { useDispatch } from 'react-redux'
import { setAllOrders, setLoading, setError } from '../state/sellerSlice'
import { getSellerOrders, acceptOrder, rejectOrder } from '../services/seller.api'

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

    return {
        handleGetSellerOrders,
        handleAcceptOrder,
        handleRejectOrder,
    }
}

export default useSeller