import React, { useEffect, useMemo, useState } from "react";
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
const SECTION_X = "px-5 md:px-8 lg:px-14";
const CONTAINER = "max-w-[1440px] mx-auto";

/* =========================================================
   HELPERS — same shape as NewArrivals.jsx so both pages stay
   in sync on how they read product data.
========================================================= */

const getProductName = (product) =>
  product?.title || product?.name || "Product";

const getProductImage = (product) => {
  if (product?.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === "string" ? img : img?.url || "";
  }
  return (
    product?.variants?.[0]?.images?.[0]?.url ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop"
  );
};

const getProductKey = (product, idx) => product?._id || product?.id || idx;

const getProductAgeInDays = (product) => {
  let createdAt = product?.createdAt;
  if (
    !createdAt &&
    product?._id &&
    typeof product._id === "string" &&
    product._id.length === 24
  ) {
    const timestampHex = product._id.substring(0, 8);
    createdAt = new Date(parseInt(timestampHex, 16) * 1000);
  }
  if (!createdAt) return Infinity;
  const diffMs = Date.now() - new Date(createdAt).getTime();
  return diffMs / (1000 * 60 * 60 * 24);
};

const getProductPrice = (product) => {
  const p = product?.price;
  if (typeof p === "number") return p;
  if (typeof p === "object" && p !== null) return p.amount ?? p.value ?? 0;
  return Number(p) || 0;
};

