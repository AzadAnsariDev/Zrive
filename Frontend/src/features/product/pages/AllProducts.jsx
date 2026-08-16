import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  ChevronDown,
  SlidersHorizontal,
  X,
  Sparkle,
  Truck,
  RotateCcw,
  ShieldCheck,
  BadgeCheck,
  ArrowRight,
  Flame,
  Tag,
  Star,
  Zap,
  Layers,
  Palette,
  PackageCheck,
  IndianRupee,
} from "lucide-react";
import { useProduct } from "../hook/useProduct";
import { formatPrice } from "../../home/pages/Home";
import { CATEGORIES } from "../../../constant/Categories";
import WishlistButton from "../../wishlist/components/WishlistButton";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

const NEW_BADGE_WINDOW_DAYS = 14;
const SALE_PCTS = [20, 30, 40, 50, 25, 35, 45, 30];

/* ─────────────────────────────────────────────
   HELPERS  (unchanged — backend logic safe)
───────────────────────────────────────────── */
const getProductName = (p) => p?.title || p?.name || "Product";

const getProductImage = (p) => {
  if (p?.images?.length > 0) {
    const img = p.images[0];
    return typeof img === "string" ? img : img?.url || "";
  }
  return (
    p?.variants?.[0]?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop"
  );
};

const getProductKey = (p, i) => p?._id || p?.id || i;

const getProductAgeInDays = (p) => {
  let createdAt = p?.createdAt;
  if (!createdAt && p?._id?.length === 24) {
    createdAt = new Date(parseInt(p._id.substring(0, 8), 16) * 1000);
  }
  if (!createdAt) return Infinity;
  return (Date.now() - new Date(createdAt).getTime()) / 86400000;
};

const getProductPrice = (p) => {
  const v = p?.price;
  if (typeof v === "number") return v;
  if (typeof v === "object" && v !== null) return v.amount ?? v.value ?? 0;
  return Number(v) || 0;
};

const getProductColors = (p) => {
  if (!Array.isArray(p?.variants)) return [];
  return [...new Set(p.variants.map((v) => v.color).filter(Boolean))];
};

const getProductStock = (p) => {
  if (Array.isArray(p?.variants))
    return p.variants.reduce((s, v) => s + (Number(v.stock) || 0), 0);
  return Number(p?.stock) || 0;
};

/* ─────────────────────────────────────────────
   COUNTDOWN HOOK
───────────────────────────────────────────── */
function useCountdown(hours = 5) {
  const end = useMemo(() => Date.now() + hours * 3600000, []);
  const [left, setLeft] = useState(end - Date.now());

  useEffect(() => {
    const id = setInterval(() => {
      setLeft((p) => Math.max(0, p - 1000));
    }, 1000);
    return () => clearInterval(id);
  }, []);

  const hh = String(Math.floor(left / 3600000)).padStart(2, "0");
  const mm = String(Math.floor((left % 3600000) / 60000)).padStart(2, "0");
  const ss = String(Math.floor((left % 60000) / 1000)).padStart(2, "0");
  return { hh, mm, ss };
}

/* ─────────────────────────────────────────────
   UI ATOMS
───────────────────────────────────────────── */
const SkeletonCard = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-[#F0EEEA] mb-3" />
    <div className="h-2.5 bg-[#F0EEEA] w-1/3 mb-2 rounded" />
    <div className="h-3 bg-[#F0EEEA] w-3/4 mb-2 rounded" />
    <div className="h-3.5 bg-[#F0EEEA] w-1/4 rounded" />
  </div>
);

const NewBadge = () => (
  <span className="absolute top-2.5 left-2.5 flex items-center gap-1 bg-gradient-to-r from-[#B8912F] via-[#E9CD7A] to-[#B8912F] text-[#111111] text-[9px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 shadow-sm border border-[#D4AF37]/40">
    <Sparkle size={9} strokeWidth={2} fill="currentColor" />
    New
  </span>
);

const SaleBadge = ({ pct }) => (
  <span className="absolute top-2.5 left-2.5 bg-[#C43D3D] text-white text-[9px] font-bold tracking-[0.12em] uppercase px-2.5 py-1 shadow-sm">
    -{pct}%
  </span>
);

