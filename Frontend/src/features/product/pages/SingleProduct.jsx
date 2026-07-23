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
  Image as ImageIcon,
} from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { formatPrice } from '../../home/pages/Home'

// Simple controlled accordion row — used for Product Description / Shipping.
const AccordionRow = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-border">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full flex items-center justify-between py-5 text-left"
      >
        <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold">{title}</span>
        <ChevronDown size={16} className={`text-ink-soft transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="text-[13px] text-ink-soft leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

// Info Row (Shipping / Returns / Authenticity) per spec
const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-4 border-t border-border">
    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-soft">{label}</span>
    <span className="text-[12px] text-ink-soft text-right">{value}</span>
  </div>
)

// Premium bottom-center toast — auto-dismisses after 2s.
const AddedToCartToast = ({ productName, visible }) => (
  <div
    className={`fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${
      visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'
    }`}
  >
    <div className="flex items-center gap-3 bg-charcoal text-cream pl-3.5 pr-5 py-3 rounded-[3px] shadow-xl shadow-black/10 whitespace-nowrap">
      <span className="w-5 h-5 rounded-full bg-cream/15 flex items-center justify-center flex-shrink-0">
        <Check size={12} strokeWidth={2.5} />
      </span>
      <span className="text-[13px] font-medium">
        <span className="font-semibold">{productName}</span> added to cart successfully
      </span>
    </div>
  </div>
)

const RelatedProductCard = ({ product }) => {
  const navigate = useNavigate()
  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/product/${product._id || product.id}`)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark mb-3">
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={20} strokeWidth={1} className="text-ink-soft" />
          </div>
        )}
      </div>
      <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">{product.brand || 'Generic'}</p>
      <h3 className="font-display text-[14px] text-ink mb-1 truncate">{product.name || product.title}</h3>
      <p className="font-sans text-[13px] font-semibold text-ink">{formatPrice(product.price)}</p>
    </div>
  )
}

const SingleProduct = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleGetProductDetail } = useProduct()

  const [product, setProduct] = useState(null)
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

  const related = product?.relatedProducts ?? []

  const handleAddToCart = () => {
    // TODO: dispatch the real add-to-cart action here.
    clearTimeout(toastTimeoutRef.current)
    setToastVisible(true)
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2000)
  }

  if (!product) {
    return <div className="min-h-screen bg-cream px-5 md:px-14 py-24 animate-pulse font-display text-[22px] text-ink-soft">Loading product…</div>
  }

  return (
    <div className="bg-cream text-ink min-h-screen">
      <AddedToCartToast productName={product.name || product.title} visible={toastVisible} />

      {/* ================= MOBILE (< md) ================= */}
      <div className="md:hidden">
        <div className="px-5 pt-6 pb-2">
          <button type="button" onClick={() => navigate('/all-products')} className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft hover:text-ink transition-colors">
            <ArrowLeft size={14} strokeWidth={2} />
            Back
          </button>
        </div>

        <div className="px-5 mt-2">
          <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.name || product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={24} strokeWidth={1} className="text-ink-soft" />
              </div>
            )}
            <button
              type="button"
              onClick={() => setWishlisted((w) => !w)}
              aria-label="Add to wishlist"
              className="absolute top-4 right-4 text-ink hover:text-gold transition-colors"
            >
              <Heart size={20} strokeWidth={1} className={wishlisted ? 'fill-gold text-gold' : ''} />
            </button>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2.5 mt-3 overflow-x-auto no-scrollbar pb-1">
              {images.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setActiveImage(i)}
                  className={`w-16 h-20 overflow-hidden bg-cream-dark border flex-shrink-0 transition-colors ${
                    i === activeImage ? 'border-charcoal' : 'border-transparent'
                  }`}
                >
                  <img src={img.url} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="px-5 mt-8">
          <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">
            {product.brand || 'Generic'}
          </p>
          <h1 className="font-display text-[26px] font-medium leading-tight mb-3">
            {product.name || product.title}
          </h1>
          <div className="font-sans text-[20px] font-semibold text-ink">
            {formatPrice(product.price)}
          </div>
          {product.status === 'In-Stock' && (
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-success mt-2">
              In Stock
            </div>
          )}
        </div>

        <div className="px-5 mt-10 space-y-3">
          <button
            type="button"
            onClick={handleAddToCart}
            className="w-full bg-charcoal text-cream rounded-[3px] py-4 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
          >
            Add to Bag
          </button>
          <button
            type="button"
            onClick={() => {}}
            className="w-full bg-transparent border border-charcoal text-charcoal rounded-[3px] py-4 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-cream-dark transition-colors"
          >
            Buy Now
          </button>
        </div>

        <div className="px-5 mt-12 mb-10">
          <AccordionRow title="The Details" defaultOpen>
            {product.description ?? 'A refined, tailored piece built with premium materials and a clean, structured silhouette.'}
          </AccordionRow>
          
          <div className="mt-8">
            <InfoRow label="Shipping" value="Complimentary over ₹15,000" />
            <InfoRow label="Returns" value="14 Days Exchange" />
            <InfoRow label="Authenticity" value="Verified Original" />
          </div>
        </div>
      </div>

      {/* ================= DESKTOP / TABLET (>= md) ================= */}
      <div className="hidden md:block max-w-[1440px] mx-auto px-8 lg:px-14 py-12">
        <button type="button" onClick={() => navigate('/all-products')} className="flex items-center gap-2 text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft hover:text-ink transition-colors mb-8">
          <ArrowLeft size={14} strokeWidth={2} />
          Back to Collection
        </button>
        
        <div className="grid grid-cols-[100px_1fr_400px] gap-10 xl:gap-16">
          {/* Vertical thumbnail rail */}
          <div className="flex flex-col gap-4 max-h-[600px] overflow-y-auto no-scrollbar pb-4">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`w-full aspect-[3/4] overflow-hidden bg-cream-dark border flex-shrink-0 transition-colors ${
                  i === activeImage ? 'border-charcoal' : 'border-transparent hover:border-border'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover opacity-80 hover:opacity-100" />
              </button>
            ))}
          </div>

          {/* Cover image — fixed max-height capped at 600px inside an aspect-[3/4] container */}
          <div className="relative w-full max-w-[500px] mx-auto aspect-[3/4] h-[600px] overflow-hidden bg-cream-dark">
            {images[activeImage]?.url ? (
              <img src={images[activeImage].url} alt={product.name || product.title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <ImageIcon size={32} strokeWidth={1} className="text-ink-soft" />
              </div>
            )}

            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={handlePrevImage}
                  aria-label="Previous image"
                  className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[3px] bg-cream/90 backdrop-blur flex items-center justify-center text-ink hover:bg-cream transition-colors"
                >
                  <ChevronLeft size={18} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  onClick={handleNextImage}
                  aria-label="Next image"
                  className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-[3px] bg-cream/90 backdrop-blur flex items-center justify-center text-ink hover:bg-cream transition-colors"
                >
                  <ChevronRight size={18} strokeWidth={1.5} />
                </button>
              </>
            )}
          </div>

          {/* Sticky info panel */}
          <div className="sticky top-32 self-start">
            <p className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">
              {product.brand || 'Generic'}
            </p>
            <h1 className="font-display text-[32px] font-medium leading-[1.1] text-ink mb-4">
              {product.name || product.title}
            </h1>
            
            <div className="font-sans text-[22px] font-semibold text-ink mb-2">
              {formatPrice(product.price)}
            </div>

            {product.status === 'In-Stock' && (
              <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-success mb-6">
                In Stock
              </div>
            )}

            <div className="flex flex-col gap-3 mt-10">
              <button
                type="button"
                onClick={handleAddToCart}
                className="w-full bg-charcoal text-cream rounded-[3px] py-4 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
              >
                Add to Bag
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="w-full bg-transparent border border-charcoal text-charcoal rounded-[3px] py-4 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-cream-dark transition-colors"
              >
                Buy Now
              </button>
            </div>

            <button
              type="button"
              onClick={() => setWishlisted((w) => !w)}
              className="flex items-center gap-2 mt-5 text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors"
            >
              <Heart size={14} strokeWidth={1.5} className={wishlisted ? 'fill-gold text-gold' : ''} />
              {wishlisted ? 'Saved to Wishlist' : 'Add to Wishlist'}
            </button>

            <div className="mt-12">
              <AccordionRow title="The Details" defaultOpen>
                {product.description ?? 'A refined, tailored piece built with premium materials and a clean, structured silhouette.'}
              </AccordionRow>
              
              <div className="mt-6 border-b border-border">
                <InfoRow label="Shipping" value="Complimentary over ₹15,000" />
                <InfoRow label="Returns" value="14 Days Exchange" />
                <InfoRow label="Authenticity" value="Verified Original" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ================= You May Also Like ================= */}
      {related.length > 0 && (
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 py-10 md:py-14 border-t border-border mt-6">
          <h2 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-6">You May Also Like</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 md:gap-5">
            {related.map((p) => <RelatedProductCard key={p._id ?? p.id} product={p} />)}
          </div>
        </div>
      )}
    </div>
  )
}

export default SingleProduct