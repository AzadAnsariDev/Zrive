import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Heart,
  ChevronDown,
  SlidersHorizontal,
  X,
  Sparkle,
} from "lucide-react";
import { useProduct } from "../../product/hook/useProduct";
import { formatPrice } from "./Home";
import { CATEGORIES } from "../../../constant/Categories";
import WishlistButton from "../../wishlist/components/WishlistButton";

// TODO(refactor): pull from shared constants/categories.js once created

const FILTER_CATEGORIES = CATEGORIES

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

const NEW_BADGE_WINDOW_DAYS = 14;
const SECTION_X = "px-5 md:px-8 lg:px-14";
const CONTAINER = "max-w-[1440px] mx-auto";

const ProductCardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-cream-dark ${className}`} />
);

const getProductName = (product) =>
  product?.title || product?.name || "Product";

const getProductImage = (product) => {
  if (product?.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === "string" ? img : img?.url || "";
  }
  return (
    product?.image ||
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

// Pulls unique variant colors off a product, if the schema has them.
const getProductColors = (product) => {
  if (!Array.isArray(product?.variants)) return [];
  return [...new Set(product.variants.map((v) => v.color).filter(Boolean))];
};

// Total stock across all variants — used for the "In Stock" filter.
const getProductStock = (product) => {
  if (Array.isArray(product?.variants)) {
    return product.variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0);
  }
  return Number(product?.stock) || 0;
};

// ---- Premium gold "NEW" badge ---------------------------------------------
const NewBadge = () => (
  <span className="absolute top-2.5 left-2.5 md:top-3 md:left-3 flex items-center gap-1 bg-gradient-to-r from-[#B8912F] via-[#E9CD7A] to-[#B8912F] text-charcoal text-[9px] font-bold tracking-[0.14em] uppercase px-2.5 py-1 rounded-[2px] shadow-[0_1px_4px_rgba(0,0,0,0.25)] border border-[#D4AF37]/40">
    <Sparkle size={9} strokeWidth={2} fill="currentColor" />
    New
  </span>
);

// ---- Product card -----------------------------------------------------
const ProductCard = ({ product, onClick }) => {
  const isNew = getProductAgeInDays(product) <= NEW_BADGE_WINDOW_DAYS;

  return (
    <div className="group cursor-pointer" onClick={onClick}>
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

// ---- Sidebar filter block helper ---------------------------------------
const FilterBlock = ({ title, children }) => (
  <div className="py-5 border-b border-border">
    <h3 className="text-[11px] font-semibold tracking-[0.12em] uppercase text-ink mb-3.5">
      {title}
    </h3>
    {children}
  </div>
);

const NewArrivals = () => {
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");

  const [sortBy, setSortBy] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);
  const [filtersOpen, setFiltersOpen] = useState(true); // desktop sidebar toggle
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false); // mobile sheet

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

  // ---- shared filter body, rendered in both the desktop sidebar and the
  // mobile bottom-sheet so filter logic never has to be written twice ----
  const FilterPanelContent = () => (
    <>
      <FilterBlock title="Category">
        <div className="space-y-2.5">
          {FILTER_CATEGORIES.map((cat) => (
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
      <section
        className={`${SECTION_X} pt-8 pb-6 md:pt-12 md:pb-8 border-b border-border`}
      >
        <div className={CONTAINER}>
          <p className="text-[10px] md:text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
            Just Landed
          </p>
          <h1 className="font-display text-[26px] md:text-[36px] font-medium text-ink">
            New Arrivals
          </h1>
        </div>
      </section>

      {/* ================= Mobile control row (separate rows so nothing overlaps) ================= */}
      <section className="md:hidden border-b border-border sticky top-[57px] z-10 bg-cream/95 backdrop-blur">
        {/* Row 1: category chips, horizontal scroll, full width to itself */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar px-5 py-3">
          {FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() =>
                toggleInArray(selectedCategories, setSelectedCategories, cat.id)
              }
              className={`flex-shrink-0 text-[11px] font-medium px-3.5 py-1.5 rounded-[3px] border transition-colors ${
                selectedCategories.includes(cat.id)
                  ? "bg-charcoal text-cream border-charcoal"
                  : "bg-transparent text-ink-soft border-border"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>
        {/* Row 2: filter + sort, own row, no squeezing against chips */}
        <div className="flex items-center justify-between px-5 py-2.5 border-t border-border">
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
          {/* ---- Desktop sidebar (collapsible) ---- */}
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
            {/* ---- Desktop top bar: filter toggle (left) + sort (right) ---- */}
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

            {/* ---- Grid ---- */}
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
                <p className="font-display text-[18px] text-ink mb-2">
                  No new arrivals yet
                </p>
                <p className="text-[13px] text-ink-soft max-w-xs">
                  Check back soon — fresh drops are added regularly.
                </p>
              </div>
            )}
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

export default NewArrivals;
