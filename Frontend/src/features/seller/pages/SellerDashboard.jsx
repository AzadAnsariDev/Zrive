import React, { useEffect, useMemo, useState, useRef } from "react";
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
  ArrowUpRight,
  Sparkles,
  IndianRupee,
  PackageSearch,
  TrendingUp,
  CalendarDays,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  CartesianGrid,
} from "recharts";
import useSeller from "../hook/useSeller";
import KycRequiredModal from "../components/KycRequiredModal";

/* ─────────────────────────────────────────────
   ACCENT PALETTE — colorful but premium, not neon
───────────────────────────────────────────── */
const ACCENTS = {
  gold: { solid: "#B08D57" },
  emerald: { solid: "#2F7D5D" },
  sapphire: { solid: "#3A6EA5" },
  wine: { solid: "#A6435A" },
};
const STATUS_COLORS = ["#B08D57", "#3A6EA5", "#2F7D5D", "#A6435A", "#8B7EC8"];

/* ─────────────────────────────────────────────
   HELPERS
───────────────────────────────────────────── */
const formatINR = (n) =>
  `₹${(Number(n) || 0).toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;

const isTerminalStatus = (status) =>
  /delivered|completed|cancelled|rejected|returned/i.test(status || "");

const todayLabel = () =>
  new Date().toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

const statusTone = (status = "") => {
  const s = status.toLowerCase();
  if (/delivered|completed|approved/.test(s)) return "success";
  if (/cancelled|rejected|failed/.test(s)) return "error";
  if (/shipped|transit|confirm|accepted/.test(s)) return "info";
  return "gold";
};

const TONE_CLASSES = {
  success: "bg-success/10 text-success",
  error: "bg-error/10 text-error",
  info: "bg-[#3A6EA5]/10 text-[#3A6EA5]",
  gold: "bg-gold/15 text-gold-deep",
};

const StatusBadge = ({ status }) => {
  const tone = statusTone(status);
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-[10.5px] font-semibold tracking-[0.02em] capitalize ${TONE_CLASSES[tone]}`}
    >
      {(status || "Placed").replace(/_/g, " ")}
    </span>
  );
};

/* Builds a real (not fake-random) last-7-day revenue/order series from
   whatever orders actually have createdAt — days with no orders show 0. */
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
      map[key].revenue += Number(o.totalAmount) || 0;
      map[key].orders += 1;
    }
  });
  return buckets;
};

/* Lightweight count-up — no extra deps */
const useCountUp = (target = 0, duration = 900) => {
  const [value, setValue] = useState(0);
  const ref = useRef(null);
  useEffect(() => {
    const start = performance.now();
    const from = 0;
    const animate = (now) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setValue(from + (target - from) * eased);
      if (p < 1) ref.current = requestAnimationFrame(animate);
    };
    ref.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(ref.current);
  }, [target, duration]);
  return value;
};

const CountUp = ({ value, formatter = (v) => Math.round(v).toLocaleString("en-IN") }) => {
  const animated = useCountUp(value);
  return <>{formatter(animated)}</>;
};

/* Local keyframes — self-contained, no tailwind.config changes needed */
const LocalStyles = () => (
  <style>{`
    @keyframes zriveFadeUp { from { opacity:0; transform:translateY(10px);} to {opacity:1; transform:translateY(0);} }
    @keyframes zriveFloat { 0%,100% { transform: translateY(0) translateX(0); } 50% { transform: translateY(-14px) translateX(6px); } }
    @keyframes zrivePulse { 0%,100% { opacity:1; } 50% { opacity:.45; } }
    .zrive-fade-up { animation: zriveFadeUp .55s cubic-bezier(.16,1,.3,1) both; }
    .zrive-float-a { animation: zriveFloat 9s ease-in-out infinite; }
    .zrive-float-b { animation: zriveFloat 12s ease-in-out infinite reverse; }
    .zrive-pulse-dot { animation: zrivePulse 1.8s ease-in-out infinite; }
  `}</style>
);

