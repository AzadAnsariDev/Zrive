import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import {
  Clock,
  Check,
  X,
  Package,
  MapPin,
  Phone,
  RefreshCw,
  AlertCircle,
  Loader2,
  ChevronRight,
  Undo2,
} from 'lucide-react'
import useSeller from '../hook/useSeller'

// ---------------------------------------------------------------------
// Static reference data
// ---------------------------------------------------------------------
const FILTERS = [
  { key: 'all', label: 'All' },
  { key: 'pending', label: 'Pending' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'timeout', label: 'Timed out' },
]

const STATUS_META = {
  placed: { label: 'Placed', dot: 'bg-gold' },
  confirmed: { label: 'Confirmed', dot: 'bg-success' },
  shipped: { label: 'Shipped', dot: 'bg-gold-deep' },
  delivered: { label: 'Delivered', dot: 'bg-success' },
  cancelled: { label: 'Cancelled', dot: 'bg-error' },
}

const REJECT_REASONS = [
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'unable_to_fulfill', label: "Can't fulfill in time" },
  { value: 'other', label: 'Other' },
]

// ---------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------
const formatMoney = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0)

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString('en-IN', {
        day: 'numeric',
        month: 'short',
        hour: 'numeric',
        minute: '2-digit',
      })
    : ''

const getCountdown = (createdAt, deadline) => {
  if (!deadline) return null
  const now = Date.now()
  const end = new Date(deadline).getTime()
  const start = new Date(createdAt).getTime()
  const remainingMs = end - now
  if (remainingMs <= 0) return { expired: true, label: 'Deadline passed', fraction: 0, urgency: 'error' }

  const totalMs = Math.max(end - start, 1)
  const fraction = Math.max(0, Math.min(1, remainingMs / totalMs))
  const hours = Math.floor(remainingMs / 3_600_000)
  const minutes = Math.floor((remainingMs % 3_600_000) / 60_000)
  const label = hours > 0 ? `${hours}h ${minutes}m left` : `${minutes}m left`
  const urgency = hours < 3 ? 'error' : hours < 12 ? 'gold' : 'success'
  return { expired: false, label, fraction, urgency }
}

const URGENCY_STROKE = {
  error: '#AE4A3C',
  gold: '#9C8A5C',
  success: '#4B7A5B',
}

// An order has "timed out" when it's still pending but its confirmation
// deadline has already passed (seller didn't accept/reject in time).
const isExpired = (order) =>
  order.confirmationStatus === 'pending' &&
  !!order.confirmationDeadline &&
  new Date(order.confirmationDeadline).getTime() < Date.now()

const matchesFilter = (order, key) => {
  switch (key) {
    case 'pending':
      return order.confirmationStatus === 'pending' && !isExpired(order)
    case 'accepted':
      return order.confirmationStatus === 'accepted'
    case 'rejected':
      return order.confirmationStatus === 'rejected'
    case 'timeout':
      return isExpired(order)
    default:
      return true
  }
}

// ---------------------------------------------------------------------
// Countdown ring — live, ticks every 30s. Grounded in the real seller
// workflow: confirm before the deadline or the order auto-lapses.
// ---------------------------------------------------------------------
const CountdownBadge = ({ createdAt, deadline }) => {
  const [, tick] = useState(0)

  useEffect(() => {
    const id = setInterval(() => tick((n) => n + 1), 30_000)
    return () => clearInterval(id)
  }, [])

  const info = getCountdown(createdAt, deadline)
  if (!info) return null

  const radius = 9
  const circumference = 2 * Math.PI * radius
  const offset = circumference * (1 - info.fraction)
  const stroke = URGENCY_STROKE[info.urgency]

  return (
    <div
      className={`flex items-center gap-1.5 rounded-full border px-2.5 py-1 ${
        info.urgency === 'error'
          ? 'border-error/30 bg-error/5'
          : info.urgency === 'gold'
          ? 'border-gold/30 bg-gold/5'
          : 'border-success/25 bg-success/5'
      }`}
    >
      <svg width="20" height="20" viewBox="0 0 20 20" className="shrink-0">
        <circle cx="10" cy="10" r={radius} fill="none" stroke="#E5DFD1" strokeWidth="2" />
        <circle
          cx="10"
          cy="10"
          r={radius}
          fill="none"
          stroke={stroke}
          strokeWidth="2"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          transform="rotate(-90 10 10)"
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <span className="text-[10.5px] font-semibold tracking-[0.02em]" style={{ color: stroke }}>
        {info.label}
      </span>
    </div>
  )
}

