import React, { useEffect, useMemo } from "react";
import { useNavigate, useParams } from "react-router";
import { useSelector } from "react-redux";
import { ArrowLeft, CheckCircle2, Truck, Clock, XCircle, ChevronRight } from "lucide-react";
import useOrder from "../hook/useOrder";

const STATUS_CONFIG = {
  pending_payment: { icon: Clock, tone: "pending", label: "Awaiting payment" },
  placed:          { icon: CheckCircle2, tone: "neutral", label: "Confirmed" },
  shipped:         { icon: Truck, tone: "success", label: "Shipped" },
  delivered:       { icon: CheckCircle2, tone: "neutral", label: "Delivered" },
  cancelled:       { icon: XCircle, tone: "error", label: "Cancelled" },
  failed:          { icon: XCircle, tone: "error", label: "Payment failed" },
};

const TONE_CLASSES = {
  neutral: "bg-cream-dark text-ink-soft",
  success: "bg-success/10 text-success",
  pending: "bg-gold/10 text-gold-deep",
  error:   "bg-error/10 text-error",
};

const getPaymentId = (order) =>
  order.payment && typeof order.payment === "object" ? order.payment._id : order.payment;

const StatusBadge = ({ status }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  const Icon = config.icon;
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${TONE_CLASSES[config.tone]}`}
    >
      <Icon size={13} strokeWidth={2} />
      {config.label}
    </span>
  );
};

const OrderGroupItems = () => {
  const { paymentId } = useParams();
  const navigate = useNavigate();
  const { handleGetOrders } = useOrder();
  const orders = useSelector((state) => state.order.orders);
  const loading = useSelector((state) => state.order.loading);

  useEffect(() => {
    // agar orders already Redux me nahi hai (direct URL visit), fetch kar lo
    if (!orders || orders.length === 0) handleGetOrders();
  }, []);

  const groupOrders = useMemo(
    () => orders.filter((o) => getPaymentId(o) === paymentId),
    [orders, paymentId]
  );

  const total = useMemo(
    () => groupOrders.reduce((sum, o) => sum + (o.sellerAmount?.amount || 0), 0),
    [groupOrders]
  );

  if (loading && groupOrders.length === 0) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-ink-soft text-sm">Loading order...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-cream px-6 pt-6 pb-16">
      <div className="mx-auto max-w-2xl">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center gap-3 mb-6">
          <button
            onClick={() => navigate("/orders")}
            className="w-9 h-9 rounded-full border border-border flex items-center justify-center hover:bg-cream-dark transition-colors"
            aria-label="Back to orders"
          >
            <ArrowLeft size={17} strokeWidth={1.75} className="text-ink" />
          </button>
          <div>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-1">
              Order breakdown
            </p>
            <h1 className="font-display text-2xl text-ink leading-tight">
              #ZR-{paymentId?.slice(-5).toUpperCase()}
            </h1>
          </div>
        </div>

        <p className="text-sm text-ink-soft mb-6">
          {groupOrders.length} sellers · ₹{total.toLocaleString("en-IN")} total
        </p>

        {/* ── Per-seller order cards ─────────────────── */}
        <div className="space-y-5">
          {groupOrders.map((order) => {
            const items = order.orderItems || [];
            const primary = items[0];
            const extraCount = items.length - 1;

            return (
              <div
                key={order._id}
                className="rounded-2xl bg-surface border border-border/60 p-5"
              >
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={order.orderStatus} />
                  <span className="text-xs text-ink-soft tracking-wide">
                    ID: #ZR-{order._id.slice(-5).toUpperCase()}
                  </span>
                </div>

                <div className="flex gap-4 mb-4">
                  <img
                    src={primary?.images?.[0]?.url}
                    alt={primary?.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0 border border-border/40"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <p className="font-display text-base text-ink leading-snug truncate">
                      {primary?.title}
                      {extraCount > 0 && (
                        <span className="text-ink-soft text-sm font-sans"> +{extraCount} more</span>
                      )}
                    </p>
                    <p className="font-display text-lg text-ink mt-2">
                      ₹{order.sellerAmount?.amount?.toLocaleString("en-IN")}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/orders/${order._id}`)}
                  className="w-full flex items-center justify-center gap-1.5 py-3 rounded-full border border-border text-ink text-xs tracking-[0.15em] uppercase font-medium hover:bg-cream-dark transition-colors duration-200"
                >
                  View details
                  <ChevronRight size={14} />
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default OrderGroupItems;