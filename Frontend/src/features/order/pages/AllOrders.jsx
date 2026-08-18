import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector } from "react-redux";
import {
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Inbox,
  Package,
  Copy,
  Search,
  ChevronDown,
  RefreshCw,
  Star,
} from "lucide-react";
import useOrder from "../hook/useOrder";
import useDelivery from "../../delivery/hook/useDelivery";
import { useReview } from "../../review/hook/useReview";
import ReviewForm from "../../review/components/ReviewForm";
import { notify } from "../../../utils/toast";

// ---- Layout tokens (same as Home.jsx — keep every page consistent) --------
const SECTION_X = "px-5 md:px-6 lg:px-10";
const SECTION_Y = "py-6 md:py-8";
const CONTAINER = "max-w-[900px] mx-auto";

// ── Status → badge config ──────────────────────────────────
// "confirmed" and "packed" are internal seller-side stages — the
// buyer only ever sees "Placed" until the order actually ships.
const STATUS_CONFIG = {
  pending_payment: { icon: Clock, tone: "pending", label: "Awaiting Payment" },
  placed: { icon: CheckCircle2, tone: "neutral", label: "Placed" },
  confirmed: { icon: CheckCircle2, tone: "neutral", label: "Placed" },
  packed: { icon: CheckCircle2, tone: "neutral", label: "Placed" },
  shipped: { icon: Truck, tone: "success", label: "Shipped" },
  delivered: { icon: CheckCircle2, tone: "gold", label: "Delivered" },
  cancelled: { icon: XCircle, tone: "error", label: "Cancelled" },
  failed: { icon: XCircle, tone: "error", label: "Payment Failed" },
  partially_cancelled: {
    icon: XCircle,
    tone: "pending",
    label: "Partially Cancelled",
  },
};

const TONE_CLASSES = {
  neutral: "bg-cream-dark text-ink-soft",
  success: "bg-emerald-50 text-emerald-700",
  gold: "bg-gold/10 text-gold-deep",
  pending: "bg-amber-50 text-amber-700",
  error: "bg-red-50 text-red-600",
};

// Progression order — jab ek group ke andar alag-alag status ho, sabse "kam advanced" wala dikhao
const STATUS_PRIORITY = {
  pending_payment: 0,
  failed: 0,
  cancelled: 0,
  placed: 1,
  confirmed: 1,
  packed: 1,
  shipped: 2,
  delivered: 3,
};

// ── Delivery-model status → order-model status ─────────────────────────
const DELIVERY_STATUS_MAP = {
  delivered: "delivered",
  out_for_delivery: "shipped",
  in_transit: "shipped",
  picked_up: "shipped",
  shipped: "shipped",
  cancelled: "cancelled",
  rto_initiated: "cancelled",
  rto_delivered: "cancelled",
};

// ── Filter definitions ─────────────────────────────────────
const FILTERS = [
  { key: "all", label: "All", match: () => true },
  {
    key: "ongoing",
    label: "Ongoing",
    match: (s) =>
      [
        "placed",
        "confirmed",
        "packed",
        "shipped",
        "partially_cancelled",
      ].includes(s),
  },
  { key: "delivered", label: "Delivered", match: (s) => s === "delivered" },
  {
    key: "cancelled",
    label: "Cancelled",
    match: (s) => ["cancelled", "failed"].includes(s),
  },
];

// ── Help Center FAQ content ─────────────────────────────────
const FAQ_ITEMS = [
  {
    q: "Where's my order?",
    a: "Once your order ships, open it and hit \"Track Order\" for live courier updates, or check the delivery timeline on the Order Detail page for a full status history.",
  },
  {
    q: "Can I cancel an order?",
    a: "Yes — any order that hasn't shipped yet can be cancelled from its Order Detail page. Once a seller ships an item, cancellation is no longer available for that order.",
  },
  {
    q: "How do refunds work?",
    a: "Refunds go back to your original payment method automatically once a cancellation is processed, and usually reflect within 5–7 business days.",
  },
  {
    q: "Why did my order split into multiple deliveries?",
    a: "ZRIVE is a marketplace — if your cart has items from more than one seller, each seller ships separately, so you may see more than one parcel and tracking ID for a single order.",
  },
];

