import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { ArrowLeft, Eye, EyeOff, ArrowRight } from "lucide-react";
import { useDispatch } from "react-redux";
import { setError, setLoading } from "../state/authSlice";
import { useAuth } from "../hook/useAuth";
import { useNavigate, Link } from "react-router";
import ZriveLogo from "../components/ZriveLogo";
import authHero from "../../../assets/images/auth-hero.jpg";
import { notify } from "../../../utils/toast";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^[6-9]\d{9}$/;

const GoogleIcon = () => (
  <svg width="16" height="16" viewBox="0 0 48 48">
    <path fill="#FFC107" d="M43.6 20.5H42V20.4H24v7.2h11.3c-1.6 4.6-6 7.9-11.3 7.9-6.9 0-12.5-5.6-12.5-12.5S17.1 10.5 24 10.5c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.5 5.7 29.5 3.7 24 3.7 12.9 3.7 3.9 12.7 3.9 23.8S12.9 43.9 24 43.9c11.1 0 20.1-9 20.1-20.1 0-1.1-.1-2.2-.3-3.3z" />
    <path fill="#FF3D00" d="M6.3 14.6l5.9 4.3C13.9 15.3 18.6 12.5 24 12.5c3.2 0 6.1 1.2 8.3 3.2l5.1-5.1C34.5 7.7 29.5 5.7 24 5.7c-7.7 0-14.4 4.3-17.7 10.6z" />
    <path fill="#4CAF50" d="M24 43.9c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5c-2.1 1.5-4.7 2.4-7.6 2.4-5.3 0-9.7-3.3-11.3-7.9l-6.2 4.8C9.7 39.6 16.3 43.9 24 43.9z" />
    <path fill="#1976D2" d="M43.6 20.5H42V20.4H24v7.2h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C41.4 35.6 44.1 30.1 44.1 23.8c0-1.1-.2-2.2-.5-3.3z" />
  </svg>
);