// ---------------------------------------------------------------------
// Reject reason modal
// ---------------------------------------------------------------------
const RejectModal = ({ order, onClose, onConfirm, submitting }) => {
  const [reason, setReason] = useState('out_of_stock')
  const [note, setNote] = useState('')

  return (
    <div
      className="fixed inset-0 z-50 flex items-end md:items-center justify-center bg-ink/40 backdrop-blur-sm animate-[fadeIn_0.2s_ease]"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        className="w-full md:w-[420px] max-h-[85vh] overflow-y-auto rounded-t-[6px] md:rounded-[4px] bg-surface border border-border p-6 animate-[slideUp_0.28s_cubic-bezier(0.16,1,0.3,1)]"
      >
        <div className="flex items-start justify-between mb-1">
          <p className="text-[11px] tracking-[0.14em] uppercase text-gold font-semibold">Decline order</p>
          <button onClick={onClose} className="text-ink-soft hover:text-ink transition-colors">
            <X size={18} />
          </button>
        </div>
        <h3 className="font-display text-[22px] text-ink mb-5">Let the buyer know why</h3>

        <div className="flex flex-col gap-2 mb-5">
          {REJECT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`text-left px-4 py-3 rounded-[3px] border text-[13.5px] transition-all ${
                reason === r.value
                  ? 'border-charcoal bg-charcoal text-cream'
                  : 'border-border text-ink-soft hover:border-gold/50 hover:text-ink'
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <label className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium">
          Note {reason === 'other' && <span className="text-error">*</span>}
        </label>
        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={3}
          placeholder="Add a short note for the buyer (optional)"
          className="mt-2 w-full resize-none rounded-[3px] border border-border bg-cream px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-soft/70 focus:outline-none focus:border-gold transition-colors"
        />

        <div className="flex gap-3 mt-6">
          <button
            onClick={onClose}
            className="flex-1 py-3 rounded-[3px] border border-border text-[12px] font-semibold tracking-[0.06em] uppercase text-ink-soft hover:text-ink hover:border-ink transition-colors"
          >
            Cancel
          </button>
          <button
            disabled={submitting || (reason === 'other' && !note.trim())}
            onClick={() => onConfirm(order._id, reason, note.trim())}
            className="flex-1 py-3 rounded-[3px] bg-error text-cream text-[12px] font-semibold tracking-[0.06em] uppercase hover:bg-[#943c30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Decline order
          </button>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------
// Single order card
// ---------------------------------------------------------------------
const OrderCard = ({ order, index, onAccept, onReject, actioningId }) => {
  const item = order.orderItems?.[0]
  const extraCount = (order.orderItems?.length || 1) - 1
  const status = STATUS_META[order.orderStatus] || STATUS_META.placed
  const expired = isExpired(order)
  const isPending = order.confirmationStatus === 'pending' && order.orderStatus !== 'cancelled' && !expired
  const isActioning = actioningId === order._id

  const mobileActionSlot = (
    <>
      {isPending ? (
        <>
          <button
            disabled={isActioning}
            onClick={() => onAccept(order._id)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[3px] bg-charcoal text-cream text-[11px] font-semibold tracking-[0.06em] uppercase hover:bg-ink transition-colors disabled:opacity-50"
          >
            {isActioning ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />}
            Accept
          </button>
          <button
            disabled={isActioning}
            onClick={() => onReject(order)}
            className="flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-[3px] border border-border text-ink-soft text-[11px] font-semibold tracking-[0.06em] uppercase hover:border-error hover:text-error transition-colors disabled:opacity-50"
          >
            <X size={13} />
            Decline
          </button>
        </>
      ) : expired ? (
        <span className="text-[12px] italic text-ink-soft">Confirmation window closed</span>
      ) : (
        <button className="flex items-center gap-1 text-[11.5px] font-semibold tracking-[0.04em] uppercase text-ink-soft hover:text-ink transition-colors">
          Details
          <ChevronRight size={14} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </>
  )

  // Desktop actions — side by side, compact. Stacked buttons in a narrow
  // column looked tall and empty; a single row matches the mobile pattern
  // and keeps the card height tighter.
  const desktopActionSlot = (
    <>
      {isPending ? (
        <>
          <button
            disabled={isActioning}
            onClick={() => onAccept(order._id)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[3px] bg-charcoal text-cream text-[10.5px] font-semibold tracking-[0.06em] uppercase hover:bg-ink transition-colors disabled:opacity-50"
          >
            {isActioning ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />}
            Accept
          </button>
          <button
            disabled={isActioning}
            onClick={() => onReject(order)}
            className="flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-[3px] border border-border text-ink-soft text-[10.5px] font-semibold tracking-[0.06em] uppercase hover:border-error hover:text-error transition-colors disabled:opacity-50"
          >
            <X size={12} />
            Decline
          </button>
        </>
      ) : expired ? (
        <span className="text-[11.5px] italic text-ink-soft text-right">Window closed</span>
      ) : (
        <button className="flex items-center justify-end gap-1 text-[11px] font-semibold tracking-[0.04em] uppercase text-ink-soft hover:text-ink transition-colors ml-auto">
          Details
          <ChevronRight size={13} className="transition-transform group-hover:translate-x-0.5" />
        </button>
      )}
    </>
  )

  const badgeSlot = isPending && order.confirmationDeadline ? (
    <CountdownBadge createdAt={order.createdAt} deadline={order.confirmationDeadline} />
  ) : expired ? (
    <div className="flex items-center gap-1.5 rounded-full border border-error/30 bg-error/5 px-2.5 py-1">
      <Clock size={12} className="text-error" />
      <span className="text-[10.5px] font-semibold text-error">Timed out</span>
    </div>
  ) : order.refund ? (
    <div className="flex items-center gap-1.5 rounded-full border border-gold/30 bg-gold/5 px-2.5 py-1">
      <Undo2 size={12} className="text-gold-deep" />
      <span className="text-[10.5px] font-semibold text-gold-deep capitalize">Refund {order.refund.status}</span>
    </div>
  ) : null

  return (
    <div
      className="group border border-border rounded-[4px] bg-surface px-4 py-3.5 lg:px-5 lg:py-4 transition-all duration-300 hover:border-gold/50 hover:shadow-[0_4px_24px_-8px_rgba(24,22,15,0.12)] animate-[fadeInUp_0.45s_cubic-bezier(0.16,1,0.3,1)_backwards]"
      style={{ animationDelay: `${Math.min(index, 8) * 55}ms` }}
    >
      {/* ============================================================ */}
      {/* MOBILE + TABLET (< lg) — stacked card, always safe to wrap    */}
      {/* ============================================================ */}
      <div className="lg:hidden">
        <div className="flex gap-3.5">
          <div className="relative shrink-0 w-16 h-16 rounded-[3px] overflow-hidden bg-cream-dark border border-border">
            {item?.images?.[0]?.url && (
              <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[16px] text-ink leading-snug truncate">{item?.title}</p>
            <p className="text-[12px] text-ink-soft mt-0.5">
              Qty {item?.quantity} {extraCount > 0 && `· +${extraCount} more`}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
              <span className="text-[11px] font-semibold tracking-[0.04em] text-ink-soft uppercase">
                {status.label}
              </span>
            </div>
          </div>
          <span className="font-display text-[16px] text-ink shrink-0">
            {formatMoney(order.sellerAmount?.amount, order.sellerAmount?.currency)}
          </span>
        </div>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border">
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 text-[12.5px] text-ink truncate">
              <MapPin size={12} className="text-ink-soft shrink-0" />
              {order.shippingAddress?.name} · {order.shippingAddress?.city}
            </div>
          </div>
          {badgeSlot}
        </div>

        <div className="flex items-center gap-2 mt-3">{mobileActionSlot}</div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP (>= lg, 1024px+) — two tight groups, no stray gaps.    */}
      {/* Left group (image + product) hugs its own content; right      */}
      {/* group (buyer, price, timer, actions) stays packed together.   */}
      {/* Only ONE natural gap sits between the two groups.              */}
      {/* ============================================================ */}
      <div className="hidden lg:flex lg:items-center lg:gap-6">
        {/* Left: product */}
        <div className="flex items-center gap-3.5 min-w-0 flex-1 max-w-[360px]">
          <div className="relative shrink-0 w-14 h-14 rounded-[3px] overflow-hidden bg-cream-dark border border-border">
            {item?.images?.[0]?.url && (
              <img
                src={item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
            )}
          </div>
          <div className="min-w-0">
            <p className="font-display text-[16px] text-ink leading-snug truncate">{item?.title}</p>
            <p className="text-[11.5px] text-ink-soft mt-0.5 truncate">
              Qty {item?.quantity} {extraCount > 0 && `· +${extraCount} more`}
            </p>
            <div className="flex items-center gap-1.5 mt-1.5">
              <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${status.dot}`} />
              <span className="text-[10.5px] font-semibold tracking-[0.03em] text-ink-soft uppercase">
                {status.label}
              </span>
            </div>
          </div>
        </div>

        {/* Right: buyer, price, badge, actions — packed, right-aligned */}
        <div className="flex items-center gap-6 shrink-0">
          <div className="w-[168px] min-w-0 pl-6 border-l border-border/70">
            <div className="flex items-center gap-1.5 text-[12.5px] text-ink truncate">
              <MapPin size={12} className="text-ink-soft shrink-0" />
              <span className="truncate">
                {order.shippingAddress?.name} · {order.shippingAddress?.city}
              </span>
            </div>
            <div className="flex items-center gap-1.5 text-[11.5px] text-ink-soft mt-1">
              <Phone size={11} className="shrink-0" />
              {order.shippingAddress?.phone}
            </div>
          </div>

          <span className="font-display text-[16px] text-ink w-[84px] text-right shrink-0">
            {formatMoney(order.sellerAmount?.amount, order.sellerAmount?.currency)}
          </span>

          <div className="w-[150px] flex justify-center shrink-0">{badgeSlot}</div>

          <div className="flex items-center gap-2 w-[190px] justify-end shrink-0">{desktopActionSlot}</div>
        </div>
      </div>

      {order.cancelReason && (
        <div className="mt-3 pt-3 border-t border-border text-[12px] text-ink-soft">
          Declined ·{' '}
          <span className="text-ink">{order.cancelReason.replace('seller_rejected_', '').replace(/_/g, ' ')}</span>
        </div>
      )}
    </div>
  )
}

