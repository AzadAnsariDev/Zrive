import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  ChevronRight,
  ShieldCheck,
  Package,
} from "lucide-react";
import { notify } from "../../../utils/toast";
import useOrder from "../hook/useOrder";
import CancelOrderModal from "../components/CancelOrderModal";

const STATUS_CONFIG = {
  pending_payment: { icon: Clock, label: "Awaiting payment" },
  placed: { icon: CheckCircle2, label: "Confirmed" },
  shipped: { icon: Truck, label: "Shipped" },
  delivered: { icon: CheckCircle2, label: "Delivered" },
  cancelled: { icon: XCircle, label: "Cancelled" },
  failed: { icon: XCircle, label: "Payment failed" },
};

const getPaymentId = (order) =>
  order.payment && typeof order.payment === "object"
    ? order.payment._id
    : order.payment;

const OrderGroupItems = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { handleGetOrders, handleCancelOrder } = useOrder();
  const orders = useSelector((state) => state.order.orders || []);
  const loading = useSelector((state) => state.order.loading);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    if (!orders || orders.length === 0) handleGetOrders();
  }, []);

  const groupOrders = useMemo(
    () => orders.filter((o) => getPaymentId(o) === paymentId),
    [orders, paymentId]
  );

  const total = useMemo(
    () =>
      groupOrders.reduce((sum, o) => sum + (o.sellerAmount?.amount || 0), 0),
    [groupOrders]
  );

  const onConfirmCancel = async () => {
    setCancelling(true);
    const result = await handleCancelOrder(cancelTarget);
    setCancelling(false);
    setCancelTarget(null);
    if (result.success) notify.success("Order cancelled successfully");
    else notify.error(result.error, "Could not cancel order");
  };

  if (loading && groupOrders.length === 0) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1000px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Orders
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Order Confirmation
          </span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-4 md:px-8 pt-6">
        {/* Success Banner */}
        <div className="bg-[#EAF5EE] border border-[#287A4B]/30 rounded-[10px] p-6 mb-8 text-center space-y-2">
          <div className="w-12 h-12 rounded-full bg-[#287A4B] text-white flex items-center justify-center mx-auto mb-2">
            <CheckCircle2 size={24} />
          </div>
          <h1 className="font-display text-[22px] font-bold text-[#111111]">
            Order Placed Successfully!
          </h1>
          <p className="text-[12.5px] text-[#666666]">
            Payment Group ID: <strong className="text-[#111111]">#{paymentId?.slice(-8).toUpperCase()}</strong> · Total Paid: <strong className="text-[#287A4B]">₹{total}</strong>
          </p>
        </div>

        {/* Multi-seller Shipments */}
        <div className="space-y-4">
          <h2 className="text-[12px] font-bold uppercase tracking-[0.1em] text-[#B08D57]">
            Shipment Breakdown ({groupOrders.length} Sellers)
          </h2>

          {groupOrders.map((order) => (
            <div key={order._id} className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-4">
                <div>
                  <span className="text-[10px] font-bold uppercase text-[#B08D57]">Sub-Order ID</span>
                  <h3 className="font-display text-[15px] font-bold text-[#111]">#{order._id?.slice(-8).toUpperCase()}</h3>
                </div>
                <span className="text-[11px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2.5 py-1 rounded">
                  {order.orderStatus?.toUpperCase()}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-[12.5px] font-semibold text-[#111]">Total: ₹{order.sellerAmount?.amount || 0}</p>
                  <p className="text-[11px] text-[#666]">Items: {order.orderItems?.length || 1}</p>
                </div>
                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="px-4 py-2 bg-[#111111] text-white rounded text-[11px] font-bold uppercase hover:bg-[#B08D57] transition-all cursor-pointer"
                >
                  View Details & Track
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {cancelTarget && (
        <CancelOrderModal
          open={Boolean(cancelTarget)}
          onClose={() => setCancelTarget(null)}
          onConfirm={onConfirmCancel}
          loading={cancelling}
        />
      )}
    </div>
  );
};

export default OrderGroupItems;
