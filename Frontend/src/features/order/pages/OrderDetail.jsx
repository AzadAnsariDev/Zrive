// ============================= OrderDetail.jsx (BUYER) =============================
import React, { useEffect, useMemo, useState } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
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
  ExternalLink,
  ChevronDown,
  Copy,
  Info,
  Building2,
  Calendar,
  Sparkles,
} from "lucide-react";
import { notify } from "../../../utils/toast";
import useOrder from "../hook/useOrder.js";
import useDelivery from "../../delivery/hook/useDelivery.js";
import { setCurrentDelivery } from "../../delivery/state/deliverySlice.js";
import CancelOrderModal from "../components/CancelOrderModal";

const STATUS_CONFIG = {
  pending_payment: {
    label: "Awaiting Payment",
    note: "We're waiting for your payment confirmation.",
    icon: Clock,
    tone: "pending",
  },
  placed: {
    label: "Order Placed",
    note: "Your order has been received and confirmed.",
    icon: Check,
    tone: "neutral",
  },
  confirmed: {
    label: "Confirmed",
    note: "The merchant has accepted your order.",
    icon: Check,
    tone: "neutral",
  },
  packed: {
    label: "Packed",
    note: "Your parcel is packed and ready for pickup.",
    icon: Package,
    tone: "neutral",
  },
  shipped: {
    label: "Shipped / In Transit",
    note: "Your parcel is on its way to you.",
    icon: Truck,
    tone: "success",
  },
  delivered: {
    label: "Delivered",
    note: "Package handed over successfully.",
    icon: PackageCheck,
    tone: "gold",
  },
  cancelled: {
    label: "Cancelled",
    note: "This order was cancelled.",
    icon: XCircle,
    tone: "error",
  },
  failed: {
    label: "Payment Failed",
    note: "Payment processing was unsuccessful.",
    icon: XCircle,
    tone: "error",
  },
};

const TONE_CLASSES = {
  neutral: "bg-[#FAFAFA] text-[#111111] border border-[#EAEAEA]",
  success: "bg-[#EAF5EE] text-[#287A4B] border border-[#287A4B]/20",
  gold: "bg-[#F5EFE5] text-[#B08D57] border border-[#B08D57]/30",
  pending: "bg-[#FBF2E2] text-[#A56A16] border border-[#A56A16]/20",
  error: "bg-[#FCECEC] text-[#C43D3D] border border-[#C43D3D]/20",
};

const CANCELLABLE_STATUSES = ["placed", "confirmed", "packed"];

const formatDate = (iso, opts) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString("en-IN", opts || {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

const formatShortDate = (iso) => {
  if (!iso) return "";
  return new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
  });
};

const getItemTitle = (item) =>
  item?.title || item?.name || item?.product?.title || item?.product?.name || "Product";

const getItemImage = (item) =>
  item?.image ||
  item?.images?.[0]?.url ||
  item?.variant?.images?.[0]?.url ||
  item?.product?.images?.[0]?.url ||
  null;

const getItemPrice = (item) =>
  item?.price?.amount ?? item?.price ?? item?.sellerPrice?.amount ?? item?.sellerPrice ?? 0;

const getItemQty = (item) => item?.quantity ?? item?.qty ?? 1;

const getItemSizeColor = (item) =>
  [item?.size, item?.color].filter(Boolean).join(" · ") ||
  [item?.variant?.size, item?.variant?.color].filter(Boolean).join(" · ");