const formatDate = (iso, opts) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(
    "en-IN",
    opts || { day: "numeric", month: "short", year: "numeric" },
  );
};

// ── Grouping helpers (business logic) ───────────────────────
const getPaymentId = (order) =>
  order.payment && typeof order.payment === "object"
    ? order.payment._id
    : order.payment;

const getGroupStatus = (group) => {
  const statuses = group.map((o) => o.orderStatus);
  const unique = [...new Set(statuses)];
  if (unique.length === 1) return unique[0];

  const hasCancelled = statuses.includes("cancelled");
  const hasActive = statuses.some((s) => s !== "cancelled");
  if (hasCancelled && hasActive) return "partially_cancelled";

  return statuses.reduce((min, s) =>
    STATUS_PRIORITY[s] < STATUS_PRIORITY[min] ? s : min,
  );
};

const groupOrdersByPayment = (orders) => {
  const map = new Map();
  for (const order of orders) {
    const key = getPaymentId(order) || order._id; // fallback agar payment kabhi missing ho
    if (!map.has(key)) map.set(key, []);
    map.get(key).push(order);
  }

  return Array.from(map.values()).map((group) => {
    const allItems = group.flatMap((o) => o.orderItems || []);
    const originalTotal = group.reduce(
      (sum, o) => sum + (o.sellerAmount?.amount || 0),
      0,
    );
    const activeTotal = group
      .filter((o) => o.orderStatus !== "cancelled")
      .reduce((sum, o) => sum + (o.sellerAmount?.amount || 0), 0);

    const cancelledOrders = group.filter((o) => o.orderStatus === "cancelled");
    const refundStatus = cancelledOrders.length
      ? cancelledOrders.every((o) => o.refund?.status === "processed")
        ? "processed"
        : cancelledOrders.some((o) => o.refund?.status === "failed")
          ? "failed"
          : "initiated"
      : null;

    const itemNames = allItems.map((it) => it.title).filter(Boolean);
    const itemNamesLabel =
      itemNames.length > 2
        ? `${itemNames.slice(0, 2).join(", ")} +${itemNames.length - 2} more`
        : itemNames.join(", ");

    return {
      paymentId: getPaymentId(group[0]) || group[0]._id,
      orders: group,
      isMultiSeller: group.length > 1,
      allItems,
      itemCount: allItems.length,
      itemNamesLabel,
      total: originalTotal,
      activeTotal,
      refundStatus,
      refundedTotal: originalTotal - activeTotal,
      status: getGroupStatus(group),
      statusUpdatedAt: group[0].updatedAt,
      createdAt: group[0].createdAt,
      trackingAwb: group.find((o) => o.awbCode)?.awbCode || null,
    };
  });
};

