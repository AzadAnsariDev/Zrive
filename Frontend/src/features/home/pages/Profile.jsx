import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import {
  User,
  Lock,
  MapPin,
  SlidersHorizontal,
  LogOut,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Trash2,
  Check,
  Package,
  Heart,
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone,
  CalendarDays,
  ArrowUpRight,
  Sparkles,
  CircleCheck,
  KeyRound,
  Bell,
  Ruler,
  Home,
  Briefcase,
  MoreHorizontal,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../../auth/hook/useAuth";
import useAddress from "../../address/hook/useAddress";

/* =========================================================
   DESIGN SYSTEM
========================================================= */

const CONTAINER = "max-w-[1180px] mx-auto";
const CARD =
  "bg-white border border-black/[0.07] rounded-2xl shadow-[0_8px_30px_rgba(0,0,0,0.035)]";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

const memberSince = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
};

/* =========================================================
   SMALL UI COMPONENTS
========================================================= */

const SectionHeading = ({ eyebrow, title, description, action }) => (
  <div className="flex items-start justify-between gap-5 mb-6">
    <div>
      {eyebrow && (
        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#9A7B35] mb-1.5">
          {eyebrow}
        </p>
      )}

      <h2 className="text-[21px] md:text-[23px] font-semibold tracking-[-0.025em] text-[#171717]">
        {title}
      </h2>

      {description && (
        <p className="text-[13px] text-[#777] mt-1.5 leading-relaxed max-w-[600px]">
          {description}
        </p>
      )}
    </div>

    {action}
  </div>
);

const Field = ({ label, icon: Icon, ...props }) => (
  <label className="block">
    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#777] mb-2">
      {Icon && <Icon size={12} />}
      {label}
    </span>

    <input
      {...props}
      className="w-full h-[46px] bg-[#FAFAF8] border border-black/[0.08] rounded-xl px-3.5 text-[13.5px] text-[#171717] placeholder:text-[#AAA] focus:outline-none focus:bg-white focus:border-[#171717]/30 focus:ring-4 focus:ring-black/[0.025] transition-all disabled:bg-[#F2F2F0] disabled:text-[#999]"
    />
  </label>
);

const Toggle = ({ checked, onChange, label, hint, icon: Icon }) => (
  <div className="flex items-center justify-between gap-5 py-4 border-b border-black/[0.06] last:border-b-0">
    <div className="flex items-start gap-3">
      {Icon && (
        <div className="w-9 h-9 rounded-xl bg-[#F6F5F1] flex items-center justify-center text-[#555] shrink-0">
          <Icon size={16} strokeWidth={1.7} />
        </div>
      )}

      <div>
        <p className="text-[13.5px] font-medium text-[#222]">{label}</p>
        {hint && (
          <p className="text-[12px] text-[#888] mt-0.5 leading-relaxed">
            {hint}
          </p>
        )}
      </div>
    </div>

    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
        checked ? "bg-[#171717]" : "bg-[#E4E4E0]"
      }`}
    >
      <span
        className={`h-4 w-4 rounded-full bg-white shadow-sm transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  </div>
);