const SkeletonCard = ({ index }) => (
  <div
    className="border border-border rounded-[4px] bg-surface p-5 h-[92px] overflow-hidden relative animate-[fadeIn_0.3s_ease]"
    style={{ animationDelay: `${index * 60}ms` }}
  >
    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cream-dark/60 to-transparent -translate-x-full animate-[shimmer_1.4s_ease_infinite]" />
  </div>
)

// ---------------------------------------------------------------------
// Page
// ---------------------------------------------------------------------
const SellerOrders = () => {
  const { handleGetSellerOrders, handleAcceptOrder, handleRejectOrder } = useSeller()
  const orders = useSelector((state) => state.seller?.allOrders) || []
  const loading = useSelector((state) => state.seller?.loading)
  const error = useSelector((state) => state.seller?.error)

  const [filter, setFilter] = useState('all')
  const [actioningId, setActioningId] = useState(null)
  const [rejectTarget, setRejectTarget] = useState(null)

  useEffect(() => {
    handleGetSellerOrders()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const counts = useMemo(() => {
    const c = { all: orders.length }
    FILTERS.forEach((f) => {
      if (f.key !== 'all') c[f.key] = orders.filter((o) => matchesFilter(o, f.key)).length
    })
    return c
  }, [orders])

  const visibleOrders = useMemo(
    () => (filter === 'all' ? orders : orders.filter((o) => matchesFilter(o, filter))),
    [orders, filter]
  )

  const pendingCount = useMemo(
    () =>
      orders.filter((o) => o.confirmationStatus === 'pending' && o.orderStatus !== 'cancelled' && !isExpired(o))
        .length,
    [orders]
  )

  const accept = async (orderId) => {
    setActioningId(orderId)
    await handleAcceptOrder(orderId)
    setActioningId(null)
  }

  const reject = async (orderId, reason, note) => {
    setActioningId(orderId)
    await handleRejectOrder(orderId, reason, note)
    setActioningId(null)
    setRejectTarget(null)
  }

  const isInitialLoading = loading && orders.length === 0

  return (
    <div className="min-h-screen bg-cream">
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(14px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes shimmer { 100% { transform: translateX(100%); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.001ms !important; animation-iteration-count: 1 !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      {/* Top progress hint during background refetch */}
      {loading && orders.length > 0 && (
        <div className="fixed top-0 left-0 right-0 h-[2px] bg-gold/20 z-40 overflow-hidden">
          <div className="h-full w-1/3 bg-gold animate-[shimmer_1s_ease_infinite]" />
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 md:px-8 pt-7 md:pt-12 pb-24 md:pb-16">
        {/* Header */}
        <div className="flex items-end justify-between mb-6 md:mb-8">
          <div>
            <p className="text-[11px] tracking-[0.16em] uppercase text-gold font-semibold mb-1.5">Manage</p>
            <h1 className="font-display text-[30px] md:text-[38px] text-ink leading-none">Orders</h1>
            <p className="text-[13px] text-ink-soft mt-2">
              {pendingCount > 0
                ? `${pendingCount} order${pendingCount > 1 ? 's' : ''} waiting on your confirmation`
                : "You're all caught up"}
            </p>
          </div>
          <button
            onClick={() => handleGetSellerOrders()}
            className="hidden md:flex items-center gap-2 px-4 py-2.5 rounded-[3px] border border-border text-ink-soft text-[12px] font-semibold tracking-[0.04em] uppercase hover:border-ink hover:text-ink transition-colors"
          >
            <RefreshCw size={13} className={loading ? 'animate-spin' : ''} />
            Refresh
          </button>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar mb-6 -mx-4 px-4 md:mx-0 md:px-0">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setFilter(f.key)}
              className={`shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-full border text-[12px] font-semibold tracking-[0.02em] transition-all ${
                filter === f.key
                  ? 'bg-charcoal text-cream border-charcoal'
                  : 'border-border text-ink-soft hover:text-ink hover:border-ink/40'
              }`}
            >
              {f.label}
              <span className={filter === f.key ? 'text-cream/60' : 'text-ink-soft/60'}>{counts[f.key] ?? 0}</span>
            </button>
          ))}
        </div>

        {/* Error banner */}
        {error && (
          <div className="flex items-center justify-between gap-3 mb-6 px-4 py-3 rounded-[3px] border border-error/30 bg-error/5">
            <div className="flex items-center gap-2 text-[13px] text-error">
              <AlertCircle size={16} />
              {error}
            </div>
            <button
              onClick={() => handleGetSellerOrders()}
              className="text-[11px] font-semibold uppercase tracking-[0.06em] text-error hover:underline shrink-0"
            >
              Retry
            </button>
          </div>
        )}

        {/* List */}
        {isInitialLoading ? (
          <div className="flex flex-col gap-3">
            {[0, 1, 2, 3].map((i) => (
              <SkeletonCard key={i} index={i} />
            ))}
          </div>
        ) : visibleOrders.length === 0 ? (
          <div className="flex flex-col items-center justify-center text-center py-24 border border-dashed border-border rounded-[4px]">
            <Package size={30} className="text-ink-soft/50 mb-3" />
            <p className="font-display text-[19px] text-ink mb-1">
              {filter === 'all' ? 'No orders yet' : `No ${filter} orders`}
            </p>
            <p className="text-[13px] text-ink-soft max-w-xs">
              {filter === 'all'
                ? "New orders will show up here the moment they're placed."
                : 'Try a different filter to see other orders.'}
            </p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {visibleOrders.map((order, i) => (
              <OrderCard
                key={order._id}
                order={order}
                index={i}
                onAccept={accept}
                onReject={setRejectTarget}
                actioningId={actioningId}
              />
            ))}
          </div>
        )}
      </div>

      {rejectTarget && (
        <RejectModal
          order={rejectTarget}
          submitting={actioningId === rejectTarget._id}
          onClose={() => setRejectTarget(null)}
          onConfirm={reject}
        />
      )}
    </div>
  )
}

export default SellerOrders