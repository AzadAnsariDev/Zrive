import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate, useLocation } from "react-router";
import { notify } from "../../../utils/toast";
import {
  Home,
  Briefcase,
  MapPin,
  Check,
  Pencil,
  Trash2,
  Plus,
  X,
  Star,
  ArrowRight,
  ArrowLeft,
  Lock,
  ShieldCheck,
  CreditCard,
} from "lucide-react";
import useAddress from "../hook/useAddress";
import useOrder from "../../order/hook/useOrder";
import { setSelectedAddress } from "../state/addressSlice";

const emptyDefaults = {
  fullName: "",
  phone: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  pincode: "",
  addressType: "Home",
  isDefault: false,
};

const addressTypes = [
  { key: "Home", icon: Home },
  { key: "Work", icon: Briefcase },
  { key: "Other", icon: MapPin },
];

const Address = () => {
  const {
    handleCreateAddress,
    handleUpdateAddress,
    handleGetAllAddresses,
    handleDeleteAddress,
  } = useAddress();

  const { handleCreateOrder, handleVerifyOrder } = useOrder();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const addresses = useSelector((state) => state.address.addresses || []);
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const user = useSelector((state) => state.auth.user);

  // If we came from order-summary (e.g. "Change Address"), go back there after selection
  const returnTo = location.state?.returnTo || null;

  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [checkingOut, setCheckingOut] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    reset,
    formState: { errors },
  } = useForm({ defaultValues: emptyDefaults });

  const addressType = watch("addressType");
  const isDefault = watch("isDefault");

  useEffect(() => {
    handleGetAllAddresses();
  }, []);

  useEffect(() => {
    if (!selectedAddress && addresses.length > 0) {
      const defaultAddr = addresses.find((a) => a.isDefault) || addresses[0];
      dispatch(setSelectedAddress(defaultAddr));
    }
  }, [addresses]);

  const openCreateForm = () => {
    reset(emptyDefaults);
    setEditingId(null);
    setShowForm(true);
  };

  const openEditForm = (address) => {
    reset({
      fullName: address.fullName,
      phone: address.phone,
      addressLine1: address.addressLine1,
      addressLine2: address.addressLine2 || "",
      city: address.city,
      state: address.state,
      pincode: address.pincode,
      addressType: address.addressType || "Home",
      isDefault: address.isDefault || false,
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const onSubmitForm = async (data) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await handleUpdateAddress(editingId, data);
        notify.success("Address updated successfully");
      } else {
        await handleCreateAddress(data);
        notify.success("New address added successfully");
      }
      setShowForm(false);
      reset(emptyDefaults);
      await handleGetAllAddresses();
    } catch (err) {
      notify.error(err, "Failed to save address");
    } finally {
      setSubmitting(false);
    }
  };

  const onDeleteConfirm = async (id) => {
    try {
      await handleDeleteAddress(id);
      notify.success("Address deleted");
      setConfirmDeleteId(null);
      await handleGetAllAddresses();
    } catch (err) {
      notify.error(err, "Failed to delete address");
    }
  };

  const handleProceedToOrderSummary = () => {
    if (!selectedAddress) {
      notify.error("Please select a delivery address to proceed");
      return;
    }
    // Go back to order-summary if we came from there; otherwise go fresh
    navigate(returnTo || "/order-summary", { state: { address: selectedAddress } });
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Checkout Stepper */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-3 sm:px-8 py-3 flex items-center justify-between gap-2 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => navigate(returnTo ? returnTo : -1)}
            aria-label="Back"
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors shrink-0 cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span className="hidden sm:inline">{returnTo ? "Back to Summary" : "Back"}</span>
          </button>

          <div className="flex items-center gap-1.5 sm:gap-3 text-[11px] sm:text-[11.5px] font-semibold shrink-0">
            <span className="flex items-center gap-1 text-[#B08D57]">
              <span className="w-4 h-4 rounded-full bg-[#B08D57] text-white text-[9px] flex items-center justify-center font-bold">1</span>
              Address
            </span>
            <span className="text-[#D2D2D2]">&rarr;</span>
            <span className="flex items-center gap-1 text-[#999999]">
              <span className="w-4 h-4 rounded-full bg-[#EAEAEA] text-[#777] text-[9px] flex items-center justify-center font-bold">2</span>
              Order Summary
            </span>
            <span className="text-[#D2D2D2]">&rarr;</span>
            <span className="flex items-center gap-1 text-[#999999]">
              <span className="w-4 h-4 rounded-full bg-[#EAEAEA] text-[#777] text-[9px] flex items-center justify-center font-bold">3</span>
              Pay
            </span>
          </div>

          <div className="flex items-center gap-1 text-[10px] sm:text-[10.5px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2 py-0.5 rounded-full shrink-0">
            <Lock size={10} />
            <span className="hidden xs:inline">Razorpay Secure</span>
          </div>
        </div>
      </div>

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 pt-6">
        <div className="mb-6 border-b border-[#EAEAEA] pb-3 flex items-baseline justify-between">
          <div>
            <h1 className="font-display text-[24px] md:text-[28px] font-bold text-[#111111]">
              Select Delivery Address
            </h1>
            <p className="text-[12.5px] text-[#666666] mt-0.5">
              Choose where you want your order delivered.
            </p>
          </div>
          <button
            onClick={openCreateForm}
            className="flex items-center gap-1.5 px-4 py-2 bg-[#111111] text-white rounded text-[11.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all cursor-pointer"
          >
            <Plus size={14} />
            Add Address
          </button>
        </div>

        {/* Address Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          {addresses.map((addr) => {
            const isSelected = selectedAddress?._id === addr._id;
            return (
              <div
                key={addr._id}
                onClick={() => dispatch(setSelectedAddress(addr))}
                className={`p-5 rounded-[8px] border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-[#FAFAFA] border-[#B08D57] shadow-sm"
                    : "bg-white border-[#EAEAEA] hover:border-[#111111]"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full border-2 border-[#B08D57] flex items-center justify-center">
                      {isSelected && <span className="w-2 h-2 rounded-full bg-[#B08D57]" />}
                    </span>
                    <span className="text-[11px] font-bold uppercase tracking-[0.08em] bg-[#111111] text-white px-2 py-0.5 rounded">
                      {addr.addressType || "HOME"}
                    </span>
                    {addr.isDefault && (
                      <span className="text-[10px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2 py-0.5 rounded">
                        DEFAULT
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openEditForm(addr);
                      }}
                      className="text-[#666666] hover:text-[#111111] cursor-pointer"
                    >
                      <Pencil size={14} />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setConfirmDeleteId(addr._id);
                      }}
                      className="text-[#666666] hover:text-[#C43D3D] cursor-pointer"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                <h3 className="font-display text-[15px] font-bold text-[#111111] mb-1">
                  {addr.fullName} · {addr.phone}
                </h3>
                <p className="text-[12.5px] text-[#666666]">
                  {addr.addressLine1}, {addr.addressLine2}
                </p>
                <p className="text-[12.5px] text-[#666666]">
                  {addr.city}, {addr.state} - <strong className="text-[#111111]">{addr.pincode}</strong>
                </p>
              </div>
            );
          })}
        </div>

        {/* Payment CTA Bar */}
        <div className="p-5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B08D57]">Selected Address</p>
            <p className="text-[13px] font-bold text-[#111111]">
              {selectedAddress ? `${selectedAddress.fullName} (${selectedAddress.pincode})` : "None Selected"}
            </p>
          </div>

          <button
            onClick={handleProceedToOrderSummary}
            disabled={!selectedAddress || checkingOut}
            className="flex items-center justify-center gap-2 bg-[#111111] text-white px-8 py-3.5 rounded text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all disabled:opacity-50 cursor-pointer"
          >
            {checkingOut ? "Please wait..." : returnTo ? "Confirm Address" : "Continue to Order Summary"}
            <ArrowRight size={15} />
          </button>
        </div>
      </div>

      {/* Address Form Modal */}
      {showForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[10px] border border-[#EAEAEA] p-6 max-w-lg w-full shadow-2xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA]">
              <h3 className="font-display text-[18px] font-bold text-[#111]">
                {editingId ? "Edit Address" : "Add Delivery Address"}
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[#666] hover:text-[#111] cursor-pointer">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmitForm)} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Full Name *</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("fullName", { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Phone Number *</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("phone", { required: true })}
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  placeholder="House / Flat No., Building Name"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                  {...register("addressLine1", { required: true })}
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Address Line 2</label>
                <input
                  type="text"
                  placeholder="Street, Landmark, Area"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                  {...register("addressLine2")}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">City *</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("city", { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">State *</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("state", { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Pincode *</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("pincode", { required: true })}
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-3 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 border rounded text-[12px] font-bold uppercase text-[#555] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2 bg-[#111111] text-white rounded text-[12px] font-bold uppercase hover:bg-[#B08D57] cursor-pointer disabled:opacity-50"
                >
                  {submitting ? "Saving..." : "Save Address"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete confirmation modal */}
      {confirmDeleteId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[10px] border border-[#EAEAEA] p-6 max-w-sm w-full space-y-4">
            <h3 className="font-display text-[16px] font-bold text-[#111]">Delete Address</h3>
            <p className="text-[12.5px] text-[#666]">Are you sure you want to delete this delivery address?</p>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setConfirmDeleteId(null)} className="px-4 py-2 border rounded text-[11px] font-bold uppercase cursor-pointer">Cancel</button>
              <button onClick={() => onDeleteConfirm(confirmDeleteId)} className="px-5 py-2 bg-[#C43D3D] text-white rounded text-[11px] font-bold uppercase cursor-pointer">Delete</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Address;