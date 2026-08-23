import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  ArrowLeft,
  Check,
  Lock,
  ShieldCheck,
  CreditCard,
  Building2,
  Smartphone,
  Wallet,
  Clock,
  Percent,
  ChevronDown,
  MapPin,
} from "lucide-react";
import useOrder from "../hook/useOrder";
import useCart from "../../cart/hook/useCart";
import useAddress from "../../address/hook/useAddress";
import { notify } from "../../../utils/toast";
import { PaymentSkeleton } from "../../../components/common/Skeleton";

const PAYMENT_METHODS = [
  {
    id: "upi",
    label: "UPI (Pay via any App)",
    hint: "GPay, PhonePe, Paytm & more",
    icon: Smartphone,
    razorpayMethod: { upi: true },
  },
  {
    id: "card",
    label: "Credit / Debit Card",
    hint: "Visa, Mastercard, RuPay, Amex",
    icon: CreditCard,
    razorpayMethod: { card: true },
  },
  {
    id: "netbanking",
    label: "Net Banking",
    hint: "All major banks supported",
    icon: Building2,
    razorpayMethod: { netbanking: true },
  },
  {
    id: "wallet",
    label: "Wallets",
    hint: "Paytm, Amazon Pay, Mobikwik",
    icon: Wallet,
    razorpayMethod: { wallet: true },
  },
  {
    id: "paylater",
    label: "Pay Later",
    hint: "Simpl, LazyPay & more",
    icon: Clock,
    razorpayMethod: { paylater: true },
  },
  {
    id: "emi",
    label: "EMI",
    hint: "No cost EMI on select cards",
    icon: Percent,
    razorpayMethod: { emi: true },
  },
];

const toNumber = (val) => {
  const n = Number(val);
  return Number.isFinite(n) ? n : 0;
};

