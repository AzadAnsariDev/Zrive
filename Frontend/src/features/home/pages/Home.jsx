import React, { useEffect } from "react";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router";
import { Plus, ArrowRight, Shirt, User as UserIcon } from "lucide-react";
import { useProduct } from "../../product/hook/useProduct";
import HeroZrive from "../../../assets/images/Hero_Zrive.png";
import WishlistButton from "../../wishlist/components/WishlistButton";

// ---- Static content -------------------------------------------------------
// Using real category enum values from the product schema
const MENS_CATEGORIES = [
  { id: 'tshirts',    label: 'T-Shirts',   image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=580&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'shirts',     label: 'Shirts',     image: 'https://images.unsplash.com/photo-1618786177957-29d9b6b26d8a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Nnx8Q2FzdWFsJTIwc2hpcnQlMjBmYXNoaW9ufGVufDB8fDB8fHww' },
  { id: 'jeans',      label: 'Jeans',      image: 'https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTF8fGplYW5zfGVufDB8fDB8fHww' },
  { id: 'trousers',   label: 'Trousers',   image: 'https://images.unsplash.com/photo-1580906853305-5702e648164e?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8Mzl8fHRyb3VzZXJzfGVufDB8fDB8fHww' },
  { id: 'jackets',    label: 'Jackets',    image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=435&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D' },
  { id: 'hoodies',    label: 'Hoodies',    image: 'https://images.unsplash.com/photo-1680292783974-a9a336c10366?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG9vZGllc3xlbnwwfHwwfHx8MA%3D%3D' },
  { id: 'blazers',    label: 'Blazers',    image: 'https://images.unsplash.com/photo-1592878904946-b3cd8ae243d0?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8YmxhemVyc3xlbnwwfHwwfHx8MA%3D%3D' },
  { id: 'shoes',      label: 'Shoes',      image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c2hvZXN8ZW58MHx8MHx8fDA%3D' },
  { id: 'sunglasses', label: 'Sunglasses', image: 'https://images.unsplash.com/photo-1473496169904-658ba7c44d8a?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8c3VuZ2xhc3Nlc3xlbnwwfHwwfHx8MA%3D%3D' },
  { id: 'perfumes',   label: 'Perfumes',   image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8cGVyZnVtZXN8ZW58MHx8MHx8fDA%3D' },
]

const ProductCardSkeleton = ({ className = "" }) => (
  <div className={`animate-pulse bg-cream-dark ${className}`} />
);

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
    product?.image ||
    "https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop"
  );
};

const getProductKey = (product, idx) => product?._id || product?.id || idx;

const Home = () => {
  const navigate = useNavigate();
  const { handleGetProducts } = useProduct();

  useEffect(() => {
    handleGetProducts();
  }, []);

  const products = useSelector((state) => state.product.products);

  // ---- Data slices ----------------------------------------------------
  const trendingHero = products?.[0];
  const trendingGridMobile = products?.slice(1, 3) ?? [];
  const trendingGridDesktop = products?.slice(0, 4) ?? [];
  const forYou = products?.slice(3, 6) ?? [];
  const recentlyViewed = products?.slice(0, 4) ?? [];

  return (
    <div className="bg-cream text-ink">
      {/* ================= HERO — mobile ================= */}
      <section className="md:hidden relative">
        <img
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop"
          alt="Essentials for the modern man"
          className="w-full h-[480px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-7 left-5 right-5">
          <h1 className="font-display text-white text-[32px] font-medium leading-[1.1] tracking-tight mb-5">
            Essentials
            <br />
            For The Modern
            <br />
            Man
          </h1>
          <button
            type="button"
            onClick={() => navigate("/all-products")}
            className="bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-6 py-4 rounded-[3px] hover:bg-ink transition-colors"
          >
            Shop the Collection
          </button>
        </div>
      </section>

      {/* ================= HERO — desktop/tablet ================= */}
      <section className="hidden md:block w-full h-[220px] lg:h-[280px] relative overflow-hidden group">
        <img
          src={HeroZrive}
          alt="Big Sale and Discounts"
          className="w-full h-full object-cover object-center block transition-transform duration-500 ease-out group-hover:scale-[1.008]"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        <div className="absolute bottom-6 left-8 lg:bottom-24 lg:left-8 z-10 max-w-xl">
          <button
            type="button"
            onClick={() => navigate("/all-products")}
            className="inline-flex items-center gap-3 bg-charcoal text-cream text-[10px] font-semibold tracking-[0.1em] uppercase px-6 py-3 rounded-[3px] hover:bg-ink transition-colors"
          >
            <span>Explore Collection</span>
            <ArrowRight size={14} />
          </button>
        </div>
      </section>

      {/* ================= Shop By Category — mobile ================= */}
      <section className="md:hidden px-5 py-14 border-t border-border">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
              Menswear
            </p>
            <h2 className="font-display text-[20px] font-medium text-ink">
              Shop By Category
            </h2>
          </div>
          <button
            type="button"
            onClick={() => navigate("/all-products")}
            className="text-[12px] font-medium text-ink-soft hover:text-ink transition-colors"
          >
            View All
          </button>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {MENS_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              onClick={() => navigate(`/all-products?category=${cat.id}`)}
              className="group flex-shrink-0 w-[128px]"
            >
              <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-border bg-cream-dark mb-2.5">
                <img
                  src={cat.image}
                  alt={cat.label}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <span className="font-display text-[13px] text-ink">
                {cat.label}
              </span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= Shop By Category — desktop/tablet ================= */}
      <section className="hidden md:block px-8 lg:px-14 py-14 border-t border-border">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
                Menswear
              </p>
              <h2 className="font-display text-[26px] font-medium text-ink">
                Shop By Category
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/all-products")}
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft hover:text-ink transition-colors"
            >
              View All
            </button>
          </div>
          <div className="grid grid-cols-5 gap-5 lg:gap-6">
            {MENS_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                type="button"
                onClick={() => navigate(`/all-products?category=${cat.id}`)}
                className="group"
              >
                <div className="relative aspect-[3/4] overflow-hidden rounded-[3px] border border-border bg-cream-dark mb-3">
                  <img
                    src={cat.image}
                    alt={cat.label}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <span className="font-display text-[14px] text-ink">
                  {cat.label}
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ================= Trending Now — desktop/tablet ================= */}
      <section className="hidden md:block px-8 lg:px-14 py-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
                Curated For You
              </p>
              <h2 className="font-display text-[26px] font-medium text-ink">
                Trending Now
              </h2>
            </div>
            <button
              type="button"
              onClick={() => navigate("/all-products")}
              className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft hover:text-ink transition-colors"
            >
              View All
            </button>
          </div>

          <div className="grid grid-cols-5 xl:grid-cols-6 gap-4 lg:gap-5">
            {trendingGridDesktop.length > 0
              ? trendingGridDesktop.map((product, idx) => (
                  <div
                    key={getProductKey(product, idx)}
                    className="group cursor-pointer"
                    onClick={() => navigate(`/product/${product._id}`)}
                  >
                    <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark mb-3">
                      <img
                        src={getProductImage(product)}
                        alt={getProductName(product)}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                      <WishlistButton
                        productId={product._id}
                        variantSku={product.variants?.[0]?.sku}
                        className="absolute top-3 right-3 z-10"
                      />
                    </div>
                    <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">
                      {product.brand || "Generic"}
                    </p>
                    <h3 className="font-display text-[14px] text-ink mb-1 truncate">
                      {getProductName(product)}
                    </h3>
                    <span className="font-sans text-[13px] font-semibold text-ink">
                      {formatPrice(product.price)}
                    </span>
                  </div>
                ))
              : [0, 1, 2, 3].map((i) => (
                  <ProductCardSkeleton key={i} className="aspect-[3/4]" />
                ))}
          </div>
        </div>
      </section>

      {/* ================= Trending Now — mobile ================= */}
      <section className="md:hidden px-5 py-10">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-[22px] font-medium text-ink">
            Trending Now
          </h2>
          <button
            type="button"
            onClick={() => navigate("/all-products")}
            className="text-[12px] font-medium text-ink-soft"
          >
            View All
          </button>
        </div>

        <div className="grid grid-cols-2 gap-4">
          {(trendingGridMobile.length > 0
            ? [trendingHero, ...trendingGridMobile].filter(Boolean)
            : []
          ).map((product, idx) => (
            <div
              key={getProductKey(product, idx)}
              onClick={() => navigate(`/product/${product._id}`)}
              className="cursor-pointer"
            >
              <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark mb-2">
                <img
                  src={getProductImage(product)}
                  alt={getProductName(product)}
                  className="w-full h-full object-cover"
                />
                <WishlistButton
                  productId={product._id}
                  variantSku={product.variants?.[0]?.sku}
                  className="absolute top-2 right-2 z-10"
                />
              </div>
              <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">
                {product.brand || "Generic"}
              </p>
              <h3 className="font-display text-[13px] text-ink mb-0.5 truncate">
                {getProductName(product)}
              </h3>
              <p className="font-sans text-[12px] font-semibold text-ink">
                {formatPrice(product.price)}
              </p>
            </div>
          ))}
          {trendingGridMobile.length === 0 &&
            [0, 1, 2, 3].map((i) => (
              <ProductCardSkeleton key={i} className="aspect-[3/4]" />
            ))}
        </div>
      </section>

      {/* ================= For You — mobile only ================= */}
      <section className="md:hidden px-5 py-8 border-t border-border">
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-display text-[20px] font-medium text-ink">
            For You
          </h2>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar pb-1">
          {forYou.length > 0
            ? forYou.map((product, idx) => (
                <div
                  key={getProductKey(product, idx)}
                  className="flex-shrink-0 w-[130px]"
                  onClick={() => navigate(`/product/${product._id}`)}
                >
                  <div className="aspect-[3/4] overflow-hidden bg-cream-dark mb-2">
                    <img
                      src={getProductImage(product)}
                      alt={getProductName(product)}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <h3 className="font-display text-[13px] text-ink truncate mb-0.5">
                    {getProductName(product)}
                  </h3>
                  <p className="font-sans text-[12px] font-semibold text-ink">
                    {formatPrice(product.price)}
                  </p>
                </div>
              ))
            : [0, 1].map((i) => (
                <ProductCardSkeleton
                  key={i}
                  className="flex-shrink-0 w-[130px] aspect-[3/4]"
                />
              ))}
        </div>
      </section>

      {/* ================= Editorial Banner Placeholder — desktop/tablet ================= */}
      <section className="hidden md:block px-8 lg:px-14 py-10">
        <div className="max-w-[1440px] mx-auto relative h-[280px] overflow-hidden group bg-charcoal">
          {/* Placeholder image — swap with backend URL later */}
          <img
            src="https://img.magnific.com/free-psd/black-friday-facebook-cover-banner-template_120329-6569.jpg?semt=ais_test_b&w=740&q=80"
            alt="Mid-Season Sale"
            className="absolute inset-0 w-full h-full object-cover opacity-60 transition-transform duration-700 group-hover:scale-105"
          />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
            <p className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gold mb-4">
              Mid-Season Event
            </p>
            <h2 className="font-display text-white text-[42px] font-medium tracking-tight mb-6">
              The Archive Sale
            </h2>
            <button
              type="button"
              onClick={() => navigate("/all-products")}
              className="bg-cream text-ink text-[11px] font-semibold tracking-[0.1em] uppercase px-8 py-4 rounded-[3px] hover:bg-surface transition-colors"
            >
              Shop the Event
            </button>
          </div>
        </div>
      </section>

      {/* ================= Newsletter — desktop/tablet ================= */}
      <section className="hidden md:flex justify-center px-8 lg:px-14 py-14 bg-cream-dark border-y border-border">
        <div className="max-w-md text-center">
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-3">
            The Inner Circle
          </p>
          <h2 className="font-display text-[32px] font-medium text-ink mb-3">
            Join the Elite
          </h2>
          <p className="text-[13px] text-ink-soft leading-relaxed mb-8">
            Subscribe to receive first access to new collections, private sales,
            and curated style guides.
          </p>
          <div className="flex gap-2">
            <input
              type="email"
              placeholder="Enter your email"
              onChange={() => {}}
              className="flex-1 border border-border bg-cream px-5 py-3.5 text-[13px] text-ink outline-none focus:border-ink transition-colors rounded-[3px]"
            />
            <button
              type="button"
              onClick={() => {}}
              className="bg-charcoal text-cream text-[11px] font-semibold tracking-[0.1em] uppercase px-8 py-3.5 rounded-[3px] hover:bg-ink transition-colors"
            >
              Join
            </button>
          </div>
        </div>
      </section>

      {/* ================= Footer — mobile ================= */}
      <footer className="md:hidden bg-charcoal text-cream px-5 pt-16 pb-12">
        <span className="font-display text-[22px] font-medium tracking-[0.06em]">
          ZRIVE
        </span>
        <p className="text-[13px] leading-relaxed text-cream/70 mt-4 mb-10 max-w-[280px]">
          Curating the finest minimalist menswear for the global citizen.
        </p>
        <div className="grid grid-cols-2 gap-8 mb-12">
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-4">
              Company
            </h4>
            <ul className="space-y-3">
              {["About", "Journal", "Stores"].map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-[13px] text-cream/70 hover:text-cream transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-4">
              Support
            </h4>
            <ul className="space-y-3">
              {["Shipping", "Returns", "Contact"].map((label) => (
                <li key={label}>
                  <button
                    type="button"
                    onClick={() => {}}
                    className="text-[13px] text-cream/70 hover:text-cream transition-colors"
                  >
                    {label}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-cream/10 pt-6 flex items-center justify-between">
          <p className="text-[11px] text-cream/50">
            © 2026 ZRIVE. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ================= Footer — desktop/tablet ================= */}
      <footer className="hidden md:block bg-charcoal text-cream px-8 lg:px-14 pt-24 pb-12">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-12 mb-16">
            <div>
              <span className="font-display text-[24px] font-medium tracking-[0.06em]">
                ZRIVE
              </span>
              <p className="text-[13px] leading-relaxed text-cream/70 mt-4 max-w-xs">
                Elevated apparel for the modern professional. Defined by
                quality, driven by ambition.
              </p>
            </div>
            {[
              {
                title: "Shop",
                links: [
                  "Men's Collection",
                  "New Arrivals",
                  "Accessories",
                  "Sale",
                ],
              },
              {
                title: "Company",
                links: ["About ZRIVE", "Sustainability", "Stores", "Careers"],
              },
              {
                title: "Support",
                links: [
                  "Shipping & Returns",
                  "Privacy Policy",
                  "Contact Us",
                  "Size Guide",
                ],
              },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-5">
                  {title}
                </h4>
                <ul className="space-y-3">
                  {links.map((label) => (
                    <li key={label}>
                      <button
                        type="button"
                        onClick={() => {}}
                        className="text-[13px] text-cream/70 hover:text-cream transition-colors"
                      >
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-cream/10 pt-8 flex items-center justify-between">
            <p className="text-[11px] text-cream/50">
              © 2026 ZRIVE. All rights reserved.
            </p>
            <div className="flex items-center gap-6">
              {["Instagram", "Twitter", "Facebook"].map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {}}
                  className="text-[11px] font-medium uppercase tracking-[0.1em] text-cream/50 hover:text-cream transition-colors"
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;