const CountdownBlock = ({ value, label }) => (
  <div className="flex flex-col items-center min-w-[52px]">
    <span className="font-display text-[30px] md:text-[38px] font-bold text-[#111111] leading-none tabular-nums">
      {value}
    </span>
    <span className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#999] mt-1">
      {label}
    </span>
  </div>
);

/* ─────────────────────────────────────────────
   PRODUCT CARD
───────────────────────────────────────────── */
const ProductCard = ({ product, onClick, salePercent = null, className = "" }) => {
  const isNew = getProductAgeInDays(product) <= NEW_BADGE_WINDOW_DAYS;
  const originalPrice = salePercent
    ? Math.round(getProductPrice(product) / (1 - salePercent / 100))
    : null;

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F7F5] mb-3">
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Hover dim */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/6 transition-all duration-300" />

        {/* Badge */}
        {salePercent ? <SaleBadge pct={salePercent} /> : isNew ? <NewBadge /> : null}

        {/* Wishlist */}
        <WishlistButton
          productId={product._id}
          variantSku={product.variants?.[0]?.sku}
          className="absolute top-3 right-3 z-10"
        />

        {/* Quick-view slide-up */}
        <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-300 bg-[#111111] py-2.5 text-center">
          <span className="text-[10px] font-semibold tracking-[0.14em] uppercase text-white">
            Quick View
          </span>
        </div>
      </div>

      <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-[#B08D57] mb-0.5 truncate">
        {product.brand || "ZRIVE"}
      </p>
      <h3 className="font-display text-[13px] md:text-[14px] text-[#111111] mb-1 truncate leading-snug">
        {getProductName(product)}
      </h3>
      <div className="flex items-center gap-2">
        <span className="text-[13px] font-semibold text-[#111111]">
          {formatPrice(product.price)}
        </span>
        {originalPrice && (
          <span className="text-[11px] text-[#999] line-through">
            {formatPrice(originalPrice)}
          </span>
        )}
      </div>
    </div>
  );
};

/* ─────────────────────────────────────────────
   FILTER BLOCK  (re-styled — more eye-catching)
───────────────────────────────────────────── */
const FilterBlock = ({ title, icon: Icon, children }) => (
  <div className="py-5 border-b border-[#EDE7DA] last:border-b-0">
    <h3 className="flex items-center gap-2 text-[10px] font-bold tracking-[0.16em] uppercase text-[#111111] mb-4">
      {Icon && (
        <span className="w-5 h-5 rounded-full bg-[#B08D57]/12 flex items-center justify-center">
          <Icon size={11} strokeWidth={2} className="text-[#B08D57]" />
        </span>
      )}
      {title}
    </h3>
    {children}
  </div>
);

