import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ShoppingBag, Store, ArrowRight, Loader2, Eye ,EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { setError, setLoading } from "../state/authSlice";
import { useAuth } from "../hook/useAuth";
import { useNavigate } from "react-router";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const ZriveLogo = () => (
  <div className="flex flex-col items-center">
    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#0F0F0F]">
      <svg
        width="34"
        height="34"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Shield outline */}
        <path
          d="M20 14C20 11.7909 21.7909 10 24 10H76C78.2091 10 80 11.7909 80 14V52C80 74 65 86 50 92C35 86 20 74 20 52V14Z"
          stroke="#A07F3A"
          strokeWidth="3.5"
        />
        {/* Z */}
        <path
          d="M32 34H52L32 62H52"
          stroke="#A07F3A"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* R */}
        <path
          d="M50 62V34H61C66 34 69 37 69 42C69 47 66 50 61 50H50M61 50L69 62"
          stroke="#A07F3A"
          strokeWidth="6.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </div>
    <p className="mt-4 font-semibold tracking-[0.35em] text-[20px] text-[#111111]">
      ZRIVE
    </p>
    <p className="mt-1 text-[11px] font-semibold tracking-[0.25em] text-[#5F5F5F]">
      MEN&apos;S FASHION MARKETPLACE
    </p>
  </div>
);

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path
      fill="#FFC107"
      d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.9 0-12.5-5.6-12.5-12.5S17.1 10.5 24 10.5c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.5 5.7 29.5 3.7 24 3.7 12.9 3.7 3.9 12.7 3.9 23.8S12.9 43.9 24 43.9c11.1 0 20.1-9 20.1-20.1 0-1.1-.1-2.2-.3-3.3z"
    />
    <path
      fill="#FF3D00"
      d="M6.3 14.6l5.9 4.3C13.9 15.3 18.6 12.5 24 12.5c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.5 7.7 29.5 5.7 24 5.7c-7.7 0-14.4 4.3-17.7 10.6z"
    />
    <path
      fill="#4CAF50"
      d="M24 43.9c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5c-2.1 1.5-4.7 2.4-7.6 2.4-5.3 0-9.7-3.3-11.3-7.9l-6.2 4.8C9.7 39.6 16.3 43.9 24 43.9z"
    />
    <path
      fill="#1976D2"
      d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 35.6 44.1 30.1 44.1 23.8c0-1.1-.2-2.2-.5-3.3z"
    />
  </svg>
);

const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="#0F0F0F">
    <path d="M16.5 1c.1 1.2-.4 2.4-1.1 3.3-.7.9-1.9 1.6-3 1.5-.1-1.2.4-2.4 1.1-3.2C14.2 1.6 15.4 1 16.5 1zM20.7 17.3c-.5 1.2-.8 1.7-1.5 2.7-1 1.4-2.3 3.2-4 3.2-1.5 0-1.9-1-3.9-1s-2.5 1-4 1c-1.7.1-3-1.9-4-3.3-2.2-3.1-3.8-8.7-1.6-12.6 1.1-1.9 3-3.1 5.1-3.1 1.5 0 2.9 1 3.9 1s2.7-1.2 4.5-1c.8.1 3 .3 4.4 2.3-.1.1-2.6 1.6-2.6 4.6.1 3.5 3.1 4.7 3.1 4.7-.1.1-.5 1.5-1.4 3.5z" />
  </svg>
);

