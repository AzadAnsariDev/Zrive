// ============================= SellerOrderDetail.jsx (SELLER) =============================
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
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
  Package,
  Navigation,
  PackageCheck,
  XCircle,
} from "lucide-react";
import useSeller from "../hook/useSeller";
import useDelivery from "../../delivery/hook/useDelivery.js";
import { setCurrentDelivery } from "../../delivery/state/deliverySlice.js";

const formatMoney = (amount, currency = "INR") =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount ?? 0);

const REJECT_REASONS = [
  { value: "out_of_stock", label: "Out of stock" },
  { value: "unable_to_fulfill", label: "Can't fulfill in time" },
  { value: "other", label: "Other" },
];

// ---------------------------------------------------------------------
// Same classifier used on the buyer side — raw Shiprocket `status` is
// coarse/reused across scan events, the real signal is in `note`. This
// is what turns the raw scan feed into the friendly "Shipped / Out for
// Delivery / Delivered" stages sellers actually want to see.
// ---------------------------------------------------------------------
function classifyMilestone(entry) {
  const text = `${entry?.note || ""} ${entry?.status || ""}`
    .toLowerCase()
    .replace(/_/g, " ");
  if (/\brto\b|return to origin/.test(text)) return "rto";
  if (/cancel/.test(text)) return "cancelled";
  if (/\bdelivered\b/.test(text)) return "delivered";
  if (/out\s*for\s*delivery/.test(text)) return "out_for_delivery";
  if (
    /picked\s*up|in\s*transit|manifest|bag\s*added|trip\s*arrived|origin\s*center|dispatch/.test(
      text,
    )
  )
    return "in_transit";
  if (/awb|pickup\s*scheduled|out\s*for\s*pickup|courier\s*assign/.test(text))
    return "awb_assigned";
  if (/order\s*(placed|created)/.test(text)) return "order_created";
  return null;
}

const SELLER_MILESTONE_SEQUENCE = [
  "awb_assigned",
  "in_transit",
  "out_for_delivery",
  "delivered",
];
const SELLER_MILESTONE_META = {
  awb_assigned: { label: "Shipment Assigned", icon: Truck },
  in_transit: { label: "Shipped", icon: Navigation },
  out_for_delivery: { label: "Out for Delivery", icon: MapPin },
  delivered: { label: "Delivered", icon: PackageCheck },
};

const formatDT = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      })
    : null;

// ---------------------------------------------------------------------
// Reject reason modal — same pattern as SellerOrders.jsx
// ---------------------------------------------------------------------
const RejectModal = ({ order, onClose, onConfirm, submitting }) => {
  const [reason, setReason] = useState("out_of_stock");
  const [note, setNote] = useState("");

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
          <p className="text-[11px] tracking-[0.14em] uppercase text-gold font-semibold">
            Decline order
          </p>
          <button
            onClick={onClose}
            className="text-ink-soft hover:text-ink transition-colors"
          >
            <X size={18} />
          </button>
        </div>
        <h3 className="font-display text-[22px] text-ink mb-5">
          Let the buyer know why
        </h3>

        <div className="flex flex-col gap-2 mb-5">
          {REJECT_REASONS.map((r) => (
            <button
              key={r.value}
              onClick={() => setReason(r.value)}
              className={`text-left px-4 py-3 rounded-[3px] border text-[13.5px] transition-all ${
                reason === r.value
                  ? "border-charcoal bg-charcoal text-cream"
                  : "border-border text-ink-soft hover:border-gold/50 hover:text-ink"
              }`}
            >
              {r.label}
            </button>
          ))}
        </div>

        <label className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium">
          Note {reason === "other" && <span className="text-error">*</span>}
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
            disabled={submitting || (reason === "other" && !note.trim())}
            onClick={() => onConfirm(order._id, reason, note.trim())}
            className="flex-1 py-3 rounded-[3px] bg-error text-cream text-[12px] font-semibold tracking-[0.06em] uppercase hover:bg-[#943c30] transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : null}
            Decline order
          </button>
        </div>
      </div>
    </div>
  );
};

