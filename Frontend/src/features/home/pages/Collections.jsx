import React, { useEffect, useRef, useState, useCallback } from "react";
import { useNavigate } from "react-router";
import { ArrowUpRight } from "lucide-react";

// ---- Layout tokens (same as Home.jsx — keep every page consistent) --------
const SECTION_X = "px-5 md:px-8 lg:px-14";
const CONTAINER = "max-w-[1440px] mx-auto";

// ── Collection data ──────────────────────────────────────────────
// `size` drives the bento-grid span. `accent` marks the sale tile.
const COLLECTIONS = [
  {
    id: "essentials",
    name: "Everyday Essentials",
    tag: "Core",
    desc: "Building blocks — the pieces you reach for without thinking.",
    span: "md:col-span-2 md:row-span-2",
  },
  {
    id: "smart-casual",
    name: "Smart Casual",
    tag: "Versatile",
    desc: "Off-duty tailoring for when the day has no fixed dress code.",
    span: "md:col-span-1 md:row-span-2",
  },
  {
    id: "formal-edit",
    name: "Formal Edit",
    tag: "Tailored",
    desc: "Suiting and shirting, and the details that hold a room.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: "street-style",
    name: "Street Style",
    tag: "Bold",
    desc: "Volume, layering, and pieces that move first.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: "weekend",
    name: "Weekend",
    tag: "Relaxed",
    desc: "Unstructured fits for slower mornings.",
    span: "md:col-span-1 md:row-span-1",
  },
  {
    id: "trending",
    name: "Trending Now",
    tag: "Live",
    desc: "What the city is actually buying this week.",
    span: "md:col-span-2 md:row-span-1",
  },
  {
    id: "sale",
    name: "The Sale Edit",
    tag: "Up to 40% off",
    desc: "A tighter edit, better prices — while it lasts.",
    span: "md:col-span-1 md:row-span-1",
    accent: true,
  },
];

