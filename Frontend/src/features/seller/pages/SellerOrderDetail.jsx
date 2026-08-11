import React, { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft,
  Check,
  X,
  Truck,
  FileText,
  Download,
  MapPin,
  Phone,
  Loader2,
} from 'lucide-react'
import useSeller from '../hook/useSeller'
import useDelivery from '../../delivery/hook/useDelivery.js'
import { setCurrentDelivery } from '../../delivery/state/deliverySlice.js'

const formatMoney = (amount, currency = 'INR') =>
  new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0)

const REJECT_REASONS = [
  { value: 'out_of_stock', label: 'Out of stock' },
  { value: 'unable_to_fulfill', label: "Can't fulfill in time" },
  { value: 'other', label: 'Other' },
]

// ---------------------------------------------------------------------
// Reject reason modal — same pattern as SellerOrders.jsx
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
// Primary action — morphs "Accept Order" → "Request Pickup" with a
// checkmark-burst once confirmed. Request Pickup only enables once AWB
// is actually assigned (delivery.status === 'awb_assigned'); before that
// it shows a disabled "Preparing shipment" state. Once pickup is
// scheduled (or beyond), it swaps to a status line instead of a button.
// ---------------------------------------------------------------------
const AcceptedAction = ({ justAccepted, delivery, onSchedulePickup, scheduling }) => {
  const canSchedule = delivery?.status === 'awb_assigned'
  const alreadyScheduled = ['pickup_scheduled', 'picked_up', 'in_transit', 'delivered'].includes(
    delivery?.status
  )

  if (alreadyScheduled) {
    return (
      <div className="text-center py-4 border border-border rounded-[4px] text-[13px] text-ink-soft capitalize">
        {delivery.status.replace(/_/g, ' ')}
        {delivery.pickupScheduledDate && (
          <span className="text-ink">
            {' '}
            · Pickup: {new Date(delivery.pickupScheduledDate).toLocaleDateString('en-IN')}
          </span>
        )}
      </div>
    )
  }

  if (delivery?.status === 'cancelled') {
    return (
      <div className="text-center py-4 border border-border rounded-[4px] text-[13px] text-ink-soft">
        Shipment cancelled
      </div>
    )
  }

  return (
    <button
      disabled={!canSchedule || scheduling}
      onClick={onSchedulePickup}
      className={`relative w-full overflow-hidden rounded-[3px] py-4 text-[12.5px] font-semibold tracking-[0.08em] uppercase transition-colors duration-500 ${
        justAccepted
          ? 'bg-success text-cream'
          : canSchedule
          ? 'bg-charcoal text-cream hover:bg-ink'
          : 'bg-border text-ink-soft/60 cursor-not-allowed'
      }`}
    >
      <span
        className={`flex items-center justify-center gap-2 transition-all duration-500 ${
          justAccepted ? 'opacity-0 -translate-y-2' : 'opacity-100 translate-y-0'
        }`}
      >
        {scheduling ? <Loader2 size={15} className="animate-spin" /> : <Truck size={15} />}
        {canSchedule ? 'Request Pickup' : 'Preparing shipment'}
      </span>
      {justAccepted && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 animate-[fadeIn_0.25s_ease]">
          <Check size={16} className="animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]" />
          Order accepted
        </span>
      )}
    </button>
  )
}

