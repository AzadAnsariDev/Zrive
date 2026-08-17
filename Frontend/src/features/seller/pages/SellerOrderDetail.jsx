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
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    );
  }

  const isPending = order.confirmationStatus === "pending";
  const isAccepted = order.confirmationStatus === "accepted";
  const isRejected = order.confirmationStatus === "rejected";

  const onAccept = async () => {
    setSubmitting(true);
    try {
      await handleAcceptOrder(order._id);
      notify.success("Order accepted for fulfillment!");
      await handleGetOrderById(order._id);
    } catch (err) {
      notify.error(err, "Failed to accept order.");
    } finally {
      setSubmitting(false);
    }
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
              <span className="text-[10px] font-bold uppercase tracking-[0.08em] bg-[#F5EFE5] text-[#B08D57] px-2.5 py-0.5 rounded">
                Status: {order.confirmationStatus}
              </span>
              <span className="text-[11.5px] text-[#666]">{formatDate(order.createdAt)}</span>
            </div>
            <h1 className="font-display text-[24px] font-bold text-[#111]">
              Sub-Order #{order._id?.slice(-8).toUpperCase()}
            </h1>
            <p className="text-[12.5px] text-[#666] mt-0.5">
              Net Settlement Payout: <strong className="text-[#287A4B]">{formatMoney(order.sellerAmount?.amount)}</strong>
            </p>
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
              const cover = item.variant?.images?.[0]?.url || item.product?.images?.[0]?.url;

              return (
                <div key={i} className="py-3 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-20 bg-[#FAFAFA] border border-[#EAEAEA] rounded overflow-hidden shrink-0">
                      {cover ? (
                        <img src={cover} alt="" className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#999]">
                          <Package size={20} />
                        </div>
                      )}
                    </div>

                    <div>
                      <h3 className="font-display text-[14px] font-bold text-[#111]">
                        {item.product?.title || item.product?.name}
                      </h3>
                      {item.variant && (
                        <p className="text-[11.5px] text-[#666]">
                          SKU: {item.variant.sku} · Size: {item.variant.size} · Color: {item.variant.color}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-[14px] font-bold text-[#111]">{formatMoney(item.price?.amount || item.price)}</p>
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
          {order.address ? (
            <div className="text-[12.5px] text-[#555] space-y-1">
              <p className="font-bold text-[#111]">{order.address.fullName} · {order.address.phone}</p>
              <p>{order.address.addressLine1}, {order.address.addressLine2}</p>
              <p>{order.address.city}, {order.address.state} - <strong>{order.address.pincode}</strong></p>
            </div>
          ) : (
            <p className="text-[12px] text-[#666]">Address details unavailable.</p>
          )}
        </div>
      </div>

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
