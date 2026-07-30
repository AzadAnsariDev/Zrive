import React from "react";
import { Link, useParams } from "react-router";
import { Check, Package, MapPin, ArrowRight } from "lucide-react";

// ─────────────────────────────────────────────────────────
// DUMMY DATA — jab Order model + Redux slice ban jaye,
// isse hata ke useSelector / RTK Query se orderId ke basis
// pe real order fetch karna. Shape same rakhna taaki
// neeche ka JSX bina change ke chal jaye.
// ─────────────────────────────────────────────────────────
const dummyOrder = {
  orderId: "ZRV-2026-08341",
  placedAt: "30 July 2026, 5:09 PM",
  paymentStatus: "paid",
  items: [
    {
      id: 1,
      title: "Premium Sunglasses",
      category: "ETHNIC WEAR",
      variant: "Fixed · Black",
      quantity: 5,
      pricePerUnit: 600,
      image:
        "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=200&h=200&fit=crop",
    },
  ],
  address: {
    name: "Rahul Sharma",
    line1: "402, Sunrise Apartments, Rajarampuri",
    line2: "Kolhapur, Maharashtra – 416008",
    phone: "+91 98765 43210",
  },
  subtotal: 3000,
  shipping: 0,
  total: 3000,
};

const OrderPlaced = () => {
  const { orderId } = useParams();
  const order = dummyOrder; // TODO: replace with fetched order using orderId

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-3xl mx-auto px-6 pt-6 pb-20 md:pt-8 md:pb-28">
        {/* ── Success hero ─────────────────────────────── */}
        <div className="flex flex-col items-center text-center mb-16">
          <div className="w-16 h-16 rounded-full border border-success/30 bg-success/10 flex items-center justify-center mb-8">
            <Check className="w-7 h-7 text-success" strokeWidth={2.5} />
          </div>

          <p className="text-xs tracking-[0.2em] text-gold uppercase mb-3">
            Order Confirmed
          </p>
          <h1 className="font-display text-4xl md:text-5xl text-ink mb-4">
            Thank you, {order.address.name.split(" ")[0]}
          </h1>
          <p className="text-ink-soft max-w-md">
            Your order has been placed successfully. A confirmation has been
            sent to your registered contact details.
          </p>

          <div className="mt-8 flex items-center gap-2 text-sm text-ink-soft">
            <span>Order</span>
            <span className="font-medium text-ink tracking-wide">
              #{order.orderId}
            </span>
            <span className="text-border">·</span>
            <span>{order.placedAt}</span>
          </div>
        </div>

        {/* ── Items ─────────────────────────────────────── */}
        <div className="border-t border-border pt-10 mb-10">
          <div className="flex items-center gap-2 mb-6">
            <Package className="w-4 h-4 text-gold" />
            <p className="text-xs tracking-[0.15em] text-ink-soft uppercase">
              {order.items.length} {order.items.length === 1 ? "Item" : "Items"}
            </p>
          </div>

          <div className="space-y-6">
            {order.items.map((item) => (
              <div key={item.id} className="flex gap-5">
                <img
                  src={item.image}
                  alt={item.title}
                  className="w-20 h-20 object-cover rounded-[3px] border border-border"
                />
                <div className="flex-1 flex justify-between">
                  <div>
                    <p className="text-xs tracking-[0.1em] text-gold uppercase mb-1">
                      {item.category}
                    </p>
                    <p className="font-display text-lg text-ink mb-1">
                      {item.title}
                    </p>
                    <p className="text-sm text-ink-soft">
                      {item.variant} · Qty {item.quantity}
                    </p>
                  </div>
                  <p className="font-medium text-ink">
                    ₹{item.pricePerUnit * item.quantity}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ── Address + Summary ───────────────────────────── */}
        <div className="grid md:grid-cols-2 gap-10 border-t border-border pt-10">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <MapPin className="w-4 h-4 text-gold" />
              <p className="text-xs tracking-[0.15em] text-ink-soft uppercase">
                Shipping To
              </p>
            </div>
            <p className="text-ink font-medium mb-1">{order.address.name}</p>
            <p className="text-sm text-ink-soft leading-relaxed">
              {order.address.line1}
              <br />
              {order.address.line2}
            </p>
            <p className="text-sm text-ink-soft mt-2">{order.address.phone}</p>
          </div>

          <div>
            <p className="text-xs tracking-[0.15em] text-ink-soft uppercase mb-4">
              Order Summary
            </p>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-ink-soft">Subtotal</span>
                <span className="text-ink">₹{order.subtotal}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-ink-soft">Shipping</span>
                <span className="text-ink">
                  {order.shipping === 0 ? "Free" : `₹${order.shipping}`}
                </span>
              </div>
              <div className="flex justify-between pt-3 border-t border-border">
                <span className="font-medium text-ink">Total Paid</span>
                <span className="font-display text-lg text-ink">
                  ₹{order.total}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Actions ─────────────────────────────────────── */}
        <div className="flex flex-col sm:flex-row gap-4 mt-16 pt-10 border-t border-border">
          <Link
            to="/orders"
            className="flex-1 flex items-center justify-center gap-2 py-4 bg-charcoal text-cream rounded-[3px] text-sm tracking-wide font-medium hover:bg-ink transition-colors"
          >
            View Order
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            to="/"
            className="flex-1 flex items-center justify-center py-4 border border-border text-ink rounded-[3px] text-sm tracking-wide font-medium hover:bg-cream-dark transition-colors"
          >
            Continue Shopping
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrderPlaced;