import React, { useEffect, useRef, useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import useOrder from "../hook/useOrder.js";
import useDelivery from "../../delivery/hook/useDelivery.js";
import { setCurrentDelivery } from "../../delivery/state/deliverySlice.js";
import CancelOrderModal from "../components/CancelOrderModal";

// ── Status → hero badge + note ─────────────────────────────
// NOTE: "confirmed" and "packed" are seller-side/internal stages.
// The buyer only ever sees "Placed" until the order actually ships —
// showing "Confirmed" was leaking internal seller workflow state.
const STATUS_CONFIG = {
  pending_payment: { label: "Awaiting payment", note: "We're waiting for your payment to confirm.", icon: Clock, tone: "pending" },
  placed: { label: "Placed", note: "Your order is being prepared.", icon: Check, tone: "success" },
  confirmed: { label: "Placed", note: "Your order is being prepared.", icon: Check, tone: "success" },
  packed: { label: "Placed", note: "Your order is being prepared.", icon: Check, tone: "success" },
  shipped: { label: "Shipped", note: "Your order is on its way.", icon: Truck, tone: "info" },
  delivered: { label: "Delivered", note: "This order has been delivered.", icon: Package, tone: "success" },
  cancelled: { label: "Cancelled", note: "This order was cancelled.", icon: XCircle, tone: "error" },
  failed: { label: "Payment failed", note: "The payment for this order didn't go through.", icon: XCircle, tone: "error" },
};

// Cancel is allowed for the buyer up until the order actually ships —
// once shipped, the courier already has it, so cancelling stops making sense.
const CANCELLABLE_STATUSES = ["placed", "confirmed", "packed"];

// cancelReason values that mean the SELLER rejected the order
// (as opposed to "buyer_cancelled", which the buyer initiated themselves).
const SELLER_REJECTION_REASONS = ["out_of_stock", "unable_to_fulfill", "other"];

const SELLER_REJECTION_LABEL = {
  out_of_stock: "the item went out of stock",
  unable_to_fulfill: "the seller couldn't fulfill it in time",
  other: "the seller was unable to fulfill this order",
};

// Delivery record can already exist (AWB assigned) before order.orderStatus
// flips to "shipped" — the buyer should watch that happen live, not just
// see the last two stages. So we start pulling delivery data as soon as
// the order is confirmed, not only once it ships.
const DELIVERY_TRACKABLE_STATUSES = ["placed", "confirmed", "packed", "shipped", "delivered"];

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

// EDD is an estimate, not a moment that happened — shown as a plain
// weekday + date, no time, so it doesn't read like a logged event.
const formatEddDate = (edd) => {
  if (!edd) return null;
  const d = new Date(edd);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

// ── Buyer-facing milestone sequence ─────────────────────────
// Raw Shiprocket scan statuses are granular (pickup_scheduled, picked_up,
// in_transit...) — the buyer only needs the handful of moments that
// actually mean something to them.
const MILESTONE_SEQUENCE = ["order_created", "awb_assigned", "in_transit", "out_for_delivery", "delivered"];

const MILESTONE_META = {
  order_created: { label: "Order Placed", note: "We've received your order and notified the seller.", icon: Package },
  awb_assigned: { label: "Shipment Assigned", note: "A courier partner has been assigned to your order.", icon: Truck },
  in_transit: { label: "Shipped", note: "Your order has left the warehouse and is on its way.", icon: Navigation },
  out_for_delivery: { label: "Out for Delivery", note: "Your order is out for delivery today.", icon: MapPin },
  delivered: { label: "Delivered", note: "Your order has been delivered.", icon: PackageCheck },
};

// Several raw statuses collapse into the same buyer-facing milestone.
const RAW_STATUS_TO_MILESTONE = {
  order_created: "order_created",
  awb_assigned: "awb_assigned",
  pickup_scheduled: "awb_assigned",
  picked_up: "in_transit",
  in_transit: "in_transit",
  out_for_delivery: "out_for_delivery",
  delivered: "delivered",
};

function buildMilestoneTimeline(order, delivery) {
  const history = delivery?.statusHistory || [];
  const reachedAt = {};

  history.forEach((entry) => {
    const milestone = RAW_STATUS_TO_MILESTONE[entry.status];
    if (!milestone) return;
    if (!reachedAt[milestone] || new Date(entry.timestamp) < new Date(reachedAt[milestone])) {
      reachedAt[milestone] = entry.timestamp;
    }
  });

  // Order Placed is always reached — fall back to the order's own
  // createdAt if the delivery record hasn't logged it separately.
  if (!reachedAt.order_created) {
    reachedAt.order_created = order.createdAt;
  }

  const terminalEntry = [...history].reverse().find((e) => ["cancelled", "rto"].includes(e.status));

  const milestones = MILESTONE_SEQUENCE.map((key) => ({
    key,
    ...MILESTONE_META[key],
    reached: Boolean(reachedAt[key]),
    timestamp: reachedAt[key] || null,
  }));

  const lastReachedIndex = milestones.reduce((acc, m, i) => (m.reached ? i : acc), 0);

  return { milestones, lastReachedIndex, terminalEntry };
}

// ---------------------------------------------------------------------
// DeliveryProgressTimeline — the buyer's main "where's my order" view.
// Mounted fresh (via a `key` on the parent that changes whenever new
// tracking data arrives) so the whole sequence — nodes popping in,
// each connecting segment filling in turn — replays from the top every
// time, the way a good native tracking screen does.
// ---------------------------------------------------------------------
const DeliveryProgressTimeline = ({ order, delivery }) => {
  const { milestones, lastReachedIndex, terminalEntry } = buildMilestoneTimeline(order, delivery);

  return (
    <div className="relative pl-1">
      <style>{`
        @keyframes dp-segment-grow {
          from { transform: scaleY(0); }
          to   { transform: scaleY(1); }
        }
        @keyframes dp-node-in {
          from { opacity: 0; transform: translateY(8px) scale(0.82); }
          to   { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes dp-pulse-ring {
          0%   { transform: scale(0.85); opacity: 0.55; }
          70%  { transform: scale(2.15); opacity: 0; }
          100% { transform: scale(2.15); opacity: 0; }
        }
        @keyframes dp-icon-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.12); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        .dp-node { animation: dp-node-in 0.55s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .dp-icon { animation: dp-icon-pop 0.5s cubic-bezier(0.34, 1.56, 0.64, 1) both; }
        .dp-segment-fill { transform-origin: top; animation: dp-segment-grow 0.65s cubic-bezier(0.65, 0, 0.35, 1) both; }
        .dp-pulse { animation: dp-pulse-ring 2.4s cubic-bezier(0.4, 0, 0.6, 1) infinite; }
        @media (prefers-reduced-motion: reduce) {
          .dp-node, .dp-icon, .dp-segment-fill, .dp-pulse { animation: none !important; }
        }
      `}</style>

      {!milestones[milestones.length - 1]?.reached && !terminalEntry && formatEddDate(delivery?.edd) && (
        <div className="dp-node flex items-center gap-2 mb-6" style={{ animationDelay: "0s" }}>
          <Truck size={14} className="text-gold-deep shrink-0" strokeWidth={2} />
          <p className="text-sm text-ink">
            Arriving by <span className="font-semibold">{formatEddDate(delivery.edd)}</span>
          </p>
        </div>
      )}

      {milestones.map((m, idx) => {
        const isLastRow = idx === milestones.length - 1 && !terminalEntry;
        const segmentFilled = idx < lastReachedIndex;
        const isCurrent = idx === lastReachedIndex && m.reached && !terminalEntry;
        const Icon = m.icon;

        return (
          <div
            key={m.key}
            className="dp-node relative flex gap-4 pb-9 last:pb-0"
            style={{ animationDelay: `${idx * 0.14}s` }}
          >
            {!isLastRow && (
              <>
                <span className="absolute left-[15px] top-8 bottom-0 w-px bg-border" aria-hidden="true" />
                {segmentFilled && (
                  <span
                    className="dp-segment-fill absolute left-[15px] top-8 bottom-0 w-px bg-gradient-to-b from-gold to-ink"
                    style={{ animationDelay: `${0.3 + idx * 0.22}s` }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}

            <span className="relative shrink-0 w-8 h-8">
              {isCurrent && (
                <span className="dp-pulse absolute inset-0 rounded-full bg-gold/50" aria-hidden="true" />
              )}
              <span
                className={`dp-icon relative z-10 w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  m.reached
                    ? isCurrent
                      ? "bg-ink text-cream ring-4 ring-gold/25 shadow-[0_2px_10px_rgba(0,0,0,0.18)]"
                      : "bg-ink text-cream shadow-[0_1px_4px_rgba(0,0,0,0.12)]"
                    : "bg-cream-dark border border-border text-ink-soft/40"
                }`}
                style={{ animationDelay: `${0.1 + idx * 0.14}s` }}
              >
                <Icon size={14} strokeWidth={2} />
              </span>
            </span>

            <div className="pt-1.5">
              <p
                className={`text-xs font-semibold tracking-[0.1em] uppercase ${
                  m.reached ? "text-ink" : "text-ink-soft/50"
                }`}
              >
                {m.label}
              </p>
              {m.reached ? (
                <>
                  <p className="text-xs text-ink-soft mt-1">{formatDate(m.timestamp)}</p>
                  {isCurrent && (
                    <p className="text-sm text-ink-soft mt-2 leading-relaxed max-w-sm">{m.note}</p>
                  )}
                </>
              ) : (
                <p className="text-xs text-ink-soft/50 mt-1">Pending</p>
              )}
            </div>
          </div>
        );
      })}

      {terminalEntry && (
        <div
          className="dp-node relative flex gap-4"
          style={{ animationDelay: `${milestones.length * 0.14}s` }}
        >
          <span className="dp-icon relative z-10 shrink-0 w-8 h-8 rounded-full flex items-center justify-center bg-error text-cream">
            <XCircle size={14} strokeWidth={2} />
          </span>
          <div className="pt-1.5">
            <p className="text-xs font-semibold tracking-[0.1em] uppercase text-error">
              {terminalEntry.status === "rto" ? "Returned to Origin" : "Shipment Cancelled"}
            </p>
            <p className="text-xs text-ink-soft mt-1">{formatDate(terminalEntry.timestamp)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------
// Detailed scan-by-scan activity log (Meesho/Myntra "full tracking"
// style) — optional, tucked behind a toggle under the main milestone
// timeline for buyers who want the raw courier activity.
// ---------------------------------------------------------------------
const MILESTONE_LABELS = {
  order_created: "Order Placed",
  awb_assigned: "Shipment Assigned",
  pickup_scheduled: "Pickup Scheduled",
  picked_up: "Picked Up",
  in_transit: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  rto: "Return Initiated",
  cancelled: "Cancelled",
};

const FALLBACK_LOCATION = {
  order_created: "Warehouse",
  awb_assigned: "Warehouse",
};

const TrackingTimeline = ({ history }) => {
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const rows = [];
  let lastDayKey = null;
  let lastMilestoneStatus = null;
  sorted.forEach((entry, i) => {
    const dayKey = new Date(entry.timestamp).toDateString();
    if (dayKey !== lastDayKey) {
      rows.push({ type: "date", key: `date-${dayKey}`, dayKey });
      lastDayKey = dayKey;
    }
    const isMilestone = entry.status !== lastMilestoneStatus;
    lastMilestoneStatus = entry.status;
    rows.push({
      type: "entry",
      key: entry._id || `entry-${i}`,
      entry,
      isMilestone,
      isLatestOverall: i === 0,
    });
  });

  const isDelivered = sorted[0]?.status === "delivered";

  return (
    <div className="rounded-lg bg-surface border border-border p-5">
      {isDelivered && (
        <div className="flex items-center gap-2 mb-5">
          <CheckCircle2 size={18} className="text-success" strokeWidth={2} />
          <p className="text-sm font-semibold text-ink">
            Delivered on{" "}
            {new Date(sorted[0].timestamp).toLocaleDateString("en-IN", {
              weekday: "short",
              day: "numeric",
              month: "short",
            })}
          </p>
        </div>
      )}

      <div className="flex flex-col">
        {rows.map((row, idx) => {
          const isLastRow = idx === rows.length - 1;

          if (row.type === "date") {
            return (
              <div key={row.key} className="flex gap-3">
                <div className="flex flex-col items-center w-[10px] shrink-0">
                  <span className="w-px flex-1 bg-border" />
                </div>
                <p className="text-[11px] tracking-[0.08em] uppercase text-ink-soft font-semibold pt-3 pb-1.5">
                  {new Date(row.dayKey).toLocaleDateString("en-IN", {
                    weekday: "long",
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
            );
          }

          const { entry, isMilestone, isLatestOverall } = row;
          const isNegative = ["cancelled", "rto"].includes(entry.status);
          const headline = MILESTONE_LABELS[entry.status] || entry.status.replace(/_/g, " ");
          const location = entry.location || FALLBACK_LOCATION[entry.status];

          return (
            <div key={row.key} className="flex gap-3">
              <div className="flex flex-col items-center w-[10px] shrink-0">
                {isMilestone ? (
                  isNegative ? (
                    <XCircle size={16} className="text-error shrink-0 -ml-[3px] mt-0.5" strokeWidth={2} />
                  ) : (
                    <CheckCircle2 size={16} className="text-success shrink-0 -ml-[3px] mt-0.5" strokeWidth={2} />
                  )
                ) : (
                  <span
                    className={`w-2 h-2 rounded-full shrink-0 mt-1.5 ${
                      isLatestOverall ? "bg-success" : "bg-border"
                    }`}
                  />
                )}
                {!isLastRow && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className="pb-4 pt-0.5">
                {isMilestone ? (
                  <p className="text-[13.5px] font-semibold text-ink">
                    {headline}{" "}
                    <span className="font-normal text-ink-soft">
                      on{" "}
                      {new Date(entry.timestamp).toLocaleDateString("en-IN", {
                        weekday: "short",
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </p>
                ) : (
                  <>
                    <p className="text-[13px] leading-snug text-ink-soft">{entry.note || headline}</p>
                    <p className="text-[11px] text-ink-soft/70 mt-0.5">
                      {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {location ? ` · ${location}` : ""}
                    </p>
                  </>
                )}
                {isMilestone && entry.note && entry.note !== headline && (
                  <p className="text-[11px] text-ink-soft/70 mt-0.5">
                    {entry.note}
                    {location ? ` · ${location}` : ""}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
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
  const loading = useSelector((state) => state.order.loading);
  const currentDelivery = useSelector((state) => state.delivery?.currentDelivery);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showDetailedActivity, setShowDetailedActivity] = useState(false);

  const trackedDeliveryIdRef = useRef(null);

  useEffect(() => {
    handleGetOrderById(orderId);
  }, [orderId]);

  // Fetch the delivery record as soon as the order is confirmed — not
  // just once it ships — so "Shipment Assigned" can show up live the
  // moment the seller assigns a courier. Cleanup clears stale state so
  // a different order never shows a previous one's timeline.
  useEffect(() => {
    if (order && DELIVERY_TRACKABLE_STATUSES.includes(order.orderStatus)) {
      handleGetDeliveryByOrderBuyer(order._id);
    }
    return () => {
      dispatch(setCurrentDelivery(null));
      trackedDeliveryIdRef.current = null;
      setShowDetailedActivity(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [order?.orderStatus, order?._id]);

  // Once the delivery has an AWB, pull the real Shiprocket scan history
  // automatically — no button, the buyer just sees it happen. Guarded by
  // a ref so it fires once per delivery record rather than looping.
  useEffect(() => {
    if (
      currentDelivery?._id &&
      currentDelivery?.awbCode &&
      trackedDeliveryIdRef.current !== currentDelivery._id
    ) {
      trackedDeliveryIdRef.current = currentDelivery._id;
      handleTrackDeliveryBuyer(currentDelivery._id);
    }
  }, [currentDelivery?._id, currentDelivery?.awbCode]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-ink-soft text-sm">Loading order...</p>
      </div>
    );
  }

  if (!order) return null;

  const onConfirmCancel = async () => {
    setCancelling(true);
    const result = await handleCancelOrder(order._id);
    setCancelling(false);
    setShowCancelModal(false);
    if (result.success) {
      toast.success("Order cancelled");
    } else {
      toast.error(result.error || "Could not cancel order");
    }
  };

  const isCancelled = order.orderStatus === "cancelled";
  const isSellerRejected = isCancelled && SELLER_REJECTION_REASONS.includes(order.cancelReason);

  const config = isSellerRejected
    ? { label: "Cancelled by seller", note: "This order was cancelled by the seller.", icon: ShieldAlert, tone: "error" }
    : STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;

  const items = order.orderItems || [];
  const heroItem = items[0];
  const subtotal = order.sellerAmount?.amount ?? 0;
  const isTerminal = order.orderStatus === "cancelled" || order.orderStatus === "failed";
  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);

  // Forces the timeline to remount — and every entrance/line animation to
  // replay from the top — whenever fresh tracking data comes in.
  const timelineKey = `${currentDelivery?._id || "none"}-${currentDelivery?.statusHistory?.length || 0}-${order.orderStatus}`;

  return (
    <div className="min-h-screen bg-cream pb-20">
      <style>{`
        @keyframes od-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .od-in { animation: od-fade-up 0.45s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .od-in { animation: none !important; }
        }
      `}</style>

      {/* ── Hero image ─────────────────────────────────── */}
      <div className="mx-auto max-w-2xl px-6 pt-4">
        <div className="relative w-full aspect-[4/5] sm:aspect-[16/10] rounded-2xl overflow-hidden">
          <img
            src={heroItem?.images?.[0]?.url}
            alt={heroItem?.title}
            className="w-full h-full object-cover object-center"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-charcoal/85 via-charcoal/10 to-charcoal/30" />

          {/* top bar */}
          <div className="absolute top-0 inset-x-0 flex items-center justify-between px-5 pt-5">
            <button
              onClick={() => navigate("/orders")}
              className="w-9 h-9 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center hover:bg-cream transition-colors"
              aria-label="Back to orders"
            >
              <ArrowLeft size={17} strokeWidth={1.75} className="text-ink" />
            </button>
            <Link
              to="/cart"
              className="w-9 h-9 rounded-full bg-cream/90 backdrop-blur flex items-center justify-center hover:bg-cream transition-colors"
              aria-label="Cart"
            >
              <ShoppingBag size={16} strokeWidth={1.75} className="text-ink" />
            </Link>
          </div>

          {/* bottom overlay content */}
          <div className="absolute bottom-0 inset-x-0 px-6 pb-6">
            <div className="inline-block bg-cream/95 backdrop-blur rounded-md px-3.5 py-2 mb-3">
              <p className="text-[10px] tracking-[0.15em] text-ink-soft uppercase mb-0.5">
                Order reference
              </p>
              <p className="font-display text-base text-ink">
                #ZR-{order._id.slice(-5).toUpperCase()}
              </p>
            </div>
            <div>
              <span
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-cream text-[11px] font-medium tracking-[0.1em] uppercase ${
                  isSellerRejected ? "bg-error" : "bg-charcoal"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-cream" />
                {config.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-6">
        {/* ── Item(s) ────────────────────────────────── */}
        <div className="od-in pt-8 mb-10">
          {items.length === 1 ? (
            <>
              <p className="text-xs tracking-[0.15em] text-ink-soft uppercase mb-3">
                Selected item
              </p>
              <h1 className="font-display text-2xl md:text-3xl text-ink leading-tight mb-1.5">
                {heroItem?.title}
              </h1>
              <p className="text-sm text-ink-soft mb-4">Qty {heroItem?.quantity}</p>
              <p className="font-display text-xl text-ink">
                ₹{(heroItem?.price?.amount * heroItem?.quantity).toLocaleString("en-IN")}
              </p>
            </>
          ) : (
            <>
              <p className="text-xs tracking-[0.15em] text-ink-soft uppercase mb-5">
                {items.length} items in this order
              </p>
              <div className="space-y-5">
                {items.map((item, idx) => (
                  <div key={idx} className="flex gap-4 items-center">
                    <img
                      src={item.images?.[0]?.url}
                      alt={item.title}
                      className="w-14 h-14 object-cover rounded-lg border border-border/60 shrink-0"
                    />
                    <div className="flex-1 flex justify-between items-center min-w-0">
                      <div className="min-w-0">
                        <p className="text-ink text-sm font-medium mb-1 truncate">{item.title}</p>
                        <p className="text-xs text-ink-soft">Qty {item.quantity}</p>
                      </div>
                      <p className="text-sm font-medium text-ink whitespace-nowrap ml-3">
                        ₹{(item.price?.amount * item.quantity).toLocaleString("en-IN")}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>

        {/* ── Delivery progress ──────────────────────── */}
        <div className="od-in border-t border-border pt-8 mb-8" style={{ animationDelay: "80ms" }}>
          <div className="flex items-center justify-between gap-3 mb-6">
            <p className="text-xs tracking-[0.15em] text-ink-soft uppercase">
              Delivery progress
            </p>
            {!isTerminal && currentDelivery?.courierName && (
              <p className="text-[11px] text-ink-soft text-right">
                {currentDelivery.courierName}
                {currentDelivery.awbCode ? ` · ${currentDelivery.awbCode}` : ""}
              </p>
            )}
          </div>

          {isTerminal ? (
            isSellerRejected ? (
              // ── Seller-rejected apology block ──────────────────
              <div className="relative rounded-xl bg-error/5 border border-error/20 p-6 overflow-hidden">
                <div className="flex items-start gap-3.5">
                  <div className="shrink-0 w-9 h-9 rounded-full bg-error/10 flex items-center justify-center">
                    <ShieldAlert size={17} className="text-error" strokeWidth={2} />
                  </div>
                  <div className="flex-1">
                    <p className="font-display text-lg text-ink mb-1">
                      We're sorry about this one
                    </p>
                    <p className="text-sm text-ink-soft leading-relaxed">
                      This order was cancelled because {SELLER_REJECTION_LABEL[order.cancelReason]}.
                      {order.rejectionNote ? ` The seller added a note: "${order.rejectionNote}"` : ""}
                    </p>
                    <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-lg bg-cream border border-border/60 w-fit">
                      <ShieldAlert size={13} className="text-gold-deep shrink-0" />
                      <p className="text-[11.5px] text-ink-soft">
                        We've flagged this seller's account for review.
                      </p>
                    </div>

                    {order.refund?.refundId && (
                      <div className="mt-5 pt-5 border-t border-error/10 space-y-2">
                        <p className="text-xs tracking-[0.1em] uppercase text-ink-soft mb-2">
                          Refund summary
                        </p>
                        <div className="flex justify-between text-xs">
                          <span className="text-ink-soft">Order cancelled</span>
                          <span className="text-ink">{formatDate(order.cancelledAt)}</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-ink-soft">
                            Refund {order.refund.status === "processed" ? "successful" : "initiated"}
                          </span>
                          <span className="text-ink">
                            ₹{order.refund.amount?.toLocaleString("en-IN")}
                          </span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-ink-soft">Reference ID</span>
                          <span className="text-ink font-mono text-[11px]">{order.refund.refundId}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              // ── Generic cancelled / failed block ──────────────
              <div className="flex items-start gap-3 rounded-lg bg-error/5 border border-error/20 p-4">
                <XCircle size={18} className="text-error shrink-0 mt-0.5" strokeWidth={2} />
                <div className="flex-1">
                  <p className="text-sm font-medium text-ink">{config.label}</p>
                  <p className="text-xs text-ink-soft mt-0.5">{config.note}</p>

                  {order.orderStatus === "cancelled" && order.refund?.refundId && (
                    <div className="mt-4 pt-4 border-t border-error/10 space-y-2">
                      <p className="text-xs tracking-[0.1em] uppercase text-ink-soft mb-2">
                        Refund summary
                      </p>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-soft">Order Cancelled</span>
                        <span className="text-ink">{formatDate(order.cancelledAt)}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-soft">
                          Refund {order.refund.status === "processed" ? "Successful" : "Initiated"}
                        </span>
                        <span className="text-ink">
                          ₹{order.refund.amount?.toLocaleString("en-IN")}
                        </span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-ink-soft">Reference ID</span>
                        <span className="text-ink font-mono text-[11px]">{order.refund.refundId}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )
          ) : (
            <>
              <DeliveryProgressTimeline key={timelineKey} order={order} delivery={currentDelivery} />

              {/* Track Shipment only makes sense once the order has actually
                  shipped — before that, statusHistory only has our own
                  order_created/awb_assigned events, not real Shiprocket
                  scan data, so there's nothing genuine to "track" yet. */}
              {["shipped", "delivered"].includes(order.orderStatus) &&
                currentDelivery?.statusHistory?.length > 0 && (
                  <button
                    onClick={() => setShowDetailedActivity((v) => !v)}
                    className="mt-1 flex items-center gap-1.5 text-[11px] tracking-[0.05em] uppercase text-ink-soft hover:text-ink transition-colors underline underline-offset-2"
                  >
                    <MapPin size={12} />
                    {showDetailedActivity ? "Hide Tracking" : "Track Shipment"}
                  </button>
                )}
              {showDetailedActivity && (
                <div className="mt-4">
                  <TrackingTimeline history={currentDelivery?.statusHistory} />
                </div>
              )}
            </>
          )}
        </div>

        {/* ── Shipping to ────────────────────────────── */}
        <div className="od-in border-t border-border pt-8 mb-8" style={{ animationDelay: "140ms" }}>
          <div className="flex items-center gap-2 mb-5">
            <MapPin size={14} className="text-gold" />
            <p className="text-xs tracking-[0.15em] text-ink-soft uppercase">
              Shipping to
            </p>
          </div>

          <div className="relative bg-surface border border-border rounded-lg p-6 pl-8 overflow-hidden">
            <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col justify-evenly items-center">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="w-1.5 h-1.5 rounded-full bg-cream border border-border" />
              ))}
            </div>
            <p className="text-ink font-medium mb-1">{order.shippingAddress?.name}</p>
            <p className="text-sm text-ink-soft leading-relaxed">
              {order.shippingAddress?.line1}
              {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}
              <br />
              {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
              {order.shippingAddress?.pincode}
            </p>
            <p className="text-sm text-ink-soft mt-2">{order.shippingAddress?.phone}</p>
          </div>
        </div>

        {/* ── Summary ────────────────────────────────── */}
        <div className="od-in mb-6" style={{ animationDelay: "200ms" }}>
          <div className="rounded-xl bg-charcoal text-cream p-6">
            <p className="font-display text-lg mb-5">Summary</p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-cream/70">
                <span>Subtotal</span>
                <span className="text-cream">₹{subtotal.toLocaleString("en-IN")}</span>
              </div>
              <div className="flex justify-between text-cream/70">
                <span>Shipping</span>
                <span className="text-gold uppercase text-xs tracking-wide self-center">
                  Complimentary
                </span>
              </div>
              <div className="flex justify-between items-end pt-4 border-t border-cream/15">
                <span className="text-xs tracking-[0.1em] uppercase text-cream/70">Total</span>
                <span className="font-display text-2xl">
                  ₹{subtotal.toLocaleString("en-IN")}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ────────────────────────────────── */}
        <div className="od-in space-y-4" style={{ animationDelay: "240ms" }}>
          {canCancel && (
            <button
              onClick={() => setShowCancelModal(true)}
              className="w-full py-4 rounded-full border border-error/30 text-error text-xs tracking-[0.15em] uppercase font-medium hover:bg-error/5 transition-colors duration-200"
            >
              Cancel order
            </button>
          )}
          <button
            onClick={() => toast("Invoice download coming soon")}
            className="w-full py-4 rounded-full border border-border text-ink text-xs tracking-[0.15em] uppercase font-medium hover:bg-cream-dark transition-colors duration-200"
          >
            Download invoice
          </button>
          <a
            href="mailto:support@zrive.com"
            className="block text-center text-xs tracking-[0.1em] uppercase text-ink-soft hover:text-ink transition-colors"
          >
            Need assistance?
          </a>
        </div>
      </div>

      <CancelOrderModal
        open={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        onConfirm={onConfirmCancel}
        loading={cancelling}
      />
    </div>
  );
};

export default OrderDetail;