/* ─────────────────────────────────────────────
   FILTER PANEL CONTENT — moved OUTSIDE AllProducts
   so its component identity stays stable across
   re-renders (fixes: input losing focus while
   typing, and sidebar remount causing scroll jump)
───────────────────────────────────────────── */
const FilterPanelContent = ({
  selectedCategories,
  setSelectedCategories,
  selectedColors,
  setSelectedColors,
  inStockOnly,
  setInStockOnly,
  priceMin,
  setPriceMin,
  priceMax,
  setPriceMax,
  availableColors,
  toggleInArray,
  activeFilterCount,
  clearAllFilters,
}) => (
  <>
    <FilterBlock title="Category" icon={Layers}>
      <div className="space-y-1">
        {CATEGORIES.map((cat) => (
          <label
            key={cat.id}
            className="flex items-center gap-2.5 cursor-pointer group/cb px-2 py-1.5 -mx-2 rounded-md hover:bg-[#FAF7F0] transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat.id)}
              onChange={() => toggleInArray(selectedCategories, setSelectedCategories, cat.id)}
              className="w-3.5 h-3.5 rounded accent-[#B08D57] cursor-pointer"
            />
            <span className="text-[13px] text-[#555] group-hover/cb:text-[#111111] transition-colors">
              {cat.label}
            </span>
          </label>
        ))}
      </div>
    </FilterBlock>

    <FilterBlock title="Price Range" icon={IndianRupee}>
      <div className="flex items-center gap-2">
        <div className="relative w-full">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#B08D57] font-semibold">₹</span>
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full border border-[#E5E5E5] bg-white pl-6 pr-2.5 py-2 text-[12.5px] text-[#111111] outline-none focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57]/30 transition-all rounded-sm"
          />
        </div>
        <span className="text-[#B08D57] text-sm shrink-0">—</span>
        <div className="relative w-full">
          <span className="absolute left-2.5 top-1/2 -translate-y-1/2 text-[11px] text-[#B08D57] font-semibold">₹</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full border border-[#E5E5E5] bg-white pl-6 pr-2.5 py-2 text-[12.5px] text-[#111111] outline-none focus:border-[#B08D57] focus:ring-1 focus:ring-[#B08D57]/30 transition-all rounded-sm"
          />
        </div>
      </div>
    </FilterBlock>

    {availableColors.length > 0 && (
      <FilterBlock title="Color" icon={Palette}>
        <div className="space-y-1">
          {availableColors.map((color) => (
            <label
              key={color}
              className="flex items-center gap-2.5 cursor-pointer group/cb px-2 py-1.5 -mx-2 rounded-md hover:bg-[#FAF7F0] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() => toggleInArray(selectedColors, setSelectedColors, color)}
                className="w-3.5 h-3.5 rounded accent-[#B08D57] cursor-pointer"
              />
              <span
                className="w-3 h-3 rounded-full border border-[#E5E5E5] shrink-0"
                style={{ backgroundColor: color?.toLowerCase() }}
              />
              <span className="text-[13px] text-[#555] capitalize group-hover/cb:text-[#111111] transition-colors">
                {color}
              </span>
            </label>
          ))}
        </div>
      </FilterBlock>
    )}

    <FilterBlock title="Availability" icon={PackageCheck}>
      <label className="flex items-center gap-2.5 cursor-pointer group/cb px-2 py-1.5 -mx-2 rounded-md hover:bg-[#FAF7F0] transition-colors">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={() => setInStockOnly((v) => !v)}
          className="w-3.5 h-3.5 rounded accent-[#B08D57] cursor-pointer"
        />
        <span className="text-[13px] text-[#555] group-hover/cb:text-[#111111] transition-colors">
          In Stock Only
        </span>
      </label>
    </FilterBlock>

    {activeFilterCount > 0 && (
      <button
        type="button"
        onClick={clearAllFilters}
        className="mt-5 w-full text-center text-[11px] font-semibold tracking-[0.10em] uppercase text-white bg-[#111111] hover:bg-[#B08D57] py-2.5 transition-colors duration-200"
      >
        Clear All Filters
      </button>
    )}
  </>
);

/* ─────────────────────────────────────────────
   MAIN PAGE
───────────────────────────────────────────── */
const AllProducts = () => {
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();

  /* ── filter state (unchanged logic) ── */
  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => { handleGetProducts(); }, []);

  const products = useSelector((s) => s.product.products);
  const loading = useSelector((s) => s.product.loading.fetch);
  const { hh, mm, ss } = useCountdown(5);

  const availableColors = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) => getProductColors(p).forEach((c) => set.add(c)));
    return [...set];
  }, [products]);

  const toggleInArray = useCallback((arr, setArr, val) => {
    setArr(arr.includes(val) ? arr.filter((v) => v !== val) : [...arr, val]);
  }, []);

  /* ── filteredAndSorted (unchanged logic) ── */
  const filteredAndSorted = useMemo(() => {
    let list = products ? [...products] : [];
    if (selectedCategories.length > 0)
      list = list.filter((p) =>
        selectedCategories.includes(String(p.category || "").toLowerCase().trim())
      );
    if (selectedColors.length > 0)
      list = list.filter((p) =>
        getProductColors(p).some((c) => selectedColors.includes(c))
      );
    if (inStockOnly) list = list.filter((p) => getProductStock(p) > 0);
    if (priceMin !== "") list = list.filter((p) => getProductPrice(p) >= Number(priceMin));
    if (priceMax !== "") list = list.filter((p) => getProductPrice(p) <= Number(priceMax));

    if (sortBy === "newest")     list.sort((a, b) => getProductAgeInDays(a) - getProductAgeInDays(b));
    if (sortBy === "price-asc")  list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    if (sortBy === "price-desc") list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    return list;
  }, [products, selectedCategories, selectedColors, inStockOnly, priceMin, priceMax, sortBy]);

  /* ── also like (unchanged logic) ── */
  const alsoLikeProducts = useMemo(() => {
    const all = products || [];
    const ids = new Set(filteredAndSorted.map((p) => p._id));
    const pool = all.filter((p) => !ids.has(p._id));
    return (pool.length > 0 ? pool : all).slice(0, 8);
  }, [products, filteredAndSorted]);

  /* deals row — cheapest items */
  const dealsProducts = useMemo(() => {
    const all = products ? [...products] : [];
    return all.sort((a, b) => getProductPrice(a) - getProductPrice(b)).slice(0, 8);
  }, [products]);

  const activeSortLabel = SORT_OPTIONS.find((s) => s.id === sortBy)?.label;
  const activeFilterCount =
    selectedCategories.length +
    selectedColors.length +
    (inStockOnly ? 1 : 0) +
    (priceMin || priceMax ? 1 : 0);

  const clearAllFilters = () => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setPriceMin("");
    setPriceMax("");
  };

  const scrollToGrid = () =>
    document.getElementById("zrive-product-grid")?.scrollIntoView({ behavior: "smooth", block: "start" });

  /* props bundle passed to the stable, outer FilterPanelContent */
  const filterPanelProps = {
    selectedCategories,
    setSelectedCategories,
    selectedColors,
    setSelectedColors,
    inStockOnly,
    setInStockOnly,
    priceMin,
    setPriceMin,
    priceMax,
    setPriceMax,
    availableColors,
    toggleInArray,
    activeFilterCount,
    clearAllFilters,
  };

  return (
    <div className="bg-white text-[#111111] min-h-screen">

      {/* ══════════════════════════════════════════
          1 · HERO BANNER
      ══════════════════════════════════════════ */}
      <section className="relative overflow-hidden border-b border-[#E5E5E5]">
        {/* Subtle grid texture */}
        <div
          className="absolute inset-0 pointer-events-none opacity-[0.025]"
          style={{
            backgroundImage:
              "repeating-linear-gradient(0deg,#111 0,#111 1px,transparent 0,transparent 40px),repeating-linear-gradient(90deg,#111 0,#111 1px,transparent 0,transparent 40px)",
          }}
        />
        <div className="relative max-w-[1440px] mx-auto px-5 md:px-14 pt-10 pb-8 md:pt-16 md:pb-10">
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.22em] uppercase text-[#B08D57] mb-2.5 flex items-center gap-2">
            <span className="inline-block w-6 h-px bg-[#B08D57]" />
            The Full Edit
          </p>
          <h1 className="font-display text-[34px] md:text-[56px] font-bold text-[#111111] leading-tight mb-2">
            All Products
          </h1>
          <p className="text-[13px] md:text-[14px] text-[#666]">
            {loading
              ? "Loading the collection…"
              : `${products?.length || 0} pieces, curated across every category`}
          </p>
        </div>

        {/* Category chips */}
        <div className="relative border-t border-[#E5E5E5] bg-[#FAFAFA]">
          <div className="max-w-[1440px] mx-auto px-5 md:px-14 py-3.5 flex gap-2 overflow-x-auto no-scrollbar">
            <button
              type="button"
              onClick={clearAllFilters}
              className={`flex-shrink-0 text-[11px] font-medium px-4 py-2 border transition-all duration-150 ${
                selectedCategories.length === 0
                  ? "bg-[#111111] text-white border-[#111111]"
                  : "bg-white text-[#666] border-[#E5E5E5] hover:border-[#111111] hover:text-[#111111]"
              }`}
            >
              All
            </button>
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => toggleInArray(selectedCategories, setSelectedCategories, cat.id)}
                className={`flex-shrink-0 text-[11px] font-medium px-4 py-2 border transition-all duration-150 ${
                  selectedCategories.includes(cat.id)
                    ? "bg-[#111111] text-white border-[#111111]"
                    : "bg-white text-[#666] border-[#E5E5E5] hover:border-[#111111] hover:text-[#111111]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2 · FLASH SALE BANNER
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-b border-[#E5E5E5]"
        style={{ background: "linear-gradient(135deg,#FFF8ED 0%,#FDF3E3 50%,#FFF8ED 100%)" }}
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-14 py-7 md:py-9">
          <div className="flex flex-col md:flex-row items-center gap-6 md:gap-10">

            {/* Label + heading */}
            <div className="flex items-center gap-4 flex-1 text-center md:text-left flex-col md:flex-row">
              <div className="w-12 h-12 bg-[#B08D57]/12 flex items-center justify-center shrink-0">
                <Flame size={24} className="text-[#B08D57]" />
              </div>
              <div>
                <p className="text-[10px] font-semibold tracking-[0.2em] uppercase text-[#B08D57] mb-0.5">
                  Limited Time Offer
                </p>
                <h2 className="font-display text-[20px] md:text-[26px] font-bold text-[#111111] leading-tight">
                  Flash Sale —{" "}
                  <span className="text-[#C43D3D]">Up to 60% Off</span>
                </h2>
              </div>
            </div>

            {/* Countdown */}
            <div className="flex items-end gap-1.5 shrink-0">
              <CountdownBlock value={hh} label="Hours" />
              <span className="font-display text-[30px] font-bold text-[#B08D57] mb-4 leading-none">
                :
              </span>
              <CountdownBlock value={mm} label="Mins" />
              <span className="font-display text-[30px] font-bold text-[#B08D57] mb-4 leading-none">
                :
              </span>
              <CountdownBlock value={ss} label="Secs" />
            </div>

            {/* CTA */}
            <button
              type="button"
              onClick={scrollToGrid}
              className="shrink-0 flex items-center gap-2 bg-[#111111] text-white text-[11px] font-semibold tracking-[0.12em] uppercase px-6 py-3.5 hover:bg-[#B08D57] transition-colors duration-200"
            >
              Shop Sale Now <ArrowRight size={13} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          3 · MOBILE STICKY CONTROLS
      ══════════════════════════════════════════ */}
      <section className="md:hidden border-b border-[#E5E5E5] sticky top-[57px] z-10 bg-white/95 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-2.5">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#111111]"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-[#666]"
            >
              {activeSortLabel}
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 border border-[#E5E5E5] bg-white shadow-lg overflow-hidden z-20">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                    className={`w-full text-left px-4 py-2.5 text-[12.5px] transition-colors ${
                      sortBy === opt.id ? "text-[#111111] font-semibold bg-[#F7F7F5]" : "text-[#666] hover:bg-[#F7F7F5]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4 · SIDEBAR + PRODUCT GRID
      ══════════════════════════════════════════ */}
      <section id="zrive-product-grid" className="px-5 md:px-14 py-8 md:py-12">
        <div className="max-w-[1440px] mx-auto md:flex md:items-start md:gap-10">

          {/* Sidebar — now sticky on scroll + restyled as a card */}
          <aside
            className={`hidden md:block flex-shrink-0 self-start sticky top-[88px] transition-all duration-200 overflow-hidden ${
              filtersOpen ? "w-[260px]" : "w-0"
            }`}
          >
            <div className="w-[260px] bg-white border border-[#E5E5E5] shadow-[0_2px_10px_rgba(17,17,17,0.05)] max-h-[calc(100vh-108px)] overflow-y-auto no-scrollbar">
              <div className="flex items-center gap-2 px-5 pt-5 pb-4 border-b border-[#EDE7DA]">
                <span className="w-6 h-px bg-[#B08D57]" />
                <span className="text-[10px] font-bold tracking-[0.2em] uppercase text-[#B08D57]">
                  Refine Results
                </span>
              </div>
              <div className="px-5">
                <FilterPanelContent {...filterPanelProps} />
              </div>
            </div>
          </aside>

          {/* Grid area */}
          <div className="flex-1 min-w-0">
            {/* Desktop top bar */}
            <div className="hidden md:flex items-center justify-between mb-7 pb-4 border-b border-[#E5E5E5]">
              <div className="flex items-center gap-4">
                <button
                  type="button"
                  onClick={() => setFiltersOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#666] hover:text-[#111111] transition-colors"
                >
                  <SlidersHorizontal size={13} strokeWidth={1.5} />
                  {filtersOpen ? "Hide Filters" : "Show Filters"}
                  {activeFilterCount > 0 && (
                    <span className="ml-0.5 text-[10px] bg-[#B08D57] text-white px-1.5 py-0.5 font-semibold">
                      {activeFilterCount}
                    </span>
                  )}
                </button>
                <span className="text-[#DDD]">|</span>
                <span className="text-[12px] text-[#999]">
                  {filteredAndSorted.length} results
                </span>
              </div>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-[12px] font-medium text-[#666] hover:text-[#111111] transition-colors"
                >
                  Sort:{" "}
                  <span className="text-[#111111] font-semibold">{activeSortLabel}</span>
                  <ChevronDown
                    size={13}
                    strokeWidth={1.5}
                    className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 border border-[#E5E5E5] bg-white shadow-lg overflow-hidden z-20">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => { setSortBy(opt.id); setSortOpen(false); }}
                        className={`w-full text-left px-4 py-2.5 text-[12.5px] transition-colors ${
                          sortBy === opt.id
                            ? "text-[#111111] font-semibold bg-[#F7F7F5]"
                            : "text-[#666] hover:bg-[#F7F7F5]"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Product grid */}
            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
              </div>
            ) : filteredAndSorted.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
                {filteredAndSorted.map((product, idx) => (
                  <ProductCard
                    key={getProductKey(product, idx)}
                    product={product}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-28 text-center min-h-[420px]">
                <div className="w-16 h-16 bg-[#F7F7F5] flex items-center justify-center mb-5">
                  <SlidersHorizontal size={24} strokeWidth={1.5} className="text-[#999]" />
                </div>
                <p className="font-display text-[20px] text-[#111111] mb-2">
                  No products found
                </p>
                <p className="text-[13px] text-[#666] max-w-xs mb-5">
                  Try adjusting or clearing your filters to see more results.
                </p>
                <button
                  type="button"
                  onClick={clearAllFilters}
                  className="text-[11px] font-semibold tracking-[0.12em] uppercase border-b border-[#B08D57] text-[#B08D57] pb-0.5"
                >
                  Clear All Filters
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          5 · TODAY'S DEALS ROW
      ══════════════════════════════════════════ */}
      {dealsProducts.length > 0 && (
        <section className="px-5 md:px-14 py-12 md:py-16 border-b border-[#E5E5E5]">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#C43D3D] mb-1.5 flex items-center gap-1.5">
                  <Tag size={11} />
                  Limited Offers
                </p>
                <h2 className="font-display text-[22px] md:text-[30px] font-bold text-[#111111]">
                  Today's Deals
                </h2>
              </div>
              <button
                type="button"
                onClick={scrollToGrid}
                className="hidden md:flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#B08D57] hover:text-[#111111] transition-colors border-b border-[#B08D57] pb-0.5"
              >
                View All <ArrowRight size={12} />
              </button>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {dealsProducts.map((product, idx) => (
                <div key={getProductKey(product, idx)} className="flex-shrink-0 w-[155px] md:w-[195px]">
                  <ProductCard
                    product={product}
                    onClick={() => navigate(`/product/${product._id}`)}
                    salePercent={SALE_PCTS[idx % SALE_PCTS.length]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          6 · SECOND MODEL BANNER — NEW SEASON
      ══════════════════════════════════════════ */}
      <section
        className="relative overflow-hidden border-b border-[#E5E5E5]"
        style={{ background: "linear-gradient(130deg,#F7F7F5 0%,#FFFFFF 55%,#F5EFE5 100%)" }}
      >
        <div className="max-w-[1440px] mx-auto px-5 md:px-14 py-14 md:py-20 grid grid-cols-1 md:grid-cols-[1fr_280px] gap-10 items-center">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#B08D57] mb-3 flex items-center gap-1.5">
              <Zap size={11} />
              ZRIVE Exclusive
            </p>
            <h2 className="font-display text-[26px] md:text-[40px] font-bold text-[#111111] leading-tight mb-4">
              New Season.
              <br />
              New Standards.
            </h2>
            <p className="text-[13px] text-[#666] leading-relaxed max-w-lg mb-8">
              Every piece passes a rigorous quality check. We partner only with verified
              sellers who share our vision of accessible luxury for the modern man.
            </p>
            <button
              type="button"
              onClick={() => navigate("/new-arrivals")}
              className="inline-flex items-center gap-2 bg-[#111111] text-white text-[11px] font-semibold tracking-[0.12em] uppercase px-7 py-3.5 hover:bg-[#B08D57] transition-colors duration-200"
            >
              Explore New Arrivals <ArrowRight size={13} />
            </button>
          </div>

          {/* Model image */}
          <div className="hidden md:block relative overflow-hidden h-[380px]">
            <img
              src="https://images.unsplash.com/photo-1516826957135-700dedea698c?q=80&w=600&auto=format&fit=crop&crop=top"
              alt="Men's Fashion — New Season"
              className="w-full h-full object-cover object-top"
              loading="lazy"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#F5EFE5]/40 to-transparent" />
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7 · YOU MAY ALSO LIKE
      ══════════════════════════════════════════ */}
      {alsoLikeProducts.length > 0 && (
        <section className="px-5 md:px-14 py-12 md:py-16 border-b border-[#E5E5E5]">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-7">
              <div>
                <p className="text-[10px] font-semibold tracking-[0.22em] uppercase text-[#B08D57] mb-1.5 flex items-center gap-1.5">
                  <Star size={11} />
                  Keep Exploring
                </p>
                <h2 className="font-display text-[22px] md:text-[30px] font-bold text-[#111111]">
                  You May Also Like
                </h2>
              </div>
            </div>
            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-2">
              {alsoLikeProducts.map((product, idx) => (
                <div key={getProductKey(product, idx)} className="flex-shrink-0 w-[155px] md:w-[190px]">
                  <ProductCard
                    product={product}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          8 · TRUST BADGES
      ══════════════════════════════════════════ */}
      <section className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-14 py-10 grid grid-cols-2 md:grid-cols-4 gap-8">
          {[
            { icon: Truck,       title: "Free Shipping",    desc: "On orders over ₹999" },
            { icon: RotateCcw,   title: "Easy Returns",     desc: "7-day return window" },
            { icon: ShieldCheck, title: "Secure Checkout",  desc: "Encrypted payments" },
            { icon: BadgeCheck,  title: "Verified Sellers", desc: "Every seller vetted" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3.5">
              <div className="w-10 h-10 bg-white border border-[#E5E5E5] flex items-center justify-center flex-shrink-0">
                <Icon size={17} strokeWidth={1.5} className="text-[#B08D57]" />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-[#111111]">{title}</p>
                <p className="text-[11.5px] text-[#999] mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          MOBILE FILTER BOTTOM SHEET
      ══════════════════════════════════════════ */}
      {mobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-2xl max-h-[82vh] flex flex-col shadow-2xl">
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5] flex-shrink-0">
              <span className="font-display text-[16px] font-semibold text-[#111111]">
                Filters
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-[#999] hover:text-[#111111] transition-colors w-8 h-8 flex items-center justify-center"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 flex-1">
              <FilterPanelContent {...filterPanelProps} />
            </div>
            <div className="p-5 border-t border-[#E5E5E5] flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-[#111111] text-white text-[12px] font-semibold tracking-[0.12em] uppercase py-3.5 hover:bg-[#B08D57] transition-colors duration-200"
              >
                Show {filteredAndSorted.length} Results
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;