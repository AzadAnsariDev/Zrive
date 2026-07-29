import React, { useEffect, useState } from 'react'
import { Link } from 'react-router'
import { useSelector } from 'react-redux'
import { ArrowLeft, Minus, Plus, Trash2, ShoppingBag } from 'lucide-react'
import useCart from '../hook/useCart'
import { formatPrice } from '../../home/pages/Home'

// Scoped keyframes for entrance / removal / total-pulse / instant-feedback animations.
const CartAnimations = () => (
  <style>{`
    @keyframes cartFadeUp {
      from { opacity: 0; transform: translateY(14px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes totalPulse {
      0%   { color: #9C8A5C; transform: scale(1.08); }
      100% { color: #18160F; transform: scale(1); }
    }
    @keyframes numberPop {
      0%   { transform: scale(1); }
      35%  { transform: scale(1.28); color: #9C8A5C; }
      100% { transform: scale(1); color: #18160F; }
    }
    .cart-item-enter { animation: cartFadeUp 0.5s cubic-bezier(.22,.61,.36,1) both; }
    .cart-item-removing {
      max-height: 0 !important;
      opacity: 0 !important;
      transform: translateX(-16px);
      padding-top: 0 !important;
      padding-bottom: 0 !important;
      margin: 0 !important;
      border-color: transparent !important;
      overflow: hidden;
    }
    .cart-total-pulse { display: inline-block; animation: totalPulse 0.5s ease-out; transform-origin: right center; }
    .cart-number-pop { display: inline-block; animation: numberPop 0.4s ease-out; }

    @keyframes bagSway {
      0%, 100% { transform: rotate(-3deg); }
      50%      { transform: rotate(3deg); }
    }
    .empty-bag-sway { animation: bagSway 3.2s ease-in-out infinite; transform-origin: 100px 30px; }
    @keyframes emptyFadeUp {
      from { opacity: 0; transform: translateY(10px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    .empty-fade-1 { animation: emptyFadeUp 0.6s ease-out both; }
    .empty-fade-2 { animation: emptyFadeUp 0.6s ease-out 0.15s both; }
    .empty-fade-3 { animation: emptyFadeUp 0.6s ease-out 0.3s both; }
  `}</style>
)

const InfoRow = ({ label, value, strong }) => (
  <div className="flex justify-between py-3 border-t border-border">
    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-soft">{label}</span>
    <span className={`text-[13px] ${strong ? 'font-semibold text-ink' : 'text-ink-soft'}`}>{value}</span>
  </div>
)