const Register = () => {
  const [showPassword, setShowPassword] = useState(false);
  const { handleRegister } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { register, handleSubmit, formState: { errors } } = useForm({ mode: "onBlur" });

  const onSubmit = async (data) => {
    dispatch(setLoading(true));
    try {
      const user = await handleRegister(data.email, data.phone, data.fullName, data.password);
      if (user) {
        notify.success("Account created! Welcome to ZRIVE.");
        navigate("/");
      }
    } catch (err) {
      dispatch(setError(err.message));
      notify.error(err, "Registration failed. Please try again.");
    } finally {
      dispatch(setLoading(false));
    }
  };

  return (
    <div style={{ height: "100dvh" }} className="w-full flex overflow-hidden bg-white">
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        .fu  { animation: fadeUp .45s cubic-bezier(.22,1,.36,1) both; }
        .fu1 { animation: fadeUp .45s .06s cubic-bezier(.22,1,.36,1) both; }
        .fu2 { animation: fadeUp .45s .12s cubic-bezier(.22,1,.36,1) both; }
        .fu3 { animation: fadeUp .45s .18s cubic-bezier(.22,1,.36,1) both; }
        .fu4 { animation: fadeUp .45s .24s cubic-bezier(.22,1,.36,1) both; }
        .fu5 { animation: fadeUp .45s .30s cubic-bezier(.22,1,.36,1) both; }

        .auth-input {
          width: 100%;
          border-radius: 7px;
          border: 1.5px solid #e5e5e5;
          background: #ffffff;
          padding: 8px 13px;
          font-size: 13px;
          color: #111111;
          outline: none;
          transition: border-color .2s, box-shadow .2s;
        }
        .auth-input:focus {
          border-color: #B08D57;
          box-shadow: 0 0 0 3px rgba(176,141,87,.12);
        }
        .auth-input.err { border-color: #e53e3e; }
        .auth-input::placeholder { color: #999; }
        .auth-label {
          display: block;
          font-size: 10px;
          font-weight: 700;
          letter-spacing: .1em;
          text-transform: uppercase;
          color: #666;
          margin-bottom: 4px;
        }
      `}</style>

      {/* ── LEFT: Image panel (desktop only) ── */}
      <div className="relative hidden md:block md:w-[48%] lg:w-[52%] flex-shrink-0">
        <img
          src={authHero}
          alt="ZRIVE — Men's Streetwear"
          className="absolute inset-0 w-full h-full object-cover object-top"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/20 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-black/30" />

        {/* Brand mark */}
        <div className="absolute top-8 left-8 flex items-center gap-2.5 z-10">
          <span className="text-white"><ZriveLogo /></span>
          <span className="text-white font-display text-[15px] font-medium tracking-[0.35em]">ZRIVE</span>
        </div>

        {/* Bottom copy */}
        <div className="absolute bottom-10 left-8 right-8 z-10">
          <p className="text-[10px] font-bold tracking-[0.22em] uppercase text-[#B08D57] mb-2">
            Join the Culture
          </p>
          <h2 className="font-display text-[38px] lg:text-[46px] font-bold text-white leading-[1.05] mb-3">
            Your style,<br />your rules.
          </h2>
          <p className="text-[13px] text-white/55 leading-relaxed max-w-[300px]">
            Be part of an exclusive community of men who dress with intention. Early access. Members-only drops.
          </p>
        </div>
      </div>

      {/* ── RIGHT: Form panel ── */}
      <div className="relative flex-1 flex items-center justify-center bg-white px-6 md:px-10 lg:px-14 overflow-y-auto">
        <button
          type="button"
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-2 text-[12px] font-semibold text-[#666] transition-colors hover:text-[#111] cursor-pointer"
        >
          <ArrowLeft size={16} />
          Back to marketplace
        </button>
        <div className="w-full max-w-[380px] py-4">

          {/* Mobile logo */}
          <div className="flex flex-col items-center mb-4 md:hidden fu">
            <span className="text-[#111]"><ZriveLogo /></span>
            <p className="mt-2 font-display text-[16px] font-medium tracking-[0.35em] text-[#111]">ZRIVE</p>
            <p className="text-[9px] font-bold uppercase tracking-[0.25em] text-[#B08D57] mt-0.5">Men's Fashion</p>
          </div>

          {/* Heading */}
          <div className="fu mb-4">
            <p className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#B08D57] mb-1">Get started</p>
            <h1 className="font-display text-[26px] md:text-[30px] font-bold text-[#111] leading-[1.1]">
              Create your account
            </h1>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} noValidate className="space-y-3">
            {/* Full Name */}
            <div className="fu1">
              <label className="auth-label">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="Arjun Vardhan"
                className={`auth-input ${errors.fullName ? "err" : ""}`}
                {...register("fullName", {
                  required: "Please enter your full name",
                  minLength: { value: 3, message: "Name must be at least 3 characters" },
                })}
              />
              {errors.fullName && <p className="mt-1 text-[11px] text-red-400">{errors.fullName.message}</p>}
            </div>

            {/* Email */}
            <div className="fu2">
              <label className="auth-label">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="arjun@example.com"
                className={`auth-input ${errors.email ? "err" : ""}`}
                {...register("email", {
                  required: "Please enter your email",
                  pattern: { value: EMAIL_REGEX, message: "Enter a valid email address" },
                })}
              />
              {errors.email && <p className="mt-1 text-[11px] text-red-400">{errors.email.message}</p>}
            </div>

            {/* Phone */}
            <div className="fu3">
              <label className="auth-label">Phone Number</label>
              <div className={`flex items-center rounded-[7px] border-[1.5px] bg-white transition-all focus-within:border-[#B08D57] focus-within:shadow-[0_0_0_3px_rgba(176,141,87,.12)] ${errors.phone ? "border-red-500" : "border-[#e5e5e5]"}`}>
                <span className="border-r border-[#e5e5e5] px-3 py-[8px] text-[12px] font-bold text-[#666] shrink-0">+91</span>
                <input
                  id="phone"
                  type="tel"
                  inputMode="numeric"
                  placeholder="98765 43210"
                  className="w-full bg-transparent px-3 py-[8px] text-[13px] text-[#111] placeholder:text-[#999] outline-none"
                  {...register("phone", {
                    required: "Please enter your phone number",
                    pattern: { value: PHONE_REGEX, message: "Enter a valid 10-digit mobile number" },
                  })}
                />
              </div>
              {errors.phone && <p className="mt-1 text-[11px] text-red-400">{errors.phone.message}</p>}
            </div>

            {/* Password */}
            <div className="fu4">
              <label className="auth-label">Password</label>
              <div className={`flex items-center rounded-[7px] border-[1.5px] bg-white transition-all focus-within:border-[#B08D57] focus-within:shadow-[0_0_0_3px_rgba(176,141,87,.12)] ${errors.password ? "border-red-500" : "border-[#e5e5e5]"}`}>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Min 6 characters"
                  className="w-full bg-transparent px-[13px] py-[8px] text-[13px] text-[#111] placeholder:text-[#999] outline-none"
                  {...register("password", {
                    required: "Please enter your password",
                    minLength: { value: 6, message: "Minimum 6 characters" },
                  })}
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="px-3 text-[#999] hover:text-[#111] transition-colors cursor-pointer">
                  {showPassword ? <EyeOff size={15} strokeWidth={1.8} /> : <Eye size={15} strokeWidth={1.8} />}
                </button>
              </div>
              {errors.password && <p className="mt-1 text-[11px] text-red-400">{errors.password.message}</p>}
            </div>

            {/* Submit */}
            <div className="fu4 pt-1">
              <button
                type="submit"
                className="group w-full flex items-center justify-center gap-2 rounded-[7px] bg-[#B08D57] py-[11px] text-[11px] font-bold uppercase tracking-[0.12em] text-black transition-all duration-200 hover:bg-[#c9a468] hover:-translate-y-0.5 hover:shadow-lg hover:shadow-[#B08D57]/25 active:translate-y-0 cursor-pointer"
              >
                Create Account
                <ArrowRight size={14} className="transition-transform duration-200 group-hover:translate-x-1" />
              </button>
            </div>
          </form>

          {/* Divider */}
          <div className="fu4 flex items-center gap-3 my-3">
            <span className="h-px flex-1 bg-[#e5e5e5]" />
            <span className="text-[9px] font-bold tracking-[0.2em] text-[#999]">OR</span>
            <span className="h-px flex-1 bg-[#e5e5e5]" />
          </div>

          {/* Google */}
          <div className="fu5">
            <button
              type="button"
              onClick={() => { window.location.href = "/api/auth/google"; }}
              className="flex w-full items-center justify-center gap-2.5 rounded-[7px] border border-[#e5e5e5] bg-white py-[10px] text-[12px] font-semibold text-[#333] transition-all hover:border-[#B08D57]/50 hover:bg-[#fafafa] hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
            >
              <GoogleIcon />
              Continue with Google
            </button>
          </div>

          {/* Footer */}
          <p className="fu5 mt-4 text-center text-[12px] text-[#777]">
            Already have an account?{" "}
            <Link to="/login" className="font-bold text-[#B08D57] hover:text-[#d4aa6a] transition-colors">
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;