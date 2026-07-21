import React from 'react'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { Heart, Plus, Star, Shirt, Footprints, Watch, User as UserIcon } from 'lucide-react'
import { useProduct } from '../../product/hook/useProduct'

// ---- Static content -------------------------------------------------------
// Categories aren't part of the product API, so they stay static. Mobile
// uses photo thumbnails, desktop uses icon tiles.
const MOBILE_CATEGORIES = [
  { id: 'shoes', label: 'Shoes', image: 'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?q=80&w=200&auto=format&fit=crop' },
  { id: 'hoodies', label: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?q=80&w=200&auto=format&fit=crop' },
  { id: 'pants', label: 'Pants', image: 'https://images.unsplash.com/photo-1602293589930-45821b319471?q=80&w=200&auto=format&fit=crop' },
  { id: 'jackets', label: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?q=80&w=200&auto=format&fit=crop' },
]

const DESKTOP_CATEGORIES = [
  { id: 'suits', label: 'Suits', icon: Shirt },
  { id: 'shoes', label: 'Shoes', icon: Footprints },
  { id: 'accessories', label: 'Accessories', icon: Watch },
  { id: 'casual', label: 'Casual', icon: UserIcon },
]

const HERO_TILE_IMAGES = [
  'https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop',
  'https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=500&auto=format&fit=crop',
]

// Countdown target for the flash-sale banner — replace with a real end
// timestamp from the backend once that exists (e.g. sale.endsAt).
const FLASH_SALE_DURATION_MS = (8 * 3600 + 42 * 60 + 8) * 1000

const useCountdown = (durationMs) => {
  const [remaining, setRemaining] = useState(durationMs)

  useEffect(() => {
    const target = Date.now() + durationMs
    const tick = () => setRemaining(Math.max(0, target - Date.now()))
    const interval = setInterval(tick, 1000)
    return () => clearInterval(interval)
  }, [durationMs])

  const totalSeconds = Math.floor(remaining / 1000)
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0')
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0')
  const seconds = String(totalSeconds % 60).padStart(2, '0')
  return { hours, minutes, seconds }
}

const ProductCardSkeleton = ({ className = '' }) => (
  <div className={`animate-pulse rounded-2xl bg-gray-100 ${className}`} />
)

const StarRating = ({ rating = 4.5, count = 0 }) => (
  <div className="flex items-center gap-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <Star
        key={i}
        size={11}
        className={i < Math.round(rating) ? 'fill-black text-black' : 'fill-gray-200 text-gray-200'}
      />
    ))}
    {count > 0 && <span className="text-[11px] text-gray-400 ml-1">({count})</span>}
  </div>
)

