// ============================= OrderDetail.jsx (BUYER) =============================
import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  CheckCircle2,
  Clock,
  Truck,
  Package,
  PackageCheck,
  Navigation,
  XCircle,
  MapPin,
  ShieldAlert,
  RefreshCw,
  ShieldCheck,
  Headphones,
  ExternalLink,
  ChevronRight,
  CreditCard,
  AlertTriangle,
} from "lucide-react";
import toast from "react-hot-toast";
import useOrder from "../hook/useOrder.js";
import useDelivery from "../../delivery/hook/useDelivery.js";
import { setCurrentDelivery } from "../../delivery/state/deliverySlice.js";
import { useProduct } from "../../product/hook/useProduct";
import CancelOrderModal from "../components/CancelOrderModal";

const STATUS_CONFIG = {
  pending_payment: { label: "Awaiting payment", note: "We're waiting for your payment confirmation.", icon: Clock, tone: "pending" },
  placed: { label: "Order Placed", note: "Your order has been received and sent to the seller.", icon: Check, tone: "neutral" },
  confirmed: { label: "Confirmed", note: "The seller has accepted your order.", icon: Check, tone: "neutral" },
  packed: { label: "Packed", note: "Your parcel is packed and ready for pickup.", icon: Package, tone: "neutral" },
  shipped: { label: "In Transit", note: "Your parcel is on its way to you.", icon: Truck, tone: "success" },
  delivered: { label: "Delivered", note: "Package handed over successfully.", icon: PackageCheck, tone: "gold" },
  cancelled: { label: "Cancelled", note: "This order was cancelled.", icon: XCircle, tone: "error" },
  failed: { label: "Payment Failed", note: "Payment processing was unsuccessful.", icon: XCircle, tone: "error" },
};

const TONE_CLASSES = {
  neutral: "bg-[#FAFAFA] text-[#111111] border border-[#EAEAEA]",
  success: "bg-[#EAF5EE] text-[#287A4B] border border-[#287A4B]/20",
  gold: "bg-[#F5EFE5] text-[#B08D57] border border-[#B08D57]/30",
  pending: "bg-[#FBF2E2] text-[#A56A16] border border-[#A56A16]/20",
  error: "bg-[#FCECEC] text-[#C43D3D] border border-[#C43D3D]/20",
};

const CANCELLABLE_STATUSES = ["placed", "confirmed", "packed"];

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
      })
    : "—";

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { handleGetOrderById, handleCancelOrder } = useOrder();
  const { handleGetDeliveryByOrderId } = useDelivery();
  const { handleGetProductDetail } = useProduct();

  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [liveProductMap, setLiveProductMap] = useState({});

  const deliveryState = useSelector((state) => state.delivery?.currentDelivery);

  const fetchDetail = async () => {
    setLoading(true);
    const data = await handleGetOrderById(orderId);
    setOrder(data);

    if (data?._id) {
      const del = await handleGetDeliveryByOrderId(data._id);
      if (del) dispatch(setCurrentDelivery(del));
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchDetail();
  }, [orderId]);

  const delivery = deliveryState?.orderId === orderId ? deliveryState : null;
  const statusCfg = STATUS_CONFIG[order?.orderStatus] || STATUS_CONFIG.placed;
  const isCancellable = CANCELLABLE_STATUSES.includes(order?.orderStatus);

  const onConfirmCancel = async () => {
    setCancelling(true);
    const result = await handleCancelOrder(orderId);
    setCancelling(false);
    setCancelModalOpen(false);
    if (result.success) {
      toast.success("Order cancelled successfully");
      fetchDetail();
    } else {
      toast.error(result.error || "Failed to cancel order");
    }
  };

  if (loading || !order) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header bar */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111]"
          >
            <ArrowLeft size={14} />
            Back to Orders
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Order Details
          </span>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Status Header Banner */}
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[10px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <span className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase ${TONE_CLASSES[statusCfg.tone]}`}>
                {statusCfg.label}
              </span>
              <span className="text-[11.5px] text-[#666]">Placed on {formatDate(order.createdAt)}</span>
            </div>
            <h1 className="font-display text-[24px] font-bold text-[#111]">
              Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-[12.5px] text-[#666] mt-0.5">{statusCfg.note}</p>
          </div>

          <div className="flex items-center gap-3">
            {delivery?.shiprocketTrackingUrl && (
              <a
                href={delivery.shiprocketTrackingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111] text-white rounded text-[11.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all"
              >
                Track Shipment
                <ExternalLink size={14} />
              </a>
            )}

            {isCancellable && (
              <button
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2.5 border border-[#C43D3D] text-[#C43D3D] rounded text-[11.5px] font-bold uppercase hover:bg-[#FCECEC] transition-all"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Order Items Table */}
        <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-3 border-b border-[#EAEAEA] mb-4">
            Items in this Order ({order.orderItems?.length || 1})
          </h2>

          <div className="divide-y divide-[#EAEAEA]">
            {order.orderItems?.map((item, idx) => {
              const cover = item.variant?.images?.[0]?.url || item.product?.images?.[0]?.url;
              return (
                <div key={idx} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 rounded bg-[#FAFAFA] border border-[#EAEAEA] overflow-hidden shrink-0">
                      {cover ? (
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#999]">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-[14px] font-bold text-[#111]">
                        {item.product?.title || item.product?.name || "Product"}
                      </h3>
                      {item.variant && (
                        <p className="text-[11px] text-[#666] mt-0.5">
                          Size: {item.variant.size} · Color: {item.variant.color} · Qty: {item.quantity || 1}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#111]">₹{item.price?.amount || item.price || 0}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address & Payment Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-2 border-b border-[#EAEAEA]">
              Delivery Address
            </h3>
            {order.address ? (
              <div className="text-[12.5px] text-[#555] space-y-1">
                <p className="font-bold text-[#111]">{order.address.fullName} · {order.address.phone}</p>
                <p>{order.address.addressLine1}, {order.address.addressLine2}</p>
                <p>{order.address.city}, {order.address.state} - <strong>{order.address.pincode}</strong></p>
              </div>
            ) : (
              <p className="text-[12px] text-[#666]">Address unavailable.</p>
            )}
          </div>

          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5 space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-2 border-b border-[#EAEAEA]">
              Payment Summary
            </h3>
            <div className="space-y-1 text-[12.5px]">
              <div className="flex justify-between"><span className="text-[#666]">Item Total:</span> <span className="font-semibold text-[#111]">₹{order.sellerAmount?.amount || 0}</span></div>
              <div className="flex justify-between"><span className="text-[#666]">Shipping:</span> <span className="text-[#287A4B] font-semibold">FREE</span></div>
              <div className="flex justify-between pt-2 border-t border-[#EAEAEA] font-bold text-[#111]">
                <span>Total Amount Paid:</span>
                <span>₹{order.sellerAmount?.amount || 0}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {cancelModalOpen && (
        <CancelOrderModal
          onClose={() => setCancelModalOpen(false)}
          onConfirm={onConfirmCancel}
          submitting={cancelling}
        />
      )}
    </div>
  );
};

export default OrderDetail;