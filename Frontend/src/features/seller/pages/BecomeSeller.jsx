import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight, ArrowLeft, ShieldCheck, Zap, TrendingUp, Store, Check, Sparkles } from "lucide-react";
import useSeller from "../hook/useSeller";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const BecomeSeller = () => {
  const navigate = useNavigate();
  const { handleCreateBasicApplication } = useSeller();
  const { loading, error } = useSelector((state) => state.seller);
  const [submitting, setSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    setSubmitting(true);
    const ok = await handleCreateBasicApplication({
      brandName: data.brandName,
      businessEmail: data.businessEmail,
      businessPhone: data.businessPhone,
    });
    setSubmitting(false);
    if (ok) navigate("/seller");
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      {/* Top Header */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111]"
          >
            <ArrowLeft size={14} />
            Back to Marketplace
          </button>
          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            <Store size={14} />
            ZRIVE Merchant Partner Program
          </div>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          {/* Left Column: Brand Pitch */}
          <div className="space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5EFE5] text-[#B08D57] text-[11px] font-bold uppercase tracking-[0.08em]">
              <Sparkles size={13} />
              Merchant Partner Program
            </div>

            <h1 className="font-display text-[32px] md:text-[40px] font-bold leading-tight text-[#111111]">
              Grow Your Fashion Brand on ZRIVE
            </h1>

            <p className="text-[13.5px] text-[#666666] leading-relaxed">
              Reach millions of high-intent male fashion buyers across India. Enjoy instant escrow payouts, integrated Shiprocket logistics, and premium catalog tools.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3 p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#EAEAEA]">
                <div className="w-7 h-7 rounded-full bg-[#B08D57]/15 text-[#B08D57] flex items-center justify-center shrink-0">
                  <Zap size={15} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#111111]">Zero Onboarding Fee</h4>
                  <p className="text-[11.5px] text-[#666666]">No upfront setup or monthly subscription fees. Pay only when you sell.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#EAEAEA]">
                <div className="w-7 h-7 rounded-full bg-[#287A4B]/15 text-[#287A4B] flex items-center justify-center shrink-0">
                  <ShieldCheck size={15} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#111111]">Automated Escrow Settlements</h4>
                  <p className="text-[11.5px] text-[#666666]">Direct bank deposits guaranteed upon successful parcel delivery.</p>
                </div>
              </div>

              <div className="flex items-start gap-3 p-3.5 rounded-[6px] bg-[#FAFAFA] border border-[#EAEAEA]">
                <div className="w-7 h-7 rounded-full bg-[#111111] text-white flex items-center justify-center shrink-0">
                  <TrendingUp size={15} />
                </div>
                <div>
                  <h4 className="text-[13px] font-bold text-[#111111]">Shiprocket Logistics</h4>
                  <p className="text-[11.5px] text-[#666666]">Automated AWB generation, doorstep pickup, and nationwide delivery.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Register Card */}
          <div className="bg-white border border-[#EAEAEA] rounded-[10px] p-6 md:p-8 shadow-xl space-y-6">
            <div>
              <span className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">Step 1 of 2</span>
              <h2 className="font-display text-[22px] font-bold text-[#111111] mt-0.5">Register Your Merchant Account</h2>
              <p className="text-[12.5px] text-[#666666] mt-1">Fill in your brand and contact details below.</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#666666] mb-1.5">Brand / Store Name *</label>
                <input
                  type="text"
                  placeholder="e.g. Rare Rabbit Clothing"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded px-3.5 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#B08D57]"
                  {...register("brandName", { required: "Brand name is required" })}
                />
                {errors.brandName && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.brandName.message}</p>}
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#666666] mb-1.5">Business Email *</label>
                <input
                  type="email"
                  placeholder="merchant@brand.com"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded px-3.5 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#B08D57]"
                  {...register("businessEmail", {
                    required: "Business email is required",
                    pattern: { value: EMAIL_REGEX, message: "Invalid email format" },
                  })}
                />
                {errors.businessEmail && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.businessEmail.message}</p>}
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase tracking-[0.08em] text-[#666666] mb-1.5">Business Phone (10 digits) *</label>
                <input
                  type="tel"
                  placeholder="9876543210"
                  className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded px-3.5 py-2.5 text-[13px] text-[#111111] outline-none focus:border-[#B08D57]"
                  {...register("businessPhone", {
                    required: "Phone number is required",
                    pattern: { value: PHONE_REGEX, message: "Enter valid 10-digit Indian phone number" },
                  })}
                />
                {errors.businessPhone && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.businessPhone.message}</p>}
              </div>

              {error && <p className="text-[11.5px] text-[#C43D3D] bg-[#FCECEC] p-2.5 rounded border border-[#C43D3D]/30">{error}</p>}

              <button
                type="submit"
                disabled={submitting || loading?.create}
                className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white py-3.5 rounded text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all disabled:opacity-60"
              >
                {submitting ? "Registering Merchant..." : "Continue to Merchant Dashboard"}
                <ArrowRight size={15} />
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BecomeSeller;