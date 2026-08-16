import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight, ArrowLeft, Upload, Check, ShieldCheck, MapPin, CreditCard, FileText } from "lucide-react";
import useSeller from "../hook/useSeller";

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const STEPS = [
  { key: "address", label: "Pickup Address", icon: MapPin },
  { key: "payout", label: "Payout Account", icon: CreditCard },
  { key: "pan", label: "PAN Verification", icon: FileText },
];

const STEP_FIELDS = {
  address: ["addressLine1", "addressLine2", "city", "state", "pincode"],
  payout: ["upiId", "upiMobile"],
  pan: ["panNumber"],
};

const SellerKYC = () => {
  const navigate = useNavigate();
  const { handleSubmitVerification } = useSeller();
  const { loading, error } = useSelector((state) => state.seller);

  const [step, setStep] = useState(0);
  const [panPhoto, setPanPhoto] = useState(null);
  const [panPreview, setPanPreview] = useState(null);
  const [photoError, setPhotoError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    watch,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const goNext = async () => {
    const fields = STEP_FIELDS[STEPS[step].key];
    const valid = await trigger(fields);
    if (!valid) return;
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  const goBack = () => setStep((s) => Math.max(s - 1, 0));

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!["image/jpeg", "image/png", "image/jpg"].includes(file.type)) {
      setPhotoError("Upload a JPG or PNG image");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError("File must be under 5MB");
      return;
    }

    setPhotoError("");
    setPanPhoto(file);
    setPanPreview(URL.createObjectURL(file));
  };

  const onSubmit = async (data) => {
    if (!panPhoto) {
      setPhotoError("PAN photo is required");
      return;
    }

    setSubmitting(true);
    const ok = await handleSubmitVerification({
      panNumber: data.panNumber.toUpperCase(),
      panPhoto,
      pickupAddress: {
        addressLine1: data.addressLine1,
        addressLine2: data.addressLine2 || "",
        city: data.city,
        state: data.state,
        pincode: data.pincode,
      },
      payout: {
        upiId: data.upiId || undefined,
        upiMobile: data.upiMobile || undefined,
      },
    });
    setSubmitting(false);
    if (ok) navigate("/seller/");
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Top Header */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/seller/")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111]"
          >
            <ArrowLeft size={14} />
            Back to Dashboard
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Merchant Verification Wizard
          </span>
        </div>
      </div>

      <div className="max-w-[800px] mx-auto px-4 md:px-8 pt-6">
        {/* Title */}
        <div className="mb-6 border-b border-[#EAEAEA] pb-3 text-center">
          <h1 className="font-display text-[24px] md:text-[28px] font-bold text-[#111111]">
            Complete Merchant KYC Verification
          </h1>
          <p className="text-[12.5px] text-[#666666] mt-0.5">
            Required to list products, enable Shiprocket pickup, and receive Razorpay escrow payouts.
          </p>
        </div>

        {/* Stepper Header */}
        <div className="flex items-center justify-between mb-8 bg-[#FAFAFA] border border-[#EAEAEA] p-3.5 rounded-[8px]">
          {STEPS.map((s, idx) => {
            const Icon = s.icon;
            const isDone = idx < step;
            const isCurrent = idx === step;

            return (
              <div key={s.key} className="flex items-center gap-2">
                <div
                  className={`w-7 h-7 rounded-full flex items-center justify-center text-[11px] font-bold ${
                    isDone
                      ? "bg-[#287A4B] text-white"
                      : isCurrent
                      ? "bg-[#111111] text-white"
                      : "bg-[#EAEAEA] text-[#777]"
                  }`}
                >
                  {isDone ? <Check size={13} /> : idx + 1}
                </div>
                <span className={`text-[12px] font-bold hidden sm:inline ${isCurrent ? "text-[#111]" : "text-[#777]"}`}>
                  {s.label}
                </span>
              </div>
            );
          })}
        </div>

        {/* Step Form Container */}
        <form onSubmit={handleSubmit(onSubmit)} className="bg-white border border-[#EAEAEA] rounded-[10px] p-6 md:p-8 space-y-6 shadow-sm">
          {step === 0 && (
            <div className="space-y-4">
              <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57] pb-2 border-b border-[#EAEAEA]">
                1. Courier Pickup Address
              </h2>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">Address Line 1 *</label>
                <input
                  type="text"
                  placeholder="Building No, Warehouse Address"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                  {...register("addressLine1", { required: "Required" })}
                />
                {errors.addressLine1 && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.addressLine1.message}</p>}
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">Address Line 2</label>
                <input
                  type="text"
                  placeholder="Landmark, Industrial Area"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                  {...register("addressLine2")}
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">City *</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("city", { required: "Required" })}
                  />
                  {errors.city && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.city.message}</p>}
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">State *</label>
                  <input
                    type="text"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("state", { required: "Required" })}
                  />
                  {errors.state && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.state.message}</p>}
                </div>
                <div>
                  <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">Pincode *</label>
                  <input
                    type="text"
                    placeholder="110001"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                    {...register("pincode", {
                      required: "Required",
                      pattern: { value: PINCODE_REGEX, message: "6-digit code" },
                    })}
                  />
                  {errors.pincode && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.pincode.message}</p>}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="space-y-4">
              <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57] pb-2 border-b border-[#EAEAEA]">
                2. Escrow Payout Account
              </h2>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">UPI VPA ID *</label>
                <input
                  type="text"
                  placeholder="merchant@upi"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                  {...register("upiId", { required: "UPI VPA is required" })}
                />
                {errors.upiId && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.upiId.message}</p>}
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">UPI Registered Mobile *</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] outline-none"
                  {...register("upiMobile", {
                    required: "Mobile required",
                    pattern: { value: MOBILE_REGEX, message: "Valid 10-digit number" },
                  })}
                />
                {errors.upiMobile && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.upiMobile.message}</p>}
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="space-y-4">
              <h2 className="text-[12px] font-bold tracking-[0.1em] uppercase text-[#B08D57] pb-2 border-b border-[#EAEAEA]">
                3. Identity Document (PAN Card)
              </h2>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">PAN Card Number *</label>
                <input
                  type="text"
                  placeholder="ABCDE1234F"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[13px] uppercase outline-none"
                  {...register("panNumber", {
                    required: "PAN number required",
                    pattern: { value: PAN_REGEX, message: "Format: ABCDE1234F" },
                  })}
                />
                {errors.panNumber && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.panNumber.message}</p>}
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666] mb-1">Upload Clear PAN Photo *</label>
                <label className="border-2 border-dashed border-[#EAEAEA] hover:border-[#B08D57] bg-[#FAFAFA] rounded-[8px] p-6 flex flex-col items-center justify-center cursor-pointer text-center">
                  <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                  <Upload size={24} className="text-[#B08D57] mb-2" />
                  <p className="text-[12.5px] font-bold text-[#111]">Upload PAN Photo Document</p>
                  <p className="text-[11px] text-[#777] mt-0.5">JPG or PNG, max 5MB</p>
                </label>
                {photoError && <p className="text-[11px] text-[#C43D3D] mt-1">{photoError}</p>}

                {panPreview && (
                  <div className="mt-3 w-40 h-28 rounded border border-[#EAEAEA] overflow-hidden">
                    <img src={panPreview} alt="PAN preview" className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            </div>
          )}

          {error && <p className="text-[11.5px] text-[#C43D3D] bg-[#FCECEC] p-2.5 rounded border border-[#C43D3D]/30">{error}</p>}

          <div className="flex justify-between pt-4 border-t border-[#EAEAEA]">
            {step > 0 ? (
              <button
                type="button"
                onClick={goBack}
                className="px-4 py-2 border rounded text-[12px] font-bold uppercase text-[#555]"
              >
                Back
              </button>
            ) : <div />}

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={goNext}
                className="px-6 py-2 bg-[#111111] text-white rounded text-[12px] font-bold uppercase hover:bg-[#B08D57]"
              >
                Next Step
              </button>
            ) : (
              <button
                type="submit"
                disabled={submitting || loading?.submitVerification}
                className="px-8 py-2.5 bg-[#287A4B] text-white rounded text-[12px] font-bold uppercase hover:bg-[#1E6039]"
              >
                {submitting ? "Submitting..." : "Submit KYC Application"}
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};

export default SellerKYC;