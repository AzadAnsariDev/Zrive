import React, { useState } from "react";
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
} from "lucide-react";
import toast from "react-hot-toast";
import {useAuth} from "../../auth/hook/useAuth";
import useAddress from "../../address/hook/useAddress";



const SECTION_X = "px-5 md:px-6 lg:px-10";
const SECTION_Y = "py-6 md:py-8";
const CONTAINER = "max-w-[1000px] mx-auto";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

const memberSince = (date) => {
  if (!date) return "";
  return new Date(date).toLocaleDateString("en-IN", { month: "long", year: "numeric" });
};

/* ============================ Shared bits ============================ */

const Field = ({ label, ...props }) => (
  <label className="block">
    <span className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
      {label}
    </span>
    <input
      {...props}
      className="w-full bg-cream border border-border rounded-[3px] px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-ink transition-colors disabled:bg-cream-dark disabled:text-ink-soft"
    />
  </label>
);

const Toggle = ({ checked, onChange, label, hint }) => (
  <div className="flex items-center justify-between gap-4 py-3.5 border-b border-border last:border-b-0">
    <div>
      <p className="text-[13.5px] text-ink">{label}</p>
      {hint && <p className="text-[12px] text-ink-soft mt-0.5">{hint}</p>}
    </div>
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={`relative w-10 h-[22px] rounded-full flex-shrink-0 transition-colors ${
        checked ? "bg-charcoal" : "bg-cream-dark border border-border"
      }`}
    >
      <span
        className={`absolute top-[2px] w-[18px] h-[18px] rounded-full bg-cream transition-transform ${
          checked ? "translate-x-[20px]" : "translate-x-[2px]"
        }`}
      />
    </button>
  </div>
);

/* ============================ Nav config ============================ */

const NAV = [
  { id: "details", label: "Personal Details", icon: User },
  { id: "security", label: "Security", icon: Lock },
  { id: "addresses", label: "Addresses", icon: MapPin },
  { id: "preferences", label: "Preferences", icon: SlidersHorizontal },
];

/* ============================== Page ============================== */

