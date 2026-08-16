import React, { useState, useEffect } from "react";
import { useLocation, useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  ChevronRight,
  MapPin,
  ShoppingBag,
  Sparkles,
} from "lucide-react";
import useOrder from "../hook/useOrder";
import useCart from "../../cart/hook/useCart";
import useAddress from "../../address/hook/useAddress";
import toast from "react-hot-toast";

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCreateOrder, handleVerifyOrder } = useOrder();
  const { handleGetCart } = useCart();
  const { handleGetAddresses } = useAddress();

  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart?.items ?? []);
  const addressesFromStore = useSelector((state) => state.address?.addresses ?? []);

  const [selectedAddress, setSelectedAddress] = useState(location.state?.address || null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("razorpay");

  // Fetch address & cart if missing from location state
  useEffect(() => {
    handleGetCart();
    if (!selectedAddress) {
      (async () => {
        const addrList = await handleGetAddresses();
        const list = addrList || addressesFromStore;
        if (list && list.length > 0) {
          const defaultAddr = list.find((a) => a.isDefault) || list[0];
          setSelectedAddress(defaultAddr);
        } else {
          toast.error("Please select a delivery address first");
          navigate("/address");
        }
      })();
    }
  }, []);

  const subtotal = cartItems.reduce(
    (sum, item) => sum + (item.product?.price || 0) * item.quantity,
    0
  );
  const totalAmount = subtotal;

  const onPayWithRazorpay = async () => {
    if (!selectedAddress) {
      toast.error("Please select a valid delivery address");
      navigate("/address");
      return;
    }

    setLoadingPayment(true);
    try {
      const orderData = await handleCreateOrder(selectedAddress._id);
      const orderObj = orderData?.order || orderData;

      if (!orderObj || !orderObj.id) {
        toast.error("Failed to generate order ID");
        setLoadingPayment(false);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || "rzp_test_fallback",
        amount: orderObj.amount,
        currency: orderObj.currency || "INR",
        name: "ZRIVE Marketplace",
        description: "Escrow Protected Fashion Order",
        order_id: orderObj.id,
        handler: async function (razorpayRes) {
          try {
            const result = await handleVerifyOrder({
              razorpay_order_id: razorpayRes.razorpay_order_id,
              razorpay_payment_id: razorpayRes.razorpay_payment_id,
              razorpay_signature: razorpayRes.razorpay_signature,
            });

            toast.success("Payment Successful! Order Confirmed.");
            if (result && result.paymentGroup) {
              navigate(`/orders/group/${result.paymentGroup._id}`);
            } else if (result && result.order) {
              navigate(`/orders/${result.order._id}`);
            } else {
              navigate("/orders");
            }
          } catch (err) {
            toast.error("Payment verification failed. Please contact support.");
          }
        },
        prefill: {
          name: selectedAddress.fullName || user?.fullName || user?.name || "",
          email: user?.email || "",
          contact: selectedAddress.phone || user?.phone || "",
        },
        theme: { color: "#111111" },
        modal: {
          ondismiss: function () {
            setLoadingPayment(false);
            toast("Payment cancelled", { icon: "ℹ️" });
          },
        },
      };

      if (typeof window.Razorpay === "undefined") {
        toast.error("Razorpay SDK not loaded. Please refresh the page.");
        setLoadingPayment(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      toast.error(err.message || "Failed to launch Razorpay payment");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Checkout Stepper */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-8 py-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => navigate("/address")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors shrink-0"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Address</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-[11.5px] font-semibold shrink-0">
            <span className="flex items-center gap-1 text-[#287A4B]">
              <Check size={12} />
              Bag
            </span>
            <span className="text-[#D2D2D2]">&rarr;</span>
            <span className="flex items-center gap-1 text-[#287A4B]">
              <Check size={12} />
              Address
            </span>
            <span className="text-[#D2D2D2]">&rarr;</span>
            <span className="flex items-center gap-1 text-[#B08D57]">
              <span className="w-4 h-4 rounded-full bg-[#B08D57] text-white text-[9px] flex items-center justify-center font-bold">
                3
              </span>
              Payment
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2 py-0.5 rounded-full shrink-0">
            <Lock size={10} />
            <span>256-Bit Escrow</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6">
        <h1 className="font-display text-[22px] md:text-[26px] font-bold text-[#111111] mb-6">
          Payment Method & Review
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start">
          {/* Left Column: Delivery Address & Payment Options */}
          <div className="space-y-6">
            {/* Delivery Address Summary Card */}
            <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5 shadow-sm">
              <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-3">
                <div className="flex items-center gap-2">
                  <MapPin size={16} className="text-[#B08D57]" />
                  <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#111111]">
                    Delivery Address
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={() => navigate("/address")}
                  className="text-[11px] font-bold uppercase text-[#B08D57] hover:underline"
                >
                  Change
                </button>
              </div>

              {selectedAddress ? (
                <div className="text-[13px] text-[#333333] space-y-1">
                  <div className="flex items-center gap-2">
                    <p className="font-bold text-[#111111]">{selectedAddress.fullName}</p>
                    <span className="text-[10px] font-bold uppercase bg-[#FAFAFA] border border-[#EAEAEA] px-2 py-0.5 rounded text-[#666]">
                      {selectedAddress.addressType || "HOME"}
                    </span>
                  </div>
                  <p>{selectedAddress.streetAddress}</p>
                  <p>
                    {selectedAddress.city}, {selectedAddress.state} —{" "}
                    <strong className="text-[#111]">{selectedAddress.pincode}</strong>
                  </p>
                  <p className="text-[12px] text-[#666] pt-1">
                    Phone: <strong className="text-[#111]">{selectedAddress.phone}</strong>
                  </p>
                </div>
              ) : (
                <p className="text-[12.5px] text-[#666]">No address selected.</p>
              )}
            </div>

            {/* Payment Options Selector */}
            <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5 shadow-sm space-y-4">
              <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57] pb-3 border-b border-[#EAEAEA]">
                Select Payment Mode
              </h2>

              {/* Option 1: Razorpay */}
              <label
                onClick={() => setPaymentMethod("razorpay")}
                className={`flex items-start gap-4 p-4 rounded-[6px] border cursor-pointer transition-all ${
                  paymentMethod === "razorpay"
                    ? "border-[#B08D57] bg-[#FAFAFA] shadow-sm"
                    : "border-[#EAEAEA] hover:border-[#111]"
                }`}
              >
                <input
                  type="radio"
                  name="paymentMode"
                  checked={paymentMethod === "razorpay"}
                  onChange={() => setPaymentMethod("razorpay")}
                  className="mt-1 accent-[#B08D57]"
                />
                <div className="flex-1">
                  <div className="flex items-center justify-between flex-wrap gap-2">
                    <span className="font-bold text-[14px] text-[#111]">
                      Razorpay Online Payment (UPI, Cards, NetBanking, Wallets)
                    </span>
                    <span className="text-[9.5px] font-bold uppercase bg-[#EAF5EE] text-[#287A4B] px-2.5 py-0.5 rounded">
                      RECOMMENDED
                    </span>
                  </div>
                  <p className="text-[12px] text-[#666] mt-1">
                    Instant verification, 100% Escrow Buyer Protection & zero processing fee.
                  </p>
                  <div className="flex items-center gap-3 mt-3 text-[11px] font-semibold text-[#555]">
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#EAEAEA]">
                      <Smartphone size={12} className="text-[#287A4B]" /> UPI (GPay, PhonePe, Paytm)
                    </span>
                    <span className="flex items-center gap-1 bg-white px-2 py-1 rounded border border-[#EAEAEA]">
                      <CreditCard size={12} className="text-[#3B82F6]" /> Cards / NetBanking
                    </span>
                  </div>
                </div>
              </label>

              {/* Security Shield Banner */}
              <div className="flex items-center gap-3 p-3.5 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-[11.5px] text-[#555]">
                <ShieldCheck size={20} className="text-[#287A4B] shrink-0" />
                <span>
                  Your transaction is protected with <strong>Razorpay 256-bit SSL encryption</strong> and backed by ZRIVE Escrow Trust Guarantee.
                </span>
              </div>
            </div>
          </div>

          {/* Right Column: Price Breakdown & CTA */}
          <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5 shadow-sm space-y-4 sticky top-24">
            <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57] pb-3 border-b border-[#EAEAEA]">
              Order Summary ({cartItems.length} {cartItems.length === 1 ? "Item" : "Items"})
            </h2>

            <div className="space-y-2.5 text-[12.5px] border-b border-[#EAEAEA] pb-4">
              <div className="flex justify-between text-[#555]">
                <span>Item Subtotal</span>
                <span className="font-semibold text-[#111]">₹{subtotal}</span>
              </div>
              <div className="flex justify-between text-[#555]">
                <span>Delivery Charge</span>
                <span className="font-semibold text-[#287A4B]">FREE</span>
              </div>
              <div className="flex justify-between text-[#555]">
                <span>Escrow Convenience Fee</span>
                <span className="font-semibold text-[#287A4B]">FREE</span>
              </div>
            </div>

            <div className="flex justify-between items-center text-[15px] font-bold text-[#111] pt-1">
              <span>Total Amount</span>
              <span className="text-[18px]">₹{totalAmount}</span>
            </div>

            <button
              type="button"
              disabled={loadingPayment}
              onClick={onPayWithRazorpay}
              className="w-full py-3.5 bg-[#111111] text-white rounded-[6px] text-[13px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] hover:text-[#0e0e0e] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loadingPayment ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Initiating Razorpay...</span>
                </>
              ) : (
                <>
                  <Lock size={14} />
                  <span>PAY NOW ₹{totalAmount}</span>
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-[10.5px] text-[#888] flex items-center justify-center gap-1">
                <ShieldCheck size={12} className="text-[#287A4B]" /> 100% Safe & Secure Checkout
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
