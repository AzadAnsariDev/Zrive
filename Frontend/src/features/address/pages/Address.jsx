import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { useSelector, useDispatch } from "react-redux";
import { useNavigate } from "react-router";
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
} from "lucide-react";
import useAddress from "../hook/useAddress";
import usePayment from "../../payment/hook/usePayment";
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

  const { handleCreateOrder, handleVerifyOrder } = usePayment();

  const dispatch = useDispatch();
  const navigate = useNavigate();
  const addresses = useSelector((state) => state.address.addresses);
  const selectedAddress = useSelector((state) => state.address.selectedAddress);
  const user = useSelector((state) => state.auth.user);

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

  // agar koi address selected nahi hai, to default wali ko auto-select kar do
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
      isDefault: address.isDefault,
    });
    setEditingId(address._id);
    setShowForm(true);
  };

  const closeForm = () => {
    setShowForm(false);
    setEditingId(null);
    reset(emptyDefaults);
  };

  const onSubmit = async (data) => {
    setSubmitting(true);
    try {
      if (editingId) {
        await handleUpdateAddress(editingId, data);
      } else {
        await handleCreateAddress(data);
      }
      closeForm();
    } finally {
      setSubmitting(false);
    }
  };

  const onDelete = async (addressId) => {
    await handleDeleteAddress(addressId);
    setConfirmDeleteId(null);
  };

  const onSetDefault = (address) => {
    handleUpdateAddress(address._id, { isDefault: true });
  };

  const handleCheckout = async () => {
    if (!selectedAddress?._id) return;

    setCheckingOut(true);
    try {
      const order = await handleCreateOrder(selectedAddress._id);
      console.log(order);

      const options = {
        key: "rzp_test_TJOYSvdezHvcAX",
        amount: order.amount, // Amount in paise
        currency: order.currency,
        name: "Zrive",
        description: "Test Transaction",
        order_id: order.id, // Generate order_id on server
        handler: async (response) => {
          const isPaymentDone = await handleVerifyOrder(response);
          if (isPaymentDone) {
            navigate(`/order-success/${response.razorpay_order_id}`);
          }
        },
        prefill: {
          name: user?.username,
          email: user?.email,
          contact: user?.contact,
        },
        theme: {
          color: "#F37254",
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.open();
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally {
      setCheckingOut(false);
    }
  };

  const inputBase =
    "w-full bg-transparent border-b border-border pb-2 text-ink placeholder:text-ink-soft/60 focus:outline-none focus:border-gold transition-colors duration-200";

  return (
    <div className="min-h-screen bg-cream px-6 py-8 md:py-10">
      <div className="mx-auto max-w-5xl">
        {/* ── Header ─────────────────────────────────── */}
        <div className="flex items-center justify-between flex-wrap gap-4 mb-8">
          <div>
            <p className="font-sans text-xs tracking-[0.2em] uppercase text-gold mb-2">
              Delivery details
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-ink leading-tight">
              Your addresses
            </h1>
          </div>

          {!showForm && (
            <button
              onClick={openCreateForm}
              className="flex items-center gap-2 px-5 py-3 rounded-full bg-charcoal text-cream text-sm hover:scale-[1.02] transition-transform duration-200"
            >
              <Plus size={16} strokeWidth={2} />
              Add new address
            </button>
          )}
        </div>

        {/* ── Saved addresses list ─────────────────────── */}
        {!showForm && (
          <>
            {addresses.length === 0 ? (
              <div className="border border-dashed border-border rounded-lg py-16 text-center">
                <p className="text-ink-soft mb-4">No saved addresses yet.</p>
                <button
                  onClick={openCreateForm}
                  className="text-sm text-gold hover:text-gold-deep underline underline-offset-4"
                >
                  Add your first address
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {addresses.map((address) => {
                    const TypeIcon =
                      addressTypes.find((t) => t.key === address.addressType)
                        ?.icon || Home;
                    const confirming = confirmDeleteId === address._id;
                    const isSelected = selectedAddress?._id === address._id;

                    return (
                      <div
                        key={address._id}
                        onClick={() => dispatch(setSelectedAddress(address))}
                        className={`relative rounded-lg overflow-hidden flex flex-col cursor-pointer
        transition-all duration-300 ease-out
        ${
          isSelected
            ? "bg-surface border-2 border-gold shadow-[0_0_0_4px_rgba(156,138,92,0.12),0_8px_24px_-8px_rgba(122,107,69,0.35)] -translate-y-0.5"
            : "bg-surface border-2 border-transparent ring-1 ring-border hover:ring-gold/40 hover:-translate-y-0.5"
        }`}
                      >
                        {isSelected && (
                          <span className="pointer-events-none absolute inset-0 bg-gradient-to-br from-gold/[0.06] via-transparent to-transparent" />
                        )}

                        {/* ── Default banner — own line, top of card ── */}
                        {address.isDefault && (
                          <div className="flex items-center gap-1.5 bg-gold px-4 py-2">
                            <Star
                              size={12}
                              strokeWidth={2}
                              fill="currentColor"
                              className="text-charcoal"
                            />
                            <span className="text-[11px] font-semibold tracking-[0.15em] uppercase text-charcoal">
                              Default address
                            </span>
                          </div>
                        )}

                        <div className="p-6 flex flex-col gap-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* radio button */}
                              <span
                                className={`relative w-[18px] h-[18px] rounded-full border flex items-center justify-center shrink-0 transition-all duration-300 ${
                                  isSelected ? "border-gold" : "border-border"
                                }`}
                              >
                                <span
                                  className={`w-[9px] h-[9px] rounded-full bg-gold transition-all duration-300 ease-out ${
                                    isSelected
                                      ? "scale-100 opacity-100"
                                      : "scale-0 opacity-0"
                                  }`}
                                />
                              </span>

                              <span className="flex items-center gap-1.5 text-xs text-ink-soft uppercase tracking-wide px-2.5 py-1 rounded-full border border-border">
                                <TypeIcon size={12} strokeWidth={1.75} />
                                {address.addressType || "Home"}
                              </span>
                            </div>

                            <div className="flex items-center gap-1">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  openEditForm(address);
                                }}
                                className="p-2 rounded-full text-ink-soft hover:text-ink hover:bg-cream-dark transition-colors duration-200"
                                aria-label="Edit address"
                              >
                                <Pencil size={15} strokeWidth={1.75} />
                              </button>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setConfirmDeleteId(address._id);
                                }}
                                className="p-2 rounded-full text-ink-soft hover:text-error hover:bg-cream-dark transition-colors duration-200"
                                aria-label="Delete address"
                              >
                                <Trash2 size={15} strokeWidth={1.75} />
                              </button>
                            </div>
                          </div>

                          <div>
                            <p className="font-display text-lg text-ink">
                              {address.fullName}
                            </p>
                            <p className="text-ink-soft text-sm">
                              {address.phone}
                            </p>
                          </div>

                          <p className="text-ink text-sm leading-relaxed">
                            {address.addressLine1}
                            {address.addressLine2
                              ? `, ${address.addressLine2}`
                              : ""}
                            <br />
                            {address.city}, {address.state} — {address.pincode}
                          </p>

                          {!address.isDefault && !confirming && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onSetDefault(address);
                              }}
                              className="mt-1 flex items-center gap-1.5 text-xs text-gold hover:text-gold-deep w-fit"
                            >
                              <Star size={12} strokeWidth={1.75} />
                              Set as default
                            </button>
                          )}

                          {confirming && (
                            <div
                              onClick={(e) => e.stopPropagation()}
                              className="mt-1 flex items-center gap-3 pt-3 border-t border-border"
                            >
                              <span className="text-xs text-ink-soft">
                                Delete this address?
                              </span>
                              <button
                                onClick={() => onDelete(address._id)}
                                className="text-xs text-error hover:text-ink"
                              >
                                Yes, delete
                              </button>
                              <button
                                onClick={() => setConfirmDeleteId(null)}
                                className="text-xs text-ink-soft hover:text-ink"
                              >
                                Cancel
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* ── Continue to payment ─────────────────────── */}
                <div className="mt-10 flex justify-end">
                  <button
                    onClick={handleCheckout}
                    disabled={!selectedAddress || checkingOut}
                    className="flex items-center gap-2 px-8 py-4 rounded-full bg-charcoal text-cream text-sm tracking-wide transition-transform duration-200 hover:scale-[1.02] disabled:opacity-50 disabled:hover:scale-100"
                  >
                    {checkingOut ? "Processing..." : "Continue to payment"}
                    {!checkingOut && <ArrowRight size={16} strokeWidth={2} />}
                  </button>
                </div>
              </>
            )}
          </>
        )}

        {/* ── Create / Edit form ────────────────────────── */}
        {showForm && (
          <div className="grid grid-cols-1 lg:grid-cols-[1.3fr_1fr] gap-10 lg:gap-16 items-start">
            <div>
              <div className="flex items-center justify-between mb-8">
                <h2 className="font-display text-2xl text-ink">
                  {editingId ? "Edit address" : "Add a new address"}
                </h2>
                <button
                  onClick={closeForm}
                  className="p-2 rounded-full text-ink-soft hover:text-ink hover:bg-cream-dark transition-colors duration-200"
                  aria-label="Close form"
                >
                  <X size={18} strokeWidth={1.75} />
                </button>
              </div>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-9">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-7">
                  <div className="sm:col-span-2">
                    <label className="block text-xs text-ink-soft mb-2">
                      Full name
                    </label>
                    <input
                      {...register("fullName", { required: "Required" })}
                      className={inputBase}
                      placeholder="Rahul Sharma"
                    />
                    {errors.fullName && (
                      <p className="text-error text-xs mt-2">
                        {errors.fullName.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-ink-soft mb-2">
                      Phone number
                    </label>
                    <input
                      {...register("phone", {
                        required: "Required",
                        pattern: {
                          value: /^[6-9]\d{9}$/,
                          message: "Enter a valid 10-digit number",
                        },
                      })}
                      className={inputBase}
                      placeholder="98765 43210"
                      maxLength={10}
                    />
                    {errors.phone && (
                      <p className="text-error text-xs mt-2">
                        {errors.phone.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-ink-soft mb-2">
                      Address line 1
                    </label>
                    <input
                      {...register("addressLine1", { required: "Required" })}
                      className={inputBase}
                      placeholder="House no., building, street"
                    />
                    {errors.addressLine1 && (
                      <p className="text-error text-xs mt-2">
                        {errors.addressLine1.message}
                      </p>
                    )}
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs text-ink-soft mb-2">
                      Address line 2{" "}
                      <span className="text-ink-soft/60">(optional)</span>
                    </label>
                    <input
                      {...register("addressLine2")}
                      className={inputBase}
                      placeholder="Landmark, area"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-ink-soft mb-2">
                      City
                    </label>
                    <input
                      {...register("city", { required: "Required" })}
                      className={inputBase}
                      placeholder="Kolhapur"
                    />
                    {errors.city && (
                      <p className="text-error text-xs mt-2">
                        {errors.city.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-ink-soft mb-2">
                      State
                    </label>
                    <input
                      {...register("state", { required: "Required" })}
                      className={inputBase}
                      placeholder="Maharashtra"
                    />
                    {errors.state && (
                      <p className="text-error text-xs mt-2">
                        {errors.state.message}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs text-ink-soft mb-2">
                      Pincode
                    </label>
                    <input
                      {...register("pincode", {
                        required: "Required",
                        pattern: {
                          value: /^[1-9][0-9]{5}$/,
                          message: "Enter a valid 6-digit pincode",
                        },
                      })}
                      className={inputBase}
                      placeholder="416001"
                      maxLength={6}
                    />
                    {errors.pincode && (
                      <p className="text-error text-xs mt-2">
                        {errors.pincode.message}
                      </p>
                    )}
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-ink-soft mb-3">
                    Address type
                  </label>
                  <div className="flex gap-3">
                    {addressTypes.map(({ key, icon: Icon }) => {
                      const active = addressType === key;
                      return (
                        <button
                          type="button"
                          key={key}
                          onClick={() => setValue("addressType", key)}
                          className={`flex items-center gap-2 px-4 py-2.5 rounded-full border text-sm transition-all duration-200 ${
                            active
                              ? "bg-charcoal border-charcoal text-cream"
                              : "border-border text-ink-soft hover:border-gold hover:text-ink"
                          }`}
                        >
                          <Icon size={14} strokeWidth={1.75} />
                          {key}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer w-fit">
                  <span
                    className={`relative w-10 h-6 rounded-full transition-colors duration-200 ${
                      isDefault
                        ? "bg-gold"
                        : "bg-cream-dark border border-border"
                    }`}
                    onClick={() => setValue("isDefault", !isDefault)}
                  >
                    <span
                      className={`absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-surface shadow-sm transition-transform duration-200 ${
                        isDefault ? "translate-x-4" : "translate-x-0"
                      }`}
                    />
                  </span>
                  <span className="text-sm text-ink-soft">
                    Set as default address
                  </span>
                </label>

                <div className="flex items-center gap-4">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="px-10 py-4 rounded-full bg-charcoal text-cream font-sans text-sm tracking-wide transition-transform duration-200 hover:scale-[1.02] disabled:opacity-60"
                  >
                    {submitting
                      ? "Saving..."
                      : editingId
                        ? "Update address"
                        : "Save address"}
                  </button>
                  <button
                    type="button"
                    onClick={closeForm}
                    className="text-sm text-ink-soft hover:text-ink"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>

            {/* Live label preview — desktop only */}
            <div className="hidden lg:block lg:sticky lg:top-10">
              <div className="relative bg-surface border border-border rounded-lg p-8 pl-10">
                <div className="absolute left-0 top-0 bottom-0 w-6 flex flex-col justify-evenly items-center">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-cream border border-border"
                    />
                  ))}
                </div>

                <p className="text-xs tracking-[0.2em] uppercase text-gold mb-6">
                  Shipping label
                </p>

                <p className="font-display italic text-2xl text-ink mb-1 min-h-[2rem]">
                  {watch("fullName") || "Your name"}
                </p>
                <p className="text-ink-soft text-sm mb-6">
                  {watch("phone") || "Phone number"}
                </p>

                <div className="text-ink text-sm leading-relaxed border-t border-dashed border-border pt-6">
                  <p>{watch("addressLine1") || "Address line 1"}</p>
                  {watch("addressLine2") && <p>{watch("addressLine2")}</p>}
                  <p>
                    {watch("city") || "City"}, {watch("state") || "State"} —{" "}
                    {watch("pincode") || "000000"}
                  </p>
                </div>

                <div className="flex items-center gap-2 mt-6 pt-6 border-t border-border">
                  {isDefault && (
                    <span className="flex items-center gap-1 text-xs text-success">
                      <Check size={12} strokeWidth={2} /> Default
                    </span>
                  )}
                  <span className="ml-auto text-xs text-ink-soft uppercase tracking-wide">
                    {addressType}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Address;