// ---------------------------------------------------------------------
// Status timeline — renders delivery.statusHistory (real Shiprocket
// scan-by-scan data, saved by the backend trackDelivery service).
// Oldest first, newest highlighted at the bottom. Only mounted when
// the seller toggles it open via the Track Shipment button.
// ---------------------------------------------------------------------
const StatusTimeline = ({ history }) => {
  if (!history || history.length === 0) return null

  const sorted = [...history].sort(
    (a, b) => new Date(a.timestamp) - new Date(b.timestamp)
  )

  return (
    <div className="border border-border rounded-[4px] bg-surface p-4 mt-3 animate-[fadeInUp_0.3s_ease_backwards]">
      <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium mb-3">
        Shipment Timeline
      </p>
      <div className="flex flex-col">
        {sorted.map((entry, i) => {
          const isLast = i === sorted.length - 1
          return (
            <div key={entry._id || i} className="flex gap-3">
              <div className="flex flex-col items-center">
                <span
                  className={`w-2.5 h-2.5 rounded-full shrink-0 mt-1 ${
                    isLast ? 'bg-gold' : 'bg-border'
                  }`}
                />
                {!isLast && <span className="w-px flex-1 bg-border" />}
              </div>
              <div className="pb-5">
                <p className={`text-[13px] leading-snug ${isLast ? 'text-ink font-medium' : 'text-ink-soft'}`}>
                  {entry.note || entry.status.replace(/_/g, ' ')}
                </p>
                <p className="text-[11px] text-ink-soft/70 mt-0.5">
                  {entry.location ? `${entry.location} · ` : ''}
                  {new Date(entry.timestamp).toLocaleString('en-IN', {
                    day: 'numeric',
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit',
                  })}
                </p>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

const SellerOrderDetail = () => {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { handleAcceptOrder, handleRejectOrder } = useSeller()
  const {
    handleGetDeliveryByOrder,
    handleSchedulePickup,
    handleCancelDelivery,
    handleTrackDelivery,
  } = useDelivery()

  const order = useSelector((state) => (state.seller?.allOrders || []).find((o) => o._id === orderId))
  const currentDelivery = useSelector((state) => state.delivery?.currentDelivery)

  const [accepting, setAccepting] = useState(false)
  const [rejecting, setRejecting] = useState(false)
  const [scheduling, setScheduling] = useState(false)
  const [cancelling, setCancelling] = useState(false)
  const [trackingLoading, setTrackingLoading] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showRejectModal, setShowRejectModal] = useState(false)
  const [justAccepted, setJustAccepted] = useState(false)

  const accepted = order?.confirmationStatus === 'accepted'
  const rejected = order?.confirmationStatus === 'rejected'
  const item = order?.orderItems?.[0]
  const extraCount = (order?.orderItems?.length || 1) - 1

  useEffect(() => {
    if (accepted) {
      setJustAccepted(true)
      const t = setTimeout(() => setJustAccepted(false), 900)
      return () => clearTimeout(t)
    }
  }, [accepted])

  // Order accepted hote hi delivery fetch karo. Cleanup — orderId badalne
  // ya page chhodne par purana delivery + timeline state clear karo taaki
  // agla order stale/galat status na dikhaye.
  useEffect(() => {
    if (accepted) {
      handleGetDeliveryByOrder(orderId)
    }
    return () => {
      dispatch(setCurrentDelivery(null))
      setShowTimeline(false)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted, orderId])

  const accept = async () => {
    setAccepting(true)
    await handleAcceptOrder(orderId)
    setAccepting(false)
  }

  const reject = async (id, reason, note) => {
    setRejecting(true)
    await handleRejectOrder(id, reason, note)
    setRejecting(false)
    setShowRejectModal(false)
    navigate('/seller/orders')
  }

  const schedulePickup = async () => {
    if (!currentDelivery?._id) return
    setScheduling(true)
    await handleSchedulePickup(currentDelivery._id)
    setScheduling(false)
  }

  const cancelDelivery = async () => {
    if (!currentDelivery?._id) return
    setCancelling(true)
    await handleCancelDelivery(currentDelivery._id)
    setCancelling(false)
  }

  // Toggle: pehli click pe fresh data fetch karke timeline kholo, dobara
  // click pe (jab already khuli ho) sirf band kar do — koi extra API
  // call nahi. Teesri click phir se fresh fetch karegi.
  const trackShipment = async () => {
    if (showTimeline) {
      setShowTimeline(false)
      return
    }
    if (!currentDelivery?._id) return
    setTrackingLoading(true)
    await handleTrackDelivery(currentDelivery._id)
    setTrackingLoading(false)
    setShowTimeline(true)
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-[13px] text-ink-soft">Order not found.</p>
      </div>
    )
  }

  const showTrackCancelRow =
    accepted && currentDelivery && !['cancelled', 'delivered'].includes(currentDelivery.status)
  const showCancelButton =
    showTrackCancelRow && !['picked_up', 'in_transit'].includes(currentDelivery.status)

  return (
    <div className="min-h-screen bg-cream">
      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes popIn { 0% { transform: scale(0.4); opacity: 0; } 60% { transform: scale(1.15); opacity: 1; } 100% { transform: scale(1); } }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(10px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideUp { from { opacity: 0; transform: translateY(24px); } to { opacity: 1; transform: translateY(0); } }
        @media (prefers-reduced-motion: reduce) {
          *, *::before, *::after { animation-duration: 0.001ms !important; transition-duration: 0.001ms !important; }
        }
      `}</style>

      <div className="max-w-2xl mx-auto px-4 md:px-8 pt-7 md:pt-12 pb-24">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-[12px] font-semibold tracking-[0.04em] uppercase text-ink-soft hover:text-ink transition-colors mb-6"
        >
          <ArrowLeft size={14} />
          Back to orders
        </button>

        <p className="text-[11px] tracking-[0.16em] uppercase text-gold font-semibold mb-1.5">
          Order #{order._id?.slice(-8)}
        </p>
        <h1 className="font-display text-[28px] md:text-[34px] text-ink leading-tight mb-6">
          {accepted ? 'Ready to ship' : rejected ? 'Order declined' : 'Confirm this order'}
        </h1>

        {/* Product */}
        <div className="flex gap-4 border border-border rounded-[4px] bg-surface p-4 mb-4 animate-[fadeInUp_0.4s_ease_backwards]">
          <div className="shrink-0 w-16 h-16 rounded-[3px] overflow-hidden bg-cream-dark border border-border">
            {item?.images?.[0]?.url && (
              <img src={item.images[0].url} alt={item.title} className="w-full h-full object-cover" />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[16px] text-ink truncate">{item?.title}</p>
            <p className="text-[12px] text-ink-soft mt-0.5">
              Qty {item?.quantity} {extraCount > 0 && `· +${extraCount} more item${extraCount > 1 ? 's' : ''}`}
            </p>
          </div>
          <span className="font-display text-[16px] text-ink shrink-0">
            {formatMoney(order.sellerAmount?.amount, order.sellerAmount?.currency)}
          </span>
        </div>

        {/* Buyer */}
        <div className="border border-border rounded-[4px] bg-surface p-4 mb-4 animate-[fadeInUp_0.4s_ease_0.05s_backwards]">
          <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium mb-2">Ship to</p>
          <div className="flex items-center gap-1.5 text-[13.5px] text-ink">
            <MapPin size={13} className="text-ink-soft shrink-0" />
            {order.shippingAddress?.name} · {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
          </div>
          <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft mt-1.5">
            <Phone size={12} className="shrink-0" />
            {order.shippingAddress?.phone}
          </div>
        </div>

        {/* Delivery status — real status once accepted + delivery fetched */}
        {!rejected && (
          <div className="border border-border rounded-[4px] bg-surface p-4 mb-6 animate-[fadeInUp_0.4s_ease_0.1s_backwards]">
            <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium mb-2">Shipment</p>
            <div className="flex items-center gap-2">
              <span className={`w-1.5 h-1.5 rounded-full ${accepted ? 'bg-gold' : 'bg-border'}`} />
              <span className="text-[13px] text-ink capitalize">
                {!accepted
                  ? 'Waiting on order confirmation'
                  : currentDelivery
                  ? currentDelivery.status.replace(/_/g, ' ')
                  : 'Preparing shipment'}
              </span>
            </div>
            {currentDelivery?.courierName && (
              <p className="text-[12px] text-ink-soft mt-1.5">Courier: {currentDelivery.courierName}</p>
            )}
            {currentDelivery?.syncError && (
              <p className="text-[12px] text-error mt-1.5">{currentDelivery.syncError}</p>
            )}
          </div>
        )}

        {/* Primary action(s) */}
        {rejected ? (
          <div className="text-center py-4 border border-border rounded-[4px] text-[13px] text-ink-soft">
            You declined this order
            {order.cancelReason && (
              <span className="text-ink">
                {' '}
                · {order.cancelReason.replace('seller_rejected_', '').replace(/_/g, ' ')}
              </span>
            )}
          </div>
        ) : accepted ? (
          <AcceptedAction
            justAccepted={justAccepted}
            delivery={currentDelivery}
            onSchedulePickup={schedulePickup}
            scheduling={scheduling}
          />
        ) : (
          <div className="flex gap-3">
            <button
              disabled={accepting || rejecting}
              onClick={accept}
              className="flex-1 flex items-center justify-center gap-2 rounded-[3px] bg-charcoal py-4 text-[12.5px] font-semibold tracking-[0.08em] uppercase text-cream hover:bg-ink transition-colors duration-300 disabled:opacity-50"
            >
              {accepting ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />}
              Accept Order
            </button>
            <button
              disabled={accepting || rejecting}
              onClick={() => setShowRejectModal(true)}
              className="flex-1 flex items-center justify-center gap-2 rounded-[3px] border border-border py-4 text-[12.5px] font-semibold tracking-[0.08em] uppercase text-ink-soft hover:border-error hover:text-error transition-colors duration-300 disabled:opacity-50"
            >
              <X size={15} />
              Decline
            </button>
          </div>
        )}

        {/* Track + Cancel — shown once a delivery exists and isn't already
            terminal. Cancel hides once the shipment is picked up / in
            transit, since Shiprocket won't allow cancelling past that point.
            Track Shipment toggles the timeline below: 1st click fetches +
            opens, 2nd click just closes (no refetch), 3rd click refetches. */}
        {showTrackCancelRow && (
          <div className="flex gap-3 mt-3">
            <button
              disabled={trackingLoading}
              onClick={trackShipment}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-border py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase text-ink-soft hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
            >
              {trackingLoading ? <Loader2 size={13} className="animate-spin" /> : <MapPin size={13} />}
              {showTimeline ? 'Hide Tracking' : 'Track Shipment'}
            </button>
            {showCancelButton && (
              <button
                disabled={cancelling}
                onClick={cancelDelivery}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-error/40 py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase text-error hover:bg-error/5 transition-colors disabled:opacity-50"
              >
                {cancelling ? <Loader2 size={13} className="animate-spin" /> : <X size={13} />}
                Cancel Delivery
              </button>
            )}
          </div>
        )}

        {/* Real timeline — only mounted when seller toggles it open via
            the Track Shipment button above. */}
        {showTimeline && <StatusTimeline history={currentDelivery?.statusHistory} />}

        {/* Secondary actions — real state now, not hardcoded disabled.
            Enable automatically once label/invoice URLs exist on the delivery. */}
        {accepted && (
          <div className="flex gap-3 mt-3">
            <button
              disabled={!currentDelivery?.invoiceUrl}
              onClick={() => currentDelivery?.invoiceUrl && window.open(currentDelivery.invoiceUrl, '_blank')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-border py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors ${
                currentDelivery?.invoiceUrl
                  ? 'text-ink-soft hover:border-ink hover:text-ink'
                  : 'text-ink-soft/50 cursor-not-allowed'
              }`}
            >
              <FileText size={13} />
              Download Invoice
            </button>
            <button
              disabled={!currentDelivery?.labelUrl}
              onClick={() => currentDelivery?.labelUrl && window.open(currentDelivery.labelUrl, '_blank')}
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-border py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors ${
                currentDelivery?.labelUrl
                  ? 'text-ink-soft hover:border-ink hover:text-ink'
                  : 'text-ink-soft/50 cursor-not-allowed'
              }`}
            >
              <Download size={13} />
              Download Label
            </button>
          </div>
        )}
      </div>

      {showRejectModal && (
        <RejectModal
          order={order}
          submitting={rejecting}
          onClose={() => setShowRejectModal(false)}
          onConfirm={reject}
        />
      )}
    </div>
  )
}

export default SellerOrderDetail