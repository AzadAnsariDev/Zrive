import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { ArrowLeft, Home } from "lucide-react";

const NotFound = () => {
  const navigate = useNavigate();
  const [count, setCount] = useState(8);

  useEffect(() => {
    if (count <= 0) { navigate("/"); return; }
    const t = setTimeout(() => setCount((c) => c - 1), 1000);
    return () => clearTimeout(t);
  }, [count, navigate]);

  return (
    <div
      style={{ height: "100dvh" }}
      className="w-full flex flex-col items-center justify-center overflow-hidden bg-[#0a0a0a] relative select-none"
    >
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:wght@700;900&family=Inter:wght@400;500;600;700&display=swap');
        .nf-display { font-family: 'Playfair Display', serif; }
        .nf-sans    { font-family: 'Inter', sans-serif; }

        @keyframes nfFloat {
          0%, 100% { transform: translateY(0px); }
          50%       { transform: translateY(-14px); }
        }
        @keyframes nfFadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes nfCountdown {
          from { stroke-dashoffset: 0; }
          to   { stroke-dashoffset: 113; }
        }

        .nf-float { animation: nfFloat 4s ease-in-out infinite; }
        .nf-fu    { animation: nfFadeUp .55s cubic-bezier(.22,1,.36,1) both; }
        .nf-fu1   { animation: nfFadeUp .55s .10s cubic-bezier(.22,1,.36,1) both; }
        .nf-fu2   { animation: nfFadeUp .55s .20s cubic-bezier(.22,1,.36,1) both; }
        .nf-fu3   { animation: nfFadeUp .55s .30s cubic-bezier(.22,1,.36,1) both; }
        .nf-fu4   { animation: nfFadeUp .55s .40s cubic-bezier(.22,1,.36,1) both; }

        .nf-btn {
          display: inline-flex; align-items: center; gap: 8px;
          border-radius: 8px; font-size: 11px; font-weight: 700;
          letter-spacing: .12em; text-transform: uppercase;
          padding: 11px 22px; transition: all .2s ease; cursor: pointer;
          font-family: 'Inter', sans-serif;
        }
        .nf-btn-primary { background: #B08D57; color: #000; border: none; }
        .nf-btn-primary:hover { background: #c9a468; transform: translateY(-2px); box-shadow: 0 12px 32px rgba(176,141,87,.3); }
        .nf-btn-ghost { background: transparent; color: #888; border: 1.5px solid #2a2a2a; }
        .nf-btn-ghost:hover { border-color: #444; color: #ccc; transform: translateY(-2px); }

        .nf-ring { animation: nfCountdown 8s linear forwards; }
      `}</style>

      {/* Background radial glow */}
      <div style={{
        position: "absolute", borderRadius: "50%", pointerEvents: "none",
        width: 600, height: 600, top: -150, left: "50%", transform: "translateX(-50%)",
        background: "radial-gradient(circle, rgba(176,141,87,0.1) 0%, transparent 70%)",
        filter: "blur(60px)"
      }} />
      <div style={{
        position: "absolute", borderRadius: "50%", pointerEvents: "none",
        width: 300, height: 300, bottom: 0, right: "8%",
        background: "radial-gradient(circle, rgba(176,141,87,0.05) 0%, transparent 70%)",
        filter: "blur(50px)"
      }} />

      {/* Grid lines */}
      <div className="absolute inset-0 pointer-events-none" style={{
        backgroundImage: "linear-gradient(rgba(176,141,87,0.035) 1px, transparent 1px), linear-gradient(90deg, rgba(176,141,87,0.035) 1px, transparent 1px)",
        backgroundSize: "60px 60px"
      }} />

      {/* Top brand */}
      <div className="absolute top-8 left-8 z-10 nf-fu">
        <button onClick={() => navigate("/")} className="nf-display text-white font-black cursor-pointer" style={{ fontSize: 20, letterSpacing: "0.35em" }}>
          ZRIVE
        </button>
      </div>

      {/* Main */}
      <div className="relative z-10 flex flex-col items-center text-center px-6">

        {/* 404 */}
        <div className="nf-float nf-fu relative mb-1">
          {/* Outline layer */}
          <p className="nf-display font-black leading-none" style={{
            fontSize: "clamp(110px, 20vw, 190px)",
            color: "transparent",
            WebkitTextStroke: "1.5px rgba(176,141,87,0.3)",
            letterSpacing: "-0.02em",
          }}>
            404
          </p>
          {/* Gold shimmer overlay */}
          <p className="nf-display font-black leading-none absolute inset-0" style={{
            fontSize: "clamp(110px, 20vw, 190px)",
            background: "linear-gradient(135deg, #B08D57 0%, #e8c97a 40%, #B08D57 65%, #8a6a3a 100%)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            opacity: 0.22,
            letterSpacing: "-0.02em",
          }}>
            404
          </p>
        </div>

        {/* Divider with label */}
        <div className="nf-fu1 flex items-center gap-4 mb-5">
          <span style={{ width: 48, height: 1, background: "linear-gradient(to right, transparent, #B08D57)" }} />
          <span className="nf-sans font-bold uppercase text-[#B08D57]" style={{ fontSize: 9, letterSpacing: "0.35em" }}>Page Not Found</span>
          <span style={{ width: 48, height: 1, background: "linear-gradient(to left, transparent, #B08D57)" }} />
        </div>

        {/* Heading */}
        <h1 className="nf-fu2 nf-display text-white font-bold mb-3" style={{ fontSize: "clamp(22px, 3.5vw, 34px)", lineHeight: 1.1 }}>
          This page doesn't exist.
        </h1>

        {/* Subtext */}
        <p className="nf-fu3 nf-sans text-[#555] leading-relaxed mb-8" style={{ fontSize: 13, maxWidth: 340 }}>
          The URL you entered isn't part of the Zrive universe.{" "}
          Redirecting to marketplace in{" "}
          <span style={{ color: "#B08D57", fontWeight: 700 }}>{count}s</span>
        </p>

        {/* Buttons + countdown ring */}
        <div className="nf-fu4 flex flex-col items-center gap-4">
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <button className="nf-btn nf-btn-primary" onClick={() => navigate("/")}>
              <Home size={14} />
              Go to Homepage
            </button>
            <button className="nf-btn nf-btn-ghost" onClick={() => navigate(-1)}>
              <ArrowLeft size={14} />
              Go Back
            </button>
          </div>

          {/* Countdown ring */}
          <div className="relative flex items-center justify-center" style={{ width: 44, height: 44 }}>
            <svg width="44" height="44" style={{ transform: "rotate(-90deg)" }}>
              <circle cx="22" cy="22" r="18" fill="none" stroke="#1a1a1a" strokeWidth="2" />
              <circle cx="22" cy="22" r="18" fill="none" stroke="#B08D57" strokeWidth="2"
                strokeDasharray="113" strokeDashoffset="0" strokeLinecap="round"
                className="nf-ring"
              />
            </svg>
            <span className="nf-sans absolute text-white font-bold" style={{ fontSize: 11 }}>{count}</span>
          </div>
        </div>
      </div>

      {/* Footer label */}
      <div className="absolute bottom-6 nf-fu4">
        <p className="nf-sans text-[#2a2a2a] uppercase" style={{ fontSize: 10, letterSpacing: "0.2em" }}>
          Zrive — Premium Streetwear
        </p>
      </div>
    </div>
  );
};

export default NotFound;