const Register = () => {
  const [accountType, setAccountType] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);


  const { handleRegister } = useAuth()

  const dispatch = useDispatch();
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    const {email, phone, fullName, password} = data
    try {
        await handleRegister(email, phone, fullName, password, accountType === "seller")
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
      navigate("/")
    }
  };

  return (
    <div className="min-h-screen w-full bg-[#F5E9DA] px-6 py-10">
      <div className="mx-auto w-full max-w-[420px]">
        {/* Logo */}
        <ZriveLogo />

        {/* Heading */}
        <h1 className="mt-6 text-[38px] font-bold leading-[1.1] tracking-tight text-[#111111]">
          Create Your Account
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-[#5F5F5F]">
          Choose whether you want to shop or sell on ZRIVE.
        </p>

        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mt-8 space-y-6"
        >
          {/* Account type toggle */}
          <div
            role="radiogroup"
            aria-label="Account type"
            className="grid grid-cols-2 gap-2 rounded-full bg-[#0F0F0F]/[0.06] p-1.5"
          >
            <button
              type="button"
              role="radio"
              aria-checked={accountType === "buyer"}
              onClick={() => setAccountType("buyer")}
              className={`flex items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A07F3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5E9DA] ${
                accountType === "buyer"
                  ? "bg-[#0F0F0F] text-white shadow-sm"
                  : "text-[#5F5F5F] hover:text-[#111111]"
              }`}
            >
              <ShoppingBag
                size={17}
                strokeWidth={accountType === "buyer" ? 2.25 : 2}
              />
              Buyer
            </button>
            <button
              type="button"
              role="radio"
              aria-checked={accountType === "seller"}
              onClick={() => setAccountType("seller")}
              className={`flex items-center justify-center gap-2 rounded-full py-3.5 text-[15px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A07F3A] focus-visible:ring-offset-2 focus-visible:ring-offset-[#F5E9DA] ${
                accountType === "seller"
                  ? "bg-[#0F0F0F] text-white shadow-sm"
                  : "text-[#5F5F5F] hover:text-[#111111]"
              }`}
            >
              <Store
                size={17}
                strokeWidth={accountType === "seller" ? 2.25 : 2}
              />
              Seller
            </button>
          </div>

          {/* Full Name */}
          <div>
            <label
              htmlFor="fullName"
              className="mb-2 block text-[15px] font-semibold text-[#111111]"
            >
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              placeholder="Arjun Vardhan"
              aria-invalid={errors.fullName ? "true" : "false"}
              className={`w-full rounded-full border bg-white px-5 py-4 text-[15px] text-[#111111] placeholder:text-[#B9B2A4] shadow-sm outline-none transition-colors focus:border-[#A07F3A] focus:ring-2 focus:ring-[#A07F3A]/20 ${
                errors.fullName ? "border-red-400" : "border-[#E7DDCB]"
              }`}
              {...register("fullName", {
                required: "Please enter your full name",
                minLength: {
                  value: 3,
                  message: "Name must be at least 3 characters",
                },
              })}
            />
            {errors.fullName && (
              <p className="mt-1.5 text-[13px] font-medium text-red-500">
                {errors.fullName.message}
              </p>
            )}
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="mb-2 block text-[15px] font-semibold text-[#111111]"
            >
              Email Address
            </label>
            <input
              id="email"
              type="email"
              placeholder="arjun@example.com"
              aria-invalid={errors.email ? "true" : "false"}
              className={`w-full rounded-full border bg-white px-5 py-4 text-[15px] text-[#111111] placeholder:text-[#B9B2A4] shadow-sm outline-none transition-colors focus:border-[#A07F3A] focus:ring-2 focus:ring-[#A07F3A]/20 ${
                errors.email ? "border-red-400" : "border-[#E7DDCB]"
              }`}
              {...register("email", {
                required: "Please enter your email address",
                pattern: {
                  value: EMAIL_REGEX,
                  message: "Enter a valid email address",
                },
              })}
            />
            {errors.email && (
              <p className="mt-1.5 text-[13px] font-medium text-red-500">
                {errors.email.message}
              </p>
            )}
          </div>

          {/* Phone */}
          <div>
            <label
              htmlFor="phone"
              className="mb-2 block text-[15px] font-semibold text-[#111111]"
            >
              Phone Number
            </label>
            <div
              className={`flex items-center overflow-hidden rounded-full border bg-white shadow-sm transition-colors focus-within:border-[#A07F3A] focus-within:ring-2 focus-within:ring-[#A07F3A]/20 ${
                errors.phone ? "border-red-400" : "border-[#E7DDCB]"
              }`}
            >
              <span className="border-r border-[#E7DDCB] bg-[#0F0F0F]/[0.04] px-4 py-4 text-[15px] font-medium text-[#111111]">
                +91
              </span>
              <input
                id="phone"
                type="tel"
                inputMode="numeric"
                placeholder="98765 43210"
                aria-invalid={errors.phone ? "true" : "false"}
                className="w-full bg-transparent px-4 py-4 text-[15px] text-[#111111] placeholder:text-[#B9B2A4] outline-none"
                {...register("phone", {
                  required: "Please enter your phone number",
                  pattern: {
                    value: PHONE_REGEX,
                    message: "Enter a valid 10-digit mobile number",
                  },
                })}
              />
            </div>
            {errors.phone && (
              <p className="mt-1.5 text-[13px] font-medium text-red-500">
                {errors.phone.message}
              </p>
            )}
          </div>

          {/* Password */}
          <div>
            <label
              htmlFor="password"
              className="mb-2 block text-[15px] font-semibold text-[#111111]"
            >
              Password
            </label>

            <div
              className={`flex items-center overflow-hidden rounded-full border bg-white shadow-sm transition-colors focus-within:border-[#A07F3A] focus-within:ring-2 focus-within:ring-[#A07F3A]/20 ${
                errors.password ? "border-red-400" : "border-[#E7DDCB]"
              }`}
            >
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                aria-invalid={errors.password ? "true" : "false"}
                className="w-full bg-transparent px-5 py-4 text-[15px] text-[#111111] placeholder:text-[#B9B2A4] outline-none"
                {...register("password", {
                  required: "Please enter your password",
                  minLength: {
                    value: 6,
                    message: "Password must be at least 6 characters",
                  },
                })}
              />

              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="px-5 text-[#5F5F5F] hover:text-[#111111]"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>

            {errors.password && (
              <p className="mt-1.5 text-[13px] font-medium text-red-500">
                {errors.password.message}
              </p>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="flex w-full items-center justify-center gap-2 rounded-full bg-[#0F0F0F] py-4 text-[15px] font-semibold text-white transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Submit
          </button>
        </form>

        {/* Divider */}
        <div className="mt-8 flex items-center gap-3">
          <span className="h-px flex-1 bg-[#0F0F0F]/10" />
          <span className="text-[11px] font-semibold tracking-[0.2em] text-[#5F5F5F]">
            OR SOCIAL SECURE JOIN
          </span>
          <span className="h-px flex-1 bg-[#0F0F0F]/10" />
        </div>

        {/* Social buttons */}
        <div className="mt-6 grid grid-cols-2 gap-3">
          <button
            type="button"
            onClick={()=>{
              window.location.href = "api/auth/google"
            }}
            className="flex items-center justify-center gap-2 rounded-full border border-[#E7DDCB] bg-white py-3.5 text-[15px] font-semibold text-[#111111] shadow-sm transition-colors hover:bg-[#0F0F0F]/[0.03]"
          >
            <GoogleIcon />
            Google
          </button>
          <button
            type="button"
            className="flex items-center justify-center gap-2 rounded-full border border-[#E7DDCB] bg-white py-3.5 text-[15px] font-semibold text-[#111111] shadow-sm transition-colors hover:bg-[#0F0F0F]/[0.03]"
          >
            <AppleIcon />
            Apple
          </button>
        </div>

        {/* Footer */}
        <p className="mt-8 text-center text-[13px] leading-relaxed text-[#5F5F5F]">
          Secure processing by ZRIVE Trust System.
          <br />
          <a
            href="/privacy"
            className="underline underline-offset-2 hover:text-[#111111]"
          >
            Privacy Policy
          </a>{" "}
          &{" "}
          <a
            href="/terms"
            className="underline underline-offset-2 hover:text-[#111111]"
          >
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;
