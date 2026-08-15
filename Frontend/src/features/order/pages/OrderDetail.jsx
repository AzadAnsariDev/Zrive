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
} from "lucide-react";
import toast from "react-hot-toast";
import useOrder from "../hook/useOrder.js";
import useDelivery from "../../delivery/hook/useDelivery.js";
import { setCurrentDelivery } from "../../delivery/state/deliverySlice.js";
import { useProduct } from "../../product/hook/useProduct";
import CancelOrderModal from "../components/CancelOrderModal";

// ---- Layout tokens (same family as AllOrders/Home/Collections) ------------
const SECTION_X = "px-5 md:px-6 lg:px-10";
const CONTAINER = "max-w-[1100px] mx-auto";

// ── Status → badge config ──────────────────────────────────
// tone values line up with the same TONE_CLASSES vocabulary used on the
// AllOrders list page, so a given status always reads the same color
// wherever the buyer sees it across the app.
const STATUS_CONFIG = {
  pending_payment: { label: "Awaiting payment", note: "We're waiting for your payment to confirm.", icon: Clock, tone: "pending" },
  placed: { label: "Placed", note: "Your order is being prepared.", icon: Check, tone: "neutral" },
  confirmed: { label: "Placed", note: "Your order is being prepared.", icon: Check, tone: "neutral" },
  packed: { label: "Placed", note: "Your order is being prepared.", icon: Check, tone: "neutral" },
  shipped: { label: "Shipped", note: "Your order is on its way.", icon: Truck, tone: "success" },
  delivered: { label: "Delivered", note: "This order has been delivered.", icon: Package, tone: "gold" },
  cancelled: { label: "Cancelled", note: "This order was cancelled.", icon: XCircle, tone: "error" },
  failed: { label: "Payment failed", note: "The payment for this order didn't go through.", icon: XCircle, tone: "error" },
};

const TONE_CLASSES = {
  neutral: "bg-cream-dark text-ink-soft",
  success: "bg-emerald-50 text-emerald-700",
  gold: "bg-gold/10 text-gold-deep",
  pending: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-600",
};

const CANCELLABLE_STATUSES = ["placed", "confirmed", "packed"];

const SELLER_REJECTION_REASONS = ["out_of_stock", "unable_to_fulfill", "other"];

const SELLER_REJECTION_LABEL = {
  out_of_stock: "the item went out of stock",
  unable_to_fulfill: "the seller couldn't fulfill it in time",
  other: "the seller was unable to fulfill this order",
};

const DELIVERY_TRACKABLE_STATUSES = ["placed", "confirmed", "packed", "shipped", "delivered"];

// ── Trust strip content ─────────────────────────────────────
const TRUST_ITEMS = [
  { icon: Truck, label: "Free Shipping", note: "On every order, no minimum" },
  { icon: RefreshCw, label: "Easy Returns", note: "7-day return window" },
  { icon: ShieldCheck, label: "Secure Payments", note: "100% protected checkout" },
  { icon: Headphones, label: "Dedicated Support", note: "We reply within hours" },
];

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

