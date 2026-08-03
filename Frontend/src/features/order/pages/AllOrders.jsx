import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { CheckCircle2, Truck, Clock, XCircle, ChevronRight, Inbox } from "lucide-react";
import useOrder from "../hook/useOrder";

// ── Status → badge config ──────────────────────────────────
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

// Progression order — jab ek group ke andar alag-alag status ho, sabse "kam advanced" wala dikhao
const STATUS_PRIORITY = { pending_payment: 0, failed: 0, cancelled: 0, placed: 1, shipped: 2, delivered: 3 };

// ── Filter pills ─────────────────────────────────────────
const FILTERS = [
  { key: "all",       label: "All",       match: () => true },
  { key: "ongoing",   label: "Ongoing",   match: (s) => ["pending_payment", "placed", "shipped"].includes(s) },
  { key: "delivered", label: "Delivered", match: (s) => s === "delivered" },
  { key: "cancelled", label: "Cancelled", match: (s) => ["cancelled", "failed"].includes(s) },
];

const formatDate = (iso, opts) => {
  if (!iso) return "—";
  return new Date(iso).toLocaleDateString(
    "en-IN",
    opts || { day: "numeric", month: "short", year: "numeric" }
  );
};

// ── Grouping helpers ─────────────────────────────────────
const getPaymentId = (order) =>
  order.payment && typeof order.payment === "object" ? order.payment._id : order.payment;

const getGroupStatus = (group) => {
  const statuses = group.map((o) => o.orderStatus);
  const unique = [...new Set(statuses)];
  if (unique.length === 1) return unique[0];
  return statuses.reduce((min, s) =>
    STATUS_PRIORITY[s] < STATUS_PRIORITY[min] ? s : min
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
    return {
      paymentId: getPaymentId(group[0]) || group[0]._id,
      orders: group,
      isMultiSeller: group.length > 1,
      primaryItem: allItems[0],
      extraCount: allItems.length - 1,
      total: group.reduce((sum, o) => sum + (o.sellerAmount?.amount || 0), 0),
      status: getGroupStatus(group),
      createdAt: group[0].createdAt,
    };
  });
};