// ---------------------------------------------------------------------
// Primary action — morphs "Accept Order" → "Request Pickup"
// ---------------------------------------------------------------------
const AcceptedAction = ({
  justAccepted,
  delivery,
  onSchedulePickup,
  scheduling,
}) => {
  const canSchedule = delivery?.status === "awb_assigned";
  const alreadyScheduled = [
    "pickup_scheduled",
    "picked_up",
    "in_transit",
    "delivered",
  ].includes(delivery?.status);

  if (alreadyScheduled) {
    return (
      <div className="text-center py-4 border border-border rounded-[4px] text-[13px] text-ink-soft capitalize">
        {delivery.status.replace(/_/g, " ")}
        {delivery.pickupScheduledDate && (
          <span className="text-ink">
            {" "}
            · Pickup:{" "}
            {new Date(delivery.pickupScheduledDate).toLocaleDateString("en-IN")}
          </span>
        )}
      </div>
    );
  }

  if (delivery?.status === "cancelled") {
    return (
      <div className="text-center py-4 border border-border rounded-[4px] text-[13px] text-ink-soft">
        Shipment cancelled
      </div>
    );
  }

  return (
    <button
      disabled={!canSchedule || scheduling}
      onClick={onSchedulePickup}
      className={`relative w-full overflow-hidden rounded-[3px] py-4 text-[12.5px] font-semibold tracking-[0.08em] uppercase transition-colors duration-500 ${
        justAccepted
          ? "bg-success text-cream"
          : canSchedule
            ? "bg-charcoal text-cream hover:bg-ink"
            : "bg-border text-ink-soft/60 cursor-not-allowed"
      }`}
    >
      <span
        className={`flex items-center justify-center gap-2 transition-all duration-500 ${
          justAccepted
            ? "opacity-0 -translate-y-2"
            : "opacity-100 translate-y-0"
        }`}
      >
        {scheduling ? (
          <Loader2 size={15} className="animate-spin" />
        ) : (
          <Truck size={15} />
        )}
        {canSchedule ? "Request Pickup" : "Preparing shipment"}
      </span>
      {justAccepted && (
        <span className="absolute inset-0 flex items-center justify-center gap-2 animate-[fadeIn_0.25s_ease]">
          <Check
            size={16}
            className="animate-[popIn_0.4s_cubic-bezier(0.34,1.56,0.64,1)]"
          />
          Order accepted
        </span>
      )}
    </button>
  );
};

