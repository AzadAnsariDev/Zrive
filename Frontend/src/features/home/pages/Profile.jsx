import React, { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router";
import { useSelector, useDispatch } from "react-redux";
import {
  User,
  Lock,
  MapPin,
  LogOut,
  Eye,
  EyeOff,
  Pencil,
  Plus,
  Check,
  Package,
  Heart,
  ChevronRight,
  ShieldCheck,
  Mail,
  Phone,
  ArrowLeft,
  Sparkles,
  Store,
  ArrowUpRight,
  Trash2,
} from "lucide-react";
import { notify } from "../../../utils/toast";
import { ProfileSkeleton } from "../../../components/common/Skeleton";
import { useAuth } from "../../auth/hook/useAuth";
import useAddress from "../../address/hook/useAddress";

const initials = (name = "") =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("") || "U";

const Profile = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { handleLogout, handleUpdateProfile } = useAuth();
  const { handleGetAllAddresses, handleDeleteAddress } = useAddress();

  const user = useSelector((state) => state.auth.user);
  const addresses = useSelector((state) => state.address.addresses || []);

  const [activeTab, setActiveTab] = useState("overview");
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [confirmLogout, setConfirmLogout] = useState(false);
  const [confirmDeleteAddress, setConfirmDeleteAddress] = useState(null);
  const [deletingAddress, setDeletingAddress] = useState(false);

  const [formData, setFormData] = useState({
    fullName: user?.fullName || user?.username || user?.name || "",
    email: user?.email || "",
    phone: user?.phone || "",
  });

  useEffect(() => {
    handleGetAllAddresses();
  }, []);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName || user.username || user.name || "",
        email: user.email || "",
        phone: user.phone || "",
      });
    }
  }, [user]);

  if (!user) {
    return <ProfileSkeleton />;
  }

  const onSaveProfile = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (handleUpdateProfile) {
        await handleUpdateProfile(formData);
      }
      notify.success("Profile updated successfully");
      setEditing(false);
    } catch (err) {
      notify.error(err, "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const onLogout = async () => {
    await handleLogout();
    notify.success("Signed out successfully");
    navigate("/login");
  };

  const onDeleteAddress = async () => {
    if (!confirmDeleteAddress) return;
    setDeletingAddress(true);
    try {
      await handleDeleteAddress(confirmDeleteAddress._id);
      notify.success("Address removed successfully");
      setConfirmDeleteAddress(null);
      await handleGetAllAddresses();
    } catch (err) {
      notify.error(err, "Failed to remove address");
    } finally {
      setDeletingAddress(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Top Bar */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            User Account Center
          </span>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-6">
        {/* User Hero Banner */}
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[10px] p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-full bg-[#111111] text-[#B08D57] font-bold text-[18px] flex items-center justify-center border-2 border-[#B08D57]">
              {initials(user?.fullName || user?.name || "User")}
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-display text-[22px] font-bold text-[#111111]">
                  {user?.fullName || user?.username || user?.name || "ZRIVE Member"}
                </h1>
                <span className="text-[9.5px] font-bold uppercase tracking-[0.08em] bg-[#F5EFE5] text-[#B08D57] px-2.5 py-0.5 rounded border border-[#B08D57]/30">
                  VERIFIED BUYER
                </span>
              </div>
              <p className="text-[12.5px] text-[#666666] mt-0.5">
                {user?.email} {user?.phone ? `· ${user.phone}` : ""}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/orders"
              className="flex items-center gap-1.5 px-4 py-2.5 bg-[#111111] text-white rounded text-[11.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all"
            >
              <Package size={14} />
              My Orders
            </Link>
            <button
              onClick={() => setConfirmLogout(true)}
              className="flex items-center gap-1.5 px-4 py-2.5 border border-[#EAEAEA] bg-white text-[#C43D3D] rounded text-[11.5px] font-bold uppercase hover:bg-[#FCECEC] transition-all cursor-pointer"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
          {/* Left Navigation */}
          <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-2 space-y-1">
            {[
              { id: "overview", label: "Account Overview", icon: User },
              { id: "addresses", label: "Saved Addresses", icon: MapPin },
              { id: "security", label: "Security & Settings", icon: Lock },
            ].map(({ id, label, icon: Icon }) => (
              <button
                key={id}
                onClick={() => setActiveTab(id)}
                className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded text-[12.5px] font-bold transition-all text-left cursor-pointer ${
                  activeTab === id
                    ? "bg-[#111111] text-white"
                    : "text-[#666666] hover:text-[#111111] hover:bg-white"
                }`}
              >
                <Icon size={15} />
                {label}
              </button>
            ))}
          </div>

          {/* Right Tab Contents */}
          <main className="space-y-6">
            {activeTab === "overview" && (
              <div className="space-y-6">
                {/* Shortcut Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div
                    onClick={() => navigate("/orders")}
                    className="p-5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] hover:border-[#B08D57] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <Package size={22} className="text-[#B08D57] mb-2" />
                      <h3 className="font-display text-[15px] font-bold text-[#111]">My Orders</h3>
                      <p className="text-[11px] text-[#666]">Track & view history</p>
                    </div>
                    <ArrowUpRight size={16} className="text-[#999]" />
                  </div>

                  <div
                    onClick={() => navigate("/wishlist")}
                    className="p-5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] hover:border-[#B08D57] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <Heart size={22} className="text-[#B08D57] mb-2" />
                      <h3 className="font-display text-[15px] font-bold text-[#111]">My Wishlist</h3>
                      <p className="text-[11px] text-[#666]">Saved items</p>
                    </div>
                    <ArrowUpRight size={16} className="text-[#999]" />
                  </div>

                  <div
                    onClick={() => navigate("/become-seller")}
                    className="p-5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] hover:border-[#B08D57] cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div>
                      <Store size={22} className="text-[#B08D57] mb-2" />
                      <h3 className="font-display text-[15px] font-bold text-[#111]">Seller Console</h3>
                      <p className="text-[11px] text-[#666]">Start selling on ZRIVE</p>
                    </div>
                    <ArrowUpRight size={16} className="text-[#999]" />
                  </div>
                </div>

                {/* Profile Form */}
                <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-6 shadow-sm">
                  <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-5">
                    <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
                      Personal Details
                    </h2>
                    <button
                      type="button"
                      onClick={() => setEditing(!editing)}
                      className="flex items-center gap-1 text-[11.5px] font-bold text-[#111] hover:text-[#B08D57] cursor-pointer"
                    >
                      <Pencil size={13} />
                      {editing ? "Cancel" : "Edit Profile"}
                    </button>
                  </div>

                  <form onSubmit={onSaveProfile} className="space-y-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">Full Name</label>
                        <input
                          type="text"
                          disabled={!editing}
                          value={formData.fullName}
                          onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                          className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] text-[#111] outline-none disabled:opacity-70"
                        />
                      </div>
                      <div>
                        <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">Email Address</label>
                        <input
                          type="email"
                          disabled={!editing}
                          value={formData.email}
                          onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                          className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] text-[#111] outline-none disabled:opacity-70"
                        />
                      </div>
                    </div>

                    {editing && (
                      <div className="flex justify-end pt-2">
                        <button
                          type="submit"
                          disabled={loading}
                          className="px-6 py-2.5 bg-[#111111] text-white rounded text-[12px] font-bold uppercase hover:bg-[#B08D57] transition-all cursor-pointer disabled:opacity-50"
                        >
                          {loading ? "Saving..." : "Save Changes"}
                        </button>
                      </div>
                    )}
                  </form>
                </div>
              </div>
            )}

            {activeTab === "addresses" && (
              <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-6 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-4">
                  <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
                    Saved Delivery Addresses ({addresses.length})
                  </h2>
                  <Link
                    to="/address"
                    className="flex items-center gap-1 text-[11.5px] font-bold text-[#111] hover:text-[#B08D57]"
                  >
                    <Plus size={13} />
                    Add Address
                  </Link>
                </div>

                {addresses.length === 0 ? (
                  <p className="text-[12.5px] text-[#666] py-6 text-center">No delivery addresses saved yet.</p>
                ) : (
                  <div className="space-y-3">
                    {addresses.map((addr) => (
                      <div key={addr._id} className="relative p-4 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[6px] text-[13px]">
                        <button
                          type="button"
                          onClick={() => setConfirmDeleteAddress(addr)}
                          aria-label={`Remove address for ${addr.fullName}`}
                          className="absolute right-3 top-3 p-1 text-[#999999] hover:text-[#C43D3D] transition-colors cursor-pointer"
                        >
                          <Trash2 size={15} />
                        </button>
                        <p className="pr-8 font-bold text-[#111] mb-1">{addr.fullName} · {addr.phone}</p>
                        <p className="text-[#666]">{addr.addressLine1}{addr.addressLine2 ? `, ${addr.addressLine2}` : ""}</p>
                        <p className="text-[#666]">{addr.city}, {addr.state} - <strong>{addr.pincode}</strong></p>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === "security" && (
              <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-6 shadow-sm space-y-4">
                <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57] pb-3 border-b border-[#EAEAEA]">
                  Account Security & Protection
                </h2>
                <div className="flex items-center justify-between p-4 bg-[#FAFAFA] rounded border border-[#EAEAEA]">
                  <div>
                    <p className="text-[13px] font-bold text-[#111]">Two-Factor Escrow Protection</p>
                    <p className="text-[11px] text-[#666]">Razorpay 256-bit encryption active</p>
                  </div>
                  <span className="text-[10px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2.5 py-1 rounded">ACTIVE</span>
                </div>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* Logout Modal */}
      {confirmLogout && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[10px] border border-[#EAEAEA] p-6 max-w-sm w-full text-center space-y-4">
            <LogOut size={28} className="text-[#C43D3D] mx-auto" />
            <h3 className="font-display text-[18px] font-bold text-[#111]">Sign Out of ZRIVE?</h3>
            <p className="text-[12.5px] text-[#666]">You will need to sign in again to access your orders and wishlist.</p>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setConfirmLogout(false)}
                className="flex-1 py-2.5 border border-[#EAEAEA] rounded text-[12px] font-bold uppercase text-[#555] cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={onLogout}
                className="flex-1 py-2.5 bg-[#C43D3D] text-white rounded text-[12px] font-bold uppercase hover:bg-[#9F2E2E] cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      )}

      {confirmDeleteAddress && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[10px] border border-[#EAEAEA] p-6 max-w-sm w-full shadow-2xl">
            <Trash2 size={28} className="text-[#C43D3D] mx-auto mb-4" />
            <h3 className="font-display text-[18px] font-bold text-[#111] text-center">Remove this address?</h3>
            <p className="text-[12.5px] text-[#666] text-center mt-2 mb-6">
              This saved delivery address will be permanently removed.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setConfirmDeleteAddress(null)}
                disabled={deletingAddress}
                className="flex-1 py-2.5 border border-[#EAEAEA] rounded text-[12px] font-bold uppercase text-[#555] cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={onDeleteAddress}
                disabled={deletingAddress}
                className="flex-1 py-2.5 bg-[#C43D3D] text-white rounded text-[12px] font-bold uppercase hover:bg-[#9F2E2E] cursor-pointer disabled:opacity-60"
              >
                {deletingAddress ? "Removing..." : "Remove"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;