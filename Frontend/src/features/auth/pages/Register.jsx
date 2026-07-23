import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ShoppingBag, Store, Eye, EyeOff } from "lucide-react";
import { useDispatch } from "react-redux";
import { setError, setLoading } from "../state/authSlice";
import { useAuth } from "../hook/useAuth";
import { useNavigate, Link } from "react-router";
import ZriveLogo from "../components/ZriveLogo";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.9 0-12.5-5.6-12.5-12.5S17.1 10.5 24 10.5c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.5 5.7 29.5 3.7 24 3.7 12.9 3.7 3.9 12.7 3.9 23.8S12.9 43.9 24 43.9c11.1 0 20.1-9 20.1-20.1 0-1.1-.1-2.2-.3-3.3z" />
    <path fill="#FF3D00" d="M6.3 14.6l5.9 4.3C13.9 15.3 18.6 12.5 24 12.5c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.5 7.7 29.5 5.7 24 5.7c-7.7 0-14.4 4.3-17.7 10.6z" />
    <path fill="#4CAF50" d="M24 43.9c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5c-2.1 1.5-4.7 2.4-7.6 2.4-5.3 0-9.7-3.3-11.3-7.9l-6.2 4.8C9.7 39.6 16.3 43.9 24 43.9z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 35.6 44.1 30.1 44.1 23.8c0-1.1-.2-2.2-.5-3.3z" />
  </svg>
);

const AppleIcon = () => (
  <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
    <path d="M16.5 1c.1 1.2-.4 2.4-1.1 3.3-.7.9-1.9 1.6-3 1.5-.1-1.2.4-2.4 1.1-3.2C14.2 1.6 15.4 1 16.5 1zM20.7 17.3c-.5 1.2-.8 1.7-1.5 2.7-1 1.4-2.3 3.2-4 3.2-1.5 0-1.9-1-3.9-1s-2.5 1-4 1c-1.7.1-3-1.9-4-3.3-2.2-3.1-3.8-8.7-1.6-12.6 1.1-1.9 3-3.1 5.1-3.1 1.5 0 2.9 1 3.9 1s2.7-1.2 4.5-1c.8.1 3 .3 4.4 2.3-.1.1-2.6 1.6-2.6 4.6.1 3.5 3.1 4.7 3.1 4.7-.1.1-.5 1.5-1.4 3.5z" />
  </svg>
);

