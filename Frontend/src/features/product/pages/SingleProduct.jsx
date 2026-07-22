import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  ChevronDown,
  Check,
  Star,
  Image as ImageIcon,
} from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { formatPrice } from '../../home/pages/Home'

// Sizes aren't in the backend yet — mocked so the UI/UX is complete and
// ready to wire once real size/stock data exists per product.
const MOCK_SIZES = ['S', 'M', 'L', 'XL']

// Fit-feedback bar is mocked too (no real "buyers' voice" data source yet).
const MOCK_FIT_FEEDBACK = { small: 14, true: 72, large: 14 }

const StarRating = ({ rating = 4.5, count = 0 }) => (
  <div className="flex items-center gap-1">
    {[0, 1, 2, 3, 4].map((i) => (
      <Star key={i} size={12} className={i < Math.round(rating) ? 'fill-black text-black' : 'fill-gray-200 text-gray-200'} />
    ))}
    {count > 0 && <span className="text-[12px] text-gray-500 ml-1">{rating} · {count} Ratings</span>}
  </div>
)

// Simple controlled accordion row — used for Product Description / Shipping.
const AccordionRow = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-gray-100">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-4 text-left"
      >
        <span className="text-[12px] font-semibold tracking-[0.1em] uppercase">{title}</span>
        <ChevronDown size={16} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      {open && <div className="pb-4 text-[13.5px] text-gray-600 leading-relaxed">{children}</div>}
    </div>
  )
}

