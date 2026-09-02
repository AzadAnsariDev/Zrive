import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router";
import { useDispatch, useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  X,
  Truck,
  FileText,
  MapPin,
  Package,
  Navigation,
  PackageCheck,
  XCircle,
  ExternalLink,
  ShieldCheck,
  Phone,
} from "lucide-react";
import useSeller from "../hook/useSeller";
import useDelivery from "../../delivery/hook/useDelivery.js";
import { setCurrentDelivery } from "../../delivery/state/deliverySlice.js";
import { notify } from "../../../utils/toast";
import { OrderDetailSkeleton } from "../../../components/common/Skeleton";

const formatMoney = (amount) => `₹${(Number(amount) || 0).toLocaleString("en-IN")}`;

const formatDate = (iso) =>
  iso
    ? new Date(iso).toLocaleString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "—";

const SellerOrderDetail = () => {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const {
    handleGetOrderById,
    handleAcceptOrder,
    handleRejectOrder,
  } = useSeller();
  const { trackDeliveryByOrderId } = useDelivery();

  const order = useSelector((state) => state.seller.currentOrder);
  const currentDelivery = useSelector((state) => state.delivery.currentDelivery);

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [showAcceptModal, setShowAcceptModal] = useState(false);
  const [rejectReason, setRejectReason] = useState("out_of_stock");

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        const ord = await handleGetOrderById(orderId);
        if (ord && ["confirmed", "shipped", "delivered"].includes(ord.orderStatus)) {
          const del = await trackDeliveryByOrderId(orderId);
          if (del) dispatch(setCurrentDelivery(del));
        }
      } catch (err) {
        notify.error(err, "Failed to load order details.");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [orderId]);

  if (loading || !order) {
    return <OrderDetailSkeleton />;
  }

  const isTimeout =
    order.confirmationStatus === "expired" ||
    order.confirmationStatus === "timeout" ||
    order.cancelReason === "seller_no_response" ||
    (order.confirmationStatus === "pending" &&
      !!order.confirmationDeadline &&
      new Date(order.confirmationDeadline).getTime() < Date.now());

  const isCancelled = order.orderStatus === "cancelled" || Boolean(order.cancelReason);
  const isPending = order.confirmationStatus === "pending" && !isTimeout && !isCancelled;
  const isAccepted = order.confirmationStatus === "accepted";
  const isRejected = (order.confirmationStatus === "rejected" || isCancelled) && !isTimeout;

  const displayStatus = isTimeout
    ? "TIMED OUT"
    : isCancelled
    ? "CANCELLED"
    : (order.confirmationStatus || order.orderStatus || "PENDING").toUpperCase();

  const onAccept = () => {
    setShowAcceptModal(true);
  };

  const onReject = async () => {
    setSubmitting(true);
    try {
      await handleRejectOrder(order._id, rejectReason);
      notify.success("Order rejected");
      await handleGetOrderById(order._id);
      setShowRejectModal(false);
    } catch (err) {
      notify.error(err, "Failed to reject order.");
    } finally {
      setSubmitting(false);
    }
  };

  const address = order.shippingAddress || order.address;
  const buyerName = address?.name || address?.fullName || order.user?.name || "Buyer";
  const phone = address?.phone || order.user?.phone || "—";
  const line1 = address?.line1 || address?.streetAddress || address?.addressLine1 || "";
  const line2 = address?.line2 || address?.addressLine2 || "";
  const city = address?.city || "";
  const state = address?.state || "";
  const pincode = address?.pincode || "";
  const addressType = address?.addressType;

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header Bar */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/seller/orders")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Orders List
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Merchant Fulfillment View
          </span>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6 space-y-6">
        {/* Sub-Order Header */}
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-6 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span
                className={`text-[10px] font-bold uppercase tracking-[0.08em] px-2.5 py-0.5 rounded ${
                  isTimeout
                    ? "bg-[#FCECEC] text-[#C43D3D]"
                    : isAccepted
                    ? "bg-[#EAF5EE] text-[#287A4B]"
                    : isRejected
                    ? "bg-[#FCECEC] text-[#C43D3D]"
                    : "bg-[#F5EFE5] text-[#B08D57]"
                }`}
              >
                Status: {displayStatus}
              </span>
              <span className="text-[11.5px] text-[#666]">{formatDate(order.createdAt)}</span>
            </div>
            <h1 className="font-display text-[24px] font-bold text-[#111]">
              Sub-Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-[12.5px] text-[#666] mt-0.5">
              Net Settlement Payout:{" "}
              <strong className="text-[#287A4B]">
                {formatMoney(order.sellerAmount?.amount ?? order.sellerAmount ?? 0)}
              </strong>
            </p>

            {(isRejected || isTimeout || order.cancelReason) && (
              <div className="mt-3 p-3 bg-[#FFF5F5] border border-[#FCECEC] rounded text-[12px] text-[#C43D3D] space-y-0.5">
                <p>
                  <strong>Reason:</strong>{" "}
                  {order.cancelReason === "seller_no_response"
                    ? "Timed out — No confirmation provided within deadline"
                    : order.cancelReason === "out_of_stock"
                    ? "Out of Stock"
                    : order.cancelReason === "pricing_error"
                    ? "Pricing Error"
                    : order.cancelReason === "logistics_issue"
                    ? "Logistics / Address Unserviceable"
                    : order.cancelReason === "unable_to_fulfill"
                    ? "Unable to fulfill"
                    : order.cancelReason || "Order Cancelled"}
                </p>
                {order.rejectionNote && (
                  <p className="text-[#666]">
                    <strong>Note:</strong> {order.rejectionNote}
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {isPending && (
              <>
                <button
                  onClick={onAccept}
                  disabled={submitting}
                  className="px-5 py-2.5 bg-[#287A4B] text-white rounded text-[11.5px] font-bold uppercase hover:bg-[#1E6039] cursor-pointer disabled:opacity-50"
                >
                  Accept Order
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={submitting}
                  className="px-5 py-2.5 border border-[#C43D3D] text-[#C43D3D] rounded text-[11.5px] font-bold uppercase hover:bg-[#FCECEC] cursor-pointer disabled:opacity-50"
                >
                  Reject Order
                </button>
              </>
            )}

            {currentDelivery?.shiprocketTrackingUrl && (
              <a
                href={currentDelivery.shiprocketTrackingUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111] text-white rounded text-[11.5px] font-bold uppercase hover:bg-[#B08D57] cursor-pointer"
              >
                Track Shipment
                <ExternalLink size={14} />
              </a>
            )}
          </div>
        </div>

        {/* Order Items */}
        <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5">
          <h2 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-3 border-b border-[#EAEAEA] mb-4">
            Items to Pack ({order.orderItems?.length || 1})
          </h2>

          <div className="divide-y divide-[#EAEAEA]">
            {order.orderItems?.map((item, i) => {
              const cover =
                item.images?.[0]?.url ||
                (typeof item.images?.[0] === "string" ? item.images[0] : null) ||
                item.image ||
                item.variant?.images?.[0]?.url ||
                (typeof item.variant?.images?.[0] === "string" ? item.variant?.images?.[0] : null) ||
                item.productId?.images?.[0]?.url ||
                (typeof item.productId?.images?.[0] === "string" ? item.productId?.images?.[0] : null) ||
                item.product?.images?.[0]?.url ||
                (typeof item.product?.images?.[0] === "string" ? item.product?.images?.[0] : null) ||
                null;

              const title =
                item.title ||
                item.name ||
                item.productId?.title ||
                item.productId?.name ||
                item.product?.title ||
                item.product?.name ||
                "Item";

              const variantObj =
                item.variant ||
                item.productId?.variants?.find?.(
                  (v) => v._id?.toString() === item.variantId?.toString()
                );

              const qty = item.quantity || item.qty || 1;
              const unitPrice = Number(item.price?.amount ?? item.price ?? 0);
              const totalPrice = unitPrice * qty;

              const variantDetails = [
                variantObj?.sku && `SKU: ${variantObj.sku}`,
                variantObj?.size && `Size: ${variantObj.size}`,
                variantObj?.color && `Color: ${variantObj.color}`,
                item.size && `Size: ${item.size}`,
                item.color && `Color: ${item.color}`,
              ]
                .filter(Boolean)
                .join(" · ");

              return (
                <div key={item._id || item.variantId || i} className="py-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4 min-w-0">
                    <div className="w-16 h-20 bg-[#FAFAFA] border border-[#EAEAEA] rounded overflow-hidden shrink-0">
                      {cover ? (
                        <img src={cover} alt={title} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#999]">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div className="min-w-0">
                      <h3 className="font-display text-[14px] font-bold text-[#111] line-clamp-1">
                        {title}
                      </h3>
                      <p className="text-[11.5px] text-[#666] mt-0.5">
                        {variantDetails ? `${variantDetails} · ` : ""}Qty: {qty}
                      </p>
                      {unitPrice > 0 && (
                        <p className="text-[11px] text-[#888]">
                          Unit Price: {formatMoney(unitPrice)}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-[14px] font-bold text-[#111]">
                      {formatMoney(totalPrice || order.sellerAmount?.amount || 0)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Buyer Delivery Address */}
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5 space-y-2">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57] pb-2 border-b border-[#EAEAEA]">
            Buyer Delivery Address
          </h3>
          {address ? (
            <div className="text-[12.5px] text-[#555] space-y-1">
              <div className="flex items-center gap-2">
                <p className="font-bold text-[#111]">
                  {buyerName} · {phone}
                </p>
                {addressType && (
                  <span className="text-[9.5px] font-bold uppercase px-2 py-0.5 bg-[#EAEAEA] text-[#555] rounded">
                    {addressType}
                  </span>
                )}
              </div>
              {(line1 || line2) && (
                <p>
                  {line1}
                  {line2 ? `, ${line2}` : ""}
                </p>
              )}
              {(city || state || pincode) && (
                <p>
                  {city}
                  {city && state ? ", " : ""}
                  {state} {pincode ? "— " : ""}
                  {pincode ? <strong className="text-[#111]">{pincode}</strong> : null}
                </p>
              )}
            </div>
          ) : (
            <p className="text-[12px] text-[#666]">Address details unavailable.</p>
          )}
        </div>
      </div>

      {/* Accept Order Notice Modal */}
      {showAcceptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[12px] border border-[#EAEAEA] p-6 md:p-7 max-w-md w-full space-y-5 shadow-2xl relative">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#F5EFE5] border border-[#E6D7C3] flex items-center justify-center text-[#B08D57] shrink-0">
                  <Truck size={20} />
                </div>
                <div>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold uppercase tracking-wider text-[#B08D57] bg-[#F5EFE5] px-2 py-0.5 rounded">
                    <ShieldCheck size={11} /> Pipeline Verified
                  </span>
                  <h3 className="text-[16px] font-bold text-[#111] mt-0.5">Live Dispatch Notice</h3>
                </div>
              </div>
              <button
                onClick={() => setShowAcceptModal(false)}
                className="text-[#888] hover:text-[#111] p-1 rounded-full transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>
            </div>

            <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-4 text-[12px] leading-relaxed text-[#555] space-y-2.5">
              <p>
                Our automated delivery pipeline and real-time tracking integration with <strong className="text-[#111]">Shiprocket</strong> have been officially tested and verified end-to-end.
              </p>
              <p>
                Accepting an order generates an actual live courier shipment &amp; chargeable AWB. To avoid incurring real courier charges during testing, <strong className="text-[#C43D3D]">live order acceptance is temporarily locked</strong> in this preview environment.
              </p>
              <div className="pt-1 text-[11px] text-[#B08D57] font-semibold flex items-center gap-1.5">
                <span>✨</span>
                <span>Full automated fulfillment will be live upon official launch at <strong className="underline">Zrive.com</strong>.</span>
              </div>
            </div>

            <div className="flex justify-end pt-1">
              <button
                onClick={() => setShowAcceptModal(false)}
                className="w-full sm:w-auto px-6 py-2.5 bg-[#111111] text-white rounded-[6px] text-[11.5px] font-bold uppercase tracking-wider hover:bg-[#B08D57] transition-colors cursor-pointer"
              >
                Understood
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Reject Modal */}
      {showRejectModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[8px] border border-[#EAEAEA] p-6 max-w-sm w-full space-y-4">
            <h3 className="font-display text-[16px] font-bold text-[#111]">Reject Order Confirmation</h3>
            <p className="text-[12px] text-[#666]">Choose rejection reason:</p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[12.5px] outline-none"
            >
              <option value="out_of_stock">Out of Stock</option>
              <option value="unable_to_fulfill">Unable to fulfill in time</option>
              <option value="pricing_error">Pricing Error</option>
              <option value="logistics_issue">Logistics / Address Unserviceable</option>
              <option value="other">Other</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setShowRejectModal(false)} className="px-4 py-2 border rounded text-[11px] font-bold uppercase cursor-pointer">Cancel</button>
              <button onClick={onReject} className="px-5 py-2 bg-[#C43D3D] text-white rounded text-[11px] font-bold uppercase cursor-pointer">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SellerOrderDetail;