// ── Scroll-reveal card ────────────────────────────────────────────
const CollectionCard = ({ item, index, onClick }) => {
  const ref = useRef(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold: 0.2 },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const initial = item.name.charAt(0);

  return (
    <button
      ref={ref}
      type="button"
      onClick={onClick}
      style={{ transitionDelay: inView ? `${(index % 4) * 80}ms` : "0ms" }}
      className={`edit-reveal ${inView ? "edit-in-view" : ""} ${item.span} group relative overflow-hidden rounded-[3px] text-left min-h-[220px] ${
        item.accent
          ? "bg-charcoal border border-gold/40"
          : "bg-charcoal border border-charcoal"
      }`}
    >
      {/* Giant translucent type-driven "image" — no stock photography needed */}
      <span
        aria-hidden="true"
        className={`pointer-events-none absolute -right-4 -bottom-10 font-display select-none leading-none transition-transform duration-700 ease-out group-hover:scale-[1.08] ${
          item.accent ? "text-gold/15" : "text-cream/[0.07]"
        }`}
        style={{ fontSize: "clamp(120px, 22vw, 260px)" }}
      >
        {initial}
      </span>

      {/* Bottom gradient for text legibility */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-t from-charcoal via-charcoal/40 to-transparent"
      />

      {/* Crop-mark corner brackets — signature hover motif (photoshoot framing) */}
      {["top-3 left-3", "top-3 right-3", "bottom-3 left-3", "bottom-3 right-3"].map(
        (pos, i) => (
          <span
            key={pos}
            aria-hidden="true"
            className={`crop-mark crop-mark-${i} absolute ${pos} w-4 h-4 opacity-0 group-hover:opacity-100 transition-all duration-500 ease-out`}
            style={{
              borderColor: item.accent ? "var(--color-gold)" : "var(--color-cream)",
              borderTopWidth: pos.includes("top") ? "1.5px" : 0,
              borderBottomWidth: pos.includes("bottom") ? "1.5px" : 0,
              borderLeftWidth: pos.includes("left") ? "1.5px" : 0,
              borderRightWidth: pos.includes("right") ? "1.5px" : 0,
              borderStyle: "solid",
            }}
          />
        ),
      )}

      {/* Content */}
      <span className="relative z-10 flex h-full flex-col justify-between p-5 md:p-6">
        <span
          className={`text-[10px] font-semibold tracking-[0.16em] uppercase ${
            item.accent ? "text-gold" : "text-cream/60"
          }`}
        >
          {item.tag}
        </span>

        <span>
          <span className="font-display block text-[19px] md:text-[24px] font-medium text-cream mb-1.5 leading-tight">
            {item.name}
          </span>
          <span className="block text-[12px] text-cream/65 max-w-[32ch] mb-3">
            {item.desc}
          </span>
          <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream translate-y-1.5 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-400 ease-out">
            Explore
            <ArrowUpRight
              size={14}
              strokeWidth={2}
              className="transition-transform duration-400 ease-out group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
            />
          </span>
        </span>
      </span>
    </button>
  );
};

const Collections = () => {
  const navigate = useNavigate();

  const goToCollection = useCallback(
    (id) => navigate(`/collections/${id}`),
    [navigate],
  );

  return (
    <div className="bg-cream text-ink min-h-screen">
      <style>{`
        @keyframes edit-rise {
          from { transform: translateY(105%); opacity: 0; }
          to   { transform: translateY(0);    opacity: 1; }
        }
        @keyframes edit-line-draw {
          from { transform: scaleX(0); }
          to   { transform: scaleX(1); }
        }
        @keyframes edit-fade-up {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes edit-marquee {
          from { transform: translateX(0); }
          to   { transform: translateX(-50%); }
        }

        .edit-hero-clip { overflow: hidden; display: inline-block; }
        .edit-hero-word {
          display: inline-block;
          animation: edit-rise 0.85s cubic-bezier(0.16,1,0.3,1) both;
        }
        .edit-hero-sub {
          animation: edit-fade-up 0.7s cubic-bezier(0.16,1,0.3,1) 0.65s both;
        }
        .edit-hero-line {
          transform-origin: left center;
          animation: edit-line-draw 0.9s cubic-bezier(0.16,1,0.3,1) 0.55s both;
        }

        .edit-reveal {
          opacity: 0;
          transform: translateY(26px) scale(0.98);
          transition: opacity 0.7s cubic-bezier(0.16,1,0.3,1), transform 0.7s cubic-bezier(0.16,1,0.3,1);
        }
        .edit-in-view { opacity: 1; transform: translateY(0) scale(1); }

        .crop-mark-0 { transform: translate(4px, 4px); }
        .crop-mark-1 { transform: translate(-4px, 4px); }
        .crop-mark-2 { transform: translate(4px, -4px); }
        .group:hover .crop-mark-0,
        .group:hover .crop-mark-1,
        .group:hover .crop-mark-2,
        .group:hover .crop-mark-3 { transform: translate(0, 0); }
        .crop-mark-3 { transform: translate(-4px, -4px); }

        .edit-marquee-track {
          display: flex;
          width: max-content;
          animation: edit-marquee 22s linear infinite;
        }

        @media (prefers-reduced-motion: reduce) {
          .edit-hero-word, .edit-hero-sub, .edit-hero-line,
          .edit-reveal, .edit-marquee-track {
            animation: none !important;
            transition: none !important;
            opacity: 1 !important;
            transform: none !important;
          }
        }
      `}</style>

      {/* ================= Hero ================= */}
      <section className="bg-charcoal text-cream">
        <div className={`${SECTION_X}`}>
          <div className={`${CONTAINER} py-16 md:py-24`}>
            <span className="edit-hero-sub block text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-4">
              Menswear, Curated
            </span>

            <h1 className="font-display font-medium text-[52px] md:text-[96px] leading-[0.95] mb-6">
              <span className="edit-hero-clip">
                <span className="edit-hero-word" style={{ animationDelay: "0ms" }}>
                  The
                </span>
              </span>{" "}
              <span className="edit-hero-clip">
                <span className="edit-hero-word" style={{ animationDelay: "140ms" }}>
                  Edit
                </span>
              </span>
            </h1>

            <span className="edit-hero-line block h-px w-24 bg-gold mb-6" />

            <p className="edit-hero-sub text-[14px] md:text-[16px] text-cream/65 max-w-[46ch]">
              Curated styles for the modern man — not everything we sell, only
              what's worth wearing this season.
            </p>
          </div>
        </div>

        {/* Ambient marquee strip */}
        <div className="border-t border-cream/10 overflow-hidden py-3">
          <div className="edit-marquee-track">
            {[...Array(2)].map((_, dup) => (
              <span key={dup} className="flex items-center shrink-0">
                {["Tailored", "Curated", "Worn Well", "Season After Season"].map(
                  (w) => (
                    <span
                      key={w}
                      className="text-[11px] font-semibold tracking-[0.16em] uppercase text-cream/35 px-6 whitespace-nowrap"
                    >
                      {w} <span className="text-gold/50 ml-6">•</span>
                    </span>
                  ),
                )}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Bento grid ================= */}
      <section className={`${SECTION_X} py-10 md:py-16`}>
        <div className={CONTAINER}>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-4 auto-rows-[220px] md:auto-rows-[200px]">
            {COLLECTIONS.map((item, i) => (
              <CollectionCard
                key={item.id}
                item={item}
                index={i}
                onClick={() => goToCollection(item.id)}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
};

export default Collections;