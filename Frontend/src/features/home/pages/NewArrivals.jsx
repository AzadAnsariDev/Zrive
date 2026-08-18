import React, { useEffect, useMemo, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  Sparkle,
  SlidersHorizontal,
  ChevronDown,
  ArrowLeft,
  ShoppingBag,
  Sparkles,
  Check,
} from "lucide-react";
import { useProduct } from "../../product/hook/useProduct";
import { formatPrice } from "./Home";
import { CATEGORIES } from "../../../constant/Categories";
import WishlistButton from "../../wishlist/components/WishlistButton";
import useCart from "../../cart/hook/useCart";

const FILTER_CATEGORIES = CATEGORIES;

const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

/* ── Product Card with hover Add-to-Cart slide-up (same as Home) ── */
const NewArrivalCard = ({ product, onClick }) => {
  const { handleAddToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const coverImg =
    product.images?.[0]?.url ||
    product.images?.[0] ||
    product.image ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop";

  const onAddToCart = async (e) => {
    e.stopPropagation();
    if (adding || added) return;
    setAdding(true);
    try {
      const variantId = product.variants?.[0]?._id || product.variants?.[0]?.sku;
      await handleAddToCart(product._id, variantId);
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add to cart:", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div
      className="group cursor-pointer"
      onClick={onClick}
    >
      {/* Image container */}
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F7F5] mb-2 rounded-sm border border-[#E5E5E5] group-hover:border-[#111111] transition-all duration-300">
        {coverImg ? (
          <img
            src={coverImg}
            alt={product.title || product.name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#999]">
            <ShoppingBag size={24} />
          </div>
        )}

        {/* NEW Badge */}
        <span className="absolute top-2 left-2 bg-[#B08D57] text-[#0e0e0e] text-[9px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded-sm shadow">
          NEW
        </span>

        {/* Wishlist */}
        <WishlistButton
          productId={product._id}
          variantSku={product.variants?.[0]?.sku}
          className="absolute top-2 right-2 z-10"
        />

        {/* Add to Cart — slide up on hover */}
        <button
          type="button"
          onClick={onAddToCart}
          className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-250 bg-[#111111] hover:bg-[#B08D57] py-2.5 flex items-center justify-center gap-1.5 z-10 transition-colors duration-200"
        >
          {adding ? (
            <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white animate-pulse">
              Adding...
            </span>
          ) : added ? (
            <>
              <Check size={12} className="text-emerald-400" />
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-emerald-400">
                Added ✓
              </span>
            </>
          ) : (
            <>
              <ShoppingBag size={12} className="text-white" />
              <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-white">
                Add to Cart
              </span>
            </>
          )}
        </button>
      </div>

      {/* Product Info */}
      <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#B08D57] mb-0.5 truncate">
        {product.brand || "ZRIVE"}
      </p>
      <h3 className="text-[13px] font-medium text-[#111111] truncate leading-snug mb-1">
        {product.title || product.name}
      </h3>
      <p className="text-[13px] font-semibold text-[#111111]">
        {formatPrice(product.price)}
      </p>
    </div>
  );
};

const NewArrivals = () => {
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();

  const productsFromStore = useSelector((state) => state.product.products || []);
  const loading = useSelector((state) => state.product.loading?.products);

  const [selectedCategory, setSelectedCategory] = useState("all");
  const [selectedSort, setSelectedSort] = useState("newest");
  const [sortOpen, setSortOpen] = useState(false);

  useEffect(() => {
    handleGetProducts();
  }, []);

  const filteredProducts = useMemo(() => {
    let list = [...productsFromStore];

    if (selectedCategory !== "all") {
      list = list.filter(
        (p) => p.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    if (selectedSort === "price-asc") {
      list.sort((a, b) => (a.price?.amount || a.price) - (b.price?.amount || b.price));
    } else if (selectedSort === "price-desc") {
      list.sort((a, b) => (b.price?.amount || b.price) - (a.price?.amount || a.price));
    }

    return list;
  }, [productsFromStore, selectedCategory, selectedSort]);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header Bar */}
      <div className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate("/")}
            className="flex items-center gap-2 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Home
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            <Sparkles size={14} />
            New Season Drops
          </div>
        </div>
      </div>

      {/* Hero Header */}
      <div className="bg-[#111111] text-white py-12 px-5 md:px-8 lg:px-12 border-b border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <span className="text-[11px] font-bold tracking-[0.16em] uppercase text-[#B08D57] block mb-2">
              EXCLUSIVES · FALL 2026
            </span>
            <h1 className="font-display text-[32px] md:text-[42px] font-bold leading-tight">
              New Arrivals
            </h1>
            <p className="text-[13.5px] text-white/70 mt-1.5 max-w-lg leading-relaxed">
              Explore the latest contemporary tailored drops, premium outerwear, and signature accessories added this week.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-[12px] font-bold uppercase tracking-[0.08em] bg-white/10 text-white px-4 py-2 rounded-full border border-white/20">
              {filteredProducts.length} Items
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 pt-8">
        {/* Controls Bar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E5E5E5]">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setSelectedCategory("all")}
              className={`px-4 py-2 rounded-[6px] text-[12px] font-bold tracking-[0.04em] transition-all whitespace-nowrap ${
                selectedCategory === "all"
                  ? "bg-[#111111] text-white shadow-sm"
                  : "bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5] hover:border-[#111111]"
              }`}
            >
              All Drops
            </button>
            {FILTER_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id)}
                className={`px-4 py-2 rounded-[6px] text-[12px] font-bold tracking-[0.04em] transition-all whitespace-nowrap ${
                  selectedCategory === cat.id
                    ? "bg-[#111111] text-white shadow-sm"
                    : "bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5] hover:border-[#111111]"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative shrink-0">
            <button
              onClick={() => setSortOpen(!sortOpen)}
              className="flex items-center gap-2 px-4 py-2 rounded-[6px] border border-[#E5E5E5] bg-[#FAFAFA] text-[12px] font-bold text-[#111111]"
            >
              <span>Sort: {SORT_OPTIONS.find((s) => s.id === selectedSort)?.label}</span>
              <ChevronDown size={14} />
            </button>

            {sortOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-[#E5E5E5] rounded-[6px] shadow-xl z-20 py-1">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      setSelectedSort(opt.id);
                      setSortOpen(false);
                    }}
                    className={`w-full text-left px-4 py-2 text-[12.5px] hover:bg-[#FAFAFA] transition-colors ${
                      selectedSort === opt.id ? "font-bold text-[#B08D57]" : "text-[#555555]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="aspect-[3/4] bg-[#FAFAFA] rounded-sm border border-[#E5E5E5] mb-2" />
                <div className="h-2 bg-[#EAEAEA] w-1/3 mb-1.5 rounded" />
                <div className="h-3 bg-[#EAEAEA] w-3/4 mb-1.5 rounded" />
                <div className="h-3 bg-[#EAEAEA] w-1/4 rounded" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-[#FAFAFA] rounded-[10px] border border-[#E5E5E5] my-6">
            <Sparkle size={32} className="text-[#B08D57] mx-auto mb-2" />
            <p className="font-display text-[20px] font-bold text-[#111111]">No New Arrivals Found</p>
            <p className="text-[13px] text-[#666666] mt-1">Try selecting a different category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-5">
            {filteredProducts.map((p) => (
              <NewArrivalCard
                key={p._id || p.id}
                product={p}
                onClick={() => navigate(`/product/${p._id || p.id}`)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