const StatusBadge = ({ status, updatedAt }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  const Icon = config.icon;
  const label =
    status === "delivered"
      ? `Delivered ${formatDate(updatedAt, { day: "numeric", month: "short" })}`
      : config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[3px] text-[11px] font-semibold tracking-[0.02em] whitespace-nowrap ${TONE_CLASSES[config.tone]}`}
    >
      <Icon size={12} strokeWidth={2.2} />
      {label}
    </span>
  );
};

const OrderRowSkeleton = () => (
  <div className="py-6 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-4 w-32 bg-cream-dark rounded-[3px]" />
      <div className="h-5 w-20 bg-cream-dark rounded-[3px]" />
    </div>
    <div className="flex items-end justify-between">
      <div className="flex gap-2">
        <div className="w-16 h-16 bg-cream-dark rounded-[3px]" />
        <div className="w-16 h-16 bg-cream-dark rounded-[3px]" />
      </div>
      <div className="h-9 w-28 bg-cream-dark rounded-[3px]" />
    </div>
  </div>
);

const FilterTabs = ({ activeFilter, setActiveFilter }) => (
  <div className="flex items-center gap-6 overflow-x-auto no-scrollbar border-b border-border">
    {FILTERS.map((f) => {
      const active = activeFilter === f.key;
      return (
        <button
          key={f.key}
          type="button"
          onClick={() => setActiveFilter(f.key)}
          className={`relative flex-shrink-0 pb-3 text-[13px] font-medium tracking-[0.02em] transition-colors ${
            active ? "text-ink" : "text-ink-soft hover:text-ink"
          }`}
        >
          {f.label}
          {active && (
            <span className="absolute left-0 right-0 -bottom-px h-[2px] bg-ink" />
          )}
        </button>
      );
    })}
  </div>
);

// ── FAQ accordion row ────────────────────────────────────────
const FaqRow = ({ item, isOpen, onToggle }) => (
  <div className="py-4">
    <button
      type="button"
      onClick={onToggle}
      className="w-full flex items-center justify-between gap-4 text-left"
      aria-expanded={isOpen}
    >
      <span className="text-[13.5px] font-medium text-ink">{item.q}</span>
      <ChevronDown
        size={16}
        strokeWidth={1.75}
        className={`text-ink-soft shrink-0 transition-transform duration-300 ${
          isOpen ? "rotate-180" : ""
        }`}
      />
    </button>
    <div
      className={`grid transition-all duration-300 ease-out ${
        isOpen ? "grid-rows-[1fr] opacity-100 mt-2.5" : "grid-rows-[0fr] opacity-0"
      }`}
      style={{ overflow: "hidden" }}
    >
      <div className="min-h-0">
        <p className="text-[13px] text-ink-soft leading-relaxed pr-6">{item.a}</p>
      </div>
    </div>
  </div>
);

const AllOrders = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleGetOrders } = useOrder();
  const { handleSyncOrderDeliveries } = useDelivery();
  const { handleCheckEligibility, handleCreateReview } = useReview();
  const orders = useSelector((state) => state.order.orders);
  const loading = useSelector((state) => state.order.loading);
  const deliveries = useSelector((state) => state.delivery.deliveries);
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [openFaq, setOpenFaq] = useState(null);
  const hasTrackedRef = useRef(false);

  // ── Review state ──
  const [reviewModal, setReviewModal] = useState(null); // { productId, orderId }
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewedKeys, setReviewedKeys] = useState(new Set());

  // Refetch every time the user actually navigates to this screen, not just
  // the very first time it ever mounts. This route sits behind a persistent
  // bottom tab bar, so switching tabs and back doesn't remount the
  // component — an empty-deps effect would only ever fire once, and the
  // slice would keep showing stale data (e.g. orders you deleted directly
  // in the DB) forever until a full page reload. `location.key` changes on
  // every navigation entry, even revisiting the same route, so this effect
  // reliably re-runs each visit.
  useEffect(() => {
    handleGetOrders();
    hasTrackedRef.current = false; // allow the delivery-sync effect below to run again for this fresh load
  }, [location.key]);

  useEffect(() => {
    if (loading || hasTrackedRef.current || orders.length === 0) return;
    hasTrackedRef.current = true;

    const activeOrderIds = orders
      .filter(
        (o) => !["delivered", "cancelled", "failed"].includes(o.orderStatus),
      )
      .map((o) => o._id);

    if (activeOrderIds.length) {
      handleSyncOrderDeliveries(activeOrderIds);
    }
  }, [loading, orders]);

  const deliveryByOrderId = useMemo(() => {
    const map = new Map();
    for (const d of deliveries || []) {
      const orderId = typeof d.order === "object" ? d.order?._id : d.order;
      if (orderId) map.set(orderId, d);
    }
    return map;
  }, [deliveries]);

  const ordersWithLiveStatus = useMemo(() => {
    return orders.map((o) => {
      const delivery = deliveryByOrderId.get(o._id);
      const mapped = delivery?.status
        ? DELIVERY_STATUS_MAP[delivery.status.toLowerCase()]
        : null;
      if (!mapped) return o;
      return {
        ...o,
        orderStatus: mapped,
        updatedAt: delivery.updatedAt || o.updatedAt,
        awbCode: delivery.awbCode || null,
      };
    });
  }, [orders, deliveryByOrderId]);

  // Filter out pending_payment orders before grouping — these are incomplete
  // checkout sessions (payment never completed) and should never appear in
  // the order history page.
  const placedOrders = useMemo(
    () => ordersWithLiveStatus.filter((o) => o.orderStatus !== "pending_payment"),
    [ordersWithLiveStatus],
  );

  const groupedOrders = useMemo(
    () => groupOrdersByPayment(placedOrders),
    [placedOrders],
  );

  const searchedGroups = useMemo(() => {
    const q = searchQuery.trim().toLowerCase().replace(/^#/, "");
    if (!q) return groupedOrders;
    return groupedOrders.filter((g) => {
      const fullId = g.paymentId.toLowerCase();
      const shortId = g.paymentId.slice(-6).toLowerCase();
      const idMatch =
        fullId.includes(q) || shortId.includes(q) || `zr-${shortId}`.includes(q);
      const itemMatch = g.allItems.some((it) =>
        (it.title || "").toLowerCase().includes(q),
      );
      return idMatch || itemMatch;
    });
  }, [groupedOrders, searchQuery]);

  const filteredGroups = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter);
    return searchedGroups.filter((g) => filter.match(g.status));
  }, [searchedGroups, activeFilter]);

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    const shortId = `ZR-${id.slice(-6).toUpperCase()}`;
    navigator.clipboard?.writeText(shortId);
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
  };

  // ── Review handlers ──
  const openReviewModal = async (e, productId, orderId) => {
    e.stopPropagation();
    if (!productId || !orderId) return;

    const key = `${productId}-${orderId}`;
    if (reviewedKeys.has(key)) {
      notify.success("You've already shared your thoughts on this one!");
      return;
    }

    const res = await handleCheckEligibility(productId);
    if (res?.alreadyReviewed) {
      setReviewedKeys((prev) => new Set(prev).add(key));
      notify.success("You've already reviewed this item.");
      return;
    }
    if (!res?.canReview) {
      notify.error("This item isn't eligible for a review right now.");
      return;
    }
    setReviewModal({ productId, orderId });
  };

  const handleSubmitReview = async (data) => {
    setSubmittingReview(true);
    try {
      await handleCreateReview(reviewModal.productId, data);
      setReviewedKeys((prev) =>
        new Set(prev).add(`${reviewModal.productId}-${reviewModal.orderId}`),
      );
      notify.success("Thanks! Your review helps other shoppers.");
      setReviewModal(null);
    } catch (err) {
      throw err;
    } finally {
      setSubmittingReview(false);
    }
  };

  const noOrdersAtAll = !loading && orders.length === 0;
  const noSearchMatch = !loading && !noOrdersAtAll && filteredGroups.length === 0 && searchQuery.trim();
  const noFilterMatch = !loading && !noOrdersAtAll && filteredGroups.length === 0 && !searchQuery.trim();

  return (
    <div className="bg-cream text-ink min-h-screen">
      <style>{`
        @keyframes ord-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ord-row { animation: ord-fade-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) both; }
        @media (prefers-reduced-motion: reduce) {
          .ord-row { animation: none !important; }
        }
      `}</style>

      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <div className={CONTAINER}>
          {/* ================= Header + search ================= */}
          <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end md:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <h1 className="font-display text-[26px] md:text-[32px] font-medium text-ink">
                  All Orders
                </h1>
                <button
                  type="button"
                  onClick={() => handleGetOrders()}
                  disabled={loading}
                  title="Refresh"
                  className="p-1.5 rounded-full text-ink-soft hover:text-ink hover:bg-cream-dark transition-colors disabled:opacity-40"
                >
                  <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
                </button>
              </div>
              <p className="text-[13px] text-ink-soft">
                Review your recent purchases and track shipments.
              </p>
            </div>

            {orders.length > 0 && (
              <div className="relative w-full md:w-[280px] shrink-0">
                <Search
                  size={14}
                  strokeWidth={1.75}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-soft pointer-events-none"
                />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search by order ID or item"
                  className="w-full pl-9 pr-3 py-2.5 text-[13px] bg-surface border border-border rounded-[3px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-ink transition-colors"
                />
              </div>
            )}
          </div>

          {/* ================= Filter tabs ================= */}
          <FilterTabs
            activeFilter={activeFilter}
            setActiveFilter={setActiveFilter}
          />

          {/* ================= Loading ================= */}
          {loading && (
            <div className="divide-y divide-border">
              <OrderRowSkeleton />
              <OrderRowSkeleton />
              <OrderRowSkeleton />
            </div>
          )}

          {/* ================= Empty states ================= */}
          {(noOrdersAtAll || noSearchMatch || noFilterMatch) && (
            <div className="py-20 text-center">
              <Inbox
                className="mx-auto mb-4 text-ink-soft"
                size={26}
                strokeWidth={1.2}
              />
              <p className="font-display text-[16px] text-ink mb-1">
                {noOrdersAtAll
                  ? "No orders yet"
                  : noSearchMatch
                    ? "No matches found"
                    : "Nothing here"}
              </p>
              <p className="text-[13px] text-ink-soft mb-5">
                {noOrdersAtAll
                  ? "Once you place an order, it'll show up here."
                  : noSearchMatch
                    ? `We couldn't find an order matching "${searchQuery}".`
                    : "Try a different filter to see your other orders."}
              </p>
              <button
                type="button"
                onClick={() =>
                  noOrdersAtAll ? navigate("/") : setSearchQuery("")
                }
                className="inline-flex items-center gap-2 bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] hover:bg-ink transition-colors"
              >
                {noOrdersAtAll ? "Start Shopping" : noSearchMatch ? "Clear Search" : "View All"}
              </button>
            </div>
          )}

          {/* ================= Order rows ================= */}
          {!loading && filteredGroups.length > 0 && (
            <div className="divide-y divide-border">
              {filteredGroups.map((g, i) => {
                const showTrackOrder = g.status === "shipped" && g.trackingAwb;
                const showReviewCta = g.status === "delivered";
                const primaryItem = g.allItems[0];
                const reviewKey = `${primaryItem?.productId}-${g.orders[0]._id}`;
                const alreadyReviewed = reviewedKeys.has(reviewKey);

                return (
                  <div
                    key={g.paymentId}
                    style={{ animationDelay: `${i * 40}ms` }}
                    className="ord-row py-6"
                  >
                    {/* Top row: order id + placed date  ⟷  status + price */}
                    <div className="flex items-start justify-between mb-4 gap-3">
                      <div>
                        <button
                          type="button"
                          onClick={(e) => handleCopyId(e, g.paymentId)}
                          className="flex items-center gap-1.5 text-[13px] font-medium text-ink hover:text-ink-soft transition-colors"
                        >
                          Order #ZR-{g.paymentId.slice(-6).toUpperCase()}
                          <Copy
                            size={11}
                            strokeWidth={1.5}
                            className="text-ink-soft"
                          />
                          {copiedId === g.paymentId && (
                            <span className="text-gold-deep text-[11px]">
                              Copied
                            </span>
                          )}
                        </button>
                        <p className="text-[12px] text-ink-soft mt-0.5">
                          Placed on {formatDate(g.createdAt)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <StatusBadge
                          status={g.status}
                          updatedAt={g.statusUpdatedAt}
                        />
                        <span className="font-sans text-[16px] md:text-[17px] font-semibold text-ink">
                          ₹{g.activeTotal.toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Bottom row: thumbnails + names  ⟷  actions */}
                    <div className="flex items-end justify-between gap-4 flex-wrap">
                      <div className="flex flex-col gap-2 min-w-0">
                        <div className="flex items-center gap-2">
                          {g.allItems.slice(0, 4).map((item, idx) => (
                            <div
                              key={idx}
                              className="w-16 h-16 overflow-hidden bg-cream-dark rounded-[3px]"
                            >
                              <img
                                src={item.images?.[0]?.url}
                                alt={item.title}
                                className="w-full h-full object-cover"
                              />
                            </div>
                          ))}
                          {g.itemCount > 4 && (
                            <div className="w-16 h-16 flex items-center justify-center bg-cream-dark rounded-[3px] text-[11px] font-semibold text-ink-soft">
                              +{g.itemCount - 4}
                            </div>
                          )}
                          {g.isMultiSeller && (
                            <span className="flex items-center gap-1 text-[9.5px] font-medium text-ink-soft ml-1">
                              <Package size={10} strokeWidth={1.5} />
                              Multi-seller
                            </span>
                          )}
                        </div>
                        <p className="text-[12px] text-ink-soft truncate max-w-[420px]">
                          {g.itemNamesLabel}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        {showReviewCta && (
                          <button
                            type="button"
                            onClick={(e) =>
                              openReviewModal(
                                e,
                                primaryItem?.productId,
                                g.orders[0]._id,
                              )
                            }
                            disabled={alreadyReviewed}
                            className={`flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase px-5 py-2.5 rounded-[3px] transition-colors ${
                              alreadyReviewed
                                ? "border border-border text-ink-soft/60 cursor-default"
                                : "border border-gold/50 text-gold-deep hover:bg-gold/10"
                            }`}
                          >
                            <Star size={12} fill={alreadyReviewed ? "currentColor" : "none"} />
                            {alreadyReviewed ? "Reviewed" : "Write a Review"}
                          </button>
                        )}
                        {showTrackOrder && (
                          <button
                            type="button"
                            onClick={() =>
                              window.open(
                                `https://shiprocket.co/tracking/${g.trackingAwb}`,
                                "_blank",
                                "noopener,noreferrer",
                              )
                            }
                            className="bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-5 py-2.5 rounded-[3px] hover:bg-ink transition-colors"
                          >
                            Track Order
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() =>
                            navigate(
                              g.isMultiSeller
                                ? `/orders/group/${g.paymentId}`
                                : `/orders/${g.orders[0]._id}`,
                            )
                          }
                          className="border border-border text-ink-soft hover:border-ink hover:text-ink transition-colors text-[11px] font-semibold tracking-[0.1em] uppercase px-5 py-2.5 rounded-[3px]"
                        >
                          View Details
                        </button>
                      </div>
                    </div>

                    {/* Refund note, if any */}
                    {g.refundedTotal > 0 && (
                      <p className="text-[11px] text-red-600 mt-3">
                        ₹{g.refundedTotal.toLocaleString("en-IN")}{" "}
                        {g.refundStatus === "processed"
                          ? "refunded"
                          : g.refundStatus === "failed"
                            ? "refund failed"
                            : "refund initiated"}
                        {" · "}
                        <span className="text-ink-soft line-through">
                          ₹{g.total.toLocaleString("en-IN")} original
                        </span>
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* ================= Help Center (FAQ) ================= */}
      <section className={`${SECTION_X} py-12 md:py-16 border-t border-border bg-cream-dark`}>
        <div className={CONTAINER}>
          <div className="mb-8 md:mb-10 text-center">
            <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
              Help Center
            </p>
            <h2 className="font-display text-[20px] md:text-[26px] font-medium text-ink">
              Common questions
            </h2>
          </div>
          <div className="max-w-[640px] mx-auto divide-y divide-border">
            {FAQ_ITEMS.map((item, idx) => (
              <FaqRow
                key={item.q}
                item={item}
                isOpen={openFaq === idx}
                onToggle={() => setOpenFaq((cur) => (cur === idx ? null : idx))}
              />
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
            Questions about your orders?
          </h2>
          <p className="text-[13px] text-cream/65 mb-6 max-w-md mx-auto">
            Our support team typically responds within a few hours.
          </p>
          <a
            href="mailto:azadansaridev@gmail.com"
            className="inline-flex items-center gap-2 bg-cream text-ink text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3.5 rounded-[3px] hover:bg-surface transition-colors"
          >
            Contact Support
          </a>
        </div>
      </section>

      {reviewModal && (
        <ReviewForm
          onClose={() => setReviewModal(null)}
          onSubmit={handleSubmitReview}
          submitting={submittingReview}
        />
      )}
    </div>
  );
};

export default AllOrders;