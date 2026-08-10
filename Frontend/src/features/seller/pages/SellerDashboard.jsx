import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  Lock,
  ShieldAlert,
  Clock,
  PlusCircle,
  Boxes,
  ShoppingBag,
  Wallet,
  ArrowRight,
  Sparkles,
} from "lucide-react";
import useSeller from "../hook/useSeller";
import KycRequiredModal from "../components/KycRequiredModal";


// ---- Dynamic KYC status banner ----------------------------------------
const KycBanner = ({ application, onGoToKyc }) => {
  if (!application || application.applicationStatus === "basic") {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[3px] border-l-4 border-gold bg-gold/10 px-6 py-5 mb-8">
        <div className="flex items-start gap-3.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-gold/20 flex-shrink-0">
            <Lock size={16} className="text-gold-deep" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink mb-0.5">
              Complete your KYC to start selling on ZRIVE
            </p>
            <p className="text-[12.5px] text-ink-soft leading-relaxed">
              Add your pickup address, payout details, and PAN to unlock product listing.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onGoToKyc}
          className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-[3px] bg-charcoal px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink"
        >
          Complete KYC
          <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  if (application.applicationStatus === "pending_verification") {
    return (
      <div className="flex items-start gap-3.5 rounded-[3px] border-l-4 border-ink-soft bg-cream-dark px-6 py-5 mb-8">
        <div className="flex items-center justify-center w-9 h-9 rounded-full bg-surface flex-shrink-0">
          <Clock size={16} className="text-ink-soft" strokeWidth={1.5} />
        </div>
        <div>
          <p className="text-[14px] font-semibold text-ink mb-0.5">
            Your KYC is under review
          </p>
          <p className="text-[12.5px] text-ink-soft leading-relaxed">
            We're verifying your details. This usually takes 24-36 hours — we'll notify you once you're approved.
          </p>
        </div>
      </div>
    );
  }

  if (application.applicationStatus === "rejected") {
    return (
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[3px] border-l-4 border-error bg-error/5 px-6 py-5 mb-8">
        <div className="flex items-start gap-3.5">
          <div className="flex items-center justify-center w-9 h-9 rounded-full bg-error/10 flex-shrink-0">
            <ShieldAlert size={16} className="text-error" strokeWidth={1.5} />
          </div>
          <div>
            <p className="text-[14px] font-semibold text-ink mb-0.5">
              Your KYC application was rejected
            </p>
            <p className="text-[12.5px] text-ink-soft leading-relaxed">
              {application.rejectionReason || "Please review your details and resubmit."}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={onGoToKyc}
          className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-[3px] bg-error px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-error/90"
        >
          Resubmit
          <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  return null;
};

// ---- Quick action tile --------------------------------------------------
const ActionTile = ({ icon: Icon, label, description, locked, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`group relative flex flex-col items-start gap-3 rounded-[3px] border border-border bg-surface p-5 text-left transition-all duration-200 hover:border-ink hover:shadow-sm ${
      locked ? "opacity-70" : ""
    }`}
  >
    <div className="flex items-center justify-center w-10 h-10 rounded-[3px] bg-cream-dark group-hover:bg-gold/15 transition-colors">
      <Icon size={18} className="text-ink" strokeWidth={1.5} />
    </div>
    <div>
      <p className="text-[13.5px] font-semibold text-ink flex items-center gap-1.5">
        {label}
        {locked && <Lock size={11} className="text-ink-soft" strokeWidth={2} />}
      </p>
      <p className="text-[12px] text-ink-soft mt-0.5">{description}</p>
    </div>
  </button>
);

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { user } = useSelector((state) => state.auth);
  const { application, allOrders, loading } = useSelector((state) => state.seller);

  const { handleGetMyApplication, handleGetSellerOrders } = useSeller();
  const [showKycModal, setShowKycModal] = useState(false);

  const isFullSeller = user?.role === "seller";

  useEffect(() => {
    if (!isFullSeller) handleGetMyApplication();
    handleGetSellerOrders();
  }, []);

  const goToKyc = () => navigate("/seller/become-seller/verify");

  const handleListProduct = () => {
    if (!isFullSeller) {
      setShowKycModal(true);
      return;
    }
    navigate("/seller/inventory/new");
  };

  const recentOrders = (allOrders || []).slice(0, 5);

  return (
    <div className="px-5 md:px-8 py-8 max-w-[1200px] mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-gold mb-1">
            Seller Dashboard
          </p>
          <h1 className="font-display text-[26px] font-medium text-ink">
            Welcome back{application?.brandName ? `, ${application.brandName}` : ""}
          </h1>
        </div>
        {isFullSeller && (
          <span className="hidden md:flex items-center gap-1.5 rounded-full bg-success/10 text-success text-[11px] font-semibold px-3.5 py-1.5">
            <Sparkles size={12} />
            Verified Seller
          </span>
        )}
      </div>

      {/* KYC banner — persistent until role becomes "seller" */}
      {!isFullSeller && <KycBanner application={application} onGoToKyc={goToKyc} />}

      {/* Quick actions */}
      <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-3">
        Quick Actions
      </p>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <ActionTile
          icon={PlusCircle}
          label="List a Product"
          description="Add a new item to your store"
          locked={!isFullSeller}
          onClick={handleListProduct}
        />
        <ActionTile
          icon={Boxes}
          label="Inventory"
          description="Manage your listings"
          locked={false}
          onClick={() => navigate("/seller/inventory")}
        />
        <ActionTile
          icon={ShoppingBag}
          label="Orders"
          description="Track and fulfill orders"
          locked={false}
          onClick={() => navigate("/seller/orders")}
        />
        <ActionTile
          icon={Wallet}
          label="Payments"
          description="View payouts & earnings"
          locked={false}
          onClick={() => navigate("/seller/payments")}
        />
      </div>

      {/* Recent orders */}
      <div className="flex items-center justify-between mb-3">
        <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
          Recent Orders
        </p>
        <button
          type="button"
          onClick={() => navigate("/seller/orders")}
          className="text-[11px] font-semibold tracking-[0.05em] text-ink-soft hover:text-ink transition-colors"
        >
          View All
        </button>
      </div>

      <div className="rounded-[3px] border border-border bg-surface overflow-hidden">
        {loading ? (
          <div className="px-6 py-10 text-center text-[13px] text-ink-soft">Loading orders…</div>
        ) : recentOrders.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-[13px] text-ink-soft">No orders yet.</p>
            <p className="text-[12px] text-ink-soft/70 mt-1">
              Orders will show up here once buyers start purchasing.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-border">
            {recentOrders.map((order, idx) => (
              <div
                key={order._id || order.id || idx}
                className="flex items-center justify-between px-6 py-4 hover:bg-cream-dark transition-colors cursor-pointer"
                onClick={() => navigate(`/seller/orders/${order._id || order.id}`)}
              >
                <div>
                  <p className="text-[13px] font-medium text-ink">
                    Order #{(order._id || order.id || "").toString().slice(-6).toUpperCase() || idx + 1}
                  </p>
                  <p className="text-[12px] text-ink-soft mt-0.5">
                    {order.status || "Placed"}
                  </p>
                </div>
                {order.totalAmount != null && (
                  <span className="text-[13px] font-semibold text-ink">₹{order.totalAmount}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {showKycModal && (
        <KycRequiredModal
          onClose={() => setShowKycModal(false)}
          onGoToKyc={() => {
            setShowKycModal(false);
            goToKyc();
          }}
          applicationStatus={application.applicationStatus}
        />
      )}
    </div>
  );
};

export default SellerDashboard;