// Premium bottom-center toast — auto-dismisses after 2s.
const AddedToCartToast = ({ productName, visible }) => (
  <div
    className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
    }`}
  >
    <div className="flex items-center gap-3 bg-black text-white pl-3.5 pr-5 py-3 rounded-full shadow-xl shadow-black/20 whitespace-nowrap">
      <span className="w-6 h-6 rounded-full bg-white/15 flex items-center justify-center flex-shrink-0">
        <Check size={13} strokeWidth={3} />
      </span>
      <span className="text-[13px] font-medium">
        <span className="font-semibold">{productName}</span> added to cart successfully
      </span>
    </div>
  </div>
)

const RelatedProductCard = ({ product }) => (
  <div>
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 mb-3">
      {product.images?.[0]?.url ? (
        <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon size={20} strokeWidth={1.5} className="text-gray-300" />
        </div>
      )}
    </div>
    <p className="text-[10.5px] font-semibold tracking-[0.08em] uppercase text-gray-400 mb-1">{product.category ?? 'Zrive'}</p>
    <h3 className="text-[13.5px] font-semibold">{product.name}</h3>
    <p className="text-[13px] text-gray-500 mt-0.5">{formatPrice(product.price)}</p>
  </div>
)

const SingleProduct = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleGetProductDetail } = useProduct()

  // NOTE: verify this matches your actual reducer key — adjust
  // `state.product.productDetail` if your slice names it differently.
  const [product, setProduct] = useState(null)

  const [selectedSize, setSelectedSize] = useState('M')
  const [activeImage, setActiveImage] = useState(0)
  const [wishlisted, setWishlisted] = useState(false)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimeoutRef = useRef(null)

  async function fetchProductDetail(){
    const product = await handleGetProductDetail(productId)
    setProduct(product)
  }

  useEffect(() => {
    fetchProductDetail()
  }, [productId])

  useEffect(() => {
    return () => clearTimeout(toastTimeoutRef.current)
  }, [])

  const images = product?.images?.length ? product.images : [product?.image].filter(Boolean)

  const handlePrevImage = () => setActiveImage((i) => (i - 1 + images.length) % images.length)
  const handleNextImage = () => setActiveImage((i) => (i + 1) % images.length)

  // "You May Also Like" needs the detail API to return related items
  // (e.g. `product.relatedProducts`) since we're no longer fetching the
  // full product list on this page. Section just won't render until the
  // backend includes that field.
  const related = product?.relatedProducts ?? []

  const discountPercent =
    product?.originalPrice && product?.price
      ? Math.round((1 - product.price / product.originalPrice) * 100)
      : null

  const handleAddToCart = () => {
    // TODO: dispatch the real add-to-cart action here.
    clearTimeout(toastTimeoutRef.current)
    setToastVisible(true)
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2000)
  }

  if (!product) {
    return <div className="max-w-[1440px] mx-auto px-5 md:px-14 py-16 animate-pulse text-gray-400">Loading product…</div>
  }

  return (
    <div className="bg-white text-black">
      <AddedToCartToast productName={product.name} visible={toastVisible} />

      {/* ================= MOBILE (< md) ================= */}
      <div className="md:hidden">
        <div className="px-5 pt-5">
          <button type="button" onClick={() => navigate('/all-products')} className="flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase text-gray-500 hover:text-black transition-colors">
            <ArrowLeft size={14} strokeWidth={2} />
            Back to Collection
          </button>
        </div>

        <div className="px-5 mt-4">
          <div className="relative aspect-[4/5] rounded-2xl overflow-hidden bg-gray-50">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={24} strokeWidth={1.5} className="text-gray-300" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setWishlisted((w) => !w)}
              aria-label="Add to wishlist"
              className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
            >
              <Heart size={16} strokeWidth={1.75} className={wishlisted ? 'fill-black text-black' : ''} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-14 h-16 rounded-lg overflow-hidden bg-gray-50 border-2 transition-colors ${
                    i === activeImage ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 mt-6">
          {product.tag && <p className="text-[11px] font-semibold tracking-[0.14em] uppercase text-gray-500 mb-1.5">{product.tag}</p>}
          <h1 className="text-[21px] font-extrabold tracking-tight leading-tight mb-2.5">{product.name}</h1>
          <div className="flex items-center gap-2.5">
            <span className="text-[19px] font-bold">{formatPrice(product.price)}</span>
            {product.originalPrice && <span className="text-[14px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>}
          </div>
        </div>

        <div className="px-5 mt-7">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase">Select Size</h2>
            <button type="button" onClick={() => {}} className="text-[12px] font-semibold underline">Size Chart</button>
          </div>
          <div className="flex gap-2.5">
            {MOCK_SIZES.map((size) => (
              <button
                key={size}
                type="button"
                onClick={() => setSelectedSize(size)}
                className={`w-12 h-12 rounded-xl border text-[13px] font-medium transition-colors ${
                  size === selectedSize ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-400'
                }`}
              >
                {size}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mt-4">
            <Check size={14} className="text-green-700 flex-shrink-0" />
            <p className="text-[12px] text-green-800 leading-snug">
              Based on your profile, we suggest size <strong>M</strong> for a tailored fit.
            </p>
          </div>
        </div>

        <div className="px-5 mt-6">
          <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase mb-3">Fit Feedback (Buyers' Voice)</h2>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-xl border border-gray-200 py-3">
              <p className="text-[11px] text-gray-500">Runs Small</p>
              <p className="text-[13px] font-semibold mt-0.5">{MOCK_FIT_FEEDBACK.small}%</p>
            </div>
            <div className="rounded-xl bg-green-600 text-white py-3">
              <p className="text-[11px]">True to Size</p>
              <p className="text-[13px] font-semibold mt-0.5">{MOCK_FIT_FEEDBACK.true}%</p>
            </div>
            <div className="rounded-xl border border-gray-200 py-3">
              <p className="text-[11px] text-gray-500">Runs Large</p>
              <p className="text-[13px] font-semibold mt-0.5">{MOCK_FIT_FEEDBACK.large}%</p>
            </div>
          </div>
        </div>

        <div className="px-5 mt-7 space-y-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full rounded-xl border-2 border-black py-4 text-[13.5px] font-bold tracking-wide uppercase hover:bg-gray-50 transition-colors"
          >
            Add to Bag
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="w-full rounded-xl bg-black text-white py-4 text-[13.5px] font-bold tracking-wide uppercase hover:opacity-90 active:scale-[0.99] transition-all"
          >
            Buy Now
          </button>
        </div>

        <div className="px-5 mt-8">
          <AccordionRow title="Product Description">
            {product.description ?? 'A refined, tailored piece built with premium materials and a clean, structured silhouette.'}
          </AccordionRow>
          <AccordionRow title="Shipping & Returns">
            Free shipping on orders above ₹999. Easy 14-day returns and exchanges.
          </AccordionRow>
        </div>
      </div>

      {/* ================= DESKTOP / TABLET (>= md) ================= */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-8 lg:px-14 py-4">
        <button type="button" onClick={() => navigate('/all-products')} className="flex mb-2 items-center gap-2 text-[12px] font-semibold tracking-wide uppercase text-gray-500 hover:text-black transition-colors">
          <ArrowLeft size={14} strokeWidth={2} />
          Back to Collection
        </button>
        <div className="grid grid-cols-[88px_1.2fr_1fr] gap-8">
          {/* Vertical thumbnail rail */}
          <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto no-scrollbar">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`w-20 aspect-square rounded-lg overflow-hidden bg-gray-50 border-2 flex-shrink-0 transition-colors ${
                  i === activeImage ? 'border-black' : 'border-transparent hover:border-gray-300'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Cover image — fixed height so it can't blow up the page, with
              prev/next arrows to cycle through the same images shown in
              the thumbnail rail. */}
          <div className="relative h-[600px] rounded-2xl overflow-hidden bg-gray-50">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={26} strokeWidth={1.5} className="text-gray-300" />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronLeft size={18} strokeWidth={2} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
                >
                  <ChevronRight size={18} strokeWidth={2} />
                </button>
              </>
            )}
          </div>

          {/* Sticky info panel */}
          <div className="sticky top-28 self-start">
            {product.title && <p className="text-[13px] font-semibold text-gray-500">{product.title}</p>}
            <h1 className="text-[24px] font-bold tracking-tight mt-1 mb-2">{product.name}</h1>
            <StarRating rating={product.rating} count={product.reviewCount} />

            <div className="flex items-center gap-3 mt-4">
              <span className="text-[22px] font-extrabold">{formatPrice(product.price)}</span>
              {product.originalPrice && (
                <>
                  <span className="text-[15px] text-gray-400 line-through">{formatPrice(product.originalPrice)}</span>
                  {discountPercent !== null && (
                    <span className="text-[13px] font-semibold text-green-700">{discountPercent}% off</span>
                  )}
                </>
              )}
            </div>

            <div className="mt-7">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase">Select Size</h2>
                <button type="button" onClick={() => {}} className="text-[12px] font-semibold underline">Size Chart</button>
              </div>
              <div className="flex gap-2.5">
                {MOCK_SIZES.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => setSelectedSize(size)}
                    className={`w-12 h-12 rounded-xl border text-[13px] font-medium transition-colors ${
                      size === selectedSize ? 'bg-black text-white border-black' : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {size}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2.5 bg-green-50 border border-green-100 rounded-xl px-4 py-3 mt-4">
                <Check size={14} className="text-green-700 flex-shrink-0" />
                <p className="text-[12px] text-green-800 leading-snug">
                  Based on your profile, we suggest size <strong>M</strong> for a tailored fit.
                </p>
              </div>
            </div>

            <div className="mt-6">
              <h2 className="text-[12px] font-semibold tracking-[0.1em] uppercase mb-3">Fit Feedback (Buyers' Voice)</h2>
              <div className="grid grid-cols-3 gap-2 text-center">
                <div className="rounded-xl border border-gray-200 py-3">
                  <p className="text-[11px] text-gray-500">Runs Small</p>
                  <p className="text-[13px] font-semibold mt-0.5">{MOCK_FIT_FEEDBACK.small}%</p>
                </div>
                <div className="rounded-xl bg-green-600 text-white py-3">
                  <p className="text-[11px]">True to Size</p>
                  <p className="text-[13px] font-semibold mt-0.5">{MOCK_FIT_FEEDBACK.true}%</p>
                </div>
                <div className="rounded-xl border border-gray-200 py-3">
                  <p className="text-[11px] text-gray-500">Runs Large</p>
                  <p className="text-[13px] font-semibold mt-0.5">{MOCK_FIT_FEEDBACK.large}%</p>
                </div>
              </div>
            </div>

            <div className="flex gap-3 mt-7">
              <button
                type="button"
                onClick={handleAddToCart}
                className="flex-1 rounded-xl border-2 border-black py-4 text-[13px] font-bold tracking-wide uppercase hover:bg-gray-50 transition-colors"
              >
                Add to Bag
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="flex-1 rounded-xl bg-black text-white py-4 text-[13px] font-bold tracking-wide uppercase hover:opacity-90 active:scale-[0.99] transition-all"
              >
                Buy Now
              </button>
            </div>

            <button
              type="button"
              onClick={() => setWishlisted((w) => !w)}
              className="flex items-center gap-2 text-[12.5px] font-medium text-gray-500 hover:text-black mt-4 transition-colors"
            >
              <Heart size={15} strokeWidth={1.75} className={wishlisted ? 'fill-black text-black' : ''} />
              {wishlisted ? 'Saved to wishlist' : 'Add to wishlist'}
            </button>

            <div className="mt-8">
              <AccordionRow title="Product Description" defaultOpen>
                {product.description ?? 'A refined, tailored piece built with premium materials and a clean, structured silhouette.'}
              </AccordionRow>
              <AccordionRow title="Shipping & Returns">
                Free shipping on orders above ₹999. Easy 14-day returns and exchanges.
              </AccordionRow>
            </div>
          </div>
        </div>
      </div>

      {/* ================= You May Also Like ================= */}
      {related.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 py-12 md:py-16 border-t border-gray-100 mt-8">
          <h2 className="text-[12px] font-semibold tracking-[0.14em] uppercase text-gray-500 mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 md:gap-7">
            {related.map((p) => <RelatedProductCard key={p._id ?? p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default SingleProduct