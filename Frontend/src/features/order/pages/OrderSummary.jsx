import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import {
  ArrowLeft,
  MapPin,
  ChevronRight,
  Lock,
  ShieldCheck,
  Truck,
  Package,
  Check,
  AlertCircle,
} from "lucide-react";
import useOrder from "../hook/useOrder";
import useCart from "../../cart/hook/useCart";
import useAddress from "../../address/hook/useAddress";
import { setSelectedAddress } from "../../address/state/addressSlice";
import { notify } from "../../../utils/toast";

const toNum = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};
const formatINR = (amount) =>
  `₹${toNum(amount).toLocaleString("en-IN")}`;

const getUnitPrice = (item) => {
  const v = item.product?.variants;
  if (v?.price?.amount != null) return toNum(v.price.amount);
  if (v?.priceOverride != null) return toNum(v.priceOverride);
  return toNum(item.price?.amount ?? item.product?.price?.amount ?? 0);
};

const Stepper = ({ onBack }) => (
  <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
    <div className="max-w-[1100px] mx-auto px-3 sm:px-8 py-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
      <button
        type="button"
        onClick={onBack}
        className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors shrink-0 cursor-pointer"
      >
        <ArrowLeft size={16} />
        <span className="hidden sm:inline">Back to Cart</span>
      </button>

      <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-[11.5px] font-semibold shrink-0">
        <span className="flex items-center gap-1 text-[#287A4B]">
          <Check size={12} strokeWidth={2.5} />
          Address
        </span>
        <span className="text-[#D2D2D2]">&rarr;</span>
        <span className="flex items-center gap-1 text-[#B08D57]">
          <span className="w-4 h-4 rounded-full bg-[#B08D57] text-white text-[9px] flex items-center justify-center font-bold">
            2
          </span>
          Order Summary
        </span>
        <span className="text-[#D2D2D2]">&rarr;</span>
        <span className="flex items-center gap-1 text-[#AAAAAA]">
          <span className="w-4 h-4 rounded-full bg-[#EAEAEA] text-[#777] text-[9px] flex items-center justify-center font-bold">
            3
          </span>
          Pay
        </span>
      </div>

      <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2.5 py-1 rounded-full shrink-0">
        <Lock size={10} />
        <span className="hidden sm:inline">Razorpay Secure</span>
      </div>
    </div>
  </div>
);

const AddressCard = ({ address, onChangeClick }) => {
  if (!address) {
    return (
      <button
        type="button"
        onClick={onChangeClick}
        className="w-full flex items-center gap-3 p-5 border-2 border-dashed border-[#EAEAEA] rounded-[10px] hover:border-[#B08D57] transition-colors group cursor-pointer"
      >
        <div className="w-10 h-10 rounded-full bg-[#F5EFE5] flex items-center justify-center shrink-0 group-hover:bg-[#EBE0D0] transition-colors">
          <MapPin size={18} className="text-[#B08D57]" />
        </div>
        <div className="text-left">
          <p className="text-[13px] font-bold text-[#111]">Add Delivery Address</p>
          <p className="text-[11.5px] text-[#888]">Select where to deliver your order</p>
        </div>
        <ChevronRight size={16} className="text-[#AAAAAA] ml-auto" />
      </button>
    );
  }

  return (
    <div className="p-5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[10px]">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-9 h-9 rounded-full bg-[#F5EFE5] flex items-center justify-center shrink-0 mt-0.5">
            <MapPin size={15} className="text-[#B08D57]" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <p className="text-[13.5px] font-bold text-[#111]">{address.fullName}</p>
              <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] bg-[#111] text-white px-2 py-0.5 rounded">
                {address.addressType || "HOME"}
              </span>
              {address.isDefault && (
                <span className="text-[9.5px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2 py-0.5 rounded">
                  DEFAULT
                </span>
              )}
            </div>
            <p className="text-[12.5px] text-[#555] leading-relaxed">
              {address.addressLine1}
              {address.addressLine2 ? `, ${address.addressLine2}` : ""}
            </p>
            <p className="text-[12.5px] text-[#555]">
              {address.city}, {address.state} —{" "}
              <strong className="text-[#111]">{address.pincode}</strong>
            </p>
            <p className="text-[11.5px] text-[#888] mt-1">
              Phone: <strong className="text-[#333]">{address.phone}</strong>
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onChangeClick}
          className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#B08D57] hover:text-[#8A6D40] border border-[#B08D57]/30 hover:border-[#B08D57] px-3 py-1.5 rounded transition-all whitespace-nowrap shrink-0 cursor-pointer"
        >
          Change
        </button>
      </div>
    </div>
  );
};

