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

const NewArrivals = () => {
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();
  const { handleAddToCart } = useCart();

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
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
              <div key={i} className="aspect-[3/4] bg-[#FAFAFA] rounded-[8px] border border-[#E5E5E5] animate-pulse" />
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="p-12 text-center bg-[#FAFAFA] rounded-[10px] border border-[#E5E5E5] my-6">
            <Sparkle size={32} className="text-[#B08D57] mx-auto mb-2" />
            <p className="font-display text-[20px] font-bold text-[#111111]">No New Arrivals Found</p>
            <p className="text-[13px] text-[#666666] mt-1">Try selecting a different category filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {filteredProducts.map((p) => {
              const coverImg = p.images?.[0]?.url || p.image;
              return (
                <div
                  key={p._id || p.id}
                  onClick={() => navigate(`/product/${p._id || p.id}`)}
                  className="group cursor-pointer bg-white rounded-[3px] border border-[#E5E5E5] overflow-hidden hover:border-[#B08D57] transition-all duration-300 shadow-sm flex flex-col justify-between"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-[#FAFAFA]">
                    {coverImg ? (
                      <img
                        src={coverImg}
                        alt={p.title || p.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-[#999]">
                        <ShoppingBag size={24} />
                      </div>
                    )}

                    <span className="absolute top-3 left-3 bg-[#B08D57] text-[#0e0e0e] text-[9.5px] font-bold uppercase tracking-[0.1em] px-2 py-0.5 rounded shadow">
                      NEW
                    </span>

                    <WishlistButton
                      productId={p._id}
                      variantSku={p.variants?.[0]?.sku}
                      className="absolute top-3 right-3 z-10"
                    />
                  </div>

                  <div className="p-4">
                    <p className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#B08D57] mb-1">
                      {p.brand || "ZRIVE"}
                    </p>
                    <h3 className="font-display text-[14px] font-bold text-[#111111] truncate group-hover:text-[#B08D57] transition-colors">
                      {p.title || p.name}
                    </h3>
                    <p className="text-[15px] font-bold text-[#111111] mt-1.5">{formatPrice(p.price)}</p>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (p.variants?.[0]) {
                          handleAddToCart(p._id, p.variants[0]._id);
                        } else {
                          navigate(`/product/${p._id}`);
                        }
                      }}
                      className="w-full mt-3 py-2.5 rounded-[6px] bg-[#111111] text-white text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all flex items-center justify-center gap-1.5"
                    >
                      <ShoppingBag size={13} />
                      Add to Cart
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default NewArrivals;