const PrimaryButton = ({ children, loading, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-[#171717] text-white text-[12px] font-semibold hover:bg-[#2B2B2B] active:scale-[0.98] transition-all disabled:opacity-50 disabled:pointer-events-none"
  >
    {children}
    {loading && (
      <span className="w-3.5 h-3.5 rounded-full border-2 border-white/30 border-t-white animate-spin" />
    )}
  </button>
);

const SecondaryButton = ({ children, ...props }) => (
  <button
    {...props}
    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white border border-black/[0.09] text-[#333] text-[12px] font-semibold hover:border-black/20 hover:bg-[#FAFAF8] transition-all"
  >
    {children}
  </button>
);

/* ---------------------------------------------------------
   Hero stat (Orders / Wishlist / Addresses quick links)
--------------------------------------------------------- */

const HeroStat = ({ label, icon: Icon, value, onClick, bordered, showArrow = true }) => (
  <button
    onClick={onClick}
    className={`text-left group ${bordered ? "border-l border-white/10 pl-5" : ""}`}
  >
    <p className="text-[10px] uppercase tracking-[0.12em] text-white/35">{label}</p>
    <div className="flex items-center gap-1 mt-1.5">
      <Icon size={15} className="text-[#D9BF83]" />
      <span className="text-[14px] font-medium text-white">{value}</span>
      {showArrow && (
        <ArrowUpRight
          size={13}
          className="text-white/30 group-hover:text-white transition-colors"
        />
      )}
    </div>
  </button>
);

/* ---------------------------------------------------------
   Overview quick link card
--------------------------------------------------------- */

const QuickLinkCard = ({ icon: Icon, iconBg, iconColor, title, description, onClick }) => (
  <button
    type="button"
    onClick={onClick}
    className={`${CARD} p-5 text-left group hover:-translate-y-0.5 transition-transform`}
  >
    <div className="flex items-start justify-between">
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center"
        style={{ background: iconBg }}
      >
        <Icon size={19} style={{ color: iconColor }} />
      </div>

      <ArrowUpRight
        size={16}
        className="text-[#AAA] group-hover:text-[#171717] transition-colors"
      />
    </div>

    <p className="text-[16px] font-semibold mt-5">{title}</p>
    <p className="text-[12px] text-[#888] mt-1">{description}</p>
  </button>
);

/* ---------------------------------------------------------
   Account info row (used inside the overview summary card)
--------------------------------------------------------- */

const InfoRow = ({ icon: Icon, label, value, borderRight, borderBottom }) => (
  <div
    className={`p-5 md:p-6 ${borderBottom ? "border-b" : ""} ${
      borderRight ? "sm:border-r" : ""
    } border-black/[0.06]`}
  >
    <div className="flex items-center gap-3">
      <div className="w-9 h-9 rounded-xl bg-[#F6F6F3] flex items-center justify-center">
        <Icon size={15} className="text-[#666]" />
      </div>

      <div className="min-w-0">
        <p className="text-[10px] uppercase tracking-[0.1em] text-[#999]">{label}</p>
        <p className="text-[13px] font-medium mt-0.5 truncate">{value || "Not added"}</p>
      </div>
    </div>
  </div>
);

/* ---------------------------------------------------------
   Sign out control — shared between desktop sidebar & mobile
--------------------------------------------------------- */

const LogoutControl = ({ variant = "desktop", confirming, onRequestConfirm, onCancel, onConfirm }) => {
  const isMobile = variant === "mobile";

  if (!confirming) {
    return (
      <button
        type="button"
        onClick={onRequestConfirm}
        className={
          isMobile
            ? "inline-flex items-center gap-2.5 h-10 px-4 rounded-xl border border-red-100 bg-red-50/60 text-[12px] font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
            : "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-red-100 bg-red-50/60 text-[12px] font-medium text-red-600 hover:bg-red-50 hover:border-red-200 transition-all"
        }
      >
        <LogOut size={15} />
        {isMobile ? "Sign out of ZRIVE" : "Sign out"}
      </button>
    );
  }

  if (isMobile) {
    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 h-10 rounded-xl border border-black/[0.08] text-[11px] font-semibold text-[#777]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="flex-1 h-10 rounded-xl bg-red-600 hover:bg-red-700 text-white text-[11px] font-semibold transition-colors"
        >
          Confirm sign out
        </button>
      </div>
    );
  }

  return (
    <div className={`${CARD} p-3`}>
      <p className="text-[11px] text-[#555] mb-3">Sign out from this account?</p>

      <div className="grid grid-cols-2 gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="h-9 rounded-lg border border-black/[0.08] text-[10px] font-semibold text-[#777]"
        >
          Cancel
        </button>

        <button
          type="button"
          onClick={onConfirm}
          className="h-9 rounded-lg bg-red-600 hover:bg-red-700 text-white text-[10px] font-semibold transition-colors"
        >
          Sign out
        </button>
      </div>
    </div>
  );
};

/* =========================================================
   SIDEBAR NAV CONFIG
========================================================= */

const NAV = [
  { id: "overview", label: "Overview", icon: Sparkles },
  { id: "details", label: "Personal details", icon: User },
  { id: "security", label: "Security", icon: ShieldCheck },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

/* =========================================================
   PAGE
========================================================= */

const Profile = () => {
  const navigate = useNavigate();

  const { handleUpdateProfile, handleChangePassword, handleLogout } = useAuth();

  const { handleCreateAddress, handleGetAllAddresses, handleUpdateAddress, handleDeleteAddress } = useAddress();

  const user = useSelector((state) => state.auth?.user) || {};
  const addresses = useSelector((state) => state.address?.addresses) || [];

  const savingProfile = useSelector((state) => state.auth?.updateLoading);
  const changingPassword = useSelector((state) => state.auth?.passwordLoading);

  const [activeTab, setActiveTab] = useState("overview");
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  /* =========================================================
     PERSONAL DETAILS
  ========================================================= */

  const [form, setForm] = useState({
    fullName: user.username || "",
    email: user.email || "",
    phone: user.contact || "",
    gender: user.gender || "",
    dob: user.dob || "",
  });

  const onFormChange = (e) =>
    setForm((f) => ({
      ...f,
      [e.target.name]: e.target.value,
    }));

  const onSaveDetails = async (e) => {
    e.preventDefault();

    const result = await handleUpdateProfile(form);

    if (result) {
      toast.success("Profile updated");
    }
  };

  /* =========================================================
     SECURITY
  ========================================================= */

  const [pwd, setPwd] = useState({
    current: "",
    next: "",
    confirm: "",
  });

  const [showPwd, setShowPwd] = useState({
    current: false,
    next: false,
    confirm: false,
  });

  const onPwdChange = (e) =>
    setPwd((p) => ({
      ...p,
      [e.target.name]: e.target.value,
    }));

  const onChangePassword = async (e) => {
    e.preventDefault();

    if (pwd.next.length < 8) {
      toast.error("New password should be at least 8 characters");
      return;
    }

    if (pwd.next !== pwd.confirm) {
      toast.error("New passwords don't match");
      return;
    }

    const result = await handleChangePassword({
      currentPassword: pwd.current,
      newPassword: pwd.next,
    });

    if (result) {
      toast.success("Password updated");

      setPwd({
        current: "",
        next: "",
        confirm: "",
      });
    }
  };

  /* =========================================================
     ADDRESSES
  ========================================================= */

  const [addingAddress, setAddingAddress] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [addrForm, setAddrForm] = useState({
    fullName: "",
    addressType: "Home",
    addressLine1: "",
    addressLine2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });

  const resetAddrForm = () =>
    setAddrForm({
      fullName: "",
      addressType: "Home",
      addressLine1: "",
      addressLine2: "",
      city: "",
      state: "",
      pincode: "",
      phone: "",
    });

  const onAddrChange = (e) =>
    setAddrForm((a) => ({
      ...a,
      [e.target.name]: e.target.value,
    }));

  const onSaveAddress = async (e) => {
    e.preventDefault();

    const result = editingId
      ? await handleUpdateAddress(editingId, addrForm)
      : await handleCreateAddress(addrForm);

    if (result) {
      toast.success(editingId ? "Address updated" : "Address added");

      setAddingAddress(false);
      setEditingId(null);
      resetAddrForm();
    }
  };

  const onEditAddress = (addr) => {
    setAddrForm({
      fullName: addr.fullName || "",
      addressType: addr.addressType || "Home",
      addressLine1: addr.addressLine1 || "",
      addressLine2: addr.addressLine2 || "",
      city: addr.city || "",
      state: addr.state || "",
      pincode: addr.pincode || "",
      phone: addr.phone || "",
    });

    setEditingId(addr._id);
    setAddingAddress(true);
  };

  const onDeleteAddress = async (id) => {
    const result = await handleDeleteAddress(id);

    if (result) {
      toast.success("Address removed");
    }
  };

  useEffect(() => {
    handleGetAllAddresses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /* =========================================================
     PREFERENCES
  ========================================================= */

  const [prefs, setPrefs] = useState({
    newsletter: user.preferences?.newsletter ?? true,
    orderUpdatesSms: user.preferences?.orderUpdatesSms ?? true,
    size: user.preferences?.size || "M",
  });

  const onSavePreferences = async () => {
    const result = await handleUpdateProfile({
      preferences: prefs,
    });

    if (result) {
      toast.success("Preferences saved");
    }
  };

  /* =========================================================
     PROFILE COMPLETION
  ========================================================= */

  const completion = useMemo(() => {
    const fields = [user.username, user.email, user.contact, user.gender, user.dob];

    const completed = fields.filter(Boolean).length;

    return Math.round((completed / fields.length) * 100);
  }, [user]);

  /* =========================================================
     LOGOUT
  ========================================================= */

  const logout = () => {
    handleLogout();
    toast.success("Logged out");
  };

  /* =========================================================
     RENDER
  ========================================================= */

  return (
    <div className="min-h-screen bg-[#F7F7F4] text-[#171717]">
      {/* =====================================================
          HERO
      ===================================================== */}

      <section className="relative overflow-hidden bg-[#171717]">
        <div className="absolute -top-32 -right-20 w-[420px] h-[420px] rounded-full bg-[#C9A96A]/10 blur-3xl" />

        <div className={`${CONTAINER} px-5 md:px-8`}>
          <div className="relative py-8 md:py-12">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-7">
              <div className="flex items-center gap-5">
                {/* Avatar */}
                <div className="relative shrink-0">
                  <div className="w-[76px] h-[76px] md:w-[92px] md:h-[92px] rounded-[26px] bg-gradient-to-br from-[#D9BF83] to-[#9B7733] flex items-center justify-center shadow-xl">
                    <span className="text-[#171717] text-[25px] md:text-[30px] font-semibold">
                      {initials(user.username)}
                    </span>
                  </div>

                  <div className="absolute -right-1.5 -bottom-1.5 w-7 h-7 rounded-full bg-[#171717] border-2 border-[#171717] flex items-center justify-center">
                    <CircleCheck size={16} className="text-[#D9BF83]" />
                  </div>
                </div>

                <div>
                  <div className="flex flex-wrap items-center gap-2 mb-2">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 border border-white/10 text-[9px] font-bold uppercase tracking-[0.12em] text-[#D9BF83]">
                      <Sparkles size={11} />
                      ZRIVE Member
                    </span>

                    {user.createdAt && (
                      <span className="text-[11px] text-white/40">
                        Since {memberSince(user.createdAt)}
                      </span>
                    )}
                  </div>

                  <h1 className="text-[27px] md:text-[34px] font-semibold tracking-[-0.04em] text-white">
                    {user.username || "Your Account"}
                  </h1>

                  <p className="text-[13px] text-white/50 mt-1">
                    {user.email || "Manage your ZRIVE account"}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setActiveTab("details")}
                className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-xl bg-white text-[#171717] text-[12px] font-semibold hover:bg-[#F3F3F1] transition-all self-start md:self-auto"
              >
                <Pencil size={14} />
                Edit profile
              </button>
            </div>

            {/* Hero mini stats */}
            <div className="grid grid-cols-3 max-w-[620px] mt-9 border-t border-white/10 pt-5">
              <HeroStat
                label="Orders"
                icon={Package}
                value="View orders"
                onClick={() => navigate("/orders")}
              />

              <HeroStat
                label="Wishlist"
                icon={Heart}
                value="Saved items"
                onClick={() => navigate("/wishlist")}
                bordered
              />

              <HeroStat
                label="Addresses"
                icon={MapPin}
                value={`${addresses.length} saved`}
                onClick={() => setActiveTab("addresses")}
                bordered
                showArrow={false}
              />
            </div>
          </div>
        </div>
      </section>

      {/* =====================================================
          MAIN
      ===================================================== */}

      <main className={`${CONTAINER} px-5 md:px-8 py-7 md:py-10`}>
        <div className="grid lg:grid-cols-[235px_minmax(0,1fr)] gap-7 lg:gap-10">
          {/* =================================================
              SIDEBAR
          ================================================= */}

          <aside className="lg:sticky lg:top-6 lg:self-start">
            <div className={`${CARD} p-2`}>
              <div className="px-3 py-3">
                <p className="text-[9px] font-bold uppercase tracking-[0.16em] text-[#999]">
                  Account
                </p>
              </div>

              <nav className="space-y-1">
                {NAV.map(({ id, label, icon: Icon }) => {
                  const active = activeTab === id;

                  return (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setActiveTab(id)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[12.5px] font-medium transition-all ${
                        active
                          ? "bg-[#171717] text-white shadow-sm"
                          : "text-[#777] hover:bg-[#F6F6F3] hover:text-[#222]"
                      }`}
                    >
                      <Icon size={16} strokeWidth={1.8} />
                      <span className="flex-1 text-left">{label}</span>

                      {active && <ChevronRight size={14} className="text-white/40" />}
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Completion */}
            <div className={`${CARD} p-4 mt-3`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-lg bg-[#F7F1E4] flex items-center justify-center">
                    <Sparkles size={13} className="text-[#9A7B35]" />
                  </div>

                  <span className="text-[11px] font-semibold text-[#444]">
                    Profile strength
                  </span>
                </div>

                <span className="text-[11px] font-bold text-[#9A7B35]">{completion}%</span>
              </div>

              <div className="h-1.5 bg-[#EEEEEA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#B08A42] rounded-full transition-all"
                  style={{ width: `${completion}%` }}
                />
              </div>

              <p className="text-[10.5px] text-[#999] mt-2 leading-relaxed">
                Complete your profile for a smoother shopping experience.
              </p>
            </div>

            {/* Logout (desktop only — mobile has its own control below the content) */}
            <div className="hidden lg:block mt-4">
              <LogoutControl
                variant="desktop"
                confirming={confirmingLogout}
                onRequestConfirm={() => setConfirmingLogout(true)}
                onCancel={() => setConfirmingLogout(false)}
                onConfirm={logout}
              />
            </div>
          </aside>

          {/* =================================================
              CONTENT
          ================================================= */}

          <div className="min-w-0">
            {/* =================================================
                OVERVIEW
            ================================================= */}

            {activeTab === "overview" && (
              <div className="space-y-5">
                <SectionHeading
                  eyebrow="Account overview"
                  title="Welcome back"
                  description="Manage your account, shopping preferences and delivery details from one place."
                />

                {/* Overview cards */}
                <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  <QuickLinkCard
                    icon={Package}
                    iconBg="#F3F4F1"
                    iconColor="#444"
                    title="Your orders"
                    description="Track and manage your purchases"
                    onClick={() => navigate("/orders")}
                  />

                  <QuickLinkCard
                    icon={Heart}
                    iconBg="#F7F1E4"
                    iconColor="#9A7B35"
                    title="Wishlist"
                    description="Products you saved for later"
                    onClick={() => navigate("/wishlist")}
                  />

                  <QuickLinkCard
                    icon={MapPin}
                    iconBg="#F3F4F1"
                    iconColor="#444"
                    title="Delivery addresses"
                    description={
                      addresses.length
                        ? `${addresses.length} saved address${addresses.length > 1 ? "es" : ""}`
                        : "Add your first address"
                    }
                    onClick={() => setActiveTab("addresses")}
                  />
                </div>

                {/* Account information */}
                <div className={`${CARD} overflow-hidden`}>
                  <div className="p-5 md:p-6 border-b border-black/[0.06]">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-[10px] uppercase tracking-[0.14em] text-[#999] font-bold">
                          Account information
                        </p>

                        <h3 className="text-[17px] font-semibold mt-1">Your profile</h3>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveTab("details")}
                        className="text-[11px] font-semibold text-[#555] hover:text-[#171717] flex items-center gap-1"
                      >
                        Edit
                        <ChevronRight size={13} />
                      </button>
                    </div>
                  </div>

                  <div className="grid sm:grid-cols-2">
                    <InfoRow icon={User} label="Full name" value={user.username} borderBottom borderRight />
                    <InfoRow icon={Mail} label="Email" value={user.email} borderBottom />
                    <InfoRow icon={Phone} label="Phone" value={user.contact} borderRight />
                    <InfoRow
                      icon={CalendarDays}
                      label="Member since"
                      value={user.createdAt ? memberSince(user.createdAt) : "ZRIVE Member"}
                    />
                  </div>
                </div>

                {/* Security summary */}
                <div className="grid md:grid-cols-[1fr_auto] gap-5 items-center bg-[#EEEDE8] rounded-2xl p-5 md:p-6">
                  <div className="flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-white flex items-center justify-center shrink-0">
                      <ShieldCheck size={20} />
                    </div>

                    <div>
                      <p className="text-[14px] font-semibold">Your account is protected</p>

                      <p className="text-[12px] text-[#777] mt-1 max-w-[500px] leading-relaxed">
                        Keep your password strong and unique to protect your ZRIVE account.
                      </p>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveTab("security")}
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-xl bg-[#171717] text-white text-[11px] font-semibold"
                  >
                    Security settings
                    <ChevronRight size={13} />
                  </button>
                </div>
              </div>
            )}

            {/* =================================================
                PERSONAL DETAILS
            ================================================= */}

            {activeTab === "details" && (
              <form onSubmit={onSaveDetails} className="space-y-5">
                <SectionHeading
                  eyebrow="Profile"
                  title="Personal details"
                  description="Keep your information up to date for a smoother checkout and delivery experience."
                />

                <div className={`${CARD} p-5 md:p-7`}>
                  <div className="flex items-center gap-4 pb-6 mb-6 border-b border-black/[0.06]">
                    <div className="w-14 h-14 rounded-2xl bg-[#171717] text-[#D9BF83] flex items-center justify-center text-[18px] font-semibold">
                      {initials(user.username)}
                    </div>

                    <div>
                      <p className="text-[14px] font-semibold">{user.username || "Your name"}</p>

                      <p className="text-[12px] text-[#888] mt-0.5">
                        Your public account identity
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-5">
                    <Field
                      label="Full name"
                      icon={User}
                      name="fullName"
                      value={form.fullName}
                      onChange={onFormChange}
                      placeholder="Your name"
                    />

                    <Field
                      label="Phone number"
                      icon={Phone}
                      name="phone"
                      value={form.phone}
                      onChange={onFormChange}
                      placeholder="10-digit mobile number"
                    />

                    <Field
                      label="Email address"
                      icon={Mail}
                      name="email"
                      type="email"
                      value={form.email}
                      disabled
                      title="Contact support to change your email"
                    />

                    <Field
                      label="Date of birth"
                      icon={CalendarDays}
                      name="dob"
                      type="date"
                      value={form.dob}
                      onChange={onFormChange}
                    />
                  </div>

                  <div className="mt-6">
                    <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#777] mb-2.5">
                      <User size={12} />
                      Gender
                    </span>

                    <div className="flex flex-wrap gap-2">
                      {["Male", "Female", "Prefer not to say"].map((gender) => (
                        <button
                          key={gender}
                          type="button"
                          onClick={() =>
                            setForm((f) => ({
                              ...f,
                              gender,
                            }))
                          }
                          className={`h-10 px-4 rounded-xl text-[12px] font-medium border transition-all ${
                            form.gender === gender
                              ? "bg-[#171717] border-[#171717] text-white"
                              : "bg-white border-black/[0.09] text-[#777] hover:border-black/20"
                          }`}
                        >
                          {gender}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mt-8 pt-6 border-t border-black/[0.06]">
                    <p className="text-[11px] text-[#999]">
                      Your email address cannot be changed here.
                    </p>

                    <PrimaryButton type="submit" loading={savingProfile} disabled={savingProfile}>
                      <Check size={14} />
                      {savingProfile ? "Saving" : "Save changes"}
                    </PrimaryButton>
                  </div>
                </div>
              </form>
            )}

            {/* =================================================
                SECURITY
            ================================================= */}

            {activeTab === "security" && (
              <div className="space-y-5">
                <SectionHeading
                  eyebrow="Account protection"
                  title="Security"
                  description="Manage your password and keep your account protected."
                />

                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`${CARD} p-5`}>
                    <div className="w-10 h-10 rounded-xl bg-[#EEF5EF] flex items-center justify-center mb-4">
                      <ShieldCheck size={18} className="text-[#4E7B55]" />
                    </div>

                    <p className="text-[14px] font-semibold">Account security</p>

                    <p className="text-[12px] text-[#888] mt-1 leading-relaxed">
                      Your account password should be unique and at least 8 characters long.
                    </p>

                    <div className="flex items-center gap-2 mt-4 text-[11px] font-medium text-[#4E7B55]">
                      <CircleCheck size={14} />
                      Password protection enabled
                    </div>
                  </div>

                  <div className={`${CARD} p-5`}>
                    <div className="w-10 h-10 rounded-xl bg-[#F7F1E4] flex items-center justify-center mb-4">
                      <KeyRound size={18} className="text-[#9A7B35]" />
                    </div>

                    <p className="text-[14px] font-semibold">Password</p>

                    <p className="text-[12px] text-[#888] mt-1 leading-relaxed">
                      Change your password regularly and avoid reusing passwords from other
                      services.
                    </p>
                  </div>
                </div>

                <form onSubmit={onChangePassword} className={`${CARD} p-5 md:p-7`}>
                  <div className="flex items-center gap-3 pb-6 mb-6 border-b border-black/[0.06]">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F2] flex items-center justify-center">
                      <Lock size={17} />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold">Change password</h3>

                      <p className="text-[11px] text-[#999] mt-0.5">
                        Enter your current password first
                      </p>
                    </div>
                  </div>

                  <div className="max-w-[520px] space-y-5">
                    {[
                      { key: "current", label: "Current password" },
                      { key: "next", label: "New password" },
                      { key: "confirm", label: "Confirm new password" },
                    ].map(({ key, label }) => (
                      <label key={key} className="block relative">
                        <span className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#777] mb-2">
                          <Lock size={12} />
                          {label}
                        </span>

                        <input
                          type={showPwd[key] ? "text" : "password"}
                          name={key}
                          value={pwd[key]}
                          onChange={onPwdChange}
                          className="w-full h-[46px] bg-[#FAFAF8] border border-black/[0.08] rounded-xl px-3.5 pr-11 text-[13.5px] focus:outline-none focus:bg-white focus:border-[#171717]/30 focus:ring-4 focus:ring-black/[0.025]"
                        />

                        <button
                          type="button"
                          onClick={() =>
                            setShowPwd((s) => ({
                              ...s,
                              [key]: !s[key],
                            }))
                          }
                          className="absolute right-3 top-[34px] text-[#999] hover:text-[#222]"
                          tabIndex={-1}
                        >
                          {showPwd[key] ? <EyeOff size={16} /> : <Eye size={16} />}
                        </button>
                      </label>
                    ))}
                  </div>

                  <div className="flex justify-start mt-7">
                    <PrimaryButton
                      type="submit"
                      loading={changingPassword}
                      disabled={changingPassword}
                    >
                      <KeyRound size={14} />
                      {changingPassword ? "Updating" : "Update password"}
                    </PrimaryButton>
                  </div>
                </form>
              </div>
            )}

            {/* =================================================
                ADDRESSES
            ================================================= */}

            {activeTab === "addresses" && (
              <div className="space-y-5">
                <SectionHeading
                  eyebrow="Delivery"
                  title="Your addresses"
                  description="Save your preferred delivery locations for faster checkout."
                  action={
                    !addingAddress && (
                      <button
                        type="button"
                        onClick={() => {
                          resetAddrForm();
                          setEditingId(null);
                          setAddingAddress(true);
                        }}
                        className="inline-flex items-center gap-2 h-10 px-4 rounded-xl bg-[#171717] text-white text-[11px] font-semibold shrink-0"
                      >
                        <Plus size={14} />
                        Add address
                      </button>
                    )
                  }
                />

                {addingAddress && (
                  <form onSubmit={onSaveAddress} className={`${CARD} p-5 md:p-7`}>
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <p className="text-[15px] font-semibold">
                          {editingId ? "Edit address" : "Add new address"}
                        </p>

                        <p className="text-[11px] text-[#999] mt-1">
                          Enter the details used for delivery.
                        </p>
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAddingAddress(false);
                          setEditingId(null);
                        }}
                        className="w-8 h-8 rounded-lg hover:bg-[#F5F5F2] text-[#888]"
                      >
                        ×
                      </button>
                    </div>

                    <div className="mb-5">
                      <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#777] mb-2.5">
                        Address type
                      </p>

                      <div className="flex gap-2">
                        {[
                          { label: "Home", icon: Home },
                          { label: "Work", icon: Briefcase },
                          { label: "Other", icon: MoreHorizontal },
                        ].map(({ label, icon: Icon }) => (
                          <button
                            type="button"
                            key={label}
                            onClick={() =>
                              setAddrForm((a) => ({
                                ...a,
                                addressType: label,
                              }))
                            }
                            className={`inline-flex items-center gap-2 h-10 px-3.5 rounded-xl text-[11px] font-medium border ${
                              addrForm.addressType === label
                                ? "bg-[#171717] text-white border-[#171717]"
                                : "bg-white text-[#777] border-black/[0.08]"
                            }`}
                          >
                            <Icon size={13} />
                            {label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-5">
                      <Field
                        label="Full name"
                        icon={User}
                        name="fullName"
                        value={addrForm.fullName}
                        onChange={onAddrChange}
                        placeholder="Recipient's name"
                      />

                      <Field
                        label="Phone"
                        icon={Phone}
                        name="phone"
                        value={addrForm.phone}
                        onChange={onAddrChange}
                        placeholder="Delivery phone"
                      />

                      <Field
                        label="Address line 1"
                        icon={MapPin}
                        name="addressLine1"
                        value={addrForm.addressLine1}
                        onChange={onAddrChange}
                        placeholder="House / flat / street"
                      />

                      <Field
                        label="Address line 2"
                        name="addressLine2"
                        value={addrForm.addressLine2}
                        onChange={onAddrChange}
                        placeholder="Area / landmark"
                      />

                      <Field
                        label="City"
                        name="city"
                        value={addrForm.city}
                        onChange={onAddrChange}
                        placeholder="City"
                      />

                      <Field
                        label="State"
                        name="state"
                        value={addrForm.state}
                        onChange={onAddrChange}
                        placeholder="State"
                      />

                      <Field
                        label="Pincode"
                        name="pincode"
                        value={addrForm.pincode}
                        onChange={onAddrChange}
                        placeholder="6-digit pincode"
                      />
                    </div>

                    <div className="flex flex-col sm:flex-row gap-2 mt-7">
                      <PrimaryButton type="submit">
                        <Check size={14} />
                        {editingId ? "Update address" : "Save address"}
                      </PrimaryButton>

                      <SecondaryButton
                        type="button"
                        onClick={() => {
                          setAddingAddress(false);
                          setEditingId(null);
                        }}
                      >
                        Cancel
                      </SecondaryButton>
                    </div>
                  </form>
                )}

                {addresses.length === 0 && !addingAddress && (
                  <div className={`${CARD} p-12 text-center`}>
                    <div className="w-14 h-14 rounded-2xl bg-[#F5F5F2] flex items-center justify-center mx-auto mb-4">
                      <MapPin size={22} className="text-[#999]" />
                    </div>

                    <h3 className="text-[15px] font-semibold">No addresses yet</h3>

                    <p className="text-[12px] text-[#999] mt-1.5">
                      Add a delivery address to make checkout faster.
                    </p>

                    <button
                      type="button"
                      onClick={() => {
                        resetAddrForm();
                        setEditingId(null);
                        setAddingAddress(true);
                      }}
                      className="inline-flex items-center gap-2 mt-5 h-10 px-4 rounded-xl bg-[#171717] text-white text-[11px] font-semibold"
                    >
                      <Plus size={14} />
                      Add your first address
                    </button>
                  </div>
                )}

                <div className="grid md:grid-cols-2 gap-4">
                  {addresses.map((addr) => (
                    <div key={addr._id} className={`${CARD} p-5 group`}>
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-[#F5F5F2] flex items-center justify-center">
                            {addr.addressType === "Work" ? (
                              <Briefcase size={16} />
                            ) : (
                              <Home size={16} />
                            )}
                          </div>

                          <div>
                            <div className="flex items-center gap-2">
                              <p className="text-[13px] font-semibold">{addr.addressType}</p>

                              {addr.isDefault && (
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#EEF5EF] text-[#4E7B55] text-[8px] font-bold uppercase tracking-[0.08em]">
                                  <Check size={9} />
                                  Default
                                </span>
                              )}
                            </div>

                            <p className="text-[10px] text-[#999] mt-0.5">{addr.fullName}</p>
                          </div>
                        </div>
                      </div>

                      <div className="mt-5 p-3.5 rounded-xl bg-[#FAFAF8]">
                        <p className="text-[12.5px] text-[#444] leading-relaxed">
                          {addr.addressLine1}
                          {addr.addressLine2 ? `, ${addr.addressLine2}` : ""}
                          <br />
                          {addr.city}, {addr.state} — {addr.pincode}
                        </p>

                        <p className="text-[11px] text-[#999] mt-2">{addr.phone}</p>
                      </div>

                      <div className="flex items-center gap-4 mt-4">
                        <button
                          type="button"
                          onClick={() => onEditAddress(addr)}
                          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] font-bold text-[#777] hover:text-[#171717]"
                        >
                          <Pencil size={12} />
                          Edit
                        </button>

                        <button
                          type="button"
                          onClick={() => onDeleteAddress(addr._id)}
                          className="inline-flex items-center gap-1.5 text-[10px] uppercase tracking-[0.08em] font-bold text-[#999] hover:text-red-600"
                        >
                          <Trash2 size={12} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* =================================================
                PREFERENCES
            ================================================= */}

            {activeTab === "preferences" && (
              <div className="space-y-5">
                <SectionHeading
                  eyebrow="Shopping experience"
                  title="Preferences"
                  description="Customize how ZRIVE communicates with you and remembers your shopping preferences."
                />

                {/* Size */}
                <div className={`${CARD} p-5 md:p-7`}>
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-[#F7F1E4] flex items-center justify-center shrink-0">
                      <Ruler size={18} className="text-[#9A7B35]" />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold">Your usual size</h3>

                      <p className="text-[12px] text-[#888] mt-1">
                        We'll use this preference to make shopping recommendations more
                        relevant.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                      <button
                        type="button"
                        key={size}
                        onClick={() =>
                          setPrefs((p) => ({
                            ...p,
                            size,
                          }))
                        }
                        className={`h-12 rounded-xl text-[12px] font-semibold border transition-all ${
                          prefs.size === size
                            ? "bg-[#171717] text-white border-[#171717] shadow-sm"
                            : "bg-white border-black/[0.08] text-[#777] hover:border-black/20"
                        }`}
                      >
                        {size}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Communication */}
                <div className={`${CARD} p-5 md:p-7`}>
                  <div className="flex items-start gap-4 mb-3">
                    <div className="w-10 h-10 rounded-xl bg-[#F5F5F2] flex items-center justify-center shrink-0">
                      <Bell size={18} className="text-[#555]" />
                    </div>

                    <div>
                      <h3 className="text-[15px] font-semibold">Communication</h3>

                      <p className="text-[12px] text-[#888] mt-1">
                        Choose what you'd like to hear from us about.
                      </p>
                    </div>
                  </div>

                  <div className="border-t border-black/[0.06] mt-5">
                    <Toggle
                      label="Newsletter"
                      hint="New arrivals, edits, offers and style updates."
                      checked={prefs.newsletter}
                      onChange={(value) =>
                        setPrefs((p) => ({
                          ...p,
                          newsletter: value,
                        }))
                      }
                      icon={Mail}
                    />

                    <Toggle
                      label="Order updates via SMS"
                      hint="Shipping, delivery and important order notifications."
                      checked={prefs.orderUpdatesSms}
                      onChange={(value) =>
                        setPrefs((p) => ({
                          ...p,
                          orderUpdatesSms: value,
                        }))
                      }
                      icon={Phone}
                    />
                  </div>

                  <div className="pt-6 mt-2 border-t border-black/[0.06] flex justify-end">
                    <PrimaryButton type="button" onClick={onSavePreferences}>
                      <Check size={14} />
                      Save preferences
                    </PrimaryButton>
                  </div>
                </div>

                {/* Shopping note */}
                <div className="rounded-2xl bg-[#171717] p-5 md:p-6 flex items-start gap-4">
                  <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center shrink-0">
                    <Sparkles size={17} className="text-[#D9BF83]" />
                  </div>

                  <div>
                    <p className="text-[13px] font-semibold text-white">
                      Better recommendations, better fit
                    </p>

                    <p className="text-[11.5px] text-white/50 mt-1 leading-relaxed max-w-[600px]">
                      Your preferences help ZRIVE personalize your shopping experience and
                      surface products that are more relevant to you.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* =================================================
                MOBILE LOGOUT
            ================================================= */}

            <div className="lg:hidden mt-7 pt-6 border-t border-black/[0.07]">
              <LogoutControl
                variant="mobile"
                confirming={confirmingLogout}
                onRequestConfirm={() => setConfirmingLogout(true)}
                onCancel={() => setConfirmingLogout(false)}
                onConfirm={logout}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Profile;