const OrderItemRow = ({ item }) => {
  const variant = item.product?.variants;
  const cover = variant?.images?.[0]?.url ?? item.product?.images?.[0]?.url;
  const unitPrice = getUnitPrice(item);
  const qty = toNum(item.quantity ?? 1);

  return (
    <div className="flex gap-4 py-4 border-b border-[#F0F0F0] last:border-0 items-start">
      <div className="w-16 h-20 shrink-0 rounded-[6px] overflow-hidden bg-[#F5F5F5] border border-[#EAEAEA]">
        {cover ? (
          <img
            src={cover}
            alt={item.product?.title || "Product"}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Package size={18} className="text-[#CCC]" />
          </div>
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#B08D57] mb-0.5">
          {item.product?.brand || item.product?.category || "ZRIVE"}
        </p>
        <p className="text-[13px] font-semibold text-[#111] leading-snug line-clamp-2">
          {item.product?.title || item.product?.name}
        </p>
        {variant && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {variant.size && (
              <span className="text-[10px] font-semibold text-[#555] bg-[#F0F0F0] px-2 py-0.5 rounded">
                Size: {variant.size}
              </span>
            )}
            {variant.color && (
              <span className="text-[10px] font-semibold text-[#555] bg-[#F0F0F0] px-2 py-0.5 rounded">
                Color: {variant.color}
              </span>
            )}
          </div>
        )}
        <div className="flex items-center justify-between mt-2">
          <span className="text-[11.5px] text-[#888]">Qty: {qty}</span>
          <span className="text-[14px] font-bold text-[#111]">
            {formatINR(unitPrice * qty)}
          </span>
        </div>
      </div>
    </div>
  );
};

const OrderSummary = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch();

  const { handleCreateOrder, handleVerifyOrder } = useOrder();
  const { handleGetCart } = useCart();
  const { handleGetAddresses } = useAddress();

  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart?.items ?? []);
  const cartTotal = useSelector((state) => state.cart?.totalPrice ?? 0);
  const addressesInStore = useSelector((state) => state.address?.addresses ?? []);
  const selectedInStore = useSelector((state) => state.address?.selectedAddress);

  const [selectedAddress, setAddr] = useState(
    location.state?.address || selectedInStore || null
  );
  const [loadingAddr, setLoadingAddr] = useState(false);
  const [paying, setPaying] = useState(false);

  const isFreeShipping = cartTotal >= 999;
  const shippingFee = isFreeShipping ? 0 : 99;
  const grandTotal = cartTotal + shippingFee;

  useEffect(() => {
    handleGetCart();
    resolveAddress();
  }, []);

  const resolveAddress = async () => {
    if (location.state?.address || selectedInStore) return;
    setLoadingAddr(true);
    try {
      const list = await handleGetAddresses();
      const addrList = (list && list.length ? list : null) || addressesInStore;
      if (addrList && addrList.length > 0) {
        const def = addrList.find((a) => a.isDefault) || addrList[0];
        setAddr(def);
        dispatch(setSelectedAddress(def));
      }
    } finally {
      setLoadingAddr(false);
    }
  };

  const handleChangeAddress = () => {
    navigate("/address", { state: { returnTo: "/order-summary" } });
  };

  const handlePay = async () => {
    if (!selectedAddress) {
      notify.error("Please select a delivery address first.");
      handleChangeAddress();
      return;
    }
    if (!cartItems.length) {
      notify.error("Your cart is empty.");
      return;
    }

    setPaying(true);
    try {
      const orderData = await handleCreateOrder(selectedAddress._id);
      const orderObj = orderData?.order || orderData;

      if (!orderObj?.id) {
        notify.error("Could not generate order ID. Please try again.");
        setPaying(false);
        return;
      }

      const options = {
        key: "rzp_test_TJOYSvdezHvcAX",
        amount: orderObj.amount,
        currency: orderObj.currency || "INR",
        name: "ZRIVE Marketplace",
        description: "Escrow Protected Fashion Order",
        order_id: orderObj.id,
        handler: async function (rzpRes) {
          try {
            const result = await handleVerifyOrder({
              razorpay_order_id: rzpRes.razorpay_order_id,
              razorpay_payment_id: rzpRes.razorpay_payment_id,
              razorpay_signature: rzpRes.razorpay_signature,
            });
            notify.success("Payment successful! Order confirmed.");
            if (result?.paymentGroup) {
              navigate(`/orders/group/${result.paymentGroup._id}`);
            } else if (result?.order) {
              navigate(`/orders/${result.order._id}`);
            } else {
              navigate("/order-success");
            }
          } catch (err) {
            notify.error(err, "Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: selectedAddress.fullName || user?.fullName || "",
          email: user?.email || "",
          contact: selectedAddress.phone || user?.phone || "",
        },
        theme: { color: "#111111" },
        modal: {
          ondismiss: () => {
            setPaying(false);
            notify.info("Payment cancelled");
          },
        },
      };

      if (typeof window.Razorpay === "undefined") {
        notify.error("Razorpay not loaded. Please refresh the page.");
        setPaying(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notify.error(err, "Failed to initiate payment.");
      setPaying(false);
    }
  };

  // Empty cart guard
  if (!cartItems.length && !paying) {
    return (
      <div className="min-h-screen bg-white flex flex-col items-center justify-center gap-4 px-4">
        <div className="w-16 h-16 rounded-full bg-[#F5EFE5] flex items-center justify-center">
          <Package size={28} className="text-[#B08D57]" />
        </div>
        <p className="text-[17px] font-bold text-[#111]">Your cart is empty</p>
        <p className="text-[13px] text-[#777] text-center max-w-xs">
          Add items to your cart before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate("/all-products")}
          className="bg-[#111] text-white px-8 py-3 rounded text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all cursor-pointer"
        >
          Browse Products
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAFA] text-[#111111] pb-20">
      <Stepper onBack={() => navigate("/cart")} />

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6">
        {/* Page header */}
        <div className="mb-6 flex items-center gap-3">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="p-2 rounded-full hover:bg-[#EAEAEA] transition-colors cursor-pointer"
            aria-label="Go back"
          >
            <ArrowLeft size={18} className="text-[#555]" />
          </button>
          <div>
            <h1 className="text-[22px] md:text-[26px] font-bold text-[#111] leading-tight">
              Order Summary
            </h1>
            <p className="text-[12px] text-[#888] mt-0.5">
              Review your items and confirm delivery details
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_360px] gap-6 items-start">
          {/* ── LEFT COLUMN ── */}
          <div className="space-y-5">
            {/* Delivery Address */}
            <div className="bg-white border border-[#EAEAEA] rounded-[12px] overflow-hidden shadow-sm">
              <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
                <MapPin size={14} className="text-[#B08D57]" />
                <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
                  Delivery Address
                </h2>
              </div>
              <div className="p-5">
                {loadingAddr ? (
                  <div className="flex items-center gap-3 py-2">
                    <div className="w-5 h-5 border-2 border-[#EAEAEA] border-t-[#B08D57] rounded-full animate-spin" />
                    <p className="text-[12.5px] text-[#888]">Fetching your addresses…</p>
                  </div>
                ) : (
                  <AddressCard
                    address={selectedAddress}
                    onChangeClick={handleChangeAddress}
                  />
                )}
              </div>
            </div>

            {/* Order Items */}
            <div className="bg-white border border-[#EAEAEA] rounded-[12px] overflow-hidden shadow-sm">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
                <div className="flex items-center gap-2">
                  <Package size={14} className="text-[#B08D57]" />
                  <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
                    Items in this Order
                  </h2>
                </div>
                <span className="text-[11px] text-[#888] font-medium">
                  {cartItems.length} {cartItems.length === 1 ? "item" : "items"}
                </span>
              </div>
              <div className="px-5">
                {cartItems.map((item) => (
                  <OrderItemRow key={item._id} item={item} />
                ))}
              </div>
              <div className="px-5 py-3.5 border-t border-[#F0F0F0] bg-[#FAFAFA]">
                <button
                  type="button"
                  onClick={() => navigate("/cart")}
                  className="text-[11.5px] font-bold text-[#B08D57] hover:underline uppercase tracking-[0.06em] cursor-pointer"
                >
                  ← Edit Cart
                </button>
              </div>
            </div>

            {/* Trust strip */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { Icon: Truck, title: "Free Delivery", sub: "Orders above ₹999" },
                { Icon: ShieldCheck, title: "Razorpay Escrow", sub: "100% secure" },
                { Icon: Check, title: "Easy Returns", sub: "7-day return policy" },
              ].map(({ Icon, title, sub }) => (
                <div
                  key={title}
                  className="flex flex-col items-center gap-1.5 p-4 bg-white border border-[#EAEAEA] rounded-[10px] text-center shadow-sm"
                >
                  <Icon size={18} className="text-[#B08D57]" />
                  <p className="text-[10.5px] font-bold text-[#111]">{title}</p>
                  <p className="text-[9.5px] text-[#888]">{sub}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ── RIGHT COLUMN — price + CTA ── */}
          <div className="bg-white border border-[#EAEAEA] rounded-[12px] shadow-sm overflow-hidden lg:sticky lg:top-24">
            <div className="px-5 py-3.5 border-b border-[#F0F0F0] bg-[#FAFAFA]">
              <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
                Price Breakdown
              </h2>
            </div>

            <div className="px-5 py-4 space-y-3 text-[13px]">
              <div className="flex justify-between text-[#555]">
                <span>
                  Subtotal ({cartItems.length}{" "}
                  {cartItems.length === 1 ? "item" : "items"})
                </span>
                <span className="font-semibold text-[#111]">{formatINR(cartTotal)}</span>
              </div>
              <div className="flex justify-between text-[#555]">
                <span>Delivery Fee</span>
                <span
                  className={`font-semibold ${
                    isFreeShipping ? "text-[#287A4B]" : "text-[#111]"
                  }`}
                >
                  {isFreeShipping ? "FREE" : formatINR(shippingFee)}
                </span>
              </div>
              {!isFreeShipping && (
                <p className="text-[10.5px] text-[#888] bg-[#FFF8EE] border border-[#F0DFB0] rounded px-3 py-2 flex items-start gap-1.5">
                  <AlertCircle
                    size={12}
                    className="text-[#B08D57] shrink-0 mt-0.5"
                  />
                  Add {formatINR(999 - cartTotal)} more for FREE delivery
                </p>
              )}
              <div className="flex justify-between text-[#555]">
                <span>GST &amp; Taxes</span>
                <span className="font-semibold text-[#287A4B]">Included</span>
              </div>
            </div>

            {/* Grand Total */}
            <div className="mx-5 py-4 border-t border-b border-[#F0F0F0] flex justify-between items-center">
              <span className="text-[14px] font-bold uppercase tracking-[0.04em] text-[#111]">
                Total Amount
              </span>
              <span className="text-[22px] font-bold text-[#111]">
                {formatINR(grandTotal)}
              </span>
            </div>

            {/* Savings chip */}
            {isFreeShipping && (
              <div className="mx-5 mt-3 flex items-center gap-2 bg-[#EAF5EE] border border-[#C3DFC8] rounded-[6px] px-3 py-2">
                <Check size={13} className="text-[#287A4B]" />
                <p className="text-[11px] font-bold text-[#287A4B]">
                  You save ₹99 on delivery!
                </p>
              </div>
            )}

            {/* CTA area */}
            <div className="p-5 space-y-3">
              {!selectedAddress && !loadingAddr && (
                <p className="text-[11.5px] text-[#C43D3D] bg-[#FFF5F5] border border-[#FFC9C9] rounded px-3 py-2 flex items-center gap-1.5">
                  <AlertCircle size={12} className="shrink-0" />
                  Please add a delivery address to continue
                </p>
              )}

              <button
                type="button"
                onClick={handlePay}
                disabled={paying || !selectedAddress || loadingAddr}
                className="w-full flex items-center justify-center gap-2.5 bg-[#111111] text-white py-4 rounded-[8px] text-[13.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-md cursor-pointer"
              >
                {paying ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    <span>Opening Razorpay…</span>
                  </>
                ) : (
                  <>
                    <Lock size={15} />
                    <span>Proceed to Pay {formatINR(grandTotal)}</span>
                  </>
                )}
              </button>

              <p className="text-center text-[10.5px] text-[#888] flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-[#287A4B]" />
                256-bit SSL encryption · Razorpay Escrow
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrderSummary;