const Register = () => {
  const [accountType, setAccountType] = useState("buyer");
  const [showPassword, setShowPassword] = useState(false);

  const { handleRegister } = useAuth();

  const dispatch = useDispatch();
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    const { email, phone, fullName, password } = data;
    try {
      const user = await handleRegister(email, phone, fullName, password, accountType === "seller");
      user.role == "seller" ? navigate("/seller") : navigate("/")
    } catch (err) {
      dispatch(setError(err.message));
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div className="min-h-screen w-full bg-cream px-6 py-12 md:py-20">
      <div className="mx-auto w-full max-w-[420px]">
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
              Men&apos;s Fashion
            </p>
          </div>
        </div>

        {/* Heading */}
        <h1 className="text-center font-display text-[32px] font-medium leading-[1.1] tracking-tight text-ink mb-2">
          Create Account
        </h1>
        <p className="text-center text-[13px] leading-relaxed text-ink-soft mb-8">
          Join the exclusive marketplace for modern men's fashion.
        </p>

        <div className="rounded-[3px] border border-border bg-surface p-6 shadow-sm">
          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-5">
            {/* Account type toggle */}
            <div
              role="radiogroup"
              aria-label="Account type"
              className="grid grid-cols-2 gap-1 rounded-[3px] bg-cream-dark p-1 border border-border"
            >
              <button
                type="button"
                role="radio"
                aria-checked={accountType === "buyer"}
                onClick={() => setAccountType("buyer")}
                className={`flex items-center justify-center gap-2 rounded-[3px] py-3 text-[12px] font-semibold tracking-[0.05em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal ${
                  accountType === "buyer"
                    ? "bg-charcoal text-cream shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <ShoppingBag size={16} strokeWidth={accountType === "buyer" ? 2.25 : 1.5} />
                Buyer
              </button>
              <button
                type="button"
                role="radio"
                aria-checked={accountType === "seller"}
                onClick={() => setAccountType("seller")}
                className={`flex items-center justify-center gap-2 rounded-[3px] py-3 text-[12px] font-semibold tracking-[0.05em] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal ${
                  accountType === "seller"
                    ? "bg-charcoal text-cream shadow-sm"
                    : "text-ink-soft hover:text-ink"
                }`}
              >
                <Store size={16} strokeWidth={accountType === "seller" ? 2.25 : 1.5} />
                Seller
              </button>
            </div>

            {/* Full Name */}
            <div>
              <label htmlFor="fullName" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                Full Name
              </label>
              <input
                id="fullName"
                type="text"
                placeholder="Arjun Vardhan"
                aria-invalid={errors.fullName ? "true" : "false"}
                className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink ${
                  errors.fullName ? "border-error" : "border-border"
                }`}
                {...register("fullName", {
                  required: "Please enter your full name",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                })}
              />
              {errors.fullName && (
                <p className="mt-1.5 text-[12px] text-error">{errors.fullName.message}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                placeholder="arjun@example.com"
                aria-invalid={errors.email ? "true" : "false"}
                className={`w-full rounded-[3px] border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none transition-colors focus:border-ink ${
                  errors.email ? "border-error" : "border-border"
                }`}
                {...register("email", {
                  required: "Please enter your email address",
                  pattern: { value: EMAIL_REGEX, message: "Enter a valid email address" },
                })}
              />
              {errors.email && (
                <p className="mt-1.5 text-[12px] text-error">{errors.email.message}</p>
              )}
            </div>

            {/* Phone */}
            <div>
              <label htmlFor="phone" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                Phone Number
              </label>
              <div
                className={`flex items-center overflow-hidden rounded-[3px] border bg-cream-dark transition-colors focus-within:border-ink ${
                  errors.phone ? "border-error" : "border-border"
                }`}
              >
                <span className="border-r border-border bg-cream px-4 py-3.5 text-[13px] font-semibold text-ink-soft">
                  +91
                </span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  aria-invalid={errors.phone ? "true" : "false"}
                  className="w-full bg-transparent px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none"
                  {...register("phone", {
                    required: "Please enter your phone number",
                    pattern: { value: PHONE_REGEX, message: "Enter a valid 10-digit mobile number" },
                  })}
                />
              </div>
              {errors.phone && (
                <p className="mt-1.5 text-[12px] text-error">{errors.phone.message}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label htmlFor="password" className="mb-2 block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft">
                Password
              </label>
              <div
                className={`flex items-center overflow-hidden rounded-[3px] border bg-cream-dark transition-colors focus-within:border-ink ${
                  errors.password ? "border-error" : "border-border"
                }`}
              >
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  aria-invalid={errors.password ? "true" : "false"}
                  className="w-full bg-transparent px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none"
                  {...register("password", {
                    required: "Please enter your password",
                    minLength: { value: 6, message: "Password must be at least 6 characters" },
                  })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="px-4 text-ink-soft hover:text-ink transition-colors"
                >
                  {showPassword ? <EyeOff size={18} strokeWidth={1.5} /> : <Eye size={18} strokeWidth={1.5} />}
                </button>
              </div>
              {errors.password && (
                <p className="mt-1.5 text-[12px] text-error">{errors.password.message}</p>
              )}
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="flex w-full items-center justify-center gap-2 rounded-[3px] bg-charcoal py-4 mt-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink disabled:cursor-not-allowed disabled:opacity-60"
            >
              Submit
            </button>
          </form>

          {/* Divider */}
          <div className="mt-8 mb-6 flex items-center gap-3">
            <span className="h-px flex-1 bg-border" />
            <span className="text-[10px] font-semibold tracking-[0.2em] text-ink-soft">OR</span>
            <span className="h-px flex-1 bg-border" />
          </div>

          {/* Social buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => {
                window.location.href = "/api/auth/google";
              }}
              className="flex items-center justify-center gap-2 rounded-[3px] border border-border bg-cream py-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-cream-dark"
            >
              <GoogleIcon />
              Google
            </button>
            <button
              type="button"
              className="flex items-center justify-center gap-2 rounded-[3px] border border-border bg-cream py-3.5 text-[13px] font-semibold text-ink transition-colors hover:bg-cream-dark"
            >
              <span className="text-ink"><AppleIcon /></span>
              Apple
            </button>
          </div>
        </div>

        {/* Already have an account -> Login */}
        <p className="mt-8 text-center text-[13px] text-ink-soft">
          Already have an account?{" "}
          <Link to="/login" className="font-semibold text-ink hover:text-gold transition-colors">
            Login
          </Link>
        </p>

        {/* Footer */}
        <p className="mt-6 text-center text-[11px] leading-relaxed text-ink-soft">
          Secure processing by ZRIVE Trust System.
          <br />
          <a href="/privacy" className="underline underline-offset-2 hover:text-ink">
            Privacy Policy
          </a>{" "}
          &{" "}
          <a href="/terms" className="underline underline-offset-2 hover:text-ink">
            Terms of Service
          </a>
        </p>
      </div>
    </div>
  );
};

export default Register;