const CartItemRow = ({ item, index, isRemoving, isPulsing, onIncrement, onDecrement, onRemove }) => {
  const variant = item.product?.variants
  const cover = variant?.images?.[0]?.url ?? item.product?.images?.[0]?.url

  // Safe fallback chain — avoids crashing when variant.priceOverride or item.price is missing.
  const unitPrice = variant?.price?.amount != null
    ? variant.price
    : variant?.priceOverride != null
    ? { amount: variant.priceOverride, currency: item.product?.price?.currency || 'INR' }
    : (item.price ?? item.product?.price ?? { amount: 0, currency: 'INR' })

  return (
    <div
      className={`flex gap-5 py-8 border-t border-border transition-all duration-400 ease-out ${
        isRemoving ? 'cart-item-removing' : 'cart-item-enter'
      }`}
      style={{ transitionDelay: isRemoving ? '0ms' : `${index * 60}ms`, animationDelay: `${index * 60}ms` }}
    >
      <div className="w-24 h-28 md:w-32 md:h-40 shrink-0 rounded-[3px] overflow-hidden bg-cream-dark">
        {cover ? (
          <img src={cover} alt={item.product?.title} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ShoppingBag size={18} strokeWidth={1.25} className="text-ink-soft" />
          </div>
        )}
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-1.5">
              {item.product?.category}
            </p>
            <h3 className="font-display text-[16px] md:text-[18px] text-ink leading-snug mb-1.5 truncate">
              {item.product?.title}
            </h3>
            {variant && (
              <div className="flex items-center gap-2">
                <span className="border border-border rounded-[3px] px-2.5 py-1 text-[10.5px] font-medium text-ink-soft">
                  {variant.size}
                </span>
                <span className="border border-border rounded-[3px] px-2.5 py-1 text-[10.5px] font-medium text-ink-soft">
                  {variant.color}
                </span>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={() => onRemove(item)}
            aria-label="Remove item"
            className="shrink-0 text-ink-soft hover:text-error transition-colors"
          >
            <Trash2 size={16} strokeWidth={1.5} />
          </button>
        </div>

        <div className="flex items-end justify-between mt-auto pt-6">
          <div className="flex items-center border border-border rounded-[3px]">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-ink hover:bg-cream-dark transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <Minus size={12} strokeWidth={2} />
            </button>
            <span className={`w-9 text-center text-[13px] font-medium text-ink tabular-nums ${isPulsing ? 'cart-number-pop' : ''}`}>
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              className="w-8 h-8 flex items-center justify-center text-ink hover:bg-cream-dark transition-colors"
            >
              <Plus size={12} strokeWidth={2} />
            </button>
          </div>

          <div className="text-right">
            <p className={`font-sans text-[15px] font-semibold text-ink ${isPulsing ? 'cart-number-pop' : ''}`}>
              {formatPrice({ ...unitPrice, amount: (unitPrice?.amount ?? 0) * item.quantity })}
            </p>
            {item.quantity > 1 && (
              <p className="text-[11px] text-ink-soft mt-0.5">{formatPrice(unitPrice)} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const EmptyBagIllustration = () => (
  <svg width="180" height="180" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
    {/* drop shadow */}
    <ellipse cx="103" cy="176" rx="34" ry="6" fill="#18160F" opacity="0.07" />

    {/* motion lines — implies the bag swinging, light and empty */}
    <g stroke="#8A8371" strokeWidth="1.6" strokeLinecap="round" opacity="0.7">
      <path d="M18 96 H34" />
      <path d="M14 108 Q34 108 42 100" fill="none" />
      <path d="M22 120 Q36 120 41 114" fill="none" />
    </g>

    {/* bag — sways gently */}
    <g className="empty-bag-sway">
      <path
        d="M79 72 C79 46 88 30 103 30 C118 30 127 46 127 72"
        stroke="#18160F"
        strokeWidth="2.2"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M65 72 H141 L131 166 C131 170.5 127.5 174 123 174 H83 C78.5 174 75 170.5 75 166 Z"
        fill="#F1ECE1"
        stroke="#18160F"
        strokeWidth="1.6"
      />
      <text x="103" y="130" textAnchor="middle" fontFamily="Georgia, serif" fontSize="30" fill="#9C8A5C">
        Z
      </text>
    </g>
  </svg>
)

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center text-center px-5">
    <div className="empty-fade-1">
      <EmptyBagIllustration />
    </div>
    <h2 className="empty-fade-2 font-display text-[26px] text-ink mt-2 mb-2">
      An Empty Canvas
    </h2>
    <p className="empty-fade-2 text-[13px] text-ink-soft mb-8 max-w-xs leading-relaxed">
      Your bag has nothing to carry yet. Discover a piece worth adding.
    </p>
    <div className="empty-fade-3 flex flex-col sm:flex-row items-center gap-3">
      <Link
        to="/all-products"
        className="bg-charcoal text-cream rounded-[3px] px-8 py-3.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
      >
        Explore The Collection
      </Link>
      <Link
        to="/wishlist"
        className="border border-charcoal text-charcoal rounded-[3px] px-8 py-3.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-cream-dark transition-colors"
      >
        From Your Wishlist
      </Link>
    </div>
  </div>
)

const Cart = () => {
  const { handleGetCart, handleAddToCart, handleRemoveCartItem } = useCart()
  const { items, totalPrice: subtotal, currency } = useSelector((state) => state.cart)

  const [loading, setLoading] = useState(true)
  const [removingIds, setRemovingIds] = useState(new Set())
  const [pulseTotal, setPulseTotal] = useState(false)
  const [pulsingItemId, setPulsingItemId] = useState(null)

  const fetchCartItems = async () => {
    await handleGetCart()
    setLoading(false)
  }

  useEffect(() => {
    fetchCartItems()
  }, [])


  // Fires an instant, localized pulse right where the click happened —
  // not tied to the network round-trip, so feedback is immediate.
  const triggerPulse = (item) => {
    setPulsingItemId(item._id)
    setPulseTotal(true)
    setTimeout(() => setPulsingItemId(null), 400)
    setTimeout(() => setPulseTotal(false), 500)
  }

  // ---------------- Quantity handlers ----------------
  const handleIncrement = async (item) => {
    triggerPulse(item)
    await handleAddToCart(item.product._id, item.variant)
    await fetchCartItems()
  }

  const handleDecrement = async (item) => {
    triggerPulse(item)
    await handleRemoveCartItem(item.product._id, item.variant, "decrement")
    await fetchCartItems()
    // TODO: dispatch(updateCartQuantity({ itemId: item._id, quantity: item.quantity - 1 }))
    console.log('decrement', item._id)
  }

  // ---------------- Remove handler (animated, stub — wire to real cart action later) ----------------
  const handleRemove = async (item) => {

    await handleRemoveCartItem(item.product._id, item.variant, "remove")
    await fetchCartItems()
    setTimeout(() => {
      // TODO: dispatch(removeCartItem(item._id)) — once removed from the store,
      // this item will naturally drop out of `items` and this local flag is irrelevant.
      console.log('remove', item._id)
    }, 400)
  }

  const isFreeShipping = subtotal >= 15000

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="font-display text-[20px] text-ink-soft animate-pulse">Loading your bag…</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <CartAnimations />

      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 py-5 md:py-8">
        <Link
          to="/all-products"
          className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft hover:text-ink transition-colors mb-5"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Continue Shopping
        </Link>

        <div className="mb-6">
          <h1 className="font-display text-[30px] md:text-[36px] text-ink leading-tight">Your Bag</h1>
          {items?.length > 0 && (
            <p className="text-[12px] text-ink-soft mt-1.5">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </p>
          )}
        </div>

        {(!items || items.length === 0) ? (
          <EmptyCart />
        ) : (
          <div className="grid lg:grid-cols-[1fr_400px] gap-12 lg:gap-16 items-start">
            {/* ── Item list ── */}
            <div>
              {items.map((item, i) => (
                <CartItemRow
                  key={item._id}
                  item={item}
                  index={i}
                  isRemoving={removingIds.has(item._id)}
                  isPulsing={pulsingItemId === item._id}
                  onIncrement={() => handleIncrement(item)}
                  onDecrement={handleDecrement}
                  onRemove={handleRemove}
                />
              ))}
            </div>

            {/* ── Order summary ── */}
            <div className="bg-surface border border-border rounded-[3px] p-4 lg:p-5 lg:sticky lg:top-32">
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-3">
                Order Summary
              </p>

              <InfoRow label="Subtotal" value={formatPrice({ amount: subtotal, currency })} />
              <InfoRow
                label="Shipping"
                value={isFreeShipping ? 'Complimentary' : `Free over ${formatPrice({ amount: 15000, currency })}`}
              />

              <div className="flex justify-between items-center py-3 border-t border-border mt-1">
                <span className="text-[12px] font-semibold tracking-[0.08em] uppercase text-ink">Total</span>
                <span className={`text-[20px] font-semibold text-ink ${pulseTotal ? 'cart-total-pulse' : ''}`}>
                  {formatPrice({ amount: subtotal, currency })}
                </span>
              </div>

              <button
                type="button"
                onClick={() => {}}
                className="w-full bg-charcoal text-cream rounded-[3px] py-4 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors mt-1"
              >
                Proceed to Checkout
              </button>

              <p className="text-[11px] text-ink-soft text-center mt-3 leading-relaxed">
                Secure checkout · Easy 14-day returns
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Cart