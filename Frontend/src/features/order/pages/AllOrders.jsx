import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  CheckCircle2,
  Truck,
  Clock,
  XCircle,
  Inbox,
  Package,
  Copy,
} from "lucide-react";
import useOrder from "../hook/useOrder";
import useDelivery from "../../delivery/hook/useDelivery";

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
// Shiprocket / delivery doc ka `status` field, jab order ke against ek
// delivery record ban chuka ho, hamesha zyada authoritative hota hai
// order.orderStatus se — delivery hi actual tracking source of truth hai.
// (Backend ab trackDelivery ke andar khud order.orderStatus sync kar
// deta hai — ye map ab safety-net hai, agar kisi wajah se backend sync
// abhi tak nahi chala to bhi UI sahi dikhega.)
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
        "pending_payment",
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

    return {
      paymentId: getPaymentId(group[0]) || group[0]._id,
      orders: group,
      isMultiSeller: group.length > 1,
      allItems,
      itemCount: allItems.length,
      total: originalTotal,
      activeTotal,
      refundStatus,
      refundedTotal: originalTotal - activeTotal,
      status: getGroupStatus(group),
      statusUpdatedAt: group[0].updatedAt,
      createdAt: group[0].createdAt,
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

const AllOrders = () => {
  const navigate = useNavigate();
  const { handleGetOrders } = useOrder();
  const { handleSyncOrderDeliveries } = useDelivery();
  const orders = useSelector((state) => state.order.orders);
  const loading = useSelector((state) => state.order.loading);
  const deliveries = useSelector((state) => state.delivery.deliveries);
  const [activeFilter, setActiveFilter] = useState("all");
  const [copiedId, setCopiedId] = useState(null);
  const hasTrackedRef = useRef(false);

  useEffect(() => {
    handleGetOrders();
  }, []);

  // Page khulte hi, orders load hone ke baad, ek baar active (non-terminal)
  // orders ki delivery live-track trigger karo — taaki delivered/shipped ho
  // chuke orders ka status turant sahi dikhe, bina manual refresh ke.
  // hasTrackedRef se guarantee: sirf ek baar chalega, dobara loop nahi banega.
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

  // delivery record ko order._id se lookup karne ke liye map
  const deliveryByOrderId = useMemo(() => {
    const map = new Map();
    for (const d of deliveries || []) {
      const orderId = typeof d.order === "object" ? d.order?._id : d.order;
      if (orderId) map.set(orderId, d);
    }
    return map;
  }, [deliveries]);

  // orders ke saath live/authoritative status merge karo — agar delivery
  // record ban chuka hai (shipment create ho chuki hai) to uska status
  // order.orderStatus se zyada trust karo, kyunki wahi actual tracking truth hai
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
      };
    });
  }, [orders, deliveryByOrderId]);

  const groupedOrders = useMemo(
    () => groupOrdersByPayment(ordersWithLiveStatus),
    [ordersWithLiveStatus],
  );

  const filteredGroups = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter);
    return groupedOrders.filter((g) => filter.match(g.status));
  }, [groupedOrders, activeFilter]);

  const handleCopyId = (e, id) => {
    e.stopPropagation();
    navigator.clipboard?.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId((c) => (c === id ? null : c)), 1500);
  };

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
          {/* ================= Header ================= */}
          <div className="mb-6 md:mb-8">
            <h1 className="font-display text-[26px] md:text-[32px] font-medium text-ink mb-1">
              All Orders
            </h1>
            <p className="text-[13px] text-ink-soft">
              Review your recent purchases and track shipments.
            </p>
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

          {/* ================= Empty state ================= */}
          {!loading && filteredGroups.length === 0 && (
            <div className="py-20 text-center">
              <Inbox
                className="mx-auto mb-4 text-ink-soft"
                size={26}
                strokeWidth={1.2}
              />
              <p className="font-display text-[16px] text-ink mb-1">
                {orders.length === 0 ? "No orders yet" : "Nothing here"}
              </p>
              <p className="text-[13px] text-ink-soft mb-5">
                {orders.length === 0
                  ? "Once you place an order, it'll show up here."
                  : "Try a different filter to see your other orders."}
              </p>
              <button
                type="button"
                onClick={() => navigate("/")}
                className="inline-flex items-center gap-2 bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] hover:bg-ink transition-colors"
              >
                Start Shopping
              </button>
            </div>
          )}

          {/* ================= Order rows ================= */}
          {!loading && filteredGroups.length > 0 && (
            <div className="divide-y divide-border">
              {filteredGroups.map((g, i) => {
                const showTrackOrder = ![
                  "delivered",
                  "cancelled",
                  "failed",
                ].includes(g.status);

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

                    {/* Bottom row: thumbnails  ⟷  actions */}
                    <div className="flex items-end justify-between gap-4 flex-wrap">
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

                      <div className="flex items-center gap-2">
                        {showTrackOrder && (
                          <button
                            type="button"
                            onClick={() =>
                              navigate(
                                g.isMultiSeller
                                  ? `/orders/group/${g.paymentId}`
                                  : `/orders/${g.orders[0]._id}`,
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
    </div>
  );
};

export default AllOrders;
