import React, { useEffect, useState, useMemo } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import {
  ArrowRight,
  Sparkle,
  Truck,
  RotateCcw,
  ShieldCheck,
  BadgeCheck,
  ShoppingBag,
  Flame,
  Tag,
  Check,
  Copy,
  Zap,
  Star,
  ChevronLeft,
  ChevronRight,
  Lock,
} from "lucide-react";
import { useProduct } from "../../product/hook/useProduct";
import useCart from "../../cart/hook/useCart";
import WishlistButton from "../../wishlist/components/WishlistButton";
import { notify } from "../../../utils/toast";
import { CATEGORIES as MENS_CATEGORIES } from "../../../constant/Categories";
import HeroDesktop from "../../../assets/images/hero_desktop_genz.jpg";
import HeroMobile from "../../../assets/images/hero_mobile_compact_banner.jpg";

// ---- Backend data format safety helpers -----------------------------------
export const formatPrice = (priceObj) => {
  if (priceObj === undefined || priceObj === null) return "";
  if (typeof priceObj === "number" || typeof priceObj === "string") {
    return `₹${priceObj}`;
  }
  if (typeof priceObj === "object") {
    const amount = priceObj.amount ?? priceObj.value;
    if (amount === undefined || amount === null) return "";
    const currency = priceObj.currency || "INR";
    const symbol =
      currency === "INR" ? "₹" : currency === "USD" ? "$" : `${currency} `;
    return `${symbol}${amount}`;
  }
  return "";
};

const getProductName = (product) =>
  product?.title || product?.name || "Product";

const getProductImage = (product) => {
  if (product?.images && product.images.length > 0) {
    const img = product.images[0];
    return typeof img === "string" ? img : img?.url || "";
  }
  return (
    product?.variants?.[0]?.images?.[0]?.url ||
    product?.image ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop"
  );
};

const getProductKey = (product, idx) => product?._id || product?.id || idx;

const getProductPrice = (p) => {
  const v = p?.price;
  if (typeof v === "number") return v;
  if (typeof v === "object" && v !== null) return v.amount ?? v.value ?? 0;
  return Number(v) || 0;
};

const ProductCardSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[3/4] bg-[#F0EEEA] mb-2 rounded-sm" />
    <div className="h-2.5 bg-[#F0EEEA] w-1/3 mb-1.5 rounded" />
    <div className="h-3 bg-[#F0EEEA] w-3/4 mb-1.5 rounded" />
    <div className="h-3 bg-[#F0EEEA] w-1/4 rounded" />
  </div>
);

