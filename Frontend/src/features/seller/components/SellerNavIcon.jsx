import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Store, ShieldCheck, Sparkles, X, LogIn, ArrowRight } from "lucide-react";
import useSeller from "../hook/useSeller";

const SellerNavIcon = ({ onRequireAuth }) => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth || {});
  const { application, loading: sellerLoading } = useSelector((state) => state.seller || {});
  const { handleGetMyApplication } = useSeller();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    if (!user || user.role === "seller") return;
    if (typeof handleGetMyApplication === "function") {
      handleGetMyApplication();
    }
  }, [user]);

  // Determine behavior based on auth and seller state
  let tooltip = "Become a Seller";
  let showDot = false;
  let clickHandler = () => {};

  if (!user) {
    tooltip = "Become a Seller";
    clickHandler = () => {
      if (onRequireAuth) {
        onRequireAuth();
      } else {
        setShowModal(true);
      }
    };
  } else if (user.role === "seller") {
    tooltip = "Seller Dashboard";
    clickHandler = () => navigate("/seller");
  } else if (sellerLoading) {
    tooltip = "Become a Seller";
    clickHandler = () => navigate("/become-seller");
  } else if (!application) {
    tooltip = "Become a Seller";
    clickHandler = () => navigate("/become-seller");
  } else if (application.applicationStatus === "basic") {
    tooltip = "Finish Your Seller Application";
    clickHandler = () => navigate("/seller/become-seller/verify");
    showDot = true;
  } else if (application.applicationStatus === "pending_verification") {
    tooltip = "Application Under Review";
    clickHandler = () => navigate("/seller/become-seller/verify");
  } else if (application.applicationStatus === "rejected") {
    tooltip = "Application Rejected — Tap to Resubmit";
    clickHandler = () => navigate("/seller/become-seller/verify");
    showDot = true;
  }

  return (
    <>
      <div className="relative group flex items-center">
        <button
          type="button"
          aria-label={tooltip}
          onClick={clickHandler}
          className="relative p-2 text-[#555] hover:text-[#111] hover:bg-gray-100 rounded-lg transition-colors group flex items-center justify-center"
        >
          <Store size={18} strokeWidth={1.8} className="group-hover:scale-105 transition-transform" />
          {showDot && (
            <span className="absolute 0.5 top-1 right-1 w-2 h-2 rounded-full bg-[#B08D57] ring-2 ring-white animate-pulse" />
          )}
        </button>

        {/* Tooltip on hover */}
        <div className="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-md bg-[#111111] text-white text-[10.5px] font-medium px-2 py-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50 shadow-lg border border-white/10">
          {tooltip}
          <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#111111]" />
        </div>
      </div>

      {/* Seller Login Required Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setShowModal(false)}
          />

          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#EAEAEA] z-10 animate-fade-in-up text-center">
            <button
              type="button"
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-[#111] p-1 rounded-full hover:bg-[#F5F5F5] transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-12 h-12 rounded-2xl bg-[#F5EFE5] text-[#B08D57] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Store size={24} strokeWidth={2} />
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#666] text-[10.5px] font-semibold tracking-wider uppercase mb-2">
              <Sparkles size={11} className="text-[#B08D57]" /> Seller Portal
            </div>

            <h3 className="text-[17px] font-bold text-[#111111] tracking-tight">
              First Login to become a Seller
            </h3>
            <p className="text-[12.5px] text-[#666666] mt-2 mb-6 leading-relaxed">
              Please sign in to your Zrive account to register your store, manage products, and start selling.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  navigate("/login");
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-black text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <LogIn size={15} />
                Login to Continue
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowModal(false);
                  navigate("/register");
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#F9F9F9] text-[#111111] text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all"
              >
                Create an Account
                <ArrowRight size={14} className="text-[#666]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default SellerNavIcon;