const Payment = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCreateOrder, handleVerifyOrder } = useOrder();
  const { handleGetCart } = useCart();
  const { handleGetAddresses } = useAddress();

  const user = useSelector((state) => state.auth?.user);
  const cartItems = useSelector((state) => state.cart?.items ?? []);
  const addressesFromStore = useSelector((state) => state.address?.addresses ?? []);

  const { totalPrice: totalAmount } = useSelector((state) => state.cart);

  const [selectedAddress, setSelectedAddress] = useState(location.state?.address || null);
  const [loadingPayment, setLoadingPayment] = useState(false);
  const [loadingPage, setLoadingPage] = useState(true);
  const [selectedMethod, setSelectedMethod] = useState(null);
  const [expandedMethod, setExpandedMethod] = useState(null);

  useEffect(() => {
    async function loadData() {
      setLoadingPage(true);
      try {
        await handleGetCart();
        if (!selectedAddress) {
          const addrList = await handleGetAddresses();
          const list = addrList || addressesFromStore;
          if (list && list.length > 0) {
            const defaultAddr = list.find((a) => a.isDefault) || list[0];
            setSelectedAddress(defaultAddr);
          } else {
            notify.error("Please select a delivery address first");
            navigate("/address");
          }
        }
      } finally {
        setLoadingPage(false);
      }
    }
    loadData();
  }, []);

  if (loadingPage) {
    return <PaymentSkeleton />;
  }

  const handleSelectMethod = (methodId) => {
    setSelectedMethod(methodId);
    setExpandedMethod(methodId);
  };

  const onPayWithRazorpay = async () => {
    if (!selectedAddress) {
      notify.error("Please select a valid delivery address");
      navigate("/address");
      return;
    }

    if (totalAmount <= 0) {
      notify.error("Your cart total looks invalid. Please refresh and try again.");
      return;
    }

    setLoadingPayment(true);
    try {
      const orderData = await handleCreateOrder(selectedAddress._id);
      const orderObj = orderData?.order || orderData;

      if (!orderObj || !orderObj.id) {
        notify.error("Failed to generate order ID");
        setLoadingPayment(false);
        return;
      }

      const chosenMethod = PAYMENT_METHODS.find((m) => m.id === selectedMethod);

      const options = {
        key: "rzp_test_TJOYSvdezHvcAX",
        amount: orderObj.amount,
        currency: orderObj.currency || "INR",
        name: "ZRIVE Marketplace",
        description: "Escrow Protected Fashion Order",
        order_id: orderObj.id,
        ...(chosenMethod ? { method: chosenMethod.razorpayMethod } : {}),
        handler: async function (razorpayRes) {
          try {
            const result = await handleVerifyOrder({
              razorpay_order_id: razorpayRes.razorpay_order_id,
              razorpay_payment_id: razorpayRes.razorpay_payment_id,
              razorpay_signature: razorpayRes.razorpay_signature,
            });

            notify.success("Payment successful! Order confirmed.");
            if (result && result.paymentGroup) {
              navigate(`/orders/group/${result.paymentGroup._id}`);
            } else if (result && result.order) {
              navigate(`/orders/${result.order._id}`);
            } else {
              navigate("/orders");
            }
          } catch (err) {
            notify.error(err, "Payment verification failed. Please contact support.");
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
            notify.info("Payment cancelled");
          },
        },
      };

      if (typeof window.Razorpay === "undefined") {
        notify.error("Razorpay SDK not loaded. Please refresh the page.");
        setLoadingPayment(false);
        return;
      }

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      notify.error(err, "Failed to launch payment.");
    } finally {
      setLoadingPayment(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Checkout Stepper */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-8 py-3 grid grid-cols-[auto_1fr_auto] items-center gap-2">
          <button
            type="button"
            onClick={() => navigate("/address")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">Back to Address</span>
          </button>

          <div className="flex items-center justify-center gap-1.5 sm:gap-3 text-[11px] sm:text-[11.5px] font-semibold">
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

          <div className="hidden sm:block w-[120px]" />
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
                  className="text-[11px] font-bold uppercase text-[#B08D57] hover:underline cursor-pointer"
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
                  <p>{selectedAddress.addressLine1}, {selectedAddress.addressLine2}</p>
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

            {/* Payment Options - Myntra-style accordion */}
            <div className="bg-white border border-[#EAEAEA] rounded-[8px] overflow-hidden shadow-sm">
              <div className="px-5 py-3.5 border-b border-[#EAEAEA] bg-[#FAFAFA]">
                <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
                  Select Payment Mode
                </h2>
              </div>

              <div className="divide-y divide-[#EAEAEA]">
                {PAYMENT_METHODS.map((method) => {
                  const Icon = method.icon;
                  const isSelected = selectedMethod === method.id;
                  const isExpanded = expandedMethod === method.id;

                  return (
                    <div key={method.id}>
                      <button
                        type="button"
                        onClick={() =>
                          setExpandedMethod(isExpanded ? null : method.id)
                        }
                        className={`w-full flex items-center justify-between gap-3 px-5 py-4 text-left transition-colors cursor-pointer ${
                          isSelected ? "bg-[#FAFAFA]" : "hover:bg-[#FAFAFA]"
                        }`}
                      >
                        <span className="flex items-center gap-3">
                          <Icon
                            size={17}
                            className={isSelected ? "text-[#B08D57]" : "text-[#555]"}
                          />
                          <span className="flex flex-col">
                            <span className="text-[13.5px] font-bold text-[#111]">
                              {method.label}
                            </span>
                            <span className="text-[11px] text-[#888]">{method.hint}</span>
                          </span>
                        </span>
                        <ChevronDown
                          size={16}
                          className={`text-[#999] transition-transform ${
                            isExpanded ? "rotate-180" : ""
                          }`}
                        />
                      </button>

                      {isExpanded && (
                        <div className="px-5 pb-4 -mt-1">
                          <button
                            type="button"
                            onClick={() => handleSelectMethod(method.id)}
                            className={`w-full flex items-center justify-between px-4 py-3 rounded-[6px] border text-[12.5px] font-semibold transition-all cursor-pointer ${
                              isSelected
                                ? "border-[#B08D57] bg-[#FDF9F3] text-[#111]"
                                : "border-[#EAEAEA] text-[#555] hover:border-[#111]"
                            }`}
                          >
                            <span>Continue with {method.label}</span>
                            {isSelected && <Check size={16} className="text-[#B08D57]" />}
                          </button>
                          <p className="text-[10.5px] text-[#999] mt-2">
                            You'll complete this securely inside the Razorpay checkout window.
                          </p>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Security Shield Banner */}
              <div className="flex items-center gap-3 p-3.5 mx-5 my-4 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-[11.5px] text-[#555]">
                <ShieldCheck size={20} className="text-[#287A4B] shrink-0" />
                <span>
                  Every payment mode above is processed by{" "}
                  <strong>Razorpay's 256-bit SSL encryption</strong> and backed by ZRIVE
                  Escrow Trust Guarantee.
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
                <span className="font-semibold text-[#111]">₹{totalAmount}</span>
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
              className="w-full py-3.5 bg-[#111111] text-white rounded-[6px] text-[13px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] hover:text-[#0e0e0e] transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
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