// ---------------------------------------------------------------------
// SellerShipmentTimeline — friendly milestone view for the seller,
// replaces the old raw courier-scan dump. Reads the same messy
// statusHistory via classifyMilestone() so it stays in sync with what
// the buyer sees, just without buyer-facing copy.
// ---------------------------------------------------------------------
const SellerShipmentTimeline = ({ delivery }) => {
  const history = delivery?.statusHistory || [];
  const reachedAt = {};
  history.forEach((entry) => {
    const m = classifyMilestone(entry);
    if (!m || m === "cancelled" || m === "rto") return;
    if (!reachedAt[m] || new Date(entry.timestamp) < new Date(reachedAt[m])) {
      reachedAt[m] = entry.timestamp;
    }
  });
  const terminalEntry = [...history]
    .reverse()
    .find((e) => ["cancelled", "rto"].includes(classifyMilestone(e)));
  const milestones = SELLER_MILESTONE_SEQUENCE.map((key) => ({
    key,
    ...SELLER_MILESTONE_META[key],
    reached: Boolean(reachedAt[key]),
    timestamp: reachedAt[key] || null,
  }));
  const lastReachedIndex = milestones.reduce(
    (acc, m, i) => (m.reached ? i : acc),
    -1,
  );

  return (
    <div className="border border-border rounded-[4px] bg-surface p-4 mt-3">
      <style>{`
        @keyframes sdp-node-in { from { opacity: 0; transform: translateY(6px) scale(0.85); } to { opacity: 1; transform: translateY(0) scale(1); } }
        @keyframes sdp-segment-grow { from { transform: scaleY(0); } to { transform: scaleY(1); } }
        @keyframes sdp-pulse { 0% { transform: scale(0.85); opacity: 0.55; } 70% { transform: scale(2); opacity: 0; } 100% { transform: scale(2); opacity: 0; } }
        .sdp-node { animation: sdp-node-in 0.4s cubic-bezier(0.34,1.56,0.64,1) both; }
        .sdp-segment { transform-origin: top; animation: sdp-segment-grow 0.5s cubic-bezier(0.65,0,0.35,1) both; }
        .sdp-pulse { animation: sdp-pulse 2.2s cubic-bezier(0.4,0,0.6,1) infinite; }
        @media (prefers-reduced-motion: reduce) { .sdp-node, .sdp-segment, .sdp-pulse { animation: none !important; } }
      `}</style>
      <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium mb-4">
        Shipment Timeline
      </p>

      {milestones.map((m, idx) => {
        const isLast = idx === milestones.length - 1 && !terminalEntry;
        const segmentFilled = idx < lastReachedIndex;
        const isCurrent =
          idx === lastReachedIndex && m.reached && !terminalEntry;
        const Icon = m.icon;

        return (
          <div
            key={m.key}
            className="sdp-node relative flex gap-3 pb-7 last:pb-0"
            style={{ animationDelay: `${idx * 0.1}s` }}
          >
            {!isLast && (
              <>
                <span
                  className="absolute left-[13px] top-7 bottom-0 w-px bg-border"
                  aria-hidden="true"
                />
                {segmentFilled && (
                  <span
                    className="sdp-segment absolute left-[13px] top-7 bottom-0 w-px bg-gradient-to-b from-gold to-ink"
                    style={{ animationDelay: `${0.2 + idx * 0.18}s` }}
                    aria-hidden="true"
                  />
                )}
              </>
            )}
            <span className="relative shrink-0 w-7 h-7">
              {isCurrent && (
                <span
                  className="sdp-pulse absolute inset-0 rounded-full bg-gold/50"
                  aria-hidden="true"
                />
              )}
              <span
                className={`relative z-10 w-7 h-7 rounded-full flex items-center justify-center transition-colors duration-500 ${
                  m.reached
                    ? "bg-ink text-cream"
                    : "bg-cream-dark border border-border text-ink-soft/40"
                }`}
              >
                <Icon size={13} strokeWidth={2} />
              </span>
            </span>
            <div className="pt-0.5">
              <p
                className={`text-[12.5px] font-semibold ${m.reached ? "text-ink" : "text-ink-soft/50"}`}
              >
                {m.label}
              </p>
              <p className="text-[11px] text-ink-soft mt-0.5">
                {m.reached ? formatDT(m.timestamp) : "Pending"}
              </p>
            </div>
          </div>
        );
      })}

      {terminalEntry && (
        <div
          className="sdp-node relative flex gap-3"
          style={{ animationDelay: `${milestones.length * 0.1}s` }}
        >
          <span className="relative z-10 shrink-0 w-7 h-7 rounded-full flex items-center justify-center bg-error text-cream">
            <XCircle size={13} strokeWidth={2} />
          </span>
          <div className="pt-0.5">
            <p className="text-[12.5px] font-semibold text-error">
              {classifyMilestone(terminalEntry) === "rto"
                ? "Returned to Origin"
                : "Shipment Cancelled"}
            </p>
            <p className="text-[11px] text-ink-soft mt-0.5">
              {formatDT(terminalEntry.timestamp)}
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

const SellerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleAcceptOrder, handleRejectOrder } = useSeller();
  const {
    handleGetDeliveryByOrder,
    handleSchedulePickup,
    handleCancelDelivery,
    handleTrackDelivery,
  } = useDelivery();

  const order = useSelector((state) =>
    (state.seller?.allOrders || []).find((o) => o._id === orderId),
  );
  const currentDelivery = useSelector(
    (state) => state.delivery?.currentDelivery,
  );

  const [accepting, setAccepting] = useState(false);
  const [rejecting, setRejecting] = useState(false);
  const [scheduling, setScheduling] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [showTimeline, setShowTimeline] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [justAccepted, setJustAccepted] = useState(false);

  const accepted = order?.confirmationStatus === "accepted";
  const rejected = order?.confirmationStatus === "rejected";
  const item = order?.orderItems?.[0];
  const extraCount = (order?.orderItems?.length || 1) - 1;

  useEffect(() => {
    if (accepted) {
      setJustAccepted(true);
      const t = setTimeout(() => setJustAccepted(false), 900);
      return () => clearTimeout(t);
    }
  }, [accepted]);

  useEffect(() => {
    if (accepted) {
      handleGetDeliveryByOrder(orderId);
    }
    return () => {
      dispatch(setCurrentDelivery(null));
      setShowTimeline(false);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accepted, orderId]);

  const accept = async () => {
    setAccepting(true);
    await handleAcceptOrder(orderId);
    setAccepting(false);
  };

  const reject = async (id, reason, note) => {
    setRejecting(true);
    await handleRejectOrder(id, reason, note);
    setRejecting(false);
    setShowRejectModal(false);
    navigate("/seller/orders");
  };

  const schedulePickup = async () => {
    if (!currentDelivery?._id) return;
    setScheduling(true);
    await handleSchedulePickup(currentDelivery._id);
    setScheduling(false);
  };

  const cancelDelivery = async () => {
    if (!currentDelivery?._id) return;
    setCancelling(true);
    await handleCancelDelivery(currentDelivery._id);
    setCancelling(false);
  };

  const trackShipment = async () => {
    if (showTimeline) {
      setShowTimeline(false);
      return;
    }
    if (!currentDelivery?._id) return;
    setTrackingLoading(true);
    await handleTrackDelivery(currentDelivery._id);
    setTrackingLoading(false);
    setShowTimeline(true);
  };

  if (!order) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-[13px] text-ink-soft">Order not found.</p>
      </div>
    );
  }

  const showTrackRow =
    accepted && currentDelivery && currentDelivery.status !== "cancelled";
  const showCancelButton =
    showTrackRow &&
    !["picked_up", "in_transit", "delivered"].includes(currentDelivery.status);

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
          {accepted
            ? "Ready to ship"
            : rejected
              ? "Order declined"
              : "Confirm this order"}
        </h1>

        {/* Product */}
        <div className="flex gap-4 border border-border rounded-[4px] bg-surface p-4 mb-4 animate-[fadeInUp_0.4s_ease_backwards]">
          <div className="shrink-0 w-16 h-16 rounded-[3px] overflow-hidden bg-cream-dark border border-border">
            {item?.images?.[0]?.url && (
              <img
                src={item.images[0].url}
                alt={item.title}
                className="w-full h-full object-cover"
              />
            )}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-display text-[16px] text-ink truncate">
              {item?.title}
            </p>
            <p className="text-[12px] text-ink-soft mt-0.5">
              Qty {item?.quantity}{" "}
              {extraCount > 0 &&
                `· +${extraCount} more item${extraCount > 1 ? "s" : ""}`}
            </p>
          </div>
          <span className="font-display text-[16px] text-ink shrink-0">
            {formatMoney(
              order.sellerAmount?.amount,
              order.sellerAmount?.currency,
            )}
          </span>
        </div>

        {/* Buyer */}
        <div className="border border-border rounded-[4px] bg-surface p-4 mb-4 animate-[fadeInUp_0.4s_ease_0.05s_backwards]">
          <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium mb-2">
            Ship to
          </p>
          <div className="flex items-center gap-1.5 text-[13.5px] text-ink">
            <MapPin size={13} className="text-ink-soft shrink-0" />
            {order.shippingAddress?.name} ·{" "}
            {order.shippingAddress?.addressLine1}, {order.shippingAddress?.city}
          </div>
          <div className="flex items-center gap-1.5 text-[12.5px] text-ink-soft mt-1.5">
            <Phone size={12} className="shrink-0" />
            {order.shippingAddress?.phone}
          </div>
        </div>

        {/* Delivery status */}
        {!rejected && (
          <div className="border border-border rounded-[4px] bg-surface p-4 mb-6 animate-[fadeInUp_0.4s_ease_0.1s_backwards]">
            <p className="text-[11px] tracking-[0.1em] uppercase text-ink-soft font-medium mb-2">
              Shipment
            </p>
            <div className="flex items-center gap-2">
              <span
                className={`w-1.5 h-1.5 rounded-full ${accepted ? "bg-gold" : "bg-border"}`}
              />
              <span className="text-[13px] text-ink capitalize">
                {!accepted
                  ? "Waiting on order confirmation"
                  : currentDelivery
                    ? currentDelivery.status.replace(/_/g, " ")
                    : "Preparing shipment"}
              </span>
            </div>
            {currentDelivery?.courierName && (
              <p className="text-[12px] text-ink-soft mt-1.5">
                Courier: {currentDelivery.courierName}
              </p>
            )}
            {currentDelivery?.syncError && (
              <p className="text-[12px] text-error mt-1.5">
                {currentDelivery.syncError}
              </p>
            )}
          </div>
        )}

        {/* Primary action(s) */}
        {rejected ? (
          <div className="text-center py-4 border border-border rounded-[4px] text-[13px] text-ink-soft">
            You declined this order
            {order.cancelReason && (
              <span className="text-ink">
                {" "}
                ·{" "}
                {order.cancelReason
                  .replace("seller_rejected_", "")
                  .replace(/_/g, " ")}
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
              {accepting ? (
                <Loader2 size={15} className="animate-spin" />
              ) : (
                <Check size={15} />
              )}
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

        {/* Track + Cancel */}
        {showTrackRow && (
          <div className="flex gap-3 mt-3">
            <button
              disabled={trackingLoading}
              onClick={trackShipment}
              className="flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-border py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase text-ink-soft hover:border-ink hover:text-ink transition-colors disabled:opacity-50"
            >
              {trackingLoading ? (
                <Loader2 size={13} className="animate-spin" />
              ) : (
                <MapPin size={13} />
              )}
              {showTimeline ? "Hide Tracking" : "Track Shipment"}
            </button>
            {showCancelButton && (
              <button
                disabled={cancelling}
                onClick={cancelDelivery}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-error/40 py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase text-error hover:bg-error/5 transition-colors disabled:opacity-50"
              >
                {cancelling ? (
                  <Loader2 size={13} className="animate-spin" />
                ) : (
                  <X size={13} />
                )}
                Cancel Delivery
              </button>
            )}
          </div>
        )}

        {/* Friendly milestone timeline — replaces the old raw scan dump */}
        {showTimeline && <SellerShipmentTimeline delivery={currentDelivery} />}

        {/* Secondary actions */}
        {accepted && (
          <div className="flex gap-3 mt-3">
            <button
              disabled={!currentDelivery?.invoiceUrl}
              onClick={() =>
                currentDelivery?.invoiceUrl &&
                window.open(currentDelivery.invoiceUrl, "_blank")
              }
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-border py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors ${
                currentDelivery?.invoiceUrl
                  ? "text-ink-soft hover:border-ink hover:text-ink"
                  : "text-ink-soft/50 cursor-not-allowed"
              }`}
            >
              <FileText size={13} />
              Download Invoice
            </button>
            <button
              disabled={!currentDelivery?.labelUrl}
              onClick={() =>
                currentDelivery?.labelUrl &&
                window.open(currentDelivery.labelUrl, "_blank")
              }
              className={`flex-1 flex items-center justify-center gap-1.5 rounded-[3px] border border-border py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase transition-colors ${
                currentDelivery?.labelUrl
                  ? "text-ink-soft hover:border-ink hover:text-ink"
                  : "text-ink-soft/50 cursor-not-allowed"
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
  );
};

export default SellerOrderDetail;