const OrderTrackingTimeline = ({ order, delivery }) => {
  const isCancelled = ["cancelled", "failed"].includes(order?.orderStatus);

  const currentStageIndex = useMemo(() => {
    if (isCancelled) return -1;
    const ordStatus = order?.orderStatus?.toLowerCase();
    const delStatus = delivery?.status?.toLowerCase();

    if (ordStatus === "delivered" || delStatus === "delivered") return 4;
    if (delStatus === "out_for_delivery") return 3;
    if (ordStatus === "shipped" || ["in_transit", "picked_up"].includes(delStatus)) return 2;
    if (["confirmed", "packed"].includes(ordStatus) || ["pickup_scheduled", "awb_assigned", "order_created"].includes(delStatus)) return 1;
    return 0;
  }, [order?.orderStatus, delivery?.status, isCancelled]);

  const stages = [
    {
      id: "placed",
      title: "Order Placed",
      subtitle: formatDate(order?.createdAt, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" }),
      icon: Check,
    },
    {
      id: "packed",
      title: "Packed",
      subtitle: currentStageIndex >= 1 ? "Ready for dispatch" : "Merchant preparing parcel",
      icon: Package,
    },
    {
      id: "shipped",
      title: "Shipped",
      subtitle: delivery?.courierName ? `Via ${delivery.courierName}` : (currentStageIndex >= 2 ? "In Transit" : "Awaiting Courier"),
      icon: Truck,
    },
    {
      id: "out_for_delivery",
      title: "Out for Delivery",
      subtitle: currentStageIndex >= 3 ? "With delivery agent" : "Near your location",
      icon: Navigation,
    },
    {
      id: "delivered",
      title: "Delivered",
      subtitle: delivery?.edd ? `Est. by ${formatShortDate(delivery.edd)}` : (currentStageIndex === 4 ? "Delivered" : "Package handover"),
      icon: PackageCheck,
    },
  ];

  if (isCancelled) {
    return (
      <div className="bg-[#FFF5F5] border border-[#FFD0D0] rounded-[10px] p-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#FCECEC] flex items-center justify-center text-[#C43D3D]">
            <XCircle size={22} />
          </div>
          <div>
            <h3 className="text-[14px] font-bold text-[#C43D3D]">Order Cancelled</h3>
            <p className="text-[12px] text-[#888] mt-0.5">
              {order?.refund?.status === "processed"
                ? "Refund has been processed to your source account."
                : "This order has been cancelled and will not be delivered."}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 md:p-6 shadow-sm overflow-hidden">
      <style>{`
        @keyframes pulse-ring {
          0% { transform: scale(0.95); opacity: 0.8; }
          50% { transform: scale(1.4); opacity: 0; }
          100% { transform: scale(0.95); opacity: 0; }
        }
        .pulse-active {
          animation: pulse-ring 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes shimmer-line {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }
        .shimmer-active {
          background: linear-gradient(90deg, #287A4B 0%, #68D391 50%, #287A4B 100%);
          background-size: 200% 100%;
          animation: shimmer-line 2.5s infinite linear;
        }
      `}</style>

      <div className="flex items-center justify-between pb-4 border-b border-[#F0F0F0] mb-6">
        <div>
          <h2 className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#B08D57]">
            Live Delivery Tracking
          </h2>
          <p className="text-[13px] font-semibold text-[#111] mt-0.5">
            {currentStageIndex === 4
              ? "🎉 Package Delivered Successfully"
              : currentStageIndex >= 2
              ? `🚀 Package is on the way${delivery?.edd ? ` · Arriving by ${formatShortDate(delivery.edd)}` : ""}`
              : "⏳ Order confirmed, merchant is packing items"}
          </p>
        </div>
        {delivery?.edd && currentStageIndex < 4 && (
          <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 bg-[#F5EFE5] text-[#B08D57] rounded-full text-[11px] font-bold border border-[#B08D57]/30">
            <Calendar size={12} />
            Est. Delivery: {formatShortDate(delivery.edd)}
          </span>
        )}
      </div>

      {/* Desktop Horizontal Stepper */}
      <div className="hidden md:block py-4">
        <div className="relative flex items-center justify-between">
          <div className="absolute left-6 right-6 top-5 h-[3px] bg-[#EAEAEA] -z-0" />

          <div
            className="absolute left-6 top-5 h-[3px] -z-0 transition-all duration-700 ease-out shimmer-active"
            style={{
              width: `${(Math.min(currentStageIndex, 4) / 4) * 100}%`,
              maxWidth: "calc(100% - 48px)",
            }}
          />

          {stages.map((stage, idx) => {
            const isCompleted = idx <= currentStageIndex;
            const isCurrent = idx === currentStageIndex;
            const Icon = stage.icon;

            return (
              <div key={stage.id} className="flex flex-col items-center text-center relative z-10 w-28">
                <div className="relative mb-2.5">
                  {isCurrent && isCompleted && (
                    <span className="pulse-active absolute -inset-1.5 rounded-full bg-[#287A4B]/30" />
                  )}
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center transition-all duration-300 ${
                      isCompleted
                        ? "bg-[#287A4B] text-white shadow-md shadow-[#287A4B]/20"
                        : "bg-[#FAFAFA] border-2 border-[#EAEAEA] text-[#AAA]"
                    }`}
                  >
                    <Icon size={18} strokeWidth={2.2} />
                  </div>
                </div>

                <span
                  className={`text-[12px] font-bold leading-tight ${
                    isCompleted ? "text-[#111]" : "text-[#999]"
                  }`}
                >
                  {stage.title}
                </span>
                <span className="text-[10px] text-[#777] mt-0.5 line-clamp-1 max-w-[110px]">
                  {stage.subtitle}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Mobile Vertical Stepper */}
      <div className="md:hidden space-y-4 pt-1">
        {stages.map((stage, idx) => {
          const isCompleted = idx <= currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isLast = idx === stages.length - 1;
          const Icon = stage.icon;

          return (
            <div key={stage.id} className="flex items-start gap-3.5 relative">
              {!isLast && (
                <div
                  className={`absolute left-4 top-8 bottom-0 w-[2px] -ml-[1px] ${
                    idx < currentStageIndex ? "bg-[#287A4B]" : "bg-[#EAEAEA]"
                  }`}
                />
              )}

              <div className="relative shrink-0 z-10">
                {isCurrent && isCompleted && (
                  <span className="pulse-active absolute -inset-1 rounded-full bg-[#287A4B]/30" />
                )}
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    isCompleted
                      ? "bg-[#287A4B] text-white shadow-sm"
                      : "bg-[#FAFAFA] border-2 border-[#EAEAEA] text-[#AAA]"
                  }`}
                >
                  <Icon size={14} strokeWidth={2.2} />
                </div>
              </div>

              <div className="pb-4">
                <p className={`text-[13px] font-bold ${isCompleted ? "text-[#111]" : "text-[#999]"}`}>
                  {stage.title}
                </p>
                <p className="text-[11px] text-[#777] mt-0.5">{stage.subtitle}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const CourierTrackingCard = ({ delivery, order, onRefresh, refreshing }) => {
  const [copied, setCopied] = useState(false);
  const [showLogs, setShowLogs] = useState(false);

  const awbCode = delivery?.awbCode || order?.awbCode;
  const courierName = delivery?.courierName || "Shiprocket Express";
  const trackingUrl = delivery?.shiprocketTrackingUrl || (awbCode ? `https://shiprocket.co/tracking/${awbCode}` : null);
  const logs = delivery?.statusHistory || [];

  const handleCopyAwb = (e) => {
    e.stopPropagation();
    if (!awbCode) return;
    navigator.clipboard?.writeText(awbCode);
    setCopied(true);
    notify.success("AWB Tracking ID copied!");
    setTimeout(() => setCopied(false), 2000);
  };

  if (!awbCode && !delivery?.status) {
    return (
      <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[10px] p-5 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-[#F5EFE5] flex items-center justify-center shrink-0">
          <Info size={18} className="text-[#B08D57]" />
        </div>
        <div>
          <p className="text-[12.5px] font-bold text-[#111]">Courier Dispatch in Progress</p>
          <p className="text-[11.5px] text-[#666]">
            Live tracking and courier details (AWB number) will be assigned once the seller hands over the parcel.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F0F0F0]">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#F5EFE5] flex items-center justify-center text-[#B08D57] shrink-0">
            <Building2 size={18} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[13.5px] font-bold text-[#111]">{courierName}</span>
              <span className="text-[9.5px] font-bold uppercase bg-[#EAF5EE] text-[#287A4B] px-2 py-0.5 rounded border border-[#287A4B]/20">
                Verified Courier
              </span>
            </div>
            {awbCode && (
              <div className="flex items-center gap-1.5 text-[12px] text-[#666] mt-0.5">
                <span>AWB / Tracking:</span>
                <strong className="text-[#111] font-mono tracking-wider">{awbCode}</strong>
                <button
                  type="button"
                  onClick={handleCopyAwb}
                  className="p-1 text-[#888] hover:text-[#111] transition-colors cursor-pointer"
                  title="Copy Tracking ID"
                >
                  {copied ? <Check size={13} className="text-[#287A4B]" /> : <Copy size={13} />}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={onRefresh}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-2 border border-[#EAEAEA] rounded-[6px] text-[11px] font-bold text-[#555] hover:bg-[#FAFAFA] transition-all disabled:opacity-50 cursor-pointer"
            title="Refresh Live Tracking Status"
          >
            <RefreshCw size={12} className={refreshing ? "animate-spin text-[#B08D57]" : ""} />
            <span>{refreshing ? "Refreshing..." : "Refresh"}</span>
          </button>

          {trackingUrl && (
            <a
              href={trackingUrl}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white rounded-[6px] text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all cursor-pointer"
            >
              <span>Track on Courier</span>
              <ExternalLink size={12} />
            </a>
          )}
        </div>
      </div>

      {logs.length > 0 && (
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setShowLogs((s) => !s)}
            className="w-full flex items-center justify-between py-2 text-[12px] font-bold text-[#B08D57] hover:underline text-left cursor-pointer"
          >
            <span className="flex items-center gap-1.5">
              <Sparkles size={14} />
              Detailed Shipment Journey ({logs.length} updates)
            </span>
            <ChevronDown
              size={14}
              className={`text-[#888] transition-transform duration-300 ${showLogs ? "rotate-180" : ""}`}
            />
          </button>

          {showLogs && (
            <div className="mt-3 pl-2 pr-1 py-3 bg-[#FAFAFA] rounded-[8px] border border-[#EAEAEA] space-y-3 max-h-60 overflow-y-auto">
              {logs.map((log, idx) => (
                <div key={idx} className="flex items-start gap-3 text-[12px]">
                  <div className="w-2 h-2 rounded-full bg-[#B08D57] mt-1.5 shrink-0" />
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <p className="font-bold text-[#111]">{log.status || log.note || "Status Updated"}</p>
                      <span className="text-[10px] text-[#888]">{formatDate(log.timestamp)}</span>
                    </div>
                    {log.location && (
                      <p className="text-[11px] text-[#666] flex items-center gap-1 mt-0.5">
                        <MapPin size={11} className="text-[#B08D57]" /> {log.location}
                      </p>
                    )}
                    {log.note && log.note !== log.status && (
                      <p className="text-[11px] text-[#777] mt-0.5">{log.note}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { handleGetOrderById, handleCancelOrder } = useOrder();
  const { handleGetDeliveryByOrderBuyer, handleTrackDeliveryBuyer } = useDelivery();

  const order = useSelector((state) => state.order.currentOrder);
  const loading = useSelector((state) => state.order?.loading ?? true);
  const deliveryState = useSelector((state) => state.delivery?.currentDelivery);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [refreshingDelivery, setRefreshingDelivery] = useState(false);

  useEffect(() => {
    handleGetOrderById(orderId);
  }, [orderId]);

  useEffect(() => {
    if (!order?._id) return;
    (async () => {
      await handleGetDeliveryByOrderBuyer(order._id);
    })();
  }, [order?._id]);

  const handleRefreshTracking = async () => {
    if (!deliveryState?._id) {
      if (order?._id) {
        setRefreshingDelivery(true);
        await handleGetDeliveryByOrderBuyer(order._id);
        setRefreshingDelivery(false);
        notify.success("Order status refreshed");
      }
      return;
    }
    setRefreshingDelivery(true);
    try {
      const updated = await handleTrackDeliveryBuyer(deliveryState._id);
      if (updated) {
        notify.success("Tracking information updated!");
      }
    } finally {
      setRefreshingDelivery(false);
    }
  };

  const retry = () => {
    handleGetOrderById(orderId);
  };

  const delivery = deliveryState;
  const statusCfg = STATUS_CONFIG[order?.orderStatus] || STATUS_CONFIG.placed;
  const isCancellable = CANCELLABLE_STATUSES.includes(order?.orderStatus);

  const onConfirmCancel = async () => {
    setCancelling(true);
    const result = await handleCancelOrder(orderId);
    setCancelling(false);
    setCancelModalOpen(false);
    if (result.success) {
      notify.success("Order cancelled successfully");
      handleGetOrderById(orderId);
    } else {
      notify.error(result.error, "Failed to cancel order");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-3 px-4">
        <ShieldAlert size={28} className="text-[#C43D3D]" />
        <p className="text-[15px] font-bold text-[#111]">Couldn't load this order</p>
        <p className="text-[12.5px] text-[#666] text-center max-w-[320px]">
          It may not exist, or something went wrong while fetching it. Check your connection and try again.
        </p>
        <div className="flex items-center gap-3 mt-1">
          <button
            type="button"
            onClick={retry}
            className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111] text-white rounded text-[11.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all cursor-pointer"
          >
            <RefreshCw size={13} />
            Retry
          </button>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="text-[12px] font-bold text-[#B08D57] hover:underline cursor-pointer"
          >
            Back to Orders
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-20">
      {/* Header Bar */}
      <div className="border-b border-[#EAEAEA] bg-white sticky top-0 z-20 shadow-xs">
        <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back to All Orders</span>
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Order Details
          </span>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Status Header Banner */}
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 md:p-6 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-sm">
          <div>
            <div className="flex items-center gap-3 mb-1.5 flex-wrap">
              <span className={`px-2.5 py-0.5 rounded text-[10.5px] font-bold uppercase ${TONE_CLASSES[statusCfg.tone]}`}>
                {statusCfg.label}
              </span>
              <span className="text-[12px] text-[#666]">
                Placed on {formatDate(order.createdAt)}
              </span>
            </div>
            <h1 className="font-display text-[22px] md:text-[26px] font-bold text-[#111]">
              Order #ZR-{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-[12.5px] text-[#666] mt-0.5">{statusCfg.note}</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {isCancellable && (
              <button
                type="button"
                onClick={() => setCancelModalOpen(true)}
                className="px-4 py-2.5 border border-[#C43D3D] text-[#C43D3D] rounded-[6px] text-[11.5px] font-bold uppercase hover:bg-[#FCECEC] transition-all cursor-pointer"
              >
                Cancel Order
              </button>
            )}
          </div>
        </div>

        {/* Live Animated Order Progress Timeline */}
        <OrderTrackingTimeline order={order} delivery={delivery} />

        {/* Courier AWB Tracking Card */}
        <CourierTrackingCard
          delivery={delivery}
          order={order}
          onRefresh={handleRefreshTracking}
          refreshing={refreshingDelivery}
        />

        {/* Order Items */}
        <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 md:p-6 shadow-sm">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-3 border-b border-[#F0F0F0] mb-4">
            Items in this Order ({order.orderItems?.length || 1})
          </h2>

          <div className="divide-y divide-[#F0F0F0]">
            {order.orderItems?.map((item, idx) => {
              const cover = getItemImage(item);
              const title = getItemTitle(item);
              const sizeColor = getItemSizeColor(item);
              const qty = getItemQty(item);
              const price = getItemPrice(item);

              return (
                <div key={item._id || item.productId || idx} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-20 rounded-[6px] bg-[#FAFAFA] border border-[#EAEAEA] overflow-hidden shrink-0">
                      {cover ? (
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#999]">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="text-[13.5px] font-bold text-[#111] leading-snug line-clamp-1">{title}</h3>
                      <p className="text-[11.5px] text-[#666] mt-0.5">
                        {sizeColor ? `${sizeColor} · ` : ""}Qty: {qty}
                      </p>
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[14.5px] font-bold text-[#111]">
                      ₹{(price * qty).toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Address & Payment Info Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Delivery Address */}
          <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 md:p-6 shadow-sm space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-2 border-b border-[#F0F0F0]">
              Delivery Address
            </h3>
            {order.shippingAddress || order.address ? (
              <div className="text-[12.5px] text-[#555] space-y-1 pt-1">
                <p className="font-bold text-[#111]">
                  {order.shippingAddress?.name || order.shippingAddress?.fullName || order.address?.fullName} ·{" "}
                  {order.shippingAddress?.phone || order.address?.phone}
                </p>
                <p>
                  {order.shippingAddress?.line1 || order.shippingAddress?.streetAddress || order.address?.addressLine1}
                  {(order.shippingAddress?.line2 || order.address?.addressLine2)
                    ? `, ${order.shippingAddress?.line2 || order.address?.addressLine2}`
                    : ""}
                </p>
                <p>
                  {order.shippingAddress?.city || order.address?.city},{" "}
                  {order.shippingAddress?.state || order.address?.state} —{" "}
                  <strong className="text-[#111]">
                    {order.shippingAddress?.pincode || order.address?.pincode}
                  </strong>
                </p>
              </div>
            ) : (
              <p className="text-[12px] text-[#666]">Address unavailable.</p>
            )}
          </div>

          {/* Payment Summary */}
          <div className="bg-white border border-[#EAEAEA] rounded-[12px] p-5 md:p-6 shadow-sm space-y-2">
            <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-2 border-b border-[#F0F0F0]">
              Payment Summary
            </h3>
            <div className="space-y-1.5 text-[12.5px] pt-1">
              <div className="flex justify-between">
                <span className="text-[#666]">Item Total:</span>
                <span className="font-semibold text-[#111]">
                  ₹{(order.sellerAmount?.amount || 0).toLocaleString("en-IN")}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#666]">Shipping:</span>
                <span className="text-[#287A4B] font-semibold">FREE</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#F0F0F0] font-bold text-[#111]">
                <span>Total Amount Paid:</span>
                <span>₹{(order.sellerAmount?.amount || 0).toLocaleString("en-IN")}</span>
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