const Profile = () => {
  const navigate = useNavigate();
  const { handleUpdateProfile, handleChangePassword, handleLogout } = useAuth();
  const { handleAddAddress, handleUpdateAddress, handleDeleteAddress } = useAddress();

  const user = useSelector((state) => state.auth?.user) || {};
  const addresses = useSelector((state) => state.address?.list) || [];
  const savingProfile = useSelector((state) => state.auth?.loading?.update);
  const changingPassword = useSelector((state) => state.auth?.loading?.password);

  const [activeTab, setActiveTab] = useState("details");
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  /* -------- personal details -------- */
  const [form, setForm] = useState({
    fullName: user.name || "",
    email: user.email || "",
    phone: user.phone || "",
    gender: user.gender || "",
    dob: user.dob || "",
  });
  const onFormChange = (e) => setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const onSaveDetails = async (e) => {
    e.preventDefault();
    const result = await handleUpdateProfile(form);
    if (result) toast.success("Profile updated");
  };

  /* -------- security -------- */
  const [pwd, setPwd] = useState({ current: "", next: "", confirm: "" });
  const [showPwd, setShowPwd] = useState({ current: false, next: false, confirm: false });
  const onPwdChange = (e) => setPwd((p) => ({ ...p, [e.target.name]: e.target.value }));

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
      setPwd({ current: "", next: "", confirm: "" });
    }
  };

  /* -------- addresses -------- */
  const [addingAddress, setAddingAddress] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [addrForm, setAddrForm] = useState({
    label: "Home",
    line1: "",
    line2: "",
    city: "",
    state: "",
    pincode: "",
    phone: "",
  });
  const resetAddrForm = () =>
    setAddrForm({ label: "Home", line1: "", line2: "", city: "", state: "", pincode: "", phone: "" });

  const onAddrChange = (e) => setAddrForm((a) => ({ ...a, [e.target.name]: e.target.value }));

  const onSaveAddress = async (e) => {
    e.preventDefault();
    const result = editingId
      ? await handleUpdateAddress(editingId, addrForm)
      : await handleAddAddress(addrForm);
    if (result) {
      toast.success(editingId ? "Address updated" : "Address added");
      setAddingAddress(false);
      setEditingId(null);
      resetAddrForm();
    }
  };

  const onEditAddress = (addr) => {
    setAddrForm({
      label: addr.label || "Home",
      line1: addr.line1 || "",
      line2: addr.line2 || "",
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
    if (result) toast.success("Address removed");
  };

  /* -------- preferences -------- */
  const [prefs, setPrefs] = useState({
    newsletter: user.preferences?.newsletter ?? true,
    orderUpdatesSms: user.preferences?.orderUpdatesSms ?? true,
    size: user.preferences?.size || "M",
  });

  const onSavePreferences = async () => {
    const result = await handleUpdateProfile({ preferences: prefs });
    if (result) toast.success("Preferences saved");
  };

  return (
    <div className="min-h-screen bg-cream">
      {/* ---------- membership header ---------- */}
      <section className={`${SECTION_X} pt-6 md:pt-8`}>
        <div className={CONTAINER}>
          <div className="relative overflow-hidden bg-charcoal rounded-[3px] px-6 py-7 md:px-8 md:py-8">
            <span className="absolute -right-3 -bottom-4 font-display text-[110px] leading-none text-cream/[0.04] select-none">
              Z
            </span>
            <div className="relative flex items-center gap-4 md:gap-5">
              <div className="w-14 h-14 md:w-16 md:h-16 rounded-full border border-gold/60 flex items-center justify-center flex-shrink-0">
                <span className="font-display text-[18px] md:text-[20px] text-gold">
                  {initials(user.name)}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
                  {user.createdAt ? `Member since ${memberSince(user.createdAt)}` : "ZRIVE Account"}
                </p>
                <h1 className="font-display text-[22px] md:text-[26px] text-cream truncate">
                  {user.name || "Your Account"}
                </h1>
                <p className="text-[12.5px] text-cream/60 truncate">{user.email}</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ---------- quick links ---------- */}
      <section className={`${SECTION_X} pt-4 md:pt-5`}>
        <div className={`${CONTAINER} grid grid-cols-2 gap-3`}>
          <button
            type="button"
            onClick={() => navigate("/orders")}
            className="flex items-center gap-3 border border-border rounded-[3px] px-4 py-3.5 bg-cream hover:border-ink transition-colors text-left"
          >
            <Package size={17} strokeWidth={1.5} className="text-ink-soft flex-shrink-0" />
            <span className="flex-1 text-[13px] text-ink">Your Orders</span>
            <ChevronRight size={15} strokeWidth={1.5} className="text-ink-soft" />
          </button>
          <button
            type="button"
            onClick={() => navigate("/wishlist")}
            className="flex items-center gap-3 border border-border rounded-[3px] px-4 py-3.5 bg-cream hover:border-ink transition-colors text-left"
          >
            <Heart size={17} strokeWidth={1.5} className="text-ink-soft flex-shrink-0" />
            <span className="flex-1 text-[13px] text-ink">Your Wishlist</span>
            <ChevronRight size={15} strokeWidth={1.5} className="text-ink-soft" />
          </button>
        </div>
      </section>

      {/* ---------- settings layout ---------- */}
      <section className={`${SECTION_X} ${SECTION_Y}`}>
        <div className={`${CONTAINER} flex flex-col md:flex-row gap-6 md:gap-8`}>
          {/* nav */}
          <aside className="md:w-[210px] flex-shrink-0">
            <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-1 md:pb-0">
              {NAV.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-[3px] text-[13px] whitespace-nowrap transition-colors flex-shrink-0 ${
                    activeTab === id
                      ? "bg-charcoal text-cream"
                      : "text-ink-soft hover:text-ink hover:bg-cream-dark"
                  }`}
                >
                  <Icon size={15} strokeWidth={1.5} />
                  {label}
                </button>
              ))}
            </nav>

            <div className="hidden md:block mt-6 pt-6 border-t border-border">
              {!confirmingLogout ? (
                <button
                  type="button"
                  onClick={() => setConfirmingLogout(true)}
                  className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[3px] text-[13px] text-ink-soft hover:text-ink hover:bg-cream-dark transition-colors w-full"
                >
                  <LogOut size={15} strokeWidth={1.5} />
                  Log Out
                </button>
              ) : (
                <div className="px-3.5 py-3 border border-border rounded-[3px]">
                  <p className="text-[12px] text-ink mb-2.5">Log out of your account?</p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setConfirmingLogout(false)}
                      className="flex-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft border border-border rounded-[3px] py-2 hover:text-ink transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        handleLogout();
                        toast.success("Logged out");
                      }}
                      className="flex-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-cream bg-charcoal rounded-[3px] py-2 hover:bg-ink transition-colors"
                    >
                      Confirm
                    </button>
                  </div>
                </div>
              )}
            </div>
          </aside>

          {/* content */}
          <div className="flex-1 min-w-0">
            {activeTab === "details" && (
              <form onSubmit={onSaveDetails} className="space-y-5">
                <h2 className="font-display text-[19px] text-ink mb-1">Personal Details</h2>
                <p className="text-[13px] text-ink-soft mb-4">
                  Keep this up to date — it's what we use for order updates and delivery.
                </p>
                <div className="grid sm:grid-cols-2 gap-4">
                  <Field
                    label="Full Name"
                    name="fullName"
                    value={form.fullName}
                    onChange={onFormChange}
                    placeholder="Your name"
                  />
                  <Field
                    label="Phone"
                    name="phone"
                    value={form.phone}
                    onChange={onFormChange}
                    placeholder="10-digit mobile number"
                  />
                  <Field
                    label="Email"
                    name="email"
                    type="email"
                    value={form.email}
                    disabled
                    title="Contact support to change your email"
                  />
                  <Field
                    label="Date of Birth"
                    name="dob"
                    type="date"
                    value={form.dob}
                    onChange={onFormChange}
                  />
                </div>
                <label className="block">
                  <span className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    Gender
                  </span>
                  <div className="flex gap-2">
                    {["Male", "Female", "Prefer not to say"].map((g) => (
                      <button
                        type="button"
                        key={g}
                        onClick={() => setForm((f) => ({ ...f, gender: g }))}
                        className={`px-3.5 py-2 rounded-[3px] text-[12.5px] border transition-colors ${
                          form.gender === g
                            ? "bg-charcoal text-cream border-charcoal"
                            : "border-border text-ink-soft hover:text-ink"
                        }`}
                      >
                        {g}
                      </button>
                    ))}
                  </div>
                </label>
                <button
                  type="submit"
                  disabled={savingProfile}
                  className="bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] hover:bg-ink transition-colors disabled:opacity-50"
                >
                  {savingProfile ? "Saving..." : "Save Changes"}
                </button>
              </form>
            )}

            {activeTab === "security" && (
              <form onSubmit={onChangePassword} className="space-y-5 max-w-[420px]">
                <h2 className="font-display text-[19px] text-ink mb-1">Security</h2>
                <p className="text-[13px] text-ink-soft mb-4">
                  Choose a strong password you're not using anywhere else.
                </p>
                {[
                  { key: "current", label: "Current Password" },
                  { key: "next", label: "New Password" },
                  { key: "confirm", label: "Confirm New Password" },
                ].map(({ key, label }) => (
                  <label key={key} className="block relative">
                    <span className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                      {label}
                    </span>
                    <input
                      type={showPwd[key] ? "text" : "password"}
                      name={key}
                      value={pwd[key]}
                      onChange={onPwdChange}
                      className="w-full bg-cream border border-border rounded-[3px] px-3.5 py-2.5 pr-10 text-[13.5px] text-ink focus:outline-none focus:border-ink transition-colors"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPwd((s) => ({ ...s, [key]: !s[key] }))}
                      className="absolute right-3 top-[30px] text-ink-soft hover:text-ink"
                      tabIndex={-1}
                    >
                      {showPwd[key] ? <EyeOff size={15} strokeWidth={1.5} /> : <Eye size={15} strokeWidth={1.5} />}
                    </button>
                  </label>
                ))}
                <button
                  type="submit"
                  disabled={changingPassword}
                  className="bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] hover:bg-ink transition-colors disabled:opacity-50"
                >
                  {changingPassword ? "Updating..." : "Update Password"}
                </button>
              </form>
            )}

            {activeTab === "addresses" && (
              <div>
                <div className="flex items-center justify-between mb-1">
                  <h2 className="font-display text-[19px] text-ink">Addresses</h2>
                  {!addingAddress && (
                    <button
                      type="button"
                      onClick={() => {
                        resetAddrForm();
                        setEditingId(null);
                        setAddingAddress(true);
                      }}
                      className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.06em] uppercase text-ink-soft hover:text-ink transition-colors"
                    >
                      <Plus size={14} strokeWidth={2} />
                      Add New
                    </button>
                  )}
                </div>
                <p className="text-[13px] text-ink-soft mb-4">Where we deliver your orders.</p>

                {addingAddress && (
                  <form
                    onSubmit={onSaveAddress}
                    className="border border-border rounded-[3px] p-4 mb-5 space-y-3.5 bg-cream-dark/40"
                  >
                    <div className="flex gap-2 mb-1">
                      {["Home", "Work", "Other"].map((l) => (
                        <button
                          type="button"
                          key={l}
                          onClick={() => setAddrForm((a) => ({ ...a, label: l }))}
                          className={`px-3 py-1.5 rounded-[3px] text-[11px] border transition-colors ${
                            addrForm.label === l
                              ? "bg-charcoal text-cream border-charcoal"
                              : "border-border text-ink-soft"
                          }`}
                        >
                          {l}
                        </button>
                      ))}
                    </div>
                    <div className="grid sm:grid-cols-2 gap-3">
                      <Field label="Address Line 1" name="line1" value={addrForm.line1} onChange={onAddrChange} />
                      <Field label="Address Line 2" name="line2" value={addrForm.line2} onChange={onAddrChange} />
                      <Field label="City" name="city" value={addrForm.city} onChange={onAddrChange} />
                      <Field label="State" name="state" value={addrForm.state} onChange={onAddrChange} />
                      <Field label="Pincode" name="pincode" value={addrForm.pincode} onChange={onAddrChange} />
                      <Field label="Phone" name="phone" value={addrForm.phone} onChange={onAddrChange} />
                    </div>
                    <div className="flex gap-2 pt-1">
                      <button
                        type="submit"
                        className="bg-charcoal text-cream text-[11px] font-semibold tracking-[0.08em] uppercase px-5 py-2.5 rounded-[3px] hover:bg-ink transition-colors"
                      >
                        Save Address
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setAddingAddress(false);
                          setEditingId(null);
                        }}
                        className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft hover:text-ink px-5 py-2.5"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                )}

                {addresses.length === 0 && !addingAddress && (
                  <div className="border border-dashed border-border rounded-[3px] py-10 text-center">
                    <MapPin className="mx-auto mb-2 text-ink-soft" size={20} strokeWidth={1.3} />
                    <p className="text-[13px] text-ink-soft">No saved addresses yet.</p>
                  </div>
                )}

                <div className="grid sm:grid-cols-2 gap-3">
                  {addresses.map((addr) => (
                    <div key={addr._id} className="border border-border rounded-[3px] p-4 relative">
                      <div className="flex items-center gap-2 mb-1.5">
                        <span className="text-[9px] font-semibold tracking-[0.1em] uppercase text-gold">
                          {addr.label}
                        </span>
                        {addr.isDefault && (
                          <span className="flex items-center gap-1 text-[9px] font-semibold tracking-[0.06em] uppercase text-ink-soft">
                            <Check size={11} strokeWidth={2} />
                            Default
                          </span>
                        )}
                      </div>
                      <p className="text-[13px] text-ink leading-snug">
                        {addr.line1}
                        {addr.line2 ? `, ${addr.line2}` : ""}
                        <br />
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                      <p className="text-[12px] text-ink-soft mt-1">{addr.phone}</p>
                      <div className="flex gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => onEditAddress(addr)}
                          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft hover:text-ink transition-colors"
                        >
                          <Pencil size={12} strokeWidth={1.75} />
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => onDeleteAddress(addr._id)}
                          className="flex items-center gap-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft hover:text-ink transition-colors"
                        >
                          <Trash2 size={12} strokeWidth={1.75} />
                          Remove
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === "preferences" && (
              <div>
                <h2 className="font-display text-[19px] text-ink mb-1">Preferences</h2>
                <p className="text-[13px] text-ink-soft mb-4">
                  How we reach you, and what fits best.
                </p>

                <p className="text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-2">
                  Usual Size
                </p>
                <div className="flex gap-2 mb-6">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((s) => (
                    <button
                      type="button"
                      key={s}
                      onClick={() => setPrefs((p) => ({ ...p, size: s }))}
                      className={`w-10 h-10 rounded-[3px] text-[12px] font-semibold border transition-colors ${
                        prefs.size === s
                          ? "bg-charcoal text-cream border-charcoal"
                          : "border-border text-ink-soft hover:text-ink"
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>

                <div className="border-t border-border">
                  <Toggle
                    label="Newsletter"
                    hint="New arrivals, edits and offers — a couple of emails a month."
                    checked={prefs.newsletter}
                    onChange={(v) => setPrefs((p) => ({ ...p, newsletter: v }))}
                  />
                  <Toggle
                    label="Order Updates via SMS"
                    hint="Shipping and delivery texts for orders you place."
                    checked={prefs.orderUpdatesSms}
                    onChange={(v) => setPrefs((p) => ({ ...p, orderUpdatesSms: v }))}
                  />
                </div>

                <button
                  type="button"
                  onClick={onSavePreferences}
                  className="mt-5 bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] hover:bg-ink transition-colors"
                >
                  Save Preferences
                </button>
              </div>
            )}

            {/* mobile logout, sits under content since sidebar logout is desktop-only */}
            <div className="md:hidden mt-8 pt-5 border-t border-border">
              {!confirmingLogout ? (
                <button
                  type="button"
                  onClick={() => setConfirmingLogout(true)}
                  className="flex items-center gap-2.5 text-[13px] text-ink-soft"
                >
                  <LogOut size={15} strokeWidth={1.5} />
                  Log Out
                </button>
              ) : (
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setConfirmingLogout(false)}
                    className="flex-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-ink-soft border border-border rounded-[3px] py-2.5"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      handleLogout();
                      toast.success("Logged out");
                    }}
                    className="flex-1 text-[11px] font-semibold uppercase tracking-[0.06em] text-cream bg-charcoal rounded-[3px] py-2.5"
                  >
                    Confirm Log Out
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Profile;