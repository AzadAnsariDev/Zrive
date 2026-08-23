import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useSelector } from "react-redux";
import {
  Lock, Clock, PlusCircle, Boxes, ShoppingBag, ArrowRight, ArrowUpRight,
  IndianRupee, TrendingUp, Store, ArrowLeft, ChevronRight, ShieldCheck, BarChart2,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import useSeller from "../hook/useSeller";
import SellerAlarmToggle from "../components/SellerAlarmToggle";
import KycRequiredModal from "../components/KycRequiredModal";
import { SellerDashboardSkeleton } from "../../../components/common/Skeleton";
import {
  registerServiceWorker,
  subscribeToPushNotifications,
} from "../services/push-notification.service.js";

const formatINR = (n) =>
  `₹${(Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

const statusTone = (status = "") => {
  const s = status.toLowerCase();
  if (/delivered|completed|approved/.test(s)) return "success";
  if (/cancelled|rejected|failed/.test(s)) return "error";
  if (/shipped|transit|confirm|accepted/.test(s)) return "info";
  return "gold";
};

const TONE_CLASSES = {
  success: "bg-[#EAF5EE] text-[#287A4B] border border-[#287A4B]/20",
  error: "bg-[#FCECEC] text-[#C43D3D] border border-[#C43D3D]/20",
  info: "bg-[#EDF3F6] text-[#536B7A] border border-[#536B7A]/20",
  gold: "bg-[#F5EFE5] text-[#B08D57] border border-[#B08D57]/30",
};

const StatusBadge = ({ status }) => (
  <span
    className={`inline-flex items-center rounded-full px-2 py-0.5 text-[9.5px] font-bold tracking-[0.03em] uppercase ${TONE_CLASSES[statusTone(status)]}`}
  >
    {(status || "Placed").replace(/_/g, " ")}
  </span>
);

const ACCEPTED_STATUSES = new Set(['accepted', 'confirmed', 'packed', 'shipped', 'delivered', 'completed']);

const isAcceptedOrder = (o) => {
  const conf = (o?.confirmationStatus || '').toLowerCase();
  const st = (o?.orderStatus || '').toLowerCase();
  if (ACCEPTED_STATUSES.has(conf)) return true;
  if (['shipped', 'delivered', 'completed'].includes(st)) return true;
  return false;
};

const buildDailySeries = (orders, days = 7) => {
  const now = new Date();
  const buckets = [];
  for (let i = days - 1; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(now.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    buckets.push({
      key,
      label: d.toLocaleDateString("en-IN", { weekday: "short" }),
      revenue: 0,
      orders: 0,
    });
  }
  const map = Object.fromEntries(buckets.map((b) => [b.key, b]));
  (orders || []).forEach((o) => {
    if (!o.createdAt) return;
    const key = new Date(o.createdAt).toISOString().slice(0, 10);
    if (map[key]) {
      if (isAcceptedOrder(o)) {
        map[key].revenue += Number(o.sellerAmount?.amount ?? o.sellerAmount ?? 0);
      }
      map[key].orders += 1;
    }
  });
  return buckets;
};

const KycBanner = ({ application, onGoToKyc }) => {
  if (!application || application.applicationStatus === "basic") {
    return (
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-[6px] border border-[#B08D57] bg-[#F5EFE5] px-4 py-3 mb-5 text-[12px]">
        <div className="flex items-center gap-2.5">
          <Lock size={15} className="text-[#B08D57] shrink-0" />
          <span className="font-semibold text-[#111]">Complete KYC to list products & receive payouts</span>
        </div>
        <button
          type="button"
          onClick={onGoToKyc}
          className="shrink-0 flex items-center gap-1 rounded bg-[#111] px-3.5 py-1.5 text-[11px] font-bold text-white hover:bg-[#B08D57] transition-all"
        >
          Verify KYC &rarr;
        </button>
      </div>
    );
  }

  if (application.applicationStatus === "pending_verification") {
    return (
      <div className="flex items-center gap-2.5 rounded-[6px] border border-[#EAEAEA] bg-[#FAFAFA] px-4 py-3 mb-5 text-[12px]">
        <Clock size={15} className="text-[#666] shrink-0" />
        <span className="text-[#555]">Your KYC is under review by admin team. Usually approved in 24h.</span>
      </div>
    );
  }

  return null;
};

const SellerDashboard = () => {
  const navigate = useNavigate();
  const { handleGetMyApplication, handleGetSellerOrders } = useSeller();

  const { application, stats } = useSelector((state) => state.seller);
  const orders = useSelector((state) => state.seller.orders || []);
  const auth = useSelector((state) => state.auth);

  const [kycModalOpen, setKycModalOpen] = useState(false);

  useEffect(() => {
    handleGetMyApplication();
    handleGetSellerOrders();

    // Create the Web Push subscription before the seller leaves the dashboard.
    // The browser may show its permission prompt here; after that, pushes work
    // when the tab is closed because delivery happens through the service worker.
    registerServiceWorker().then(async () => {
      if (localStorage.getItem("sellerPushNotifications") !== "false") {
        await subscribeToPushNotifications();
      }
    });
  }, []);

  const isVerified = application?.applicationStatus === "approved";
  const chartData = useMemo(() => buildDailySeries(orders, 7), [orders]);

  const totalRevenue = stats?.totalEarnings || 0;
  const activeOrdersCount = orders.filter((o) => !/delivered|cancelled/i.test(o.orderStatus)).length;

  const handleAddProductClick = () => {
    if (!isVerified) {
      setKycModalOpen(true);
      return;
    }
    navigate("/seller/inventory/new");
  };

  if (!application && !orders.length) {
    return <SellerDashboardSkeleton />;
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] text-[12px] pb-12">
      {/* Compact Header */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-2.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1 text-[11px] font-medium text-[#666] hover:text-[#111] transition-colors"
          >
            <ArrowLeft size={13} />
            Marketplace
          </button>
          <div className="flex items-center gap-3">
            <SellerAlarmToggle compact={true} />
            <div className="flex items-center gap-1 text-[10.5px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
              <Store size={13} />
              Merchant Console
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6">
        <KycBanner application={application} onGoToKyc={() => navigate("/seller/become-seller/verify")} />

        {/* Notification Settings Banner */}
        <div className="mb-6">
          <SellerAlarmToggle compact={false} />
        </div>

        {/* Compact Title Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
          <div>
            <span className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#B08D57]">
              {application?.brandName || "Merchant Partner"} · {todayLabel()}
            </span>
            <h1 className="text-[22px] md:text-[26px] font-bold text-[#111] leading-tight">
              Seller Dashboard
            </h1>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleAddProductClick}
              className="flex items-center gap-1.5 bg-[#111] text-white px-4 py-2 rounded text-[11px] font-bold uppercase hover:bg-[#B08D57] transition-all"
            >
              <PlusCircle size={14} />
              Add Product
            </button>
            <button
              onClick={() => navigate("/seller/inventory")}
              className="flex items-center gap-1.5 border border-[#EAEAEA] bg-[#FAFAFA] text-[#111] px-3.5 py-2 rounded text-[11px] font-bold uppercase hover:border-[#111] transition-all"
            >
              <Boxes size={14} />
              Inventory
            </button>
            <button
              onClick={() => navigate("/seller/analytics")}
              className="flex items-center gap-1.5 border border-[#EAEAEA] bg-[#FAFAFA] text-[#111] px-3.5 py-2 rounded text-[11px] font-bold uppercase hover:border-[#B08D57] hover:text-[#B08D57] transition-all"
            >
              <BarChart2 size={14} />
              Analytics
            </button>
          </div>
        </div>

        {/* Compact KPI Grid */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#777]">Total Revenue</span>
              <IndianRupee size={14} className="text-[#B08D57]" />
            </div>
            <p className="text-[20px] font-bold text-[#111]">{formatINR(totalRevenue)}</p>
            <p className="text-[10px] text-[#287A4B] font-semibold mt-0.5">Escrow Settlements</p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#777]">Active Orders</span>
              <ShoppingBag size={14} className="text-[#536B7A]" />
            </div>
            <p className="text-[20px] font-bold text-[#111]">{activeOrdersCount}</p>
            <p className="text-[10px] text-[#777] mt-0.5">Pending Dispatch</p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#777]">Active Products</span>
              <Boxes size={14} className="text-[#287A4B]" />
            </div>
            <p className="text-[20px] font-bold text-[#111]">{stats?.totalProducts || 0}</p>
            <p className="text-[10px] text-[#777] mt-0.5">Listed in Catalog</p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] p-4">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#777]">KYC Status</span>
              <ShieldCheck size={14} className="text-[#B08D57]" />
            </div>
            <p className="text-[14px] font-bold text-[#111] uppercase">{application?.applicationStatus || "Basic"}</p>
            <p className="text-[10px] text-[#B08D57] font-semibold mt-0.5">ZRIVE Verified</p>
          </div>
        </div>

        {/* Chart & Actions */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
          <div className="lg:col-span-2 bg-white border border-[#EAEAEA] rounded-[6px] p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAEAEA]">
              <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
                7-Day Sales Trend (₹)
              </h2>
            </div>
            <div className="h-[200px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#B08D57" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#B08D57" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EAEAEA" vertical={false} />
                  <XAxis dataKey="label" stroke="#777" fontSize={10} tickLine={false} />
                  <YAxis stroke="#777" fontSize={10} tickLine={false} axisLine={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: "#111", border: "none", borderRadius: "4px", color: "#fff", fontSize: "11px" }}
                    formatter={(val) => [`₹${val}`, "Revenue"]}
                  />
                  <Area type="monotone" dataKey="revenue" stroke="#B08D57" strokeWidth={2} fillOpacity={1} fill="url(#goldGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] p-4">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57] mb-3 pb-2 border-b border-[#EAEAEA]">
              Quick Shortcuts
            </h2>

            <div className="space-y-2">
              <button
                onClick={() => navigate("/seller/inventory/new")}
                className="w-full flex items-center justify-between p-2.5 rounded bg-white border border-[#EAEAEA] hover:border-[#B08D57] transition-all text-left text-[11.5px] font-semibold"
              >
                <div className="flex items-center gap-2">
                  <PlusCircle size={14} className="text-[#B08D57]" />
                  <span>Create Listing</span>
                </div>
                <ArrowUpRight size={14} className="text-[#999]" />
              </button>

              <button
                onClick={() => navigate("/seller/orders")}
                className="w-full flex items-center justify-between p-2.5 rounded bg-white border border-[#EAEAEA] hover:border-[#B08D57] transition-all text-left text-[11.5px] font-semibold"
              >
                <div className="flex items-center gap-2">
                  <ShoppingBag size={14} className="text-[#B08D57]" />
                  <span>Fulfill Orders</span>
                </div>
                <ArrowUpRight size={14} className="text-[#999]" />
              </button>

              <button
                onClick={() => navigate("/seller/inventory")}
                className="w-full flex items-center justify-between p-2.5 rounded bg-white border border-[#EAEAEA] hover:border-[#B08D57] transition-all text-left text-[11.5px] font-semibold"
              >
                <div className="flex items-center gap-2">
                  <Boxes size={14} className="text-[#B08D57]" />
                  <span>Manage Stock</span>
                </div>
                <ArrowUpRight size={14} className="text-[#999]" />
              </button>
            </div>
          </div>
        </div>

        {/* Compact Recent Orders Table */}
        <div className="bg-white border border-[#EAEAEA] rounded-[6px] p-4">
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-[#EAEAEA]">
            <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
              Recent Orders ({orders.length})
            </h2>
            <button
              onClick={() => navigate("/seller/orders")}
              className="text-[11px] font-bold text-[#111] hover:text-[#B08D57] flex items-center gap-1"
            >
              View All &rarr;
            </button>
          </div>

          {orders.length === 0 ? (
            <p className="text-[12px] text-[#666] py-6 text-center">No orders received yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-[#EAEAEA] text-[9.5px] font-bold uppercase tracking-[0.08em] text-[#777]">
                    <th className="py-2 px-3">Order ID</th>
                    <th className="py-2 px-3">Customer</th>
                    <th className="py-2 px-3">Items</th>
                    <th className="py-2 px-3">Total</th>
                    <th className="py-2 px-3">Status</th>
                    <th className="py-2 px-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#EAEAEA] text-[12px]">
                  {orders.slice(0, 5).map((o) => (
                    <tr key={o._id} className="hover:bg-[#FAFAFA]">
                      <td className="py-2.5 px-3 font-bold text-[#111]">#{o._id?.slice(-8).toUpperCase()}</td>
                      <td className="py-2.5 px-3">
                        {o.shippingAddress?.name || o.shippingAddress?.fullName || o.address?.fullName || o.address?.name || "Buyer"}
                      </td>
                      <td className="py-2.5 px-3">{o.orderItems?.length || 1} Item(s)</td>
                      <td className="py-2.5 px-3 font-bold text-[#111]">₹{o.sellerAmount?.amount || o.totalAmount || 0}</td>
                      <td className="py-2.5 px-3"><StatusBadge status={o.orderStatus} /></td>
                      <td className="py-2.5 px-3 text-right">
                        <button
                          onClick={() => navigate(`/seller/orders/${o._id}`)}
                          className="text-[11px] font-bold uppercase text-[#B08D57] hover:underline"
                        >
                          Details &rarr;
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {kycModalOpen && <KycRequiredModal onClose={() => setKycModalOpen(false)} />}
    </div>
  );
};

export default SellerDashboard;