import React, { useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  ShoppingBag,
  Check,
  Clock,
  Truck,
  Package,
  XCircle,
  MapPin,
} from "lucide-react";
import toast from "react-hot-toast";
import useOrder from "../hook/useOrder";

// ── Status → hero badge + note ─────────────────────────────
const STATUS_CONFIG = {
  pending_payment: { label: "Awaiting payment", note: "We're waiting for your payment to confirm.", icon: Clock, tone: "pending" },
  placed:          { label: "Confirmed",        note: "Your order is being prepared.",              icon: Check, tone: "success" },
  shipped:         { label: "Shipped",          note: "Your order is on its way.",                   icon: Truck, tone: "info" },
  delivered:       { label: "Delivered",        note: "This order has been delivered.",              icon: Package, tone: "success" },
  cancelled:       { label: "Cancelled",        note: "This order was cancelled.",                   icon: XCircle, tone: "error" },
  failed:          { label: "Payment failed",   note: "The payment for this order didn't go through.", icon: XCircle, tone: "error" },
};

// ── Delivery progress steps ─────────────────────────────────
const STEPS = [
  { key: "placed", label: "Confirmed" },
  { key: "shipped", label: "Shipped" },
  { key: "delivered", label: "Delivered" },
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

const OrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { handleGetOrderById } = useOrder();

  const order = useSelector((state) => state.order.currentOrder);
  const loading = useSelector((state) => state.order.loading);

  useEffect(() => {
    handleGetOrderById(orderId);
  }, [orderId]);

  if (loading && !order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-ink-soft text-sm">Loading order...</p>
      </div>
    );
  }

  if (!order) return null;

  const config = STATUS_CONFIG[order.orderStatus] || STATUS_CONFIG.placed;
  const items = order.orderItems || [];
  const heroItem = items[0];
  const subtotal = order.sellerAmount?.amount ?? 0;
  const isTerminal = order.orderStatus === "cancelled" || order.orderStatus === "failed";
  const currentStepIndex = STEPS.findIndex((s) => s.key === order.orderStatus);

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
      <div className="relative w-full h-72 md:h-80 overflow-hidden">
        <img
          src={heroItem?.images?.[0]?.url}
          alt={heroItem?.title}
          className="w-full h-full object-cover"
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
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal text-cream text-[11px] font-medium tracking-[0.1em] uppercase">
              <span className="w-1.5 h-1.5 rounded-full bg-cream" />
              {config.label}
            </span>
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
          <p className="text-xs tracking-[0.15em] text-ink-soft uppercase mb-6">
            Delivery progress
          </p>

          {isTerminal ? (
            <div className="flex items-start gap-3 rounded-lg bg-error/5 border border-error/20 p-4">
              <XCircle size={18} className="text-error shrink-0 mt-0.5" strokeWidth={2} />
              <div>
                <p className="text-sm font-medium text-ink">{config.label}</p>
                <p className="text-xs text-ink-soft mt-0.5">{config.note}</p>
              </div>
            </div>
          ) : (
            <div className="relative pl-1">
              {STEPS.map((step, idx) => {
                const done = idx < currentStepIndex || order.orderStatus === "delivered" && idx <= currentStepIndex;
                const active = idx === currentStepIndex;
                const isLast = idx === STEPS.length - 1;
                const reached = idx <= currentStepIndex;

                return (
                  <div key={step.key} className="relative flex gap-4 pb-8 last:pb-0">
                    {!isLast && (
                      <span
                        className={`absolute left-[7px] top-4 w-px h-full ${
                          idx < currentStepIndex ? "bg-ink" : "bg-border"
                        }`}
                      />
                    )}
                    <span
                      className={`relative shrink-0 w-3.5 h-3.5 rounded-full mt-0.5 ${
                        reached ? "bg-ink" : "bg-cream-dark border border-border"
                      }`}
                    />
                    <div className="-mt-0.5">
                      <p
                        className={`text-xs font-semibold tracking-[0.1em] uppercase ${
                          reached ? "text-ink" : "text-ink-soft/60"
                        }`}
                      >
                        {step.label}
                      </p>
                      {active ? (
                        <>
                          <p className="text-xs text-ink-soft mt-1">
                            {formatDate(order.updatedAt || order.createdAt)}
                          </p>
                          <p className="text-sm text-ink-soft mt-2 leading-relaxed max-w-sm">
                            {config.note}
                          </p>
                        </>
                      ) : reached ? (
                        <p className="text-xs text-ink-soft mt-1">
                          {formatDate(order.createdAt)}
                        </p>
                      ) : (
                        <p className="text-xs text-ink-soft/60 mt-1">Pending</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
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
    </div>
  );
};

export default OrderDetail;