const Home = () => {

  const { handleGetProducts } = useProduct()

  // useEffect(() => {
  //   handleGetProducts()
  // }, [])

  const products = useSelector((state) => state.product.products)
  const { hours, minutes, seconds } = useCountdown(FLASH_SALE_DURATION_MS)

  // ---- Data slices ----------------------------------------------------
  // Fields assumed on each product: id, name, price, image, and optionally
  // brand, tag, rating, reviewCount, originalPrice, discountLabel. Missing
  // optional fields just don't render that piece of UI.
  const trendingHero = products?.[0]
  const trendingGridMobile = products?.slice(1, 3) ?? []
  const trendingGridDesktop = products?.slice(0, 4) ?? []
  const forYou = products?.slice(3, 6) ?? []
  const recentlyViewed = products?.slice(0, 4) ?? []

  return (
    <div className="bg-white text-black">
      {/* ================= HERO — mobile ================= */}
      <section className="md:hidden relative">
        <img
          src="https://images.unsplash.com/photo-1617137968427-85924c800a22?q=80&w=1200&auto=format&fit=crop"
          alt="Essentials for the modern man"
          className="w-full h-[440px] object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
        <div className="absolute bottom-7 left-5 right-5">
          <h1 className="text-white text-[28px] font-extrabold leading-[1.1] tracking-tight mb-5">
            ESSENTIALS
            <br />
            FOR THE MODERN
            <br />
            MAN
          </h1>
          <button
            type="button"
            onClick={() => { }}
            className="bg-white text-black text-[12.5px] font-semibold tracking-[0.08em] uppercase px-6 py-3.5 rounded-full hover:opacity-90 active:scale-[0.98] transition-all"
          >
            Shop the Collection
          </button>
        </div>
      </section>

      {/* ================= HERO — desktop/tablet ================= */}
      {/*
  Layout matches the design:
    • Left ~40% — dark overlay panel with large headline + CTA
    • Right ~60% — 2 columns × 3 rows of portrait-ratio fashion images
*/}
      <section className="hidden md:flex relative overflow-hidden" style={{ height: '72vh', minHeight: '520px', maxHeight: '780px' }}>
        {/* ── Left text panel ── */}
        <div className="relative flex flex-col justify-end p-10 lg:p-14" style={{ width: '38%', flexShrink: 0 }}>
          <img
            src={HERO_TILE_IMAGES[0]}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-black/60" />
          <div className="relative z-10">
            <span className="text-[11px] font-semibold tracking-[0.18em] uppercase text-neutral-300 mb-3 block">
              New Collection 2026
            </span>
            <h1 className="text-white font-black leading-[0.95] tracking-tight mb-6"
              style={{ fontSize: 'clamp(2.6rem, 4.5vw, 5rem)' }}>
              THE MODERN
              <br />
              MASCULINE.
            </h1>
            <button
              type="button"
              onClick={() => { }}
              className="w-fit bg-white text-black text-[11.5px] font-semibold tracking-[0.12em] uppercase px-7 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Shop Now
            </button>
          </div>
        </div>

        {/* ── Right image grid: 2 cols × 3 rows ── */}
        <div className="flex-1 grid grid-cols-2 grid-rows-3 gap-[2px]" style={{ minWidth: 0 }}>
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="relative overflow-hidden">
              <img
                src={HERO_TILE_IMAGES[i % HERO_TILE_IMAGES.length]}
                alt=""
                className="absolute inset-0 w-full h-full object-cover opacity-90"
              />
              <div className="absolute inset-0 bg-black/30" />
              <div className="absolute top-2.5 left-3 text-[9px] font-bold tracking-widest text-white/70 uppercase">ZRIVE</div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= Categories — mobile (photo circles) ================= */}
      <section className="md:hidden px-5 pt-10 pb-2">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-gray-500">Categories</h2>
          <button type="button" onClick={() => { }} className="text-[12.5px] font-medium text-gray-500 hover:text-black transition-colors">
            View All
          </button>
        </div>
        <div className="flex gap-5 overflow-x-auto no-scrollbar -mx-5 px-5 pb-1">
          {MOBILE_CATEGORIES.map((cat) => (
            <button key={cat.id} type="button" onClick={() => { }} className="flex flex-col items-center gap-2.5 flex-shrink-0">
              <span className="w-16 h-16 rounded-full overflow-hidden bg-gray-100 border border-gray-100">
                <img src={cat.image} alt={cat.label} className="w-full h-full object-cover" />
              </span>
              <span className="text-[12px] font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= Categories — desktop/tablet (icon tiles) ================= */}
      <section className="hidden md:block px-8 lg:px-14 py-14">
        <div className="max-w-[1440px] mx-auto grid grid-cols-4 gap-6">
          {DESKTOP_CATEGORIES.map(({ id, label, icon: Icon }) => (
            <button
              key={id}
              type="button"
              onClick={() => { }}
              className="flex flex-col items-center gap-3 py-2 hover:opacity-70 transition-opacity"
            >
              <Icon size={26} strokeWidth={1.25} />
              <span className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-600">{label}</span>
            </button>
          ))}
        </div>
      </section>

      {/* ================= Banner grid — desktop/tablet only ================= */}
      <section className="hidden md:block px-8 lg:px-14 pb-14">
        <div className="max-w-[1440px] mx-auto grid grid-cols-2 gap-6">
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1500673922987-e212871fec22?q=80&w=900&auto=format&fit=crop"
              alt="Summer Essentials"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7">
              <h3 className="text-white text-[22px] font-bold tracking-tight mb-1">Summer Essentials</h3>
              <button type="button" onClick={() => { }} className="text-[12px] font-semibold tracking-[0.08em] uppercase text-white border-b border-white/60 pb-0.5 hover:border-white transition-colors">
                Explore Collection
              </button>
            </div>
          </div>
          <div className="relative aspect-[4/3] rounded-2xl overflow-hidden group">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=900&auto=format&fit=crop"
              alt="Tailored Suits"
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute bottom-7 left-7">
              <h3 className="text-white text-[22px] font-bold tracking-tight mb-1">Tailored Suits</h3>
              <button type="button" onClick={() => { }} className="text-[12px] font-semibold tracking-[0.08em] uppercase text-white border-b border-white/60 pb-0.5 hover:border-white transition-colors">
                View Craftsmanship
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ================= Trending Now — mobile ================= */}
      <section className="md:hidden px-5 pt-9">
        <h2 className="text-[19px] font-extrabold tracking-tight mb-5">Trending Now</h2>

        {trendingHero ? (
          <div className="relative rounded-2xl overflow-hidden bg-gray-50 mb-4">
            <div className="relative aspect-[4/5]">
              <img src={trendingHero.image} alt={trendingHero.name} className="w-full h-full object-cover" />
              <button type="button" aria-label="Add to wishlist" onClick={() => { }} className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors">
                <Heart size={16} strokeWidth={1.75} />
              </button>
              <button type="button" aria-label="Quick add to cart" onClick={() => { }} className="absolute bottom-4 right-4 w-11 h-11 rounded-full bg-black text-white flex items-center justify-center hover:opacity-90 active:scale-95 transition-all">
                <Plus size={18} strokeWidth={2} />
              </button>
            </div>
            <div className="px-1 pt-3.5 pb-1">
              {trendingHero.tag && <span className="text-[10.5px] font-semibold tracking-[0.1em] uppercase text-gray-500">{trendingHero.tag}</span>}
              <h3 className="text-[15px] font-semibold mt-0.5">{trendingHero.name}</h3>
              <p className="text-[14px] text-gray-500 mt-0.5">${trendingHero.price}</p>
            </div>
          </div>
        ) : (
          <ProductCardSkeleton className="aspect-[4/5] mb-4" />
        )}

        <div className="grid grid-cols-2 gap-4 mt-2">
          {trendingGridMobile.length > 0
            ? trendingGridMobile.map((product) => (
              <div key={product.id}>
                <div className="relative aspect-square rounded-2xl overflow-hidden bg-gray-50 mb-2.5">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  <button type="button" aria-label="Add to wishlist" onClick={() => { }} className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors">
                    <Heart size={14} strokeWidth={1.75} />
                  </button>
                </div>
                <h3 className="text-[13.5px] font-medium">{product.name}</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">${product.price}</p>
              </div>
            ))
            : [0, 1].map((i) => <ProductCardSkeleton key={i} className="aspect-square" />)}
        </div>
      </section>

      {/* ================= Trending Now — desktop/tablet (4-col, ratings, badges) ================= */}
      <section className="hidden md:block px-8 lg:px-14 py-14">
        <div className="max-w-[1440px] mx-auto">
          <div className="flex items-end justify-between mb-6">
            <div>
              <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-1.5">Curated For You</p>
              <h2 className="text-[26px] font-extrabold tracking-tight">Trending Now</h2>
            </div>
            <button type="button" onClick={() => { }} className="text-[12.5px] font-semibold tracking-wide uppercase text-gray-500 hover:text-black transition-colors">
              View All
            </button>
          </div>

          <div className="grid grid-cols-4 gap-6">
            {trendingGridDesktop.length > 0
              ? trendingGridDesktop.map((product) => (
                <div key={product.id}>
                  <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 mb-3.5">
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                    {product.tag && (
                      <span className="absolute top-3 left-3 bg-black text-white text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded">
                        {product.tag}
                      </span>
                    )}
                    {product.discountLabel && (
                      <span className="absolute top-3 left-3 bg-red-600 text-white text-[10px] font-bold tracking-wide uppercase px-2 py-1 rounded">
                        {product.discountLabel}
                      </span>
                    )}
                    <button type="button" aria-label="Add to wishlist" onClick={() => { }} className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors">
                      <Heart size={14} strokeWidth={1.75} />
                    </button>
                  </div>
                  <p className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-gray-400 mb-1">
                    {product.brand ?? 'Zrive Essentials'}
                  </p>
                  <h3 className="text-[14px] font-semibold mb-1.5">{product.name}</h3>
                  <StarRating rating={product.rating} count={product.reviewCount} />
                  <div className="flex items-center gap-2 mt-1.5">
                    <span className="text-[14px] font-semibold">${product.price}</span>
                    {product.originalPrice && (
                      <span className="text-[12.5px] text-gray-400 line-through">${product.originalPrice}</span>
                    )}
                  </div>
                </div>
              ))
              : [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} className="aspect-[3/4]" />)}
          </div>
        </div>
      </section>

      {/* ================= For You — mobile only ================= */}
      <section className="md:hidden pt-11 pb-11">
        <div className="px-5 mb-5">
          <h2 className="text-[19px] font-extrabold tracking-tight">For You</h2>
          <p className="text-[13px] text-gray-500 mt-0.5">Based on your recent browsing</p>
        </div>
        <div className="flex gap-4 overflow-x-auto no-scrollbar px-5 pb-1">
          {forYou.length > 0
            ? forYou.map((product) => (
              <div key={product.id} className="flex-shrink-0 w-[150px]">
                <div className="aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50 mb-2.5">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                </div>
                <h3 className="text-[13px] font-medium truncate">{product.name}</h3>
                <p className="text-[13px] text-gray-500 mt-0.5">${product.price}</p>
              </div>
            ))
            : [0, 1].map((i) => <ProductCardSkeleton key={i} className="flex-shrink-0 w-[150px] aspect-[4/5]" />)}
        </div>
      </section>

      {/* ================= Flash Sale — desktop/tablet only ================= */}
      <section className="hidden md:block px-8 lg:px-14 py-14">
        <div className="max-w-[1440px] mx-auto bg-black rounded-3xl overflow-hidden grid grid-cols-[1fr_360px] items-center">
          <div className="p-12 lg:p-16">
            <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-neutral-400 mb-3">
              Limited Time Opportunity
            </p>
            <h2 className="text-white text-[32px] lg:text-[38px] font-extrabold tracking-tight leading-[1.05] mb-4">
              MID-SEASON FLASH
              <br />
              SALE
            </h2>
            <p className="text-[14px] text-neutral-400 max-w-md mb-8 leading-relaxed">
              Exclusive access to selected luxury pieces with up to 40% reduction. Refine your wardrobe for the season ahead.
            </p>
            <div className="flex items-center gap-6">
              {[
                { value: hours, label: 'Hrs' },
                { value: minutes, label: 'Mins' },
                { value: seconds, label: 'Secs' },
              ].map(({ value, label }) => (
                <div key={label} className="text-center">
                  <div className="text-white text-[28px] font-extrabold tabular-nums">{value}</div>
                  <div className="text-[10px] font-semibold tracking-[0.1em] uppercase text-neutral-500 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
          <div className="relative h-full min-h-[320px]">
            <img
              src="https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=800&auto=format&fit=crop"
              alt="Flash sale"
              className="absolute inset-0 w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-black/30" />
            <button
              type="button"
              onClick={() => { }}
              className="absolute bottom-8 left-1/2 -translate-x-1/2 bg-white text-black text-[12px] font-semibold tracking-[0.08em] uppercase px-6 py-3 rounded-full hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Shop the Sale
            </button>
          </div>
        </div>
      </section>

      {/* ================= Newsletter — desktop/tablet only ================= */}
      <section className="hidden md:flex justify-center px-8 lg:px-14 py-16 bg-gray-50">
        <div className="max-w-lg text-center">
          <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-3">The Inner Circle</p>
          <h2 className="text-[26px] font-extrabold tracking-tight mb-3">Join the Elite</h2>
          <p className="text-[13.5px] text-gray-500 leading-relaxed mb-7">
            Subscribe to receive first access to new collections, private sales, and curated style guides.
          </p>
          <div className="flex gap-3">
            <input
              type="email"
              placeholder="Enter your email"
              onChange={() => { }}
              className="flex-1 rounded-full border border-gray-200 bg-white px-5 py-3 text-[13px] outline-none focus:ring-2 focus:ring-black/10 transition-shadow"
            />
            <button
              type="button"
              onClick={() => { }}
              className="bg-black text-white text-[12.5px] font-semibold tracking-[0.08em] uppercase px-7 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              Join
            </button>
          </div>
        </div>
      </section>

      {/* ================= Recently Viewed — desktop/tablet only ================= */}
      <section className="hidden md:block px-8 lg:px-14 py-14">
        <div className="max-w-[1440px] mx-auto">
          <h2 className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-400 mb-5">Recently Viewed</h2>
          <div className="grid grid-cols-4 gap-6">
            {recentlyViewed.length > 0
              ? recentlyViewed.map((product) => (
                <div key={product.id} className="aspect-square rounded-2xl overflow-hidden bg-gray-50">
                  <img src={product.image} alt={product.name} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                </div>
              ))
              : [0, 1, 2, 3].map((i) => <ProductCardSkeleton key={i} className="aspect-square" />)}
          </div>
        </div>
      </section>

      {/* ================= Footer — mobile ================= */}
      <footer className="md:hidden bg-black text-white px-5 pt-12 pb-8">
        <span className="text-[17px] font-extrabold tracking-[0.08em]">ZRIVE</span>
        <p className="text-[13px] leading-relaxed text-neutral-400 mt-3 mb-9 max-w-[280px]">
          Curating the finest minimalist menswear for the global citizen.
        </p>
        <div className="grid grid-cols-2 gap-6 mb-9">
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-neutral-500 mb-3.5">Company</h4>
            <ul className="space-y-2.5">
              {['About', 'Journal', 'Stores'].map((label) => (
                <li key={label}><button type="button" onClick={() => { }} className="text-[13.5px] text-neutral-300 hover:text-white transition-colors">{label}</button></li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-neutral-500 mb-3.5">Support</h4>
            <ul className="space-y-2.5">
              {['Shipping', 'Returns', 'Contact'].map((label) => (
                <li key={label}><button type="button" onClick={() => { }} className="text-[13.5px] text-neutral-300 hover:text-white transition-colors">{label}</button></li>
              ))}
            </ul>
          </div>
        </div>
        <div className="border-t border-neutral-800 pt-6">
          <button type="button" onClick={() => { }} className="text-[12.5px] text-neutral-400 hover:text-white transition-colors">
            United States | EN
          </button>
        </div>
        <p className="text-[11.5px] text-neutral-500 mt-5">© 2026 ZRIVE. All rights reserved.</p>
      </footer>

      {/* ================= Footer — desktop/tablet ================= */}
      <footer className="hidden md:block bg-gray-50 px-8 lg:px-14 pt-16 pb-10">
        <div className="max-w-[1440px] mx-auto">
          <div className="grid grid-cols-[1.4fr_1fr_1fr_1fr] gap-10 mb-12">
            <div>
              <span className="text-[17px] font-extrabold tracking-[0.08em]">ZRIVE</span>
              <p className="text-[13.5px] leading-relaxed text-gray-500 mt-3 max-w-xs">
                Elevated apparel for the modern professional. Defined by quality, driven by ambition.
              </p>
            </div>
            {[
              { title: 'Shop', links: ["Men's Collection", 'New Arrivals', 'Accessories', 'Sale'] },
              { title: 'Company', links: ['About ZRIVE', 'Sustainability', 'Stores', 'Careers'] },
              { title: 'Support', links: ['Shipping & Returns', 'Privacy Policy', 'Contact Us', 'Size Guide'] },
            ].map(({ title, links }) => (
              <div key={title}>
                <h4 className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-400 mb-4">{title}</h4>
                <ul className="space-y-2.5">
                  {links.map((label) => (
                    <li key={label}>
                      <button type="button" onClick={() => { }} className="text-[13.5px] text-gray-600 hover:text-black transition-colors">
                        {label}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="border-t border-gray-200 pt-6 flex items-center justify-between">
            <p className="text-[12px] text-gray-500">© 2026 ZRIVE. All rights reserved.</p>
            <div className="flex items-center gap-5">
              {['Instagram', 'Twitter', 'Facebook'].map((label) => (
                <button key={label} type="button" onClick={() => { }} className="text-[12px] text-gray-500 hover:text-black transition-colors">
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default Home