const StatusBadge = ({ status, updatedAt }) => {
  const config = STATUS_CONFIG[status] || STATUS_CONFIG.placed;
  const Icon = config.icon;
  const label =
    status === "delivered"
      ? `Delivered on ${formatDate(updatedAt, { day: "numeric", month: "short" })}`
      : config.label;

  return (
    <span
      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium ${TONE_CLASSES[config.tone]}`}
    >
      <Icon size={13} strokeWidth={2} />
      {label}
    </span>
  );
};

const OrderCardSkeleton = () => (
  <div className="rounded-2xl bg-surface border border-border/60 p-5 animate-pulse">
    <div className="flex justify-between mb-4">
      <div className="h-6 w-32 bg-cream-dark rounded-full" />
      <div className="h-4 w-16 bg-cream-dark rounded-full" />
    </div>
    <div className="flex gap-4">
      <div className="w-24 h-24 rounded-xl bg-cream-dark shrink-0" />
      <div className="flex-1 space-y-2 py-1">
        <div className="h-4 w-3/4 bg-cream-dark rounded-full" />
        <div className="h-3 w-1/2 bg-cream-dark rounded-full" />
        <div className="h-5 w-20 bg-cream-dark rounded-full mt-3" />
      </div>
    </div>
  </div>
);

const AllOrders = () => {
  const navigate = useNavigate();
  const { handleGetOrders } = useOrder();
  const orders = useSelector((state) => state.order.orders);
  const loading = useSelector((state) => state.order.loading);
  const [activeFilter, setActiveFilter] = useState("all");

  useEffect(() => {
    handleGetOrders();
  }, []);

  const groupedOrders = useMemo(() => groupOrdersByPayment(orders), [orders]);

  const filteredGroups = useMemo(() => {
    const filter = FILTERS.find((f) => f.key === activeFilter);
    return groupedOrders.filter((g) => filter.match(g.status));
  }, [groupedOrders, activeFilter]);

  return (
    <div className="min-h-screen bg-cream px-6 pt-6 pb-16 md:pt-8">
      <style>{`
        @keyframes ord-fade-up {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .ord-card { animation: ord-fade-up 0.4s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .ord-card { animation: none !important; }
        }
      `}</style>

      <div className="mx-auto max-w-2xl">
        {/* ── Header ─────────────────────────────────── */}
        <div className="mb-6">
          <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-2">
            Order history
          </p>
          <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">
            Your orders
          </h1>
        </div>

        {/* ── Filter pills ───────────────────────────── */}
        <div className="flex gap-2.5 overflow-x-auto no-scrollbar mb-7 -mx-6 px-6">
          {FILTERS.map((f) => {
            const active = activeFilter === f.key;
            return (
              <button
                key={f.key}
                onClick={() => setActiveFilter(f.key)}
                className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-medium whitespace-nowrap transition-colors duration-200 ${
                  active
                    ? "bg-charcoal text-cream"
                    : "border border-border text-ink hover:border-gold/50"
                }`}
              >
                {f.label}
              </button>
            );
          })}
        </div>

        {/* ── Loading ────────────────────────────────── */}
        {loading && (
          <div className="space-y-5">
            <OrderCardSkeleton />
            <OrderCardSkeleton />
            <OrderCardSkeleton />
          </div>
        )}

        {/* ── Empty state ────────────────────────────── */}
        {!loading && filteredGroups.length === 0 && (
          <div className="border border-dashed border-border rounded-2xl py-16 text-center">
            <Inbox className="mx-auto mb-4 text-ink-soft" size={28} strokeWidth={1.5} />
            <p className="text-ink-soft mb-4">
              {orders.length === 0 ? "No orders yet." : "Nothing here."}
            </p>
            <button
              onClick={() => navigate("/")}
              className="text-sm text-gold hover:text-gold-deep underline underline-offset-4"
            >
              Start shopping
            </button>
          </div>
        )}

        {/* ── Order cards ────────────────────────────── */}
        {!loading && filteredGroups.length > 0 && (
          <div className="space-y-5">
            {filteredGroups.map((g, i) => (
              <div
                key={g.paymentId}
                onClick={() =>
                  g.isMultiSeller
                    ? navigate(`/orders/group/${g.paymentId}`)
                    : navigate(`/orders/${g.orders[0]._id}`)
                }
                style={{ animationDelay: `${i * 60}ms` }}
                className="ord-card cursor-pointer rounded-2xl bg-surface border border-border/60 shadow-[0_1px_2px_rgba(24,22,15,0.04)] p-5 transition-all duration-300 hover:border-gold/40 hover:-translate-y-0.5"
              >
                <div className="flex items-center justify-between mb-4">
                  <StatusBadge status={g.status} updatedAt={g.orders[0].updatedAt} />
                  <span className="text-xs text-ink-soft tracking-wide">
                    ID: #ZR-{g.paymentId.slice(-5).toUpperCase()}
                  </span>
                </div>

                <div className="flex gap-4">
                  <img
                    src={g.primaryItem?.images?.[0]?.url}
                    alt={g.primaryItem?.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0 border border-border/40"
                  />
                  <div className="flex-1 flex flex-col justify-between min-w-0">
                    <div>
                      <p className="font-display text-lg text-ink leading-snug truncate">
                        {g.primaryItem?.title}
                        {g.extraCount > 0 && (
                          <span className="text-ink-soft text-sm font-sans"> +{g.extraCount} more</span>
                        )}
                      </p>
                      <p className="text-sm text-ink-soft mt-1">
                        Purchased on {formatDate(g.createdAt)}
                      </p>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <p className="font-display text-xl text-ink">
                        ₹{g.total.toLocaleString("en-IN")}
                      </p>
                      <ChevronRight size={18} className="text-ink-soft" />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default AllOrders;