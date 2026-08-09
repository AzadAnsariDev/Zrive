import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight, ArrowLeft, Upload, Check } from "lucide-react";
import useSeller from "../hook/useSeller";
import ZriveLogo from "../../auth/components/ZriveLogo";

const PINCODE_REGEX = /^[1-9][0-9]{5}$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/;
const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

const STEPS = [
  { key: "address", label: "Pickup Address" },
  { key: "payout", label: "Payment Details" },
  { key: "pan", label: "PAN & Identity" },
];

// Field names that belong to each step — used to validate only the
// relevant fields when moving forward, without touching later steps.
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

  const upiId = watch("upiId");
  const upiMobile = watch("upiMobile");

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
    if (ok) navigate("/seller/dashboard");
  };

  const progressPct = ((step + 1) / STEPS.length) * 100;

  return (
    <div className="min-h-screen w-full bg-cream px-6 py-12 md:py-20">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .field-in {
          opacity: 0;
          animation: fadeUp 0.45s ease forwards;
        }
        .progress-fill {
          transition: width 0.5s cubic-bezier(0.22, 1, 0.36, 1);
        }
      `}</style>

      <div className="mx-auto w-full max-w-[460px]">
        {/* Logo */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col items-center">
            <div className="text-ink">
              <ZriveLogo />
            </div>
            <p className="mt-4 font-display tracking-[0.35em] text-[20px] text-ink font-medium">
              ZRIVE
            </p>
            <p className="mt-1 text-[10px] font-semibold tracking-[0.25em] text-gold uppercase">
              Seller Registry
            </p>
          </div>
        </div>

        <h1 className="text-center font-display text-[30px] font-medium leading-[1.1] tracking-tight text-ink mb-2">
          Complete Your KYC
        </h1>
        <p className="text-center text-[13px] leading-relaxed text-ink-soft mb-9">
          One more step before you can start listing on ZRIVE.
        </p>

        <div className="rounded-[3px] border border-border bg-surface p-6 md:p-8 shadow-sm">
          {/* ===== Overall phase indicator: Basic Details done, Verification active ===== */}
          <div className="flex items-center justify-between mb-2">
            <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-ink">
              <span className="flex items-center justify-center w-3.5 h-3.5 rounded-full bg-charcoal">
                <Check size={9} className="text-cream" strokeWidth={3} />
              </span>
              Basic Details
            </span>
            <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-ink">
              Verification
              <span className="w-1.5 h-1.5 rounded-full bg-gold" />
            </span>
          </div>
          <div className="relative h-[3px] w-full bg-border rounded-full overflow-hidden mb-6">
            <div className="absolute inset-y-0 left-0 bg-charcoal rounded-full" style={{ width: "100%" }} />
          </div>

          {/* ===== KYC sub-step tracker ===== */}
          <div className="flex items-center justify-between mb-8">
            {STEPS.map((s, i) => (
              <div key={s.key} className="flex-1 flex flex-col items-center">
                <div className="flex items-center w-full">
                  {i !== 0 && (
                    <div className="flex-1 h-px bg-border relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gold progress-fill"
                        style={{ width: step >= i ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                  <span
                    className={`flex-shrink-0 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-semibold transition-colors ${
                      step > i
                        ? "bg-gold text-charcoal"
                        : step === i
                        ? "bg-charcoal text-cream"
                        : "border border-border text-ink-soft"
                    }`}
                  >
                    {step > i ? <Check size={12} strokeWidth={3} /> : i + 1}
                  </span>
                  {i !== STEPS.length - 1 && (
                    <div className="flex-1 h-px bg-border relative overflow-hidden">
                      <div
                        className="absolute inset-y-0 left-0 bg-gold progress-fill"
                        style={{ width: step > i ? "100%" : "0%" }}
                      />
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
          <p className="text-center text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft -mt-4 mb-8">
            {STEPS[step].label}
          </p>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* ===== Step 1: Pickup Address ===== */}
            {step === 0 && (
              <>
                <div className="field-in" style={{ animationDelay: "40ms" }}>
                  <label htmlFor="addressLine1" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                    Address Line 1
                  </label>
                  <input
                    id="addressLine1"
                    type="text"
                    placeholder="Shop / Warehouse address"
                    className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink ${
                      errors.addressLine1 ? "border-error" : "border-border"
                    }`}
                    {...register("addressLine1", { required: "Address line 1 is required" })}
                  />
                  {errors.addressLine1 && <p className="mt-1.5 text-[12px] text-error">{errors.addressLine1.message}</p>}
                </div>

                <div className="field-in" style={{ animationDelay: "80ms" }}>
                  <label htmlFor="addressLine2" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                    Address Line 2 <span className="normal-case font-normal text-ink-soft/60">(optional)</span>
                  </label>
                  <input
                    id="addressLine2"
                    type="text"
                    placeholder="Landmark, area"
                    className="w-full rounded-[3px] border border-border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink"
                    {...register("addressLine2")}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 field-in" style={{ animationDelay: "120ms" }}>
                  <div>
                    <label htmlFor="city" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                      City
                    </label>
                    <input
                      id="city"
                      type="text"
                      placeholder="Pune"
                      className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink ${
                        errors.city ? "border-error" : "border-border"
                      }`}
                      {...register("city", { required: "Required" })}
                    />
                    {errors.city && <p className="mt-1.5 text-[12px] text-error">{errors.city.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="state" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                      State
                    </label>
                    <input
                      id="state"
                      type="text"
                      placeholder="Maharashtra"
                      className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink ${
                        errors.state ? "border-error" : "border-border"
                      }`}
                      {...register("state", { required: "Required" })}
                    />
                    {errors.state && <p className="mt-1.5 text-[12px] text-error">{errors.state.message}</p>}
                  </div>
                </div>

                <div className="field-in" style={{ animationDelay: "160ms" }}>
                  <label htmlFor="pincode" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                    Pincode
                  </label>
                  <input
                    id="pincode"
                    type="text"
                    inputMode="numeric"
                    placeholder="411001"
                    className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink ${
                      errors.pincode ? "border-error" : "border-border"
                    }`}
                    {...register("pincode", {
                      required: "Pincode is required",
                      pattern: { value: PINCODE_REGEX, message: "Enter a valid Indian pincode" },
                    })}
                  />
                  {errors.pincode && <p className="mt-1.5 text-[12px] text-error">{errors.pincode.message}</p>}
                </div>
              </>
            )}

            {/* ===== Step 2: Payout ===== */}
            {step === 1 && (
              <>
                <p className="field-in text-[12px] text-ink-soft -mt-1 mb-1" style={{ animationDelay: "40ms" }}>
                  Provide at least one — UPI ID or UPI-linked mobile number.
                </p>

                <div className="field-in" style={{ animationDelay: "80ms" }}>
                  <label htmlFor="upiId" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                    UPI ID <span className="normal-case font-normal text-ink-soft/60">(optional)</span>
                  </label>
                  <input
                    id="upiId"
                    type="text"
                    placeholder="yourname@upi"
                    className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink ${
                      errors.upiId ? "border-error" : "border-border"
                    }`}
                    {...register("upiId", {
                      validate: (value) =>
                        value || upiMobile ? true : "Provide a UPI ID or mobile number",
                    })}
                  />
                  {errors.upiId && <p className="mt-1.5 text-[12px] text-error">{errors.upiId.message}</p>}
                </div>

                <div className="field-in" style={{ animationDelay: "120ms" }}>
                  <label htmlFor="upiMobile" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                    UPI Mobile Number <span className="normal-case font-normal text-ink-soft/60">(optional)</span>
                  </label>
                  <div className="flex items-center overflow-hidden rounded-[3px] border border-border bg-cream-dark transition-colors focus-within:border-ink">
                    <span className="border-r border-border bg-cream px-4 py-3.5 text-[13px] font-semibold text-ink-soft">
                      +91
                    </span>
                    <input
                      id="upiMobile"
                      type="tel"
                      inputMode="numeric"
                      placeholder="98765 43210"
                      className="w-full bg-transparent px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none"
                      {...register("upiMobile", {
                        validate: (value) => {
                          if (!value) return true;
                          return MOBILE_REGEX.test(value) || "Enter a valid 10-digit mobile number";
                        },
                      })}
                    />
                  </div>
                  {errors.upiMobile && <p className="mt-1.5 text-[12px] text-error">{errors.upiMobile.message}</p>}
                </div>
              </>
            )}

            {/* ===== Step 3: PAN & Identity ===== */}
            {step === 2 && (
              <>
                <div className="field-in" style={{ animationDelay: "40ms" }}>
                  <label htmlFor="panNumber" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                    PAN Number
                  </label>
                  <input
                    id="panNumber"
                    type="text"
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] uppercase tracking-wide text-ink placeholder:text-ink-soft placeholder:normal-case placeholder:tracking-normal outline-none transition-colors focus:border-ink ${
                      errors.panNumber ? "border-error" : "border-border"
                    }`}
                    {...register("panNumber", {
                      required: "PAN number is required",
                      pattern: { value: PAN_REGEX, message: "Enter a valid PAN number" },
                    })}
                  />
                  {errors.panNumber && <p className="mt-1.5 text-[12px] text-error">{errors.panNumber.message}</p>}
                </div>

                <div className="field-in" style={{ animationDelay: "80ms" }}>
                  <label className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                    PAN Card Photo
                  </label>
                  <label
                    htmlFor="panPhoto"
                    className="flex flex-col items-center justify-center gap-2 rounded-[3px] border border-dashed border-border bg-cream-dark px-4 py-8 cursor-pointer transition-colors hover:border-ink"
                  >
                    {panPreview ? (
                      <img src={panPreview} alt="PAN preview" className="h-24 rounded-[3px] object-contain" />
                    ) : (
                      <>
                        <Upload size={20} strokeWidth={1.5} className="text-ink-soft" />
                        <span className="text-[12.5px] text-ink-soft">Click to upload — JPG or PNG, under 5MB</span>
                      </>
                    )}
                    <input id="panPhoto" type="file" accept="image/jpeg,image/png" onChange={handlePhotoChange} className="hidden" />
                  </label>
                  {panPreview && (
                    <p className="mt-1.5 text-[12px] text-ink-soft">
                      Looks good? <span className="text-ink underline cursor-pointer" onClick={() => document.getElementById("panPhoto").click()}>Change photo</span>
                    </p>
                  )}
                  {photoError && <p className="mt-1.5 text-[12px] text-error">{photoError}</p>}
                </div>
              </>
            )}

            {error && (
              <div className="rounded-[3px] border border-error/30 bg-error/5 px-4 py-3 text-[12.5px] text-error">
                {error}
              </div>
            )}

            {/* ===== Navigation ===== */}
            <div className="flex items-center gap-3 pt-2">
              {step > 0 && (
                <button
                  type="button"
                  onClick={goBack}
                  className="flex items-center justify-center gap-1.5 rounded-[3px] border border-border bg-cream px-5 py-4 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink transition-colors hover:bg-cream-dark"
                >
                  <ArrowLeft size={14} />
                  Back
                </button>
              )}

              {step < STEPS.length - 1 ? (
                <button
                  type="button"
                  onClick={goNext}
                  className="flex-1 group flex items-center justify-center gap-2 rounded-[3px] bg-charcoal py-4 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink"
                >
                  Continue
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={submitting || loading}
                  className="flex-1 flex items-center justify-center gap-2 rounded-[3px] bg-charcoal py-4 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {submitting || loading ? (
                    <span className="w-3.5 h-3.5 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
                  ) : (
                    "Submit for Review"
                  )}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SellerKYC;