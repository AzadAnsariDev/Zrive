import React from "react";
import { Link, useParams } from "react-router";
import { ArrowRight, ShoppingBag } from "lucide-react";

// ─────────────────────────────────────────────────────────
// Confirmation page only — deliberately does NOT fetch or
// render order line-items here. A single payment can spawn
// multiple seller-wise Order documents, so "one order" isn't
// a meaningful concept on this screen. Full detail lives on
// /orders/:orderId (OrderDetail.jsx) after the person taps
// "View your orders".
// ─────────────────────────────────────────────────────────

const OrderPlaced = () => {
  const { orderRef } = useParams(); // razorpay_order_id from the URL, shown as a reference only

  return (
    <div className="min-h-screen bg-cream flex flex-col items-center justify-center px-6 pt-14 pb-16 md:pt-16">
      <style>{`
        @keyframes op-ring {
          0%   { transform: scale(0.8); opacity: 0.5; }
          100% { transform: scale(1.9); opacity: 0; }
        }
        @keyframes op-draw {
          to { stroke-dashoffset: 0; }
        }
        @keyframes op-pop {
          0%   { transform: scale(0.6); opacity: 0; }
          60%  { transform: scale(1.06); opacity: 1; }
          100% { transform: scale(1); opacity: 1; }
        }
        @keyframes op-fade-up {
          from { opacity: 0; transform: translateY(10px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .op-badge { animation: op-pop 0.5s cubic-bezier(.2,.8,.2,1) both; }
        .op-check-path {
          stroke-dasharray: 40;
          stroke-dashoffset: 40;
          animation: op-draw 0.5s 0.35s ease-out forwards;
        }
        .op-ring-1, .op-ring-2 {
          animation: op-ring 1.6s ease-out both;
        }
        .op-ring-2 { animation-delay: 0.25s; }
        .op-fade-1 { animation: op-fade-up 0.6s 0.55s ease-out both; }
        .op-fade-2 { animation: op-fade-up 0.6s 0.7s ease-out both; }
        .op-fade-3 { animation: op-fade-up 0.6s 0.85s ease-out both; }
        @media (prefers-reduced-motion: reduce) {
          .op-badge, .op-check-path, .op-ring-1, .op-ring-2,
          .op-fade-1, .op-fade-2, .op-fade-3 { animation: none !important; }
        }
      `}</style>

      <div className="w-full max-w-md flex flex-col items-center text-center">
        {/* ── Animated stamp ─────────────────────────────── */}
        <div className="relative w-24 h-24 mb-9 flex items-center justify-center">
          <span className="op-ring-1 absolute inset-0 rounded-full border border-success/40" />
          <span className="op-ring-2 absolute inset-0 rounded-full border border-success/30" />
          <div className="op-badge relative w-16 h-16 rounded-full bg-success/10 border border-success/30 flex items-center justify-center">
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none">
              <path
                className="op-check-path"
                d="M5 13l4 4L19 7"
                stroke="#4B7A5B"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </div>
        </div>

        <p className="op-fade-1 text-xs tracking-[0.2em] text-gold uppercase mb-3">
          Order Confirmed
        </p>
        <h1 className="op-fade-1 font-display text-3xl md:text-4xl text-ink mb-3 leading-tight">
          You're all set
        </h1>
        <p className="op-fade-2 text-ink-soft text-sm leading-relaxed max-w-xs">
          Payment received — we're getting your order ready. A confirmation
          has been sent to your registered contact details.
        </p>

        {orderRef && (
          <div className="op-fade-2 mt-6 flex items-center gap-2 text-xs text-ink-soft">
            <span className="uppercase tracking-[0.1em]">Reference</span>
            <span className="font-medium text-ink tracking-wide">
              {orderRef}
            </span>
          </div>
        )}

        <div className="op-fade-3 flex flex-col sm:flex-row gap-3 mt-11 w-full">
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-charcoal text-cream rounded-full text-sm tracking-wide font-medium hover:scale-[1.02] transition-transform duration-200"
          >
            View your orders
            <ArrowRight size={16} strokeWidth={2} />
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center gap-2 py-4 border border-border text-ink rounded-full text-sm tracking-wide font-medium hover:bg-cream-dark transition-colors duration-200"
          >
            <ShoppingBag size={15} strokeWidth={1.75} />
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;