import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Store } from "lucide-react";
import useSeller from "../hook/useSeller";

// Compact icon-only CTA meant to sit inline with the other navbar icons
// (Heart, Bell, Bag, User). Shows a small dot when the seller needs to take
// action (finish KYC / resubmit) and a tooltip on hover explaining the state.
const SellerNavIcon = () => {
  const navigate = useNavigate();
  const { user, loading: authLoading } = useSelector((state) => state.auth);
  const { application, loading: sellerLoading } = useSelector((state) => state.seller);

  const { handleGetMyApplication } = useSeller();

  useEffect(() => {
    if (!user || user.role === "seller") return;
    handleGetMyApplication();
  }, [user]);

  if (authLoading || !user) return null;

  // ---- Resolve state -> { tooltip, onClick, showDot } ----------------
  let tooltip = "Become a Seller";
  let onClick = () => navigate("/become-seller");
  let showDot = false;

  if (user.role === "seller") {
    tooltip = "Seller Dashboard";
    onClick = () => navigate("/seller/dashboard");
  } else if (sellerLoading) {
    // Avoid flashing the wrong tooltip while the status call is in flight
    tooltip = "Become a Seller";
  } else if (!application) {
    tooltip = "Become a Seller";
    onClick = () => navigate("/become-seller");
  } else if (application.applicationStatus === "basic") {
    tooltip = "Finish Your Seller Application";
    onClick = () => navigate("seller/become-seller/verify");
    showDot = true;
  } else if (application.applicationStatus === "pending_verification") {
    tooltip = "Application Under Review";
    onClick = () => navigate("seller/become-seller/verify");
  } else if (application.applicationStatus === "rejected") {
    tooltip = "Application Rejected — Tap to Resubmit";
    onClick = () => navigate("seller/become-seller/verify");
    showDot = true;
  }

  return (
    <div className="relative group flex items-center">
      <button
        type="button"
        aria-label={tooltip}
        onClick={onClick}
        className="relative flex items-center justify-center leading-none text-ink hover:text-gold transition-colors"
      >
        <Store size={18} strokeWidth={1.5} />
        {showDot && (
          <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold" />
        )}
      </button>

      {/* Tooltip — desktop hover only */}
      <div className="hidden md:block pointer-events-none absolute right-0 top-full mt-2 whitespace-nowrap rounded-[3px] bg-charcoal text-cream text-[11px] font-medium px-3 py-2 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50">
        {tooltip}
      </div>
    </div>
  );
};

export default SellerNavIcon;