/* ─────────────────────────────────────────────
   COMPACT PRODUCT CARD WITH "ADD TO CART" HOVER
───────────────────────────────────────────── */
const ProductCard = ({ product, onClick, salePercent = null, className = "" }) => {
  const { handleAddToCart } = useCart();
  const [added, setAdded] = useState(false);
  const [adding, setAdding] = useState(false);

  const originalPrice = salePercent
    ? Math.round(getProductPrice(product) / (1 - salePercent / 100))
    : null;

  const onAddToCartClick = async (e) => {
    e.stopPropagation();
    if (adding || added) return;
    setAdding(true);
    try {
      const variantId = product.variants?.[0]?._id || product.variants?.[0]?.sku;
      await handleAddToCart(product._id, variantId);
      notify.success("Added to cart");
      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Failed to add product to cart:", err);
    } finally {
      setAdding(false);
    }
  };

  return (
    <div className={`group cursor-pointer ${className}`} onClick={onClick}>
      <div className="relative aspect-[3/4] overflow-hidden bg-[#F7F7F5] mb-2.5 rounded-sm border border-[#E5E5E5] group-hover:border-[#111111] transition-all duration-300">
        <img
          src={getProductImage(product)}
          alt={getProductName(product)}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />

        {/* Discount Badge */}
        {salePercent && (
          <span className="absolute top-2 left-2 bg-[#C43D3D] text-white text-[9px] font-bold tracking-[0.1em] uppercase px-2 py-0.5 shadow-sm">
            -{salePercent}%
          </span>
        )}

        {/* Wishlist */}
        <WishlistButton
          productId={product._id}
          variantSku={product.variants?.[0]?.sku}
          className="absolute top-2 right-2 z-10"
        />

        {/* ADD TO CART HOVER BUTTON (Slide-Up) */}
        <button
          type="button"
          onClick={onAddToCartClick}
          className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-250 bg-[#111111] hover:bg-[#B08D57] py-2.5 text-center flex items-center justify-center gap-1.5 transition-colors duration-200 z-10"
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

      <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-[#B08D57] mb-0.5 truncate">
        {product.brand || "ZRIVE"}
      </p>
      <h3
        style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
        className="text-[13px] text-[#111111] mb-1 truncate leading-snug font-medium"
      >
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
   MAIN HOME PAGE
───────────────────────────────────────────── */
const Home = () => {
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    handleGetProducts();
  }, []);

  const products = useSelector((state) => state.product.products);
  const loading = useSelector((state) => state.product.loading?.fetch);

  // Filtered slices
  const trendingGrid = useMemo(() => products?.slice(0, 12) ?? [], [products]);
  const dealsProducts = useMemo(() => products?.slice(2, 10) ?? [], [products]);
  const newArrivals = useMemo(() => products?.slice(4, 10) ?? [], [products]);

  const copyCouponCode = (e) => {
    e.stopPropagation();
    navigator.clipboard.writeText("ZRIVEFIRST");
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const navigateToCategory = (catId) => {
    navigate(`/all-products?category=${catId}`, { state: { category: catId } });
  };

  return (
    <div className="bg-white text-[#111111] min-h-screen" style={{ fontFamily: "'Inter', sans-serif" }}>

      {/* Scoped CSS for Marquee Ticker */}
      <style>{`
        @keyframes zriveMarquee {
          0% { transform: translateX(0%); }
          100% { transform: translateX(-50%); }
        }
        .animate-zrive-marquee {
          display: flex;
          width: max-content;
          animation: zriveMarquee 22s linear infinite;
        }
        .animate-zrive-marquee:hover {
          animation-play-state: paused;
        }
      `}</style>

      {/* ══════════════════════════════════════════
          1 · HERO BANNER — Responsive
      ══════════════════════════════════════════ */}
      <section className="relative w-full overflow-hidden bg-white">
        {/* ── MOBILE (below md): compact landscape banner with sharp edges ── */}
        <div
          className="md:hidden relative w-full cursor-pointer group bg-white rounded-none overflow-hidden"
          onClick={() => navigate("/all-products")}
        >
          <img
            src={HeroMobile}
            alt="ZRIVE — Flat 30% Off Your First Order"
            className="w-full h-auto block rounded-none object-cover transition-transform duration-700 ease-out group-hover:scale-[1.01]"
            loading="eager"
          />
        </div>

        {/* ── DESKTOP (md+): 16:9 Gen-Z wide campaign banner with CTAs ── */}
        <div
          className="hidden md:block relative w-full cursor-pointer group overflow-hidden"
          onClick={() => navigate("/all-products")}
        >
          <img
            src={HeroDesktop}
            alt="ZRIVE New Collection Drop"
            className="w-full object-cover transition-transform duration-700 ease-out group-hover:scale-[1.015]"
            style={{ display: "block" }}
            loading="eager"
          />
          {/* Gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/10 to-transparent pointer-events-none" />
          {/* CTA overlay */}
          <div className="absolute bottom-1/2 translate-y-1/2 left-14 z-10 flex flex-col items-start gap-3">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); navigate("/all-products"); }}
              className="inline-flex items-center gap-2.5 bg-[#B08D57] text-[#0a0a0a] text-[13px] font-bold tracking-[0.14em] uppercase px-8 py-4 hover:bg-white transition-all duration-300 shadow-2xl rounded-sm group/btn"
            >
              <span>Shop Collection</span>
              <ArrowRight size={14} className="group-hover/btn:translate-x-1 transition-transform" />
            </button>
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); copyCouponCode(e); }}
              className="inline-flex items-center gap-1.5 bg-black/70 backdrop-blur-sm border border-white/20 text-white text-[11px] font-semibold px-4 py-3 rounded-sm hover:border-[#B08D57] transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={12} className="text-[#B08D57]" />}
              <span>{copied ? "Copied!" : "Code: ZRIVEFIRST"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          2 · RUNNING ZRIVE FEATURES STRIP (Infinite Marquee Ticker)
      ══════════════════════════════════════════ */}
      <section className="bg-[#111111] text-white py-3 overflow-hidden border-b border-[#222]">
        <div className="animate-zrive-marquee flex items-center gap-8 text-[11px] font-medium tracking-[0.12em] uppercase">

          {/* Set 1 */}
          <div className="flex items-center gap-2 shrink-0">
            <Tag size={13} className="text-[#B08D57]" />
            <span>FLAT 20% OFF 1ST ORDER — CODE: <strong className="text-[#B08D57]">ZRIVEFIRST</strong></span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <Truck size={13} className="text-[#B08D57]" />
            <span>FREE EXPRESS SHIPPING OVER ₹999</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck size={13} className="text-[#B08D57]" />
            <span>100% VERIFIED SELLERS & AUTHENTIC PRODUCTS</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <RotateCcw size={13} className="text-[#B08D57]" />
            <span>7-DAY HASSLE-FREE RETURNS</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <Lock size={13} className="text-[#B08D57]" />
            <span>SECURE ESCROW PAYMENTS</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>

          {/* Duplicate Set for Seamless Loop */}
          <div className="flex items-center gap-2 shrink-0">
            <Tag size={13} className="text-[#B08D57]" />
            <span>FLAT 20% OFF 1ST ORDER — CODE: <strong className="text-[#B08D57]">ZRIVEFIRST</strong></span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <Truck size={13} className="text-[#B08D57]" />
            <span>FREE EXPRESS SHIPPING OVER ₹999</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <ShieldCheck size={13} className="text-[#B08D57]" />
            <span>100% VERIFIED SELLERS & AUTHENTIC PRODUCTS</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <RotateCcw size={13} className="text-[#B08D57]" />
            <span>7-DAY HASSLE-FREE RETURNS</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>
          <div className="flex items-center gap-2 shrink-0">
            <Lock size={13} className="text-[#B08D57]" />
            <span>SECURE ESCROW PAYMENTS</span>
          </div>
          <span className="text-[#444] shrink-0">•</span>

        </div>
      </section>

      {/* ══════════════════════════════════════════
          3 · PROMINENT CATEGORY CIRCLES
      ══════════════════════════════════════════ */}
      <section className="px-5 md:px-14 py-10 md:py-14 border-b border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-center justify-between mb-7">
            <div>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#B08D57] mb-1">
                Explore Menswear
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-[22px] md:text-[28px] font-bold text-[#111111]"
              >
                Shop By Category
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/all-products")}
              className="text-[11px] font-semibold tracking-[0.12em] uppercase text-[#B08D57] hover:text-[#111111] transition-colors border-b border-[#B08D57] pb-0.5"
            >
              View All Catalog
            </button>
          </div>

          {/* Large Prominent Horizontal Category Circles */}
          <div className="flex gap-5 md:gap-8 overflow-x-auto no-scrollbar pb-3">
            {MENS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigateToCategory(cat.id)}
                className="group flex-shrink-0 flex flex-col items-center w-[95px] md:w-[120px] lg:w-[130px] text-center"
              >
                <div className="w-[88px] h-[88px] md:w-[110px] md:h-[110px] lg:w-[120px] lg:h-[120px] rounded-full overflow-hidden border-2 border-[#E5E5E5] group-hover:border-[#B08D57] bg-[#F7F7F5] mb-3 p-1 transition-all duration-300 group-hover:scale-105 shadow-sm group-hover:shadow-md">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover object-top rounded-full transition-transform duration-500 group-hover:scale-110"
                    loading="lazy"
                  />
                </div>
                <span className="text-[13px] md:text-[14px] font-semibold text-[#111111] group-hover:text-[#B08D57] transition-colors truncate w-full">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          4 · TODAY'S BEST DEALS (Compact Row with Discount Badges)
      ══════════════════════════════════════════ */}
      {dealsProducts.length > 0 && (
        <section className="px-5 md:px-14 py-8 md:py-10 border-b border-[#E5E5E5]">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#C43D3D] mb-1 flex items-center gap-1">
                  <Flame size={12} />
                  Limited Time Offers
                </p>
                <h2
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-[20px] md:text-[24px] font-bold text-[#111111]"
                >
                  Today's Best Deals
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/all-products")}
                className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#B08D57] hover:text-[#111111] transition-colors"
              >
                View All Deals
              </button>
            </div>

            <div className="flex gap-3.5 md:gap-4 overflow-x-auto no-scrollbar pb-2">
              {dealsProducts.map((product, idx) => (
                <div key={getProductKey(product, idx)} className="flex-shrink-0 w-[150px] md:w-[185px]">
                  <ProductCard
                    product={product}
                    onClick={() => navigate(`/product/${product._id}`)}
                    salePercent={[25, 30, 40, 20, 35, 50, 15, 30][idx % 8]}
                  />
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ══════════════════════════════════════════
          5 · TRENDING CATALOG (Compact 6-Column Grid)
      ══════════════════════════════════════════ */}
      <section className="px-5 md:px-14 py-8 md:py-12 border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#B08D57] mb-1 flex items-center gap-1">
                <Sparkle size={12} />
                Curated Selection
              </p>
              <h2
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                className="text-[20px] md:text-[26px] font-bold text-[#111111]"
              >
                Trending Collection
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/all-products")}
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#B08D57] hover:text-[#111111] transition-colors flex items-center gap-1"
            >
              <span>Explore All ({products?.length || 0})</span>
              <ArrowRight size={12} />
            </button>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <ProductCardSkeleton key={i} />
              ))}
            </div>
          ) : trendingGrid.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 xl:grid-cols-6 gap-3.5 md:gap-4">
              {trendingGrid.map((product, idx) => (
                <ProductCard
                  key={getProductKey(product, idx)}
                  product={product}
                  onClick={() => navigate(`/product/${product._id}`)}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-10 text-[#666]">
              No products available right now.
            </div>
          )}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          6 · COMPACT OFFER BANNER (Code Copy Strip)
      ══════════════════════════════════════════ */}
      <section className="px-5 md:px-14 py-8 border-b border-[#E5E5E5]">
        <div className="max-w-[1440px] mx-auto bg-[#F7F7F5] border border-[#E5E5E5] px-6 py-6 md:px-10 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4 text-center md:text-left">
            <div className="w-10 h-10 rounded-full bg-[#B08D57]/15 flex items-center justify-center shrink-0">
              <Tag size={18} className="text-[#B08D57]" />
            </div>
            <div>
              <p className="text-[14px] font-bold text-[#111111]">
                First Time Shopping on ZRIVE?
              </p>
              <p className="text-[12px] text-[#666] mt-0.5">
                Use code <strong className="text-[#111111]">ZRIVEFIRST</strong> for Flat 20% discount on your first order.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={copyCouponCode}
              className="flex items-center gap-1.5 bg-white border border-[#111111] px-4 py-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-[#111111] hover:bg-[#111111] hover:text-white transition-colors"
            >
              {copied ? <Check size={13} className="text-emerald-600" /> : <Copy size={12} />}
              <span>{copied ? "Copied!" : "Copy ZRIVEFIRST"}</span>
            </button>

            <button
              type="button"
              onClick={() => navigate("/all-products")}
              className="flex items-center gap-1.5 bg-[#111111] text-white px-5 py-2 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-[#B08D57] transition-colors"
            >
              <span>Shop Catalog</span>
              <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════
          7 · NEW ARRIVALS COMPACT ROW
      ══════════════════════════════════════════ */}
      {newArrivals.length > 0 && (
        <section className="px-5 md:px-14 py-8 md:py-10 border-b border-[#E5E5E5]">
          <div className="max-w-[1440px] mx-auto">
            <div className="flex items-end justify-between mb-5">
              <div>
                <p className="text-[9px] font-bold tracking-[0.2em] uppercase text-[#B08D57] mb-1 flex items-center gap-1">
                  <Star size={12} />
                  Just Dropped
                </p>
                <h2
                  style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
                  className="text-[20px] md:text-[24px] font-bold text-[#111111]"
                >
                  New Arrivals
                </h2>
              </div>
              <button
                type="button"
                onClick={() => navigate("/new-arrivals")}
                className="text-[11px] font-semibold tracking-[0.1em] uppercase text-[#B08D57] hover:text-[#111111] transition-colors"
              >
                View All New
              </button>
            </div>

            <div className="flex gap-3.5 md:gap-4 overflow-x-auto no-scrollbar pb-2">
              {newArrivals.map((product, idx) => (
                <div key={getProductKey(product, idx)} className="flex-shrink-0 w-[150px] md:w-[185px]">
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
          8 · COMPACT TRUST STRIP
      ══════════════════════════════════════════ */}
      <section className="bg-[#FAFAFA] border-b border-[#E5E5E5] py-8 px-5 md:px-14">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { icon: Truck, title: "Free Express Shipping", desc: "On orders over ₹999" },
            { icon: RotateCcw, title: "7-Day Easy Returns", desc: "Hassle-free refunds" },
            { icon: ShieldCheck, title: "100% Verified Sellers", desc: "Vetted authentic brands" },
            { icon: BadgeCheck, title: "Secure Escrow", desc: "Encrypted checkout" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-white border border-[#E5E5E5] flex items-center justify-center shrink-0 shadow-2xs">
                <Icon size={15} strokeWidth={1.5} className="text-[#B08D57]" />
              </div>
              <div>
                <p className="text-[12px] font-semibold text-[#111111]">{title}</p>
                <p className="text-[11px] text-[#999]">{desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ══════════════════════════════════════════
          9 · STREAMLINED NEWSLETTER FOOTER STRIP
      ══════════════════════════════════════════ */}
      <section className="bg-[#111111] text-white py-10 px-5 md:px-14">
        <div className="max-w-[1440px] mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="text-center md:text-left">
            <p className="text-[9px] font-semibold tracking-[0.2em] uppercase text-[#B08D57] mb-1">
              Join ZRIVE Circle
            </p>
            <h3
              style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              className="text-[20px] md:text-[24px] font-bold text-white"
            >
              Get Early Access To Private Drops & Offers
            </h3>
          </div>

          <form
            onSubmit={(e) => e.preventDefault()}
            className="flex items-center gap-2 w-full md:w-auto max-w-md"
          >
            <input
              type="email"
              placeholder="Enter your email"
              className="flex-1 bg-[#1a1a1a] border border-[#333] px-4 py-2.5 text-[12px] text-white outline-none focus:border-[#B08D57] transition-colors rounded-xs"
            />
            <button
              type="submit"
              className="bg-[#B08D57] text-white text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-2.5 hover:bg-white hover:text-[#111111] transition-colors shrink-0 rounded-xs"
            >
              Subscribe
            </button>
          </form>
        </div>
      </section>

    </div>
  );
};

export default Home;