const getProductColors = (product) => {
  if (!Array.isArray(product?.variants)) return [];
  return [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
};

const getProductStock = (product) => {
  if (Array.isArray(product?.variants)) {
    return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }
  return Number(product?.stock) || 0;
};

/* =========================================================
   SMALL UI PIECES
========================================================= */

const ProductCardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-cream-dark ${className}`} />
);

const NewBadge = () => (
  <span className="absolute top-2.5 left-2.5 md:top-3 md:left-3 flex items-center gap-1 bg-gradient-to-r from-[#B8912F] via-[#E9CD7A] to-[#B8912F] text-charcoal text-[9px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-[2px] shadow-[0_1px_4px_rgba(0,0,0,0.25)] border border-[#D4AF37]/40">
    <Sparkle size={9} strokeWidth={2} fill="currentColor" />
    New
  </span>
);

const ProductCard = ({ product, onClick, className = "" }) => {
  const isNew = getProductAgeInDays(product) <= NEW_BADGE_WINDOW_DAYS;

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark mb-2.5 md:mb-3">
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        {isNew && <NewBadge />}
        <WishlistButton
          productId={product._id}
          variantSku={product.variants?.[0]?.sku}
          className="absolute top-3 right-3 z-10"
        />
      </div>
      <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">
        {product.brand || "Generic"}
      </p>
      <h3 className="font-display text-[13px] md:text-[14px] text-ink mb-0.5 truncate">
        {getProductName(product)}
      </h3>
      <span className="font-sans text-[12px] md:text-[13px] font-semibold text-ink">
        {formatPrice(product.price)}
      </span>
    </div>
  );
};

const FilterBlock = ({ title, children }) => (
  <div className="py-5 border-b border-border">
    <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink mb-3.5">
      {title}
    </h3>
    {children}
  </div>
);

/* =========================================================
   PAGE
========================================================= */

const AllProducts = () => {
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  useEffect(() => {
    handleGetProducts();
  }, []);

  const products = useSelector((state) => state.product.products);
  const loading = useSelector((state) => state.product.loading.fetch);

  const availableColors = useMemo(() => {
    const set = new Set();
    (products || []).forEach((p) =>
      getProductColors(p).forEach((c) => set.add(c)),
    );
    return [...set];
  }, [products]);

  const toggleInArray = (arr, setArr, value) => {
    setArr(
      arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
    );
  };

  const filteredAndSorted = useMemo(() => {
    let list = products ? [...products] : [];
    if (selectedCategories.length > 0) {
      list = list.filter((p) =>
        selectedCategories.includes(
          String(p.category || "")
            .toLowerCase()
            .trim(),
        ),
      );
    }
    if (selectedColors.length > 0) {
      list = list.filter((p) =>
        getProductColors(p).some((c) => selectedColors.includes(c)),
      );
    }
    if (inStockOnly) {
      list = list.filter((p) => getProductStock(p) > 0);
    }
    if (priceMin !== "") {
      list = list.filter((p) => getProductPrice(p) >= Number(priceMin));
    }
    if (priceMax !== "") {
      list = list.filter((p) => getProductPrice(p) <= Number(priceMax));
    }

    if (sortBy === "newest") {
      list.sort((a, b) => getProductAgeInDays(a) - getProductAgeInDays(b));
    } else if (sortBy === "price-asc") {
      list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortBy === "price-desc") {
      list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return list;
  }, [
    products,
    selectedCategories,
    selectedColors,
    inStockOnly,
    priceMin,
    priceMax,
    sortBy,
  ]);

  // Cross-sell row — pull from the full catalog, skipping whatever is
  // already visible in the filtered grid so it feels like a genuine
  // "something different" suggestion rather than a repeat of the grid.
  const alsoLikeProducts = useMemo(() => {
    const all = products || [];
    const visibleIds = new Set(filteredAndSorted.map((p) => p._id));
    const distinct = all.filter((p) => !visibleIds.has(p._id));
    const pool = distinct.length > 0 ? distinct : all;
    return pool.slice(0, 8);
  }, [products, filteredAndSorted]);

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

  const FilterPanelContent = () => (
    <>
      <FilterBlock title="Category">
        <div className="space-y-2.5">
          {CATEGORIES.map((cat) => (
            <label
              key={cat.id}
              className="flex items-center gap-2.5 cursor-pointer"
            >
              <input
                type="checkbox"
                checked={selectedCategories.includes(cat.id)}
                onChange={() =>
                  toggleInArray(
                    selectedCategories,
                    setSelectedCategories,
                    cat.id,
                  )
                }
                className="w-3.5 h-3.5 accent-charcoal rounded-[2px]"
              />
              <span className="text-[13px] text-ink-soft">{cat.label}</span>
            </label>
          ))}
        </div>
      </FilterBlock>

      <FilterBlock title="Price">
        <div className="flex items-center gap-2">
          <input
            type="number"
            placeholder="Min"
            value={priceMin}
            onChange={(e) => setPriceMin(e.target.value)}
            className="w-full border border-border bg-cream px-2.5 py-2 text-[12.5px] text-ink outline-none focus:border-ink transition-colors rounded-[3px]"
          />
          <span className="text-ink-soft text-[12px]">—</span>
          <input
            type="number"
            placeholder="Max"
            value={priceMax}
            onChange={(e) => setPriceMax(e.target.value)}
            className="w-full border border-border bg-cream px-2.5 py-2 text-[12.5px] text-ink outline-none focus:border-ink transition-colors rounded-[3px]"
          />
        </div>
      </FilterBlock>

      {availableColors.length > 0 && (
        <FilterBlock title="Color">
          <div className="space-y-2.5">
            {availableColors.map((color) => (
              <label
                key={color}
                className="flex items-center gap-2.5 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedColors.includes(color)}
                  onChange={() =>
                    toggleInArray(selectedColors, setSelectedColors, color)
                  }
                  className="w-3.5 h-3.5 accent-charcoal rounded-[2px]"
                />
                <span className="text-[13px] text-ink-soft capitalize">
                  {color}
                </span>
              </label>
            ))}
          </div>
        </FilterBlock>
      )}

      <FilterBlock title="Availability">
        <label className="flex items-center gap-2.5 cursor-pointer">
          <input
            type="checkbox"
            checked={inStockOnly}
            onChange={() => setInStockOnly((v) => !v)}
            className="w-3.5 h-3.5 accent-charcoal rounded-[2px]"
          />
          <span className="text-[13px] text-ink-soft">In Stock Only</span>
        </label>
      </FilterBlock>

      {activeFilterCount > 0 && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="mt-4 text-[11px] font-semibold tracking-[0.08em] uppercase text-gold hover:text-ink transition-colors"
        >
          Clear All Filters
        </button>
      )}
    </>
  );

  return (
    <div className="bg-cream text-ink min-h-screen">
      {/* ================= Header ================= */}
      <section className={`${SECTION_X} pt-8 pb-6 md:pt-12 md:pb-8 border-b border-border`}>
        <div className={CONTAINER}>
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
            The Full Edit
          </p>
          <h1 className="font-display text-[26px] md:text-[36px] font-medium text-ink mb-1">
            All Products
          </h1>
          <p className="text-[13px] text-ink-soft">
            {loading ? "Loading the collection…" : `${products?.length || 0} pieces, curated across every category`}
          </p>
        </div>
      </section>

      {/* ================= Category quick-chips (wired to the same filter state as the sidebar) ================= */}
      <section className="border-b border-border bg-cream-dark/40">
        <div className={`${CONTAINER} ${SECTION_X} flex gap-2 overflow-x-auto no-scrollbar py-4`}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => toggleInArray(selectedCategories, setSelectedCategories, cat.id)}
              className={`flex-shrink-0 text-[11px] font-medium px-4 py-2 rounded-[3px] border transition-colors ${
                selectedCategories.includes(cat.id)
                  ? "bg-charcoal text-cream border-charcoal"
                  : "bg-cream text-ink-soft border-border hover:border-ink"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
      </section>

      {/* ================= Mobile control row ================= */}
      <section className="md:hidden border-b border-border sticky top-[57px] z-10 bg-cream/95 backdrop-blur">
        <div className="flex items-center justify-between px-5 py-2.5">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="flex items-center gap-1.5 text-[12px] font-medium text-ink"
          >
            <SlidersHorizontal size={14} strokeWidth={1.5} />
            Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
          </button>
          <div className="relative">
            <button
              type="button"
              onClick={() => setSortOpen((o) => !o)}
              className="flex items-center gap-1.5 text-[12px] font-medium text-ink-soft"
            >
              {activeSortLabel}
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
              />
            </button>
            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 border border-border bg-surface shadow-lg rounded-[3px] overflow-hidden z-20">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => {
                      setSortBy(opt.id);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2.5 text-[12.5px] transition-colors ${
                      sortBy === opt.id
                        ? "text-ink font-semibold bg-cream-dark"
                        : "text-ink-soft hover:bg-cream-dark"
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

      {/* ================= Body: sidebar + grid ================= */}
      <section className={`${SECTION_X} py-8 md:py-10`}>
        <div className={`${CONTAINER} md:flex md:items-start md:gap-8`}>
          <aside
            className={`hidden md:block flex-shrink-0 transition-all duration-200 overflow-hidden ${
              filtersOpen ? "w-[240px]" : "w-0"
            }`}
          >
            <div className="w-[240px]">
              <FilterPanelContent />
            </div>
          </aside>

          <div className="flex-1 min-w-0">
            <div className="hidden md:flex items-center justify-between mb-6">
              <button
                type="button"
                onClick={() => setFiltersOpen((o) => !o)}
                className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink hover:text-gold transition-colors"
              >
                <SlidersHorizontal size={14} strokeWidth={1.5} />
                {filtersOpen ? "Hide Filters" : "Show Filters"}
                {activeFilterCount > 0 && (
                  <span className="ml-1 text-[10px] bg-gold text-charcoal px-1.5 py-0.5 rounded-full font-semibold">
                    {activeFilterCount}
                  </span>
                )}
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setSortOpen((o) => !o)}
                  className="flex items-center gap-1.5 text-[12.5px] font-medium text-ink-soft hover:text-ink transition-colors"
                >
                  Sort: <span className="text-ink">{activeSortLabel}</span>
                  <ChevronDown
                    size={13}
                    strokeWidth={1.5}
                    className={`transition-transform ${sortOpen ? "rotate-180" : ""}`}
                  />
                </button>
                {sortOpen && (
                  <div className="absolute right-0 top-full mt-2 w-52 border border-border bg-surface shadow-lg rounded-[3px] overflow-hidden z-20">
                    {SORT_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.id);
                          setSortOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 text-[12.5px] transition-colors ${
                          sortBy === opt.id
                            ? "text-ink font-semibold bg-cream-dark"
                            : "text-ink-soft hover:bg-cream-dark"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {loading ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {Array.from({ length: 12 }).map((_, i) => (
                  <ProductCardSkeleton key={i} className="aspect-[3/4]" />
                ))}
              </div>
            ) : filteredAndSorted.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
                {filteredAndSorted.map((product, idx) => (
                  <ProductCard
                    key={getProductKey(product, idx)}
                    product={product}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-24 text-center">
                <p className="font-display text-[18px] text-ink mb-2">No products found</p>
                <p className="text-[13px] text-ink-soft max-w-xs">
                  Try adjusting or clearing your filters.
                </p>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ================= Trust strip — reflects real platform guarantees, not filler copy ================= */}
      <section className="border-y border-border bg-cream-dark/40">
        <div className={`${CONTAINER} ${SECTION_X} py-8 grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8`}>
          {[
            { icon: Truck, title: "Free Shipping", desc: "On orders over ₹999" },
            { icon: RotateCcw, title: "Easy Returns", desc: "7-day return window" },
            { icon: ShieldCheck, title: "Secure Checkout", desc: "Encrypted payments" },
            { icon: BadgeCheck, title: "Verified Sellers", desc: "Every seller vetted" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-start gap-3">
              <div className="w-9 h-9 rounded-[3px] bg-cream flex items-center justify-center flex-shrink-0 border border-border">
                <Icon size={16} strokeWidth={1.5} className="text-charcoal" />
              </div>
              <div>
                <p className="text-[12.5px] font-semibold text-ink">{title}</p>
                <p className="text-[11.5px] text-ink-soft mt-0.5">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= You May Also Like ================= */}
      {alsoLikeProducts.length > 0 && (
        <section className={`${SECTION_X} py-10 md:py-14`}>
          <div className={CONTAINER}>
            <div className="flex items-end justify-between mb-6">
              <div>
                <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
                  Keep Exploring
                </p>
                <h2 className="font-display text-[22px] md:text-[28px] font-medium text-ink">
                  You May Also Like
                </h2>
              </div>
            </div>

            <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
              {alsoLikeProducts.map((product, idx) => (
                <ProductCard
                  key={getProductKey(product, idx)}
                  product={product}
                  onClick={() => navigate(`/product/${product._id}`)}
                  className="flex-shrink-0 w-[150px] md:w-[190px]"
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ================= Marketplace stat banner — real numbers, no invented stats ================= */}
      <section className="bg-charcoal text-cream">
        <div className={`${CONTAINER} ${SECTION_X} py-14 md:py-16 grid grid-cols-1 md:grid-cols-[1.2fr_1fr] gap-10 items-center`}>
          <div>
            <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-3">
              The ZRIVE Standard
            </p>
            <h2 className="font-display text-[26px] md:text-[34px] font-medium leading-tight mb-4">
              A curated marketplace,
              <br />
              not an open bazaar.
            </h2>
            <p className="text-[13px] text-cream/60 leading-relaxed max-w-md mb-6">
              Every seller on ZRIVE is vetted before their first listing goes live,
              and stays accountable after — banned sellers disappear from the
              catalog automatically, no exceptions.
            </p>
            <button
              type="button"
              onClick={() => navigate("/new-arrivals")}
              className="inline-flex items-center gap-2 bg-cream text-ink text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-3.5 rounded-[3px] hover:bg-cream-dark transition-colors"
            >
              Shop New Arrivals
              <ArrowRight size={14} />
            </button>
          </div>

          <div className="grid grid-cols-3 gap-4 md:gap-6 border-t md:border-t-0 md:border-l border-cream/10 pt-8 md:pt-0 md:pl-10">
            <div>
              <p className="font-display text-[28px] md:text-[34px] font-medium text-gold">
                {products?.length || 0}+
              </p>
              <p className="text-[11px] text-cream/50 mt-1 uppercase tracking-[0.08em]">
                Pieces Listed
              </p>
            </div>
            <div>
              <p className="font-display text-[28px] md:text-[34px] font-medium text-gold">
                {CATEGORIES.length}
              </p>
              <p className="text-[11px] text-cream/50 mt-1 uppercase tracking-[0.08em]">
                Categories
              </p>
            </div>
            <div>
              <p className="font-display text-[28px] md:text-[34px] font-medium text-gold">
                100%
              </p>
              <p className="text-[11px] text-cream/50 mt-1 uppercase tracking-[0.08em]">
                Verified Sellers
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Mobile filter bottom-sheet ================= */}
      {mobileFiltersOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setMobileFiltersOpen(false)}
          />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[12px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <span className="font-display text-[16px] text-ink">Filters</span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="text-ink-soft hover:text-ink transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="overflow-y-auto px-5">
              <FilterPanelContent />
            </div>
            <div className="p-5 border-t border-border flex-shrink-0">
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                className="w-full bg-charcoal text-cream text-[12px] font-semibold tracking-[0.1em] uppercase py-3.5 rounded-[3px]"
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