// ---- Dynamic KYC status banner ----------------------------------------
const KycBanner = ({ application, onGoToKyc }) => {
  if (!application || application.applicationStatus === "basic") {
    return (
      <div className="zrive-fade-up flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[3px] border-l-4 border-gold bg-gold/10 px-6 py-5 mb-8">
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
          className="flex-shrink-0 flex items-center justify-center gap-1.5 rounded-[3px] bg-charcoal px-5 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-all duration-200 hover:bg-ink hover:shadow-lg hover:-translate-y-0.5"
        >
          Complete KYC
          <ArrowRight size={13} />
        </button>
      </div>
    );
  }

  if (application.applicationStatus === "pending_verification") {
    return (
      <div className="zrive-fade-up flex items-start gap-3.5 rounded-[3px] border-l-4 border-ink-soft bg-cream-dark px-6 py-5 mb-8">
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
      <div className="zrive-fade-up flex flex-col md:flex-row md:items-center justify-between gap-4 rounded-[3px] border-l-4 border-error bg-error/5 px-6 py-5 mb-8">
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

// ---- Quick action tile (colorful per-action accent) ------------------------
const ACTION_ACCENTS = {
  gold: "bg-[#B08D57]/12 text-[#8A6D3F] group-hover:bg-[#B08D57]/20",
  sapphire: "bg-[#3A6EA5]/10 text-[#3A6EA5] group-hover:bg-[#3A6EA5]/18",
  emerald: "bg-[#2F7D5D]/10 text-[#2F7D5D] group-hover:bg-[#2F7D5D]/18",
  wine: "bg-[#A6435A]/10 text-[#A6435A] group-hover:bg-[#A6435A]/18",
};

const ActionTile = ({ icon: Icon, label, description, locked, onClick, accent, delay = 0 }) => (
  <button
    type="button"
    onClick={onClick}
    style={{ animationDelay: `${delay}ms` }}
    className={`zrive-fade-up group relative flex flex-col items-start gap-3 rounded-[3px] border border-border bg-surface p-5 text-left transition-all duration-200 hover:border-ink/20 hover:shadow-[0_8px_24px_rgba(17,17,17,0.08)] hover:-translate-y-0.5 ${
      locked ? "opacity-70" : ""
    }`}
  >
    <ArrowUpRight
      size={14}
      strokeWidth={1.5}
      className="absolute top-4 right-4 text-ink-soft/0 group-hover:text-gold-deep group-hover:opacity-100 opacity-0 transition-all duration-200"
    />
    <div className={`flex items-center justify-center w-10 h-10 rounded-[3px] transition-colors ${ACTION_ACCENTS[accent]}`}>
      <Icon size={18} strokeWidth={1.5} />
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

// ---- Stat card with sparkline + count-up -----------------------------------
const StatCard = ({ icon: Icon, label, value, hint, accent, sparkData, sparkKey, delay = 0, isCurrency }) => {
  const color = ACCENTS[accent].solid;
  return (
    <div
      style={{ animationDelay: `${delay}ms` }}
      className="zrive-fade-up relative overflow-hidden rounded-[3px] border border-border bg-surface p-5 transition-all duration-200 hover:shadow-[0_10px_28px_rgba(17,17,17,0.07)] hover:-translate-y-0.5"
    >
      <div className="flex items-center justify-between mb-4">
        <div
          className="flex items-center justify-center w-9 h-9 rounded-full"
          style={{ backgroundColor: `${color}1F` }}
        >
          <Icon size={16} style={{ color }} strokeWidth={1.5} />
        </div>
        {sparkData && (
          <div className="w-20 h-9 opacity-90">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={sparkData}>
                <defs>
                  <linearGradient id={`spark-${accent}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity={0.45} />
                    <stop offset="100%" stopColor={color} stopOpacity={0} />
                  </linearGradient>
                </defs>
                <Area
                  type="monotone"
                  dataKey={sparkKey}
                  stroke={color}
                  strokeWidth={1.75}
                  fill={`url(#spark-${accent})`}
                  isAnimationActive
                  animationDuration={900}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>
      <p className="font-display text-[24px] leading-none text-ink mb-1.5">
        {isCurrency ? (
          <CountUp value={value} formatter={(v) => formatINR(v)} />
        ) : (
          <CountUp value={value} />
        )}
      </p>
      <p className="text-[11.5px] font-semibold tracking-[0.06em] uppercase text-ink-soft">
        {label}
      </p>
      {hint && <p className="text-[11.5px] text-ink-soft/70 mt-1">{hint}</p>}
    </div>
  );
};

// ---- Onboarding progress ring — signature element -------------------------
const OnboardingRing = ({ isFullSeller, applicationStatus }) => {
  const targetPct = isFullSeller
    ? 100
    : applicationStatus === "pending_verification"
    ? 65
    : applicationStatus === "rejected"
    ? 50
    : 25;

  const [pct, setPct] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setPct(targetPct), 120);
    return () => clearTimeout(t);
  }, [targetPct]);

  const steps = [
    { label: "Account created", done: true },
    { label: "Brand & KYC submitted", done: targetPct >= 50 },
    { label: "Under review", done: targetPct >= 65 },
    { label: "Approved to sell", done: targetPct >= 100 },
  ];

  return (
    <div className="zrive-fade-up rounded-[3px] border border-border bg-surface p-5" style={{ animationDelay: "150ms" }}>
      <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-4">
        Seller Status
      </p>
      <div className="flex items-center gap-4 mb-5">
        <div
          className="relative w-16 h-16 rounded-full flex items-center justify-center shrink-0 transition-[background] duration-700 ease-out"
          style={{
            background: `conic-gradient(#B08D57 ${pct}%, #ECE7DC ${pct}% 100%)`,
          }}
        >
          <div className="w-[52px] h-[52px] rounded-full bg-surface flex items-center justify-center">
            <span className="font-display text-[15px] text-ink">
              <CountUp value={pct} formatter={(v) => `${Math.round(v)}%`} />
            </span>
          </div>
        </div>
        <div>
          <p className="text-[13.5px] font-semibold text-ink">
            {isFullSeller ? "Verified Seller" : "Getting Started"}
          </p>
          <p className="text-[12px] text-ink-soft mt-0.5">
            {isFullSeller
              ? "Your store is fully live on ZRIVE."
              : "Complete KYC to unlock listings."}
          </p>
        </div>
      </div>
      <div className="space-y-2.5">
        {steps.map((s) => (
          <div key={s.label} className="flex items-center gap-2.5">
            <span
              className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-500 ${
                s.done ? "bg-gold-deep" : "bg-border"
              }`}
            />
            <span className={`text-[12px] ${s.done ? "text-ink" : "text-ink-soft/70"}`}>
              {s.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ---- Order status donut chart ------------------------------------------------
const OrderStatusDonut = ({ allOrders }) => {
  const data = useMemo(() => {
    const map = {};
    (allOrders || []).forEach((o) => {
      const key = (o.status || "Placed").replace(/_/g, " ");
      map[key] = (map[key] || 0) + 1;
    });
    return Object.entries(map)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5);
  }, [allOrders]);

  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <div className="zrive-fade-up rounded-[3px] border border-border bg-surface p-5" style={{ animationDelay: "220ms" }}>
      <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-4">
        Order Breakdown
      </p>
      {total === 0 ? (
        <p className="text-[12.5px] text-ink-soft/70">
          Status breakdown will appear once orders start coming in.
        </p>
      ) : (
        <div className="flex items-center gap-5">
          <div className="w-[110px] h-[110px] shrink-0 relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={34}
                  outerRadius={52}
                  paddingAngle={3}
                  isAnimationActive
                  animationDuration={800}
                  stroke="none"
                >
                  {data.map((_, i) => (
                    <Cell key={i} fill={STATUS_COLORS[i % STATUS_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    borderRadius: 3,
                    border: "1px solid #ECE7DC",
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="font-display text-[16px] text-ink leading-none">{total}</span>
              <span className="text-[9px] text-ink-soft uppercase tracking-wide mt-0.5">orders</span>
            </div>
          </div>
          <div className="space-y-2 flex-1 min-w-0">
            {data.map((d, i) => (
              <div key={d.name} className="flex items-center gap-2 min-w-0">
                <span
                  className="w-2 h-2 rounded-full shrink-0"
                  style={{ backgroundColor: STATUS_COLORS[i % STATUS_COLORS.length] }}
                />
                <span className="text-[12px] text-ink capitalize truncate flex-1">{d.name}</span>
                <span className="text-[12px] font-semibold text-ink-soft shrink-0">{d.value}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

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

  const recentOrders = (allOrders || []).slice(0, 6);

  const stats = useMemo(() => {
    const orders = allOrders || [];
    const totalOrders = orders.length;
    const totalRevenue = orders.reduce((sum, o) => sum + (Number(o.totalAmount) || 0), 0);
    const pending = orders.filter((o) => !isTerminalStatus(o.status)).length;
    return { totalOrders, totalRevenue, pending };
  }, [allOrders]);

  const dailySeries = useMemo(() => buildDailySeries(allOrders, 7), [allOrders]);

  return (
    <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-8">
      <LocalStyles />

      {/* ══════════════════════════════════════════
          GRADIENT HERO
      ══════════════════════════════════════════ */}
      <div
        className="zrive-fade-up relative overflow-hidden rounded-[3px] mb-8 px-6 md:px-8 py-8 md:py-10"
        style={{
          background:
            "radial-gradient(120% 140% at 0% 0%, #1D1B18 0%, #2B2620 42%, #3E3324 72%, #B08D57 130%)",
        }}
      >
        {/* floating ambient blobs */}
        <div
          className="zrive-float-a absolute -top-10 right-10 w-40 h-40 rounded-full blur-3xl opacity-30 pointer-events-none"
          style={{ background: "#B08D57" }}
        />
        <div
          className="zrive-float-b absolute bottom-0 right-40 w-28 h-28 rounded-full blur-3xl opacity-20 pointer-events-none"
          style={{ background: "#3A6EA5" }}
        />

        <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#E9CD7A] mb-2">
              Seller Dashboard
            </p>
            <h1 className="font-display text-[28px] md:text-[32px] font-medium text-cream leading-tight">
              Welcome back{application?.brandName ? `, ${application.brandName}` : ""}
            </h1>
            <p className="flex items-center gap-1.5 text-[12.5px] text-cream/60 mt-2">
              <CalendarDays size={13} strokeWidth={1.5} />
              {todayLabel()}
            </p>
          </div>
          {isFullSeller && (
            <span className="flex items-center gap-2 self-start md:self-auto rounded-full bg-white/10 backdrop-blur-sm text-cream text-[11px] font-semibold px-4 py-2 border border-white/15">
              <span className="relative flex h-2 w-2">
                <span className="zrive-pulse-dot absolute inline-flex h-full w-full rounded-full bg-emerald-400" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
              </span>
              Verified Seller
            </span>
          )}
        </div>
      </div>

      {/* KYC banner — persistent until role becomes "seller" */}
      {!isFullSeller && <KycBanner application={application} onGoToKyc={goToKyc} />}

      {/* ══════════════════════════════════════════
          STATS OVERVIEW — colorful, sparklines, count-up
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 mb-10">
        <StatCard
          icon={ShoppingBag}
          label="Total Orders"
          value={loading ? 0 : stats.totalOrders}
          hint="All time"
          accent="gold"
          sparkData={dailySeries}
          sparkKey="orders"
          delay={0}
        />
        <StatCard
          icon={IndianRupee}
          label="Total Revenue"
          value={loading ? 0 : stats.totalRevenue}
          hint="Across all orders"
          accent="emerald"
          sparkData={dailySeries}
          sparkKey="revenue"
          isCurrency
          delay={60}
        />
        <StatCard
          icon={PackageSearch}
          label="Needs Attention"
          value={loading ? 0 : stats.pending}
          hint="Orders awaiting fulfillment"
          accent="wine"
          delay={120}
        />
      </div>

      {/* ══════════════════════════════════════════
          REVENUE OVERVIEW CHART
      ══════════════════════════════════════════ */}
      <div className="zrive-fade-up rounded-[3px] border border-border bg-surface p-5 md:p-6 mb-10" style={{ animationDelay: "80ms" }}>
        <div className="flex items-center justify-between mb-5">
          <div>
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1">
              Revenue Overview
            </p>
            <p className="text-[12px] text-ink-soft/70">Last 7 days</p>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
            <TrendingUp size={12} strokeWidth={2} />
            Live
          </div>
        </div>
        <div className="h-[220px] -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={dailySeries} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#B08D57" stopOpacity={0.35} />
                  <stop offset="100%" stopColor="#B08D57" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid vertical={false} stroke="#ECE7DC" />
              <XAxis
                dataKey="label"
                tickLine={false}
                axisLine={false}
                tick={{ fontSize: 11, fill: "#8C8577" }}
              />
              <YAxis hide />
              <Tooltip
                formatter={(v, name) => (name === "revenue" ? formatINR(v) : v)}
                contentStyle={{ borderRadius: 3, border: "1px solid #ECE7DC", fontSize: 12 }}
                labelStyle={{ fontWeight: 600, color: "#1A1815" }}
              />
              <Area
                type="monotone"
                dataKey="revenue"
                stroke="#B08D57"
                strokeWidth={2.25}
                fill="url(#revenueFill)"
                isAnimationActive
                animationDuration={1100}
                dot={{ r: 3, stroke: "#B08D57", strokeWidth: 2, fill: "#fff" }}
                activeDot={{ r: 5 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          QUICK ACTIONS
      ══════════════════════════════════════════ */}
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
          accent="gold"
          delay={0}
        />
        <ActionTile
          icon={Boxes}
          label="Inventory"
          description="Manage your listings"
          locked={false}
          onClick={() => navigate("/seller/inventory")}
          accent="sapphire"
          delay={60}
        />
        <ActionTile
          icon={ShoppingBag}
          label="Orders"
          description="Track and fulfill orders"
          locked={false}
          onClick={() => navigate("/seller/orders")}
          accent="emerald"
          delay={120}
        />
        <ActionTile
          icon={Wallet}
          label="Payments"
          description="View payouts & earnings"
          locked={false}
          onClick={() => navigate("/seller/payments")}
          accent="wine"
          delay={180}
        />
      </div>

      {/* ══════════════════════════════════════════
          RECENT ORDERS + SIDE WIDGETS
      ══════════════════════════════════════════ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <p className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
              Recent Orders
            </p>
            <button
              type="button"
              onClick={() => navigate("/seller/orders")}
              className="flex items-center gap-1 text-[11px] font-semibold tracking-[0.05em] text-ink-soft hover:text-ink transition-colors"
            >
              View All
              <ArrowRight size={11} />
            </button>
          </div>

          <div className="zrive-fade-up rounded-[3px] border border-border bg-surface overflow-hidden" style={{ animationDelay: "100ms" }}>
            {loading ? (
              <div className="px-6 py-10 text-center text-[13px] text-ink-soft">Loading orders…</div>
            ) : recentOrders.length === 0 ? (
              <div className="px-6 py-14 text-center">
                <div className="w-11 h-11 rounded-full bg-cream-dark flex items-center justify-center mx-auto mb-3">
                  <ShoppingBag size={18} className="text-ink-soft" strokeWidth={1.5} />
                </div>
                <p className="text-[13px] font-medium text-ink">No orders yet</p>
                <p className="text-[12px] text-ink-soft/70 mt-1">
                  Orders will show up here once buyers start purchasing.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden sm:grid grid-cols-[1fr_1fr_auto] gap-4 px-6 py-3 border-b border-border bg-cream-dark/60">
                  <span className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-ink-soft">
                    Order
                  </span>
                  <span className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-ink-soft">
                    Status
                  </span>
                  <span className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-ink-soft text-right">
                    Amount
                  </span>
                </div>
                <div className="divide-y divide-border">
                  {recentOrders.map((order, idx) => (
                    <div
                      key={order._id || order.id || idx}
                      className="grid grid-cols-[1fr_auto] sm:grid-cols-[1fr_1fr_auto] items-center gap-4 px-6 py-4 hover:bg-cream-dark/50 transition-colors cursor-pointer"
                      onClick={() => navigate(`/seller/orders/${order._id || order.id}`)}
                    >
                      <p className="text-[13px] font-medium text-ink">
                        Order #{(order._id || order.id || "").toString().slice(-6).toUpperCase() || idx + 1}
                      </p>
                      <div className="hidden sm:block">
                        <StatusBadge status={order.status} />
                      </div>
                      {order.totalAmount != null ? (
                        <span className="text-[13px] font-semibold text-ink text-right">
                          {formatINR(order.totalAmount)}
                        </span>
                      ) : (
                        <span className="text-[13px] text-ink-soft text-right">—</span>
                      )}
                      <div className="sm:hidden col-span-2 -mt-1">
                        <StatusBadge status={order.status} />
                      </div>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        <div className="space-y-6">
          <OnboardingRing
            isFullSeller={isFullSeller}
            applicationStatus={application?.applicationStatus}
          />
          <OrderStatusDonut allOrders={allOrders} />
        </div>
      </div>

      {/* Footer tip */}
      <div className="zrive-fade-up mt-10 flex items-center gap-3 rounded-[3px] border border-border bg-cream-dark/50 px-6 py-4" style={{ animationDelay: "180ms" }}>
        <div className="w-8 h-8 rounded-full bg-gold/15 flex items-center justify-center shrink-0">
          <TrendingUp size={14} className="text-gold-deep" strokeWidth={1.5} />
        </div>
        <p className="text-[12.5px] text-ink-soft">
          Sellers who respond to orders within 12 hours see fewer cancellations. Keep an eye on{" "}
          <button
            type="button"
            onClick={() => navigate("/seller/orders")}
            className="text-ink font-semibold underline underline-offset-2 hover:text-gold-deep transition-colors"
          >
            your orders
          </button>{" "}
          to stay on top of fulfillment.
        </p>
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