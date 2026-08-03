import { useDispatch } from "react-redux";
import {
  createOrder,
  getOrderById,
  getOrders,
  verifyOrder,
  cancelOrder
} from "../services/order.api";
import {
  setCurrentOrder,
  setError,
  setLoading,
  setOrders,
  updateOrder
} from "../state/orderSlice";

const useOrder = () => {
  const dispatch = useDispatch();

  const handleCreateOrder = async (addressId) => {
    const result = await createOrder(addressId);
    return result.order;
  };
  const handleVerifyOrder = async ({
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature,
  }) => {
    const result = await verifyOrder({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });
    return result.success;
  };

  const handleGetOrders = async () => {
    dispatch(setLoading(true));
    try {
      const result = await getOrders();
      dispatch(setOrders(result.orders));
    } catch (err) {
      console.log(err);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };
  const handleGetOrderById = async (orderId) => {
    dispatch(setLoading(true));
    try {
      const result = await getOrderById(orderId);
      dispatch(setCurrentOrder(result.order));
    } catch (err) {
      console.log(err);
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  const handleCancelOrder = async (orderId) => {
    dispatch(setLoading(true));
    try {
      const result = await cancelOrder(orderId);
      dispatch(updateOrder(result.order));
      return { success: true, order: result.order };
    } catch (err) {
      console.log(err);
      dispatch(setError(err.message));
      return { success: false, error: err.message };
    } finally {
      dispatch(setLoading(false));
    }
  };

  return {
    handleCreateOrder,
    handleVerifyOrder,
    handleGetOrderById,
    handleGetOrders,
    handleCancelOrder
  };
};

export default useOrder;
