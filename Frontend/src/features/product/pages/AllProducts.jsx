import React, { useEffect, useMemo, useState, useCallback } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useSearchParams, useLocation } from "react-router";
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
  ShoppingBag,
  ArrowLeft,
  Filter,
} from "lucide-react";
import { useProduct } from "../hook/useProduct";
import { formatPrice } from "../../home/pages/Home";
import { CATEGORIES } from "../../../constant/Categories";
import WishlistButton from "../../wishlist/components/WishlistButton";
import useCart from "../../cart/hook/useCart";

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

const NEW_BADGE_WINDOW_DAYS = 14;
const SALE_PCTS = [20, 30, 40, 50, 25, 35, 45, 30];

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

const SkeletonCard = () => (
  <div className="animate-pulse bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] overflow-hidden p-3">
    <div className="aspect-[3/4] bg-[#EAEAEA] rounded-md mb-3" />
    <div className="h-3 bg-[#EAEAEA] w-1/3 mb-2 rounded" />
    <div className="h-4 bg-[#EAEAEA] w-3/4 mb-2 rounded" />
    <div className="h-4 bg-[#EAEAEA] w-1/4 rounded" />
  </div>
);

const ProductCard = ({ product, onClick, salePercent = null }) => {
  const isNew = getProductAgeInDays(product) <= NEW_BADGE_WINDOW_DAYS;
  const originalPrice = salePercent
    ? Math.round(getProductPrice(product) / (1 - salePercent / 100))
    : null;

  return (
    <div
      className="group cursor-pointer bg-white border border-[#EAEAEA] rounded-[8px] overflow-hidden hover:border-[#B08D57] transition-all duration-300 shadow-sm flex flex-col justify-between"
      onClick={onClick}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAFAFA]">
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
        {/* Badges */}
        {salePercent ? (
          <span className="absolute top-2.5 left-2.5 bg-[#C43D3D] text-white text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded shadow">
            -{salePercent}% OFF
          </span>
        ) : isNew ? (
          <span className="absolute top-2.5 left-2.5 bg-[#B08D57] text-[#0e0e0e] text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 rounded shadow">
            NEW
          </span>
        ) : null}

        {/* Wishlist Button */}
        <WishlistButton
          productId={product._id}
          variantSku={product.variants?.[0]?.sku}
          className="absolute top-2.5 right-2.5 z-10"
        />
      </div>

      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          <p className="text-[10px] font-bold tracking-[0.12em] uppercase text-[#B08D57] mb-0.5 truncate">
            {product.brand || "ZRIVE"}
          </p>
          <h3 className="font-display text-[13.5px] font-semibold text-[#111111] leading-snug truncate mb-1">
            {getProductName(product)}
          </h3>
          <div className="flex items-baseline gap-2">
            <span className="text-[14px] font-bold text-[#111111]">
              {formatPrice(product.price)}
            </span>
            {originalPrice && (
              <span className="text-[11px] text-[#999999] line-through">
                {formatPrice(originalPrice)}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const FilterBlock = ({ title, icon: Icon, children }) => (
  <div className="py-4 border-b border-[#EAEAEA] last:border-b-0">
    <h3 className="flex items-center gap-1.5 text-[11px] font-bold tracking-[0.12em] uppercase text-[#111111] mb-3">
      {Icon && <Icon size={13} className="text-[#B08D57]" />}
      {title}
    </h3>
    {children}
  </div>
);

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
      <div className="space-y-1.5">
        {CATEGORIES.map((cat) => (
          <label
            key={cat.id}
            className="flex items-center gap-2.5 cursor-pointer group/cb px-1 py-1 rounded hover:bg-[#FAFAFA] transition-colors"
          >
            <input
              type="checkbox"
              checked={selectedCategories.includes(cat.id)}
              onChange={() => toggleInArray(selectedCategories, setSelectedCategories, cat.id)}
              className="w-3.5 h-3.5 rounded accent-[#B08D57] cursor-pointer"
            />
            <span className="text-[12.5px] text-[#555555] group-hover/cb:text-[#111111] transition-colors">
              {cat.label}
            </span>
          </label>
        ))}
      </div>
    </FilterBlock>

    <FilterBlock title="Price Range (₹)" icon={IndianRupee}>
      <div className="flex items-center gap-2">
        <input
          type="number"
          placeholder="Min"
          value={priceMin}
          onChange={(e) => setPriceMin(e.target.value)}
          className="w-full border border-[#EAEAEA] bg-[#FAFAFA] px-2.5 py-1.5 text-[12px] text-[#111111] outline-none focus:border-[#B08D57] rounded"
        />
        <span className="text-[#999999] text-xs">&ndash;</span>
        <input
          type="number"
          placeholder="Max"
          value={priceMax}
          onChange={(e) => setPriceMax(e.target.value)}
          className="w-full border border-[#EAEAEA] bg-[#FAFAFA] px-2.5 py-1.5 text-[12px] text-[#111111] outline-none focus:border-[#B08D57] rounded"
        />
      </div>
    </FilterBlock>

    {availableColors.length > 0 && (
      <FilterBlock title="Color" icon={Palette}>
        <div className="space-y-1.5">
          {availableColors.map((color) => (
            <label
              key={color}
              className="flex items-center gap-2.5 cursor-pointer group/cb px-1 py-1 rounded hover:bg-[#FAFAFA] transition-colors"
            >
              <input
                type="checkbox"
                checked={selectedColors.includes(color)}
                onChange={() => toggleInArray(selectedColors, setSelectedColors, color)}
                className="w-3.5 h-3.5 rounded accent-[#B08D57] cursor-pointer"
              />
              <span
                className="w-3 h-3 rounded-full border border-[#EAEAEA] shrink-0"
                style={{ backgroundColor: color?.toLowerCase() }}
              />
              <span className="text-[12.5px] text-[#555555] capitalize group-hover/cb:text-[#111111]">
                {color}
              </span>
            </label>
          ))}
        </div>
      </FilterBlock>
    )}

    <FilterBlock title="Availability" icon={PackageCheck}>
      <label className="flex items-center gap-2.5 cursor-pointer px-1 py-1 rounded hover:bg-[#FAFAFA] transition-colors">
        <input
          type="checkbox"
          checked={inStockOnly}
          onChange={() => setInStockOnly((v) => !v)}
          className="w-3.5 h-3.5 rounded accent-[#B08D57] cursor-pointer"
        />
        <span className="text-[12.5px] text-[#555555]">In Stock Only</span>
      </label>
    </FilterBlock>

    {activeFilterCount > 0 && (
      <button
        type="button"
        onClick={clearAllFilters}
        className="mt-4 w-full text-center text-[11px] font-bold uppercase tracking-[0.08em] text-white bg-[#111111] hover:bg-[#B08D57] py-2.5 rounded transition-colors"
      >
        Clear All Filters ({activeFilterCount})
      </button>
    )}
  </>
);

const AllProducts = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { handleGetProducts } = useProduct();

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [selectedColors, setSelectedColors] = useState([]);
  const [inStockOnly, setInStockOnly] = useState(false);
  const [priceMin, setPriceMin] = useState("");
  const [priceMax, setPriceMax] = useState("");
  const [sortOption, setSortOption] = useState("newest");
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [sortDropdownOpen, setSortDropdownOpen] = useState(false);

  const productsFromStore = useSelector((state) => state.product.products || []);
  const loading = useSelector((state) => state.product.loading?.products);

  useEffect(() => {
    handleGetProducts();
  }, []);

  useEffect(() => {
    const categoryParam = searchParams.get("category");
    if (categoryParam) {
      setSelectedCategories([categoryParam]);
    }
  }, [location.search, searchParams]);

  const toggleInArray = useCallback((arr, setFn, val) => {
    if (arr.includes(val)) setFn(arr.filter((v) => v !== val));
    else setFn([...arr, val]);
  }, []);

  const availableColors = useMemo(() => {
    const set = new Set();
    productsFromStore.forEach((p) => {
      getProductColors(p).forEach((c) => set.add(c));
    });
    return Array.from(set);
  }, [productsFromStore]);

  const activeFilterCount =
    selectedCategories.length +
    selectedColors.length +
    (inStockOnly ? 1 : 0) +
    (priceMin !== "" ? 1 : 0) +
    (priceMax !== "" ? 1 : 0);

  const clearAllFilters = useCallback(() => {
    setSelectedCategories([]);
    setSelectedColors([]);
    setInStockOnly(false);
    setPriceMin("");
    setPriceMax("");
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...productsFromStore];

    if (selectedCategories.length > 0) {
      list = list.filter((p) =>
        selectedCategories.some(
          (catId) => p.category?.toLowerCase() === catId.toLowerCase()
        )
      );
    }

    if (selectedColors.length > 0) {
      list = list.filter((p) => {
        const colors = getProductColors(p);
        return selectedColors.some((sc) =>
          colors.some((c) => c.toLowerCase() === sc.toLowerCase())
        );
      });
    }

    if (inStockOnly) {
      list = list.filter((p) => getProductStock(p) > 0);
    }

    if (priceMin !== "") {
      const min = Number(priceMin);
      if (!isNaN(min)) list = list.filter((p) => getProductPrice(p) >= min);
    }
    if (priceMax !== "") {
      const max = Number(priceMax);
      if (!isNaN(max)) list = list.filter((p) => getProductPrice(p) <= max);
    }

    if (sortOption === "price-asc") {
      list.sort((a, b) => getProductPrice(a) - getProductPrice(b));
    } else if (sortOption === "price-desc") {
      list.sort((a, b) => getProductPrice(b) - getProductPrice(a));
    }

    return list;
  }, [
    productsFromStore,
    selectedCategories,
    selectedColors,
    inStockOnly,
    priceMin,
    priceMax,
    sortOption,
  ]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header breadcrumb bar */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={14} />
            Back to Home
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Men's Marketplace Catalog
          </span>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-4 md:px-8 pt-6">
        {/* Title Bar & Sort */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 pb-4 border-b border-[#EAEAEA]">
          <div>
            <h1 className="font-display text-[26px] md:text-[32px] font-bold text-[#111111]">
              Men's Clothing Collection
            </h1>
            <p className="text-[13px] text-[#666666] mt-0.5">
              Showing <strong className="text-[#111111]">{filteredProducts.length}</strong> items
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Mobile Filter Button */}
            <button
              type="button"
              onClick={() => setMobileFilterOpen(true)}
              className="lg:hidden flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded text-[12px] font-bold text-[#111111]"
            >
              <Filter size={14} className="text-[#B08D57]" />
              Filter {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>

            {/* Sort Dropdown */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setSortDropdownOpen(!sortDropdownOpen)}
                className="flex items-center gap-2 px-4 py-2 bg-[#FAFAFA] border border-[#EAEAEA] rounded text-[12px] font-bold text-[#111111]"
              >
                <span>Sort by: {SORT_OPTIONS.find((s) => s.id === sortOption)?.label}</span>
                <ChevronDown size={14} />
              </button>

              {sortDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#EAEAEA] rounded shadow-xl z-30 py-1">
                  {SORT_OPTIONS.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setSortOption(opt.id);
                        setSortDropdownOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2 text-[12px] hover:bg-[#FAFAFA] ${
                        sortOption === opt.id ? "font-bold text-[#B08D57]" : "text-[#555]"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Layout Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-8 items-start">
          {/* Desktop Filter Sidebar */}
          <aside className="hidden lg:block bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5 sticky top-24">
            <div className="flex items-center justify-between pb-3 border-b border-[#EAEAEA] mb-2">
              <span className="text-[12px] font-bold uppercase tracking-[0.08em] text-[#111]">Filters</span>
              {activeFilterCount > 0 && (
                <span className="text-[10px] font-bold text-[#B08D57] bg-[#F5EFE5] px-2 py-0.5 rounded">
                  {activeFilterCount} Active
                </span>
              )}
            </div>

            <FilterPanelContent
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              availableColors={availableColors}
              toggleInArray={toggleInArray}
              activeFilterCount={activeFilterCount}
              clearAllFilters={clearAllFilters}
            />
          </aside>

          {/* Products Grid */}
          <main>
            {loading ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                  <SkeletonCard key={i} />
                ))}
              </div>
            ) : filteredProducts.length === 0 ? (
              <div className="p-12 text-center bg-[#FAFAFA] rounded-[8px] border border-[#EAEAEA]">
                <ShoppingBag size={32} className="text-[#B08D57] mx-auto mb-2" />
                <h3 className="font-display text-[20px] font-bold text-[#111111]">No Products Found</h3>
                <p className="text-[13px] text-[#666666] mt-1 mb-4">Try clearing some of your filters to see more results.</p>
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-2.5 bg-[#111111] text-white text-[12px] font-bold uppercase rounded hover:bg-[#B08D57] transition-all"
                >
                  Clear Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                {filteredProducts.map((product, i) => (
                  <ProductCard
                    key={getProductKey(product, i)}
                    product={product}
                    salePercent={SALE_PCTS[i % SALE_PCTS.length]}
                    onClick={() => navigate(`/product/${product._id}`)}
                  />
                ))}
              </div>
            )}
          </main>
        </div>

        {/* Discovery Strip */}
        <div className="mt-16 pt-8 border-t border-[#EAEAEA] grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-4 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-center">
            <Truck size={20} className="text-[#B08D57] mx-auto mb-2" />
            <p className="text-[12px] font-bold text-[#111]">Free Shipping</p>
            <p className="text-[10.5px] text-[#777]">On orders above ₹999</p>
          </div>
          <div className="p-4 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-center">
            <RotateCcw size={20} className="text-[#B08D57] mx-auto mb-2" />
            <p className="text-[12px] font-bold text-[#111]">7-Day Exchange</p>
            <p className="text-[10.5px] text-[#777]">Hassle-free doorstep pickup</p>
          </div>
          <div className="p-4 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-center">
            <ShieldCheck size={20} className="text-[#B08D57] mx-auto mb-2" />
            <p className="text-[12px] font-bold text-[#111]">100% Genuine</p>
            <p className="text-[10.5px] text-[#777]">Verified merchant guarantee</p>
          </div>
          <div className="p-4 bg-[#FAFAFA] rounded border border-[#EAEAEA] text-center">
            <BadgeCheck size={20} className="text-[#B08D57] mx-auto mb-2" />
            <p className="text-[12px] font-bold text-[#111]">Razorpay Escrow</p>
            <p className="text-[10.5px] text-[#777]">Protected payments</p>
          </div>
        </div>
      </div>

      {/* Mobile Filter Sheet */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 flex flex-col bg-white">
          <div className="flex items-center justify-between p-4 border-b border-[#EAEAEA]">
            <span className="font-display text-[18px] font-bold">Filter Products</span>
            <button onClick={() => setMobileFilterOpen(false)} className="text-[#111]">
              <X size={20} />
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-4">
            <FilterPanelContent
              selectedCategories={selectedCategories}
              setSelectedCategories={setSelectedCategories}
              selectedColors={selectedColors}
              setSelectedColors={setSelectedColors}
              inStockOnly={inStockOnly}
              setInStockOnly={setInStockOnly}
              priceMin={priceMin}
              setPriceMin={setPriceMin}
              priceMax={priceMax}
              setPriceMax={setPriceMax}
              availableColors={availableColors}
              toggleInArray={toggleInArray}
              activeFilterCount={activeFilterCount}
              clearAllFilters={clearAllFilters}
            />
          </div>
          <div className="p-4 border-t border-[#EAEAEA]">
            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-[#111111] text-white py-3 rounded text-[12px] font-bold uppercase"
            >
              Apply Filters
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default AllProducts;