const formatEddDate = (edd) => {
  if (!edd) return null;
  const d = new Date(edd);
  if (isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
};

// ── Buyer-facing milestone sequence ─────────────────────────
const MILESTONE_SEQUENCE = ["order_created", "awb_assigned", "in_transit", "out_for_delivery", "delivered"];

const MILESTONE_META = {
  order_created: { label: "Order Placed", note: "We've received your order and notified the seller.", icon: Package },
  awb_assigned: { label: "Shipment Assigned", note: "A courier partner has been assigned to your order.", icon: Truck },
  in_transit: { label: "Shipped", note: "Your order has left the warehouse and is on its way.", icon: Navigation },
  out_for_delivery: { label: "Out for Delivery", note: "Your order is out for delivery today.", icon: MapPin },
  delivered: { label: "Delivered", note: "Your order has been delivered.", icon: PackageCheck },
};

// ---------------------------------------------------------------------
// Real Shiprocket data is messy in practice: the `status` field on a
// statusHistory entry is often coarse/reused (e.g. several entries still
// tagged "pickup_scheduled" long after actual pickup), while the real
// signal lives in the free-text `note` ("In Transit - Shipment picked up",
// "In Transit - Bag Added To Trip", etc). Trusting `status` alone is why
// the buyer timeline used to stay stuck on "Placed" — this classifier
// reads note text first (falling back to status) so real courier scans
// actually move the tracker.
// ---------------------------------------------------------------------
function classifyMilestone(entry) {
  const text = `${entry?.note || ""} ${entry?.status || ""}`.toLowerCase().replace(/_/g, " ");
  if (/\brto\b|return to origin/.test(text)) return "rto";
  if (/cancel/.test(text)) return "cancelled";
  if (/\bdelivered\b/.test(text)) return "delivered";
  if (/out\s*for\s*delivery/.test(text)) return "out_for_delivery";
  if (/picked\s*up|in\s*transit|manifest|bag\s*added|trip\s*arrived|origin\s*center|dispatch/.test(text)) return "in_transit";
  if (/awb|pickup\s*scheduled|out\s*for\s*pickup|courier\s*assign/.test(text)) return "awb_assigned";
  if (/order\s*(placed|created)/.test(text)) return "order_created";
  return null;
}

function buildMilestoneTimeline(order, delivery) {
  const history = delivery?.statusHistory || [];
  const reachedAt = {};

  history.forEach((entry) => {
    const milestone = classifyMilestone(entry);
    if (!milestone || milestone === "cancelled" || milestone === "rto") return;
    if (!reachedAt[milestone] || new Date(entry.timestamp) < new Date(reachedAt[milestone])) {
      reachedAt[milestone] = entry.timestamp;
    }
  });

  if (!reachedAt.order_created) {
    reachedAt.order_created = order.createdAt;
  }

  const terminalEntry = [...history].reverse().find((e) => ["cancelled", "rto"].includes(classifyMilestone(e)));

  const milestones = MILESTONE_SEQUENCE.map((key) => ({
    key,
    ...MILESTONE_META[key],
    reached: Boolean(reachedAt[key]),
    timestamp: reachedAt[key] || null,
  }));

  const lastReachedIndex = milestones.reduce((acc, m, i) => (m.reached ? i : acc), 0);

  return { milestones, lastReachedIndex, terminalEntry };
}

// Delivery doc can reach "in_transit"/"delivered" before order.orderStatus
// is synced on the order itself — read the milestone data too so the hero
// badge never sits stuck on "Placed" while the parcel has actually moved.
function getEffectiveOrderStatus(order, delivery) {
  if (["cancelled", "failed", "pending_payment"].includes(order.orderStatus)) {
    return order.orderStatus;
  }
  const history = delivery?.statusHistory || [];
  const reached = new Set(history.map(classifyMilestone).filter(Boolean));
  if (reached.has("delivered")) return "delivered";
  if (reached.has("out_for_delivery") || reached.has("in_transit")) return "shipped";
  return order.orderStatus;
}

// Entries that belong to the courier journey itself — used to filter the
// detailed "Track Shipment" log so it only starts once the parcel is
// actually picked up, instead of repeating the order_created/awb_assigned
// stuff already shown in the milestone bar above it.
const POST_PICKUP_MILESTONES = ["in_transit", "out_for_delivery", "delivered", "cancelled", "rto"];

// ---------------------------------------------------------------------
// DeliveryProgressTimeline — the buyer's main "where's my order" view.
// (Animation logic untouched — this was already working well.)
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
              {classifyMilestone(terminalEntry) === "rto" ? "Returned to Origin" : "Shipment Cancelled"}
            </p>
            <p className="text-xs text-ink-soft mt-1">{formatDate(terminalEntry.timestamp)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

// ---------------------------------------------------------------------
// Detailed scan-by-scan activity log — only the entries from actual
// pickup onward (order_created/awb_assigned are already shown in the
// milestone bar above, so repeating them here is just noise).
// ---------------------------------------------------------------------
const MILESTONE_LABELS = {
  in_transit: "Shipped",
  out_for_delivery: "Out for Delivery",
  delivered: "Delivered",
  rto: "Return Initiated",
  cancelled: "Cancelled",
};

const TrackingTimeline = ({ history }) => {
  if (!history || history.length === 0) return null;

  const sorted = [...history].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  const rows = [];
  let lastDayKey = null;
  let lastMilestone = null;
  sorted.forEach((entry, i) => {
    const dayKey = new Date(entry.timestamp).toDateString();
    if (dayKey !== lastDayKey) {
      rows.push({ type: "date", key: `date-${dayKey}`, dayKey });
      lastDayKey = dayKey;
    }
    const milestone = classifyMilestone(entry);
    const isMilestone = milestone !== lastMilestone;
    lastMilestone = milestone;
    rows.push({
      type: "entry",
      key: entry._id || `entry-${i}`,
      entry,
      milestone,
      isMilestone,
      isLatestOverall: i === 0,
    });
  });

  const isDelivered = classifyMilestone(sorted[0]) === "delivered";

  return (
    <div className="rounded-[3px] bg-surface border border-border p-5">
      <style>{`
        @keyframes tl-row-in { from { opacity: 0; transform: translateY(6px); } to { opacity: 1; transform: translateY(0); } }
        .tl-row { animation: tl-row-in 0.4s ease-out both; }
        @media (prefers-reduced-motion: reduce) { .tl-row { animation: none !important; } }
      `}</style>

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
              <div key={row.key} className="tl-row flex gap-3" style={{ animationDelay: `${idx * 0.03}s` }}>
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

          const { entry, milestone, isMilestone, isLatestOverall } = row;
          const isNegative = ["cancelled", "rto"].includes(milestone);
          const headline = MILESTONE_LABELS[milestone] || (entry.status || "").replace(/_/g, " ") || "Update";
          const location = entry.location;

          return (
            <div key={row.key} className="tl-row flex gap-3" style={{ animationDelay: `${idx * 0.03}s` }}>
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
                  <p className="text-[13px] leading-snug text-ink-soft">{entry.note || headline}</p>
                )}
                <p className="text-[11px] text-ink-soft/70 mt-0.5">
                  {new Date(entry.timestamp).toLocaleTimeString("en-IN", {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                  {location ? ` · ${location}` : ""}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// "You May Also Like" — recommendation card + data-shape helpers.
// Same field-safety conventions as Home.jsx's ProductCard, so once a real
// recommendation endpoint exists it's a straight swap of the fetch below.
// ---------------------------------------------------------------------
const formatRecPrice = (priceObj) => {
  if (priceObj === undefined || priceObj === null) return "";
  if (typeof priceObj === "number" || typeof priceObj === "string") return `₹${priceObj}`;
  if (typeof priceObj === "object") {
    const amount = priceObj.amount ?? priceObj.value;
    if (amount === undefined || amount === null) return "";
    const currency = priceObj.currency || "INR";
    const symbol = currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;
    return `${symbol}${amount}`;
  }
  return "";
};

const getRecName = (product) => product?.title || product?.name || "Product";

const getRecImage = (product) => {
  if (product?.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === "string" ? img : img?.url || "";
  }
  return product?.image || "";
};

const YouMayLikeCard = ({ product, onClick }) => (
  <div className="group cursor-pointer" onClick={onClick}>
    <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark rounded-[3px] mb-2.5">
      <img
        src={getRecImage(product)}
        alt={getRecName(product)}
        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
      />
    </div>
    <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">
      {product.brand || "Generic"}
    </p>
    <h3 className="font-display text-[13px] text-ink mb-0.5 truncate">{getRecName(product)}</h3>
    <span className="font-sans text-[12px] font-semibold text-ink">{formatRecPrice(product.price)}</span>
  </div>
);

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleGetOrderById, handleCancelOrder } = useOrder();
  const { handleGetDeliveryByOrderBuyer, handleTrackDeliveryBuyer } = useDelivery();
  const { handleGetProducts } = useProduct();

  const order = useSelector((state) => state.order.currentOrder);
  const loading = useSelector((state) => state.order.loading);
  const currentDelivery = useSelector((state) => state.delivery?.currentDelivery);
  const allProducts = useSelector((state) => state.product.products);

  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [showDetailedActivity, setShowDetailedActivity] = useState(false);

  const trackedDeliveryIdRef = useRef(null);

  useEffect(() => {
    handleGetOrderById(orderId);
  }, [orderId]);

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

  // TODO(backend): swap this for a real recommendation endpoint (e.g. by
  // category or purchase history). For now it just pulls from the general
  // product list and excludes items already in this order.
  useEffect(() => {
    if (!allProducts || allProducts.length === 0) handleGetProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const youMayLike = useMemo(() => {
    if (!allProducts?.length) return [];
    const orderedIds = new Set((order?.orderItems || []).map((it) => it.productId || it._id));
    return allProducts.filter((p) => !orderedIds.has(p._id)).slice(0, 6);
  }, [allProducts, order?.orderItems]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-ink-soft text-[13px]">Loading order...</p>
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
  const effectiveStatus = getEffectiveOrderStatus(order, currentDelivery);

  const config = isSellerRejected
    ? { label: "Cancelled by seller", note: "This order was cancelled by the seller.", icon: ShieldAlert, tone: "error" }
    : STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.placed;

  const StatusIcon = config.icon;

  const items = order.orderItems || [];
  const heroItem = items[0];
  const subtotal = order.sellerAmount?.amount ?? 0;
  const isTerminal = order.orderStatus === "cancelled" || order.orderStatus === "failed";
  const canCancel = CANCELLABLE_STATUSES.includes(order.orderStatus);

  const postPickupHistory = (currentDelivery?.statusHistory || []).filter((e) =>
    POST_PICKUP_MILESTONES.includes(classifyMilestone(e))
  );

  const timelineKey = `${currentDelivery?._id || "none"}-${currentDelivery?.statusHistory?.length || 0}-${order.orderStatus}`;

  return (
    <div className="min-h-screen bg-cream">
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

      {/* ── Top bar (fixes the old overlay-on-image button bug) ─────── */}
      <div className="sticky top-0 z-20 bg-cream/95 backdrop-blur border-b border-border">
        <div className={SECTION_X}>
          <div className={`${CONTAINER} h-14 md:h-16 flex items-center justify-between`}>
            <button
              type="button"
              onClick={() => navigate("/orders")}
              className="flex items-center gap-2 text-ink-soft hover:text-ink transition-colors"
              aria-label="Back to orders"
            >
              <ArrowLeft size={17} strokeWidth={1.75} />
              <span className="hidden sm:inline text-[11px] font-semibold tracking-[0.1em] uppercase">
                Back to Orders
              </span>
            </button>

            <p className="font-display text-[13px] md:text-[14px] text-ink absolute left-1/2 -translate-x-1/2">
              #ZR-{order._id.slice(-6).toUpperCase()}
            </p>
          </div>
        </div>
      </div>

      {/* ── Main content: image left (sticky on desktop), details right ── */}
      <section className={`${SECTION_X} py-6 md:py-10`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 lg:grid-cols-[380px_1fr] gap-8 lg:gap-14">
            {/* ================= LEFT: image column ================= */}
            <div className="od-in lg:sticky lg:top-24 lg:self-start">
              <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark rounded-[3px]">
                <img
                  src={heroItem?.images?.[0]?.url}
                  alt={heroItem?.title}
                  className="w-full h-full object-cover object-center"
                />
              </div>

              {items.length > 1 && (
                <div className="flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                  {items.map((item, idx) => (
                    <div
                      key={idx}
                      className="w-14 h-14 shrink-0 overflow-hidden bg-cream-dark rounded-[3px] border border-border"
                    >
                      <img
                        src={item.images?.[0]?.url}
                        alt={item.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-4">
                <span
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-semibold tracking-[0.02em] uppercase ${TONE_CLASSES[config.tone]}`}
                >
                  <StatusIcon size={12} strokeWidth={2.2} />
                  {config.label}
                </span>
              </div>
            </div>

            {/* ================= RIGHT: order details ================= */}
            <div>
              {/* Item(s) */}
              <div className="od-in mb-8">
                {items.length === 1 ? (
                  <>
                    <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">
                      Selected item
                    </p>
                    <h1 className="font-display text-[22px] md:text-[28px] text-ink leading-tight mb-1.5">
                      {heroItem?.title}
                    </h1>
                    <p className="text-[13px] text-ink-soft mb-4">Qty {heroItem?.quantity}</p>
                    <p className="font-sans text-[18px] font-semibold text-ink">
                      ₹{(heroItem?.price?.amount * heroItem?.quantity).toLocaleString("en-IN")}
                    </p>
                  </>
                ) : (
                  <>
                    <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-4">
                      {items.length} items in this order
                    </p>
                    <div className="space-y-4">
                      {items.map((item, idx) => (
                        <div key={idx} className="flex gap-3 items-center">
                          <img
                            src={item.images?.[0]?.url}
                            alt={item.title}
                            className="w-14 h-14 object-cover rounded-[3px] border border-border shrink-0"
                          />
                          <div className="flex-1 flex justify-between items-center min-w-0">
                            <div className="min-w-0">
                              <p className="text-ink text-[13px] font-medium mb-1 truncate">{item.title}</p>
                              <p className="text-[12px] text-ink-soft">Qty {item.quantity}</p>
                            </div>
                            <p className="font-sans text-[13px] font-semibold text-ink whitespace-nowrap ml-3">
                              ₹{(item.price?.amount * item.quantity).toLocaleString("en-IN")}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>

              {/* Delivery progress */}
              <div className="od-in border-t border-border pt-8 mb-8" style={{ animationDelay: "80ms" }}>
                <div className="flex items-center justify-between gap-3 mb-6">
                  <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-ink-soft">
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
                    <div className="relative rounded-[3px] bg-error/5 border border-error/20 p-6 overflow-hidden">
                      <div className="flex items-start gap-3.5">
                        <div className="shrink-0 w-9 h-9 rounded-full bg-error/10 flex items-center justify-center">
                          <ShieldAlert size={17} className="text-error" strokeWidth={2} />
                        </div>
                        <div className="flex-1">
                          <p className="font-display text-[17px] text-ink mb-1">
                            We're sorry about this one
                          </p>
                          <p className="text-[13px] text-ink-soft leading-relaxed">
                            This order was cancelled because {SELLER_REJECTION_LABEL[order.cancelReason]}.
                            {order.rejectionNote ? ` The seller added a note: "${order.rejectionNote}"` : ""}
                          </p>
                          <div className="flex items-center gap-2 mt-4 px-3 py-2 rounded-[3px] bg-cream border border-border/60 w-fit">
                            <ShieldAlert size={13} className="text-gold-deep shrink-0" />
                            <p className="text-[11.5px] text-ink-soft">
                              We've flagged this seller's account for review.
                            </p>
                          </div>

                          {order.refund?.refundId && (
                            <div className="mt-5 pt-5 border-t border-error/10 space-y-2">
                              <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft mb-2">
                                Refund summary
                              </p>
                              <div className="flex justify-between text-[12px]">
                                <span className="text-ink-soft">Order cancelled</span>
                                <span className="text-ink">{formatDate(order.cancelledAt)}</span>
                              </div>
                              <div className="flex justify-between text-[12px]">
                                <span className="text-ink-soft">
                                  Refund {order.refund.status === "processed" ? "successful" : "initiated"}
                                </span>
                                <span className="font-sans text-ink">
                                  ₹{order.refund.amount?.toLocaleString("en-IN")}
                                </span>
                              </div>
                              <div className="flex justify-between text-[12px]">
                                <span className="text-ink-soft">Reference ID</span>
                                <span className="text-ink font-mono text-[11px]">{order.refund.refundId}</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 rounded-[3px] bg-error/5 border border-error/20 p-4">
                      <XCircle size={18} className="text-error shrink-0 mt-0.5" strokeWidth={2} />
                      <div className="flex-1">
                        <p className="text-[13px] font-medium text-ink">{config.label}</p>
                        <p className="text-[12px] text-ink-soft mt-0.5">{config.note}</p>

                        {order.orderStatus === "cancelled" && order.refund?.refundId && (
                          <div className="mt-4 pt-4 border-t border-error/10 space-y-2">
                            <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft mb-2">
                              Refund summary
                            </p>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-ink-soft">Order Cancelled</span>
                              <span className="text-ink">{formatDate(order.cancelledAt)}</span>
                            </div>
                            <div className="flex justify-between text-[12px]">
                              <span className="text-ink-soft">
                                Refund {order.refund.status === "processed" ? "Successful" : "Initiated"}
                              </span>
                              <span className="font-sans text-ink">
                                ₹{order.refund.amount?.toLocaleString("en-IN")}
                              </span>
                            </div>
                            <div className="flex justify-between text-[12px]">
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

                    {postPickupHistory.length > 0 && (
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
                        <TrackingTimeline history={postPickupHistory} />
                      </div>
                    )}
                  </>
                )}
              </div>

              {/* Shipping to */}
              <div className="od-in border-t border-border pt-8 mb-8" style={{ animationDelay: "140ms" }}>
                <div className="flex items-center gap-2 mb-5">
                  <MapPin size={14} className="text-gold" />
                  <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-ink-soft">
                    Shipping to
                  </p>
                </div>

                <div className="relative bg-surface border border-border rounded-[3px] p-6 pl-8 overflow-hidden">
                  <div className="absolute left-0 top-0 bottom-0 w-5 flex flex-col justify-evenly items-center">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <span key={i} className="w-1.5 h-1.5 rounded-full bg-cream border border-border" />
                    ))}
                  </div>
                  <p className="text-ink font-medium mb-1">{order.shippingAddress?.name}</p>
                  <p className="text-[13px] text-ink-soft leading-relaxed">
                    {order.shippingAddress?.line1}
                    {order.shippingAddress?.line2 ? `, ${order.shippingAddress.line2}` : ""}
                    <br />
                    {order.shippingAddress?.city}, {order.shippingAddress?.state} —{" "}
                    {order.shippingAddress?.pincode}
                  </p>
                  <p className="text-[13px] text-ink-soft mt-2">{order.shippingAddress?.phone}</p>
                </div>
              </div>

              {/* Summary */}
              <div className="od-in mb-6" style={{ animationDelay: "200ms" }}>
                <div className="rounded-[3px] bg-charcoal text-cream p-6">
                  <p className="font-display text-[17px] mb-5">Summary</p>
                  <div className="space-y-3 text-[13px]">
                    <div className="flex justify-between text-cream/70">
                      <span>Subtotal</span>
                      <span className="font-sans text-cream">₹{subtotal.toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-cream/70">
                      <span>Shipping</span>
                      <span className="text-gold uppercase text-[11px] tracking-wide self-center">
                        Complimentary
                      </span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-cream/15">
                      <span className="text-[11px] tracking-[0.1em] uppercase text-cream/70">Total</span>
                      <span className="font-sans text-[22px] font-semibold">
                        ₹{subtotal.toLocaleString("en-IN")}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="od-in space-y-3" style={{ animationDelay: "240ms" }}>
                {canCancel && (
                  <button
                    onClick={() => setShowCancelModal(true)}
                    className="w-full py-3.5 rounded-[3px] border border-red-200 text-red-600 text-[11px] tracking-[0.1em] uppercase font-semibold hover:bg-red-50 transition-colors duration-200"
                  >
                    Cancel order
                  </button>
                )}
                <button
                  onClick={() => toast("Invoice download coming soon")}
                  className="w-full py-3.5 rounded-[3px] border border-border text-ink-soft hover:border-ink hover:text-ink text-[11px] tracking-[0.1em] uppercase font-semibold transition-colors duration-200"
                >
                  Download invoice
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ================= You May Also Like ================= */}
      {youMayLike.length > 0 && (
        <section className={`${SECTION_X} py-12 md:py-16 border-t border-border`}>
          <div className={CONTAINER}>
            <div className="mb-6 md:mb-8">
              <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
                Curated For You
              </p>
              <h2 className="font-display text-[20px] md:text-[26px] font-medium text-ink">
                You May Also Like
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-5">
              {youMayLike.map((p, idx) => (
                <YouMayLikeCard
                  key={p._id || idx}
                  product={p}
                  onClick={() => navigate(`/product/${p._id}`)}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= Trust strip ================= */}
      <section className={`${SECTION_X} py-10 md:py-12 border-t border-border bg-cream-dark`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
            {TRUST_ITEMS.map(({ icon: Icon, label, note }) => (
              <div key={label} className="flex flex-col items-center text-center gap-2">
                <Icon size={20} strokeWidth={1.5} className="text-gold-deep" />
                <p className="text-[11px] font-semibold tracking-[0.05em] uppercase text-ink">{label}</p>
                <p className="text-[11px] text-ink-soft">{note}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Need help CTA ================= */}
      <section className={`${SECTION_X} py-12 md:py-16 border-t border-border`}>
        <div className={`${CONTAINER} bg-charcoal rounded-[3px] px-6 py-10 md:py-12 text-center`}>
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">
            We're Here to Help
          </p>
          <h2 className="font-display text-[22px] md:text-[28px] font-medium text-cream mb-3">
            Questions about this order?
          </h2>
          <p className="text-[13px] text-cream/65 mb-6 max-w-md mx-auto">
            Our support team typically responds within a few hours.
          </p>
          <a
            href="mailto:support@zrive.com"
            className="inline-flex items-center gap-2 bg-cream text-ink text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3.5 rounded-[3px] hover:bg-surface transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>

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