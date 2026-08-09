import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router";
import { useSelector } from "react-redux";
import { ArrowRight } from "lucide-react";
import useSeller from "../hook/useSeller";
import ZriveLogo from "../../auth/components/ZriveLogo";

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
    if (ok) navigate("/seller/dashboard");
  };

  return (
    <div className="min-h-screen w-full bg-cream px-6 py-8 ">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes fillLine {
          from { width: 0%; }
          to { width: 50%; }
        }
        .field-in {
          opacity: 0;
          animation: fadeUp 0.5s ease forwards;
        }
        .progress-fill {
          animation: fillLine 5s cubic-bezier(0.22, 1, 0.36, 1) forwards;
        }
      `}</style>

      <div className="mx-auto w-full max-w-[460px]">
        {/* Logo */}
        <div className="flex justify-center mb-10 field-in" style={{ animationDelay: "0ms" }}>
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

        {/* Heading */}
        <h1 className="text-center font-display text-[32px] font-medium leading-[1.1] tracking-tight text-ink mb-2 field-in" style={{ animationDelay: "60ms" }}>
          Join the Zrive Community
        </h1>
        <p className="text-center text-[13px] leading-relaxed text-ink-soft mb-9 field-in" style={{ animationDelay: "120ms" }}>
          Begin your journey as an exclusive seller. Tell us about your
          brand to get started.
        </p>

        <div className="rounded-[3px] border border-border bg-surface p-6 md:p-8 shadow-sm">
          {/* ===== Step progress line ===== */}
          <div className="relative mb-8 field-in" style={{ animationDelay: "160ms" }}>
            <div className="flex items-center justify-between mb-3">
              <span className="flex items-center gap-2 text-[11px] font-semibold tracking-[0.08em] uppercase text-ink">
                <span className="w-1.5 h-1.5 rounded-full bg-charcoal" />
                Basic Details
              </span>
              <span className="flex items-center gap-2 text-[11px] font-medium tracking-[0.08em] uppercase text-ink-soft/60">
                Verification
                <span className="w-1.5 h-1.5 rounded-full border border-ink-soft/40" />
              </span>
            </div>
            <div className="relative h-[3px] w-full bg-border rounded-full overflow-hidden">
              <div className="progress-fill absolute inset-y-0 left-0 bg-charcoal rounded-full" style={{ width: 0 }} />
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            <div className="field-in" style={{ animationDelay: "200ms" }}>
              <label htmlFor="brandName" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                Brand Name
              </label>
              <input
                id="brandName"
                type="text"
                placeholder="e.g. Vardhan & Co."
                aria-invalid={errors.brandName ? "true" : "false"}
                className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-all duration-200 focus:border-ink focus:bg-surface ${
                  errors.brandName ? "border-error" : "border-border"
                }`}
                {...register("brandName", {
                  required: "Brand name is required",
                  minLength: { value: 2, message: "Enter a valid brand name" },
                })}
              />
              {errors.brandName && (
                <p className="mt-1.5 text-[12px] text-error">{errors.brandName.message}</p>
              )}
            </div>

            <div className="field-in" style={{ animationDelay: "260ms" }}>
              <label htmlFor="businessEmail" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                Business Email
              </label>
              <input
                id="businessEmail"
                type="email"
                placeholder="hello@yourbrand.com"
                aria-invalid={errors.businessEmail ? "true" : "false"}
                className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-all duration-200 focus:border-ink focus:bg-surface ${
                  errors.businessEmail ? "border-error" : "border-border"
                }`}
                {...register("businessEmail", {
                  required: "Business email is required",
                  pattern: { value: EMAIL_REGEX, message: "Enter a valid email address" },
                })}
              />
              {errors.businessEmail && (
                <p className="mt-1.5 text-[12px] text-error">{errors.businessEmail.message}</p>
              )}
            </div>

            <div className="field-in" style={{ animationDelay: "320ms" }}>
              <label htmlFor="businessPhone" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                Business Phone
              </label>
              <div
                className={`flex items-center overflow-hidden rounded-[3px] border bg-cream-dark transition-all duration-200 focus-within:border-ink focus-within:bg-surface ${
                  errors.businessPhone ? "border-error" : "border-border"
                }`}
              >
                <span className="border-r border-border bg-cream px-4 py-3.5 text-[13px] font-semibold text-ink-soft">
                  +91
                </span>
                <input
                  id="businessPhone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  aria-invalid={errors.businessPhone ? "true" : "false"}
                  className="w-full bg-transparent px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none"
                  {...register("businessPhone", {
                    required: "Business phone is required",
                    pattern: { value: PHONE_REGEX, message: "Enter a valid 10-digit mobile number" },
                  })}
                />
              </div>
              {errors.businessPhone && (
                <p className="mt-1.5 text-[12px] text-error">{errors.businessPhone.message}</p>
              )}
            </div>

            {error && (
              <div className="field-in rounded-[3px] border border-error/30 bg-error/5 px-4 py-3 text-[12.5px] text-error">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting || loading}
              className="field-in group flex w-full items-center justify-center gap-2 rounded-[3px] bg-charcoal py-4 mt-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
              style={{ animationDelay: "380ms" }}
            >
              {submitting || loading ? (
                <span className="w-3.5 h-3.5 border-2 border-cream/40 border-t-cream rounded-full animate-spin" />
              ) : (
                <>
                  Continue to Dashboard
                  <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                </>
              )}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-soft field-in" style={{ animationDelay: "440ms" }}>
          You'll finish KYC & verification from your dashboard —
          <br />
          your account stays view-only for listings until then.
        </p>
      </div>
    </div>
  );
};

export default BecomeSeller;