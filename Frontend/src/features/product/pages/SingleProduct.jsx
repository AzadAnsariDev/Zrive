import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { useSelector } from 'react-redux'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  ChevronDown,
  Check,
  Image as ImageIcon,
  Share2,
  Shield,
  Truck,
  RefreshCw,
  Star,
  ShoppingBag,
  Zap,
} from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { formatPrice } from '../../home/pages/Home'
import useCart from '../../cart/hook/useCart'
import WishlistButton from '../../wishlist/components/WishlistButton'

const SIZE_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']

const ShakeKeyframes = () => (
  <style>{`
    @keyframes shakeX {
      10%, 90% { transform: translateX(-1px); }
      20%, 80% { transform: translateX(2px); }
      30%, 50%, 70% { transform: translateX(-4px); }
      40%, 60% { transform: translateX(4px); }
    }
    .shake-once { animation: shakeX 0.4s cubic-bezier(.36,.07,.19,.97) both; }
  `}</style>
)

const AccordionRow = ({ title, children, defaultOpen = false }) => {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <div className="border-b border-[#EAEAEA]">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between py-3.5 text-left"
      >
        <span className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">{title}</span>
        <ChevronDown size={14} className={`text-[#666] transition-transform duration-300 ${open ? 'rotate-180' : ''}`} />
      </button>
      <div className={`overflow-hidden transition-all duration-300 ${open ? 'max-h-96 pb-4 opacity-100' : 'max-h-0 opacity-0'}`}>
        <div className="text-[12.5px] leading-relaxed text-[#555]">{children}</div>
      </div>
    </div>
  )
}

const StockStatus = ({ variant, fallbackStatus }) => {
  if (!variant) {
    return fallbackStatus === 'In-Stock'
      ? <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#287A4B]"><span className="w-1.5 h-1.5 rounded-full bg-[#287A4B]" />Select size & color</span>
      : null
  }
  if (variant.stock === 0)
    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#C43D3D]"><span className="w-1.5 h-1.5 rounded-full bg-[#C43D3D]" />Out of Stock</span>
  if (variant.stock < 5)
    return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#A56A16]"><span className="w-1.5 h-1.5 rounded-full bg-[#A56A16] animate-pulse" />Only {variant.stock} left in stock</span>
  return <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-[#287A4B]"><span className="w-1.5 h-1.5 rounded-full bg-[#287A4B]" />In Stock</span>
}

const AddedToCartToast = ({ productName, visible }) => (
  <div className={`fixed bottom-20 md:bottom-8 left-1/2 -translate-x-1/2 z-50 transition-all duration-300 ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-3 pointer-events-none'}`}>
    <div className="flex items-center gap-3 bg-[#111111] text-white pl-4 pr-6 py-3 rounded-[6px] shadow-2xl whitespace-nowrap">
      <div className="w-4 h-4 rounded-full bg-[#287A4B] flex items-center justify-center shrink-0">
        <Check size={10} strokeWidth={3} />
      </div>
      <span className="text-[12.5px] font-medium">
        <span className="font-semibold">{productName}</span> added to bag
      </span>
    </div>
  </div>
)

const RelatedProductCard = ({ product }) => {
  const navigate = useNavigate()
  return (
    <div
      className="group cursor-pointer bg-white border border-[#EAEAEA] rounded-[8px] overflow-hidden hover:border-[#B08D57] transition-all"
      onClick={() => navigate(`/product/${product._id || product.id}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-[#FAFAFA]">
        {product.images?.[0]?.url ? (
          <img src={product.images[0].url} alt={product.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#999]">
            <ImageIcon size={20} strokeWidth={1} />
          </div>
        )}
        <WishlistButton productId={product._id} variantSku={product.variants?.[0]?.sku} className="absolute top-2.5 right-2.5 z-10" />
      </div>
      <div className="p-3">
        <p className="text-[9.5px] font-bold tracking-[0.12em] uppercase text-[#B08D57] mb-0.5 truncate">{product.brand || 'ZRIVE'}</p>
        <h3 className="font-display text-[13px] font-semibold text-[#111] mb-1 truncate">{product.name || product.title}</h3>
        <p className="text-[13.5px] font-bold text-[#111]">{formatPrice(product.price)}</p>
      </div>
    </div>
  )
}

const VariantSelector = ({ colors, sizesForColor, selectedColor, selectedSize, onSelectColor, onSelectSize, shakeSize, sizeError }) => (
  <div className="mt-5 space-y-4">
    {colors.length > 0 && (
      <div>
        <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#B08D57] mb-2">
          Color{selectedColor ? ` · ${selectedColor}` : ''}
        </p>
        <div className="flex flex-wrap gap-2">
          {colors.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => onSelectColor(color)}
              className={`px-3.5 py-1.5 text-[12px] font-medium rounded border transition-all ${
                color === selectedColor
                  ? 'bg-[#111111] text-white border-[#111111]'
                  : 'border-[#EAEAEA] text-[#111111] hover:border-[#111111]'
              }`}
            >
              {color}
            </button>
          ))}
        </div>
      </div>
    )}

    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10.5px] font-bold tracking-[0.1em] uppercase text-[#B08D57]">
          Select Size{selectedSize ? ` · ${selectedSize}` : ''}
        </p>
        <button type="button" className="text-[11px] underline text-[#666]">Size Chart</button>
      </div>
      <div className={`flex flex-wrap gap-2 ${shakeSize ? 'shake-once' : ''}`}>
        {sizesForColor.map(({ size, stock }) => (
          <button
            key={size}
            type="button"
            disabled={stock === 0}
            onClick={() => onSelectSize(size)}
            className={`min-w-[44px] h-10 px-3 text-[12px] font-semibold rounded border transition-all ${
              size === selectedSize
                ? sizeError
                  ? 'bg-[#C43D3D] text-white border-[#C43D3D]'
                  : 'bg-[#111111] text-white border-[#111111]'
                : stock === 0
                ? 'border-[#EAEAEA] text-[#ccc] line-through cursor-not-allowed'
                : 'border-[#EAEAEA] text-[#111111] hover:border-[#111111]'
            }`}
          >
            {size}
          </button>
        ))}
      </div>
      {sizeError && (
        <p className="mt-1.5 text-[11.5px] text-[#C43D3D]">Please select a size to continue.</p>
      )}
    </div>
  </div>
)

const SingleProduct = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const { handleGetProductDetail } = useProduct()

  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [toastVisible, setToastVisible] = useState(false)
  const toastTimeoutRef = useRef(null)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const [shakeSize, setShakeSize] = useState(false)

  async function fetchProductDetail() {
    const p = await handleGetProductDetail(productId)
    setProduct(p)
  }

  useEffect(() => { fetchProductDetail() }, [productId])
  useEffect(() => () => clearTimeout(toastTimeoutRef.current), [])
  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedColor(product.variants[0].color)
      setSelectedSize(product.variants[0].size)
    }
  }, [product])

  const variants = product?.variants ?? []
  const colors = [...new Set(variants.map(v => v.color))]
  const sizesForColor = variants
    .filter(v => v.color === selectedColor)
    .map(v => ({ size: v.size, stock: v.stock }))
    .sort((a, b) => {
      const ai = SIZE_ORDER.indexOf(a.size), bi = SIZE_ORDER.indexOf(b.size)
      return (ai === -1 || bi === -1) ? 0 : ai - bi
    })
  const selectedVariant = variants.find(v => v.color === selectedColor && v.size === selectedSize) ?? null

  useEffect(() => { setActiveImage(0) }, [selectedVariant])

  const images = selectedVariant?.images?.length ? selectedVariant.images
    : product?.images?.length ? product.images
    : [product?.image].filter(Boolean)

  const effectivePrice = selectedVariant?.price ?? product?.price
  const handlePrevImage = () => setActiveImage(i => (i - 1 + images.length) % images.length)
  const handleNextImage = () => setActiveImage(i => (i + 1) % images.length)
  const related = product?.relatedProducts ?? []
  const canAddToCart = variants.length === 0 || (selectedVariant && selectedVariant.stock > 0)

  useEffect(() => { if (canAddToCart) setSizeError(false) }, [canAddToCart])

  const { handleAddToCart } = useCart()
  const handleAddToBag = () => {
    if (!canAddToCart) { setSizeError(true); setShakeSize(true); return }
    handleAddToCart(product._id, selectedVariant._id)
    clearTimeout(toastTimeoutRef.current)
    setToastVisible(true)
    toastTimeoutRef.current = setTimeout(() => setToastVisible(false), 2200)
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-white">
        <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-10">
          <div className="h-4 w-28 bg-[#FAFAFA] rounded mb-6 animate-pulse" />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className="aspect-[3/4] bg-[#FAFAFA] rounded animate-pulse" />
            <div className="space-y-4">
              <div className="h-4 w-20 bg-[#FAFAFA] rounded" />
              <div className="h-8 w-3/4 bg-[#FAFAFA] rounded" />
              <div className="h-6 w-24 bg-[#FAFAFA] rounded" />
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white text-[#111111] min-h-screen pb-20 md:pb-12">
      <ShakeKeyframes />
      <AddedToCartToast productName={product.name || product.title} visible={toastVisible} />

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-[12px] text-[#666]">
          <button type="button" onClick={() => navigate(-1)} className="flex items-center gap-1 hover:text-[#111]">
            <ArrowLeft size={14} /> Back
          </button>
          <span>/</span>
          <Link to="/all-products" className="hover:text-[#111]">All Products</Link>
          <span>/</span>
          <span className="text-[#111] font-semibold truncate max-w-[200px]">{product.name || product.title}</span>
        </div>

        {/* Product Page Main Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-[auto_1fr_420px] gap-6 lg:gap-10">
          {/* Thumbnails rail (desktop) */}
          <div className="hidden lg:flex flex-col gap-2.5 w-16 shrink-0">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveImage(i)}
                className={`aspect-[3/4] rounded overflow-hidden border-2 transition-all ${
                  i === activeImage ? 'border-[#B08D57]' : 'border-transparent opacity-60 hover:opacity-100'
                }`}
              >
                <img src={img.url} alt="" className="w-full h-full object-cover" />
              </button>
            ))}
          </div>

          {/* Main Image Display */}
          <div className="relative">
            <div className="relative aspect-[3/4] max-h-[580px] overflow-hidden rounded-[8px] bg-[#FAFAFA] border border-[#EAEAEA]">
              {images[activeImage]?.url ? (
                <img src={images[activeImage].url} alt={product.name || product.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#999]">
                  <ImageIcon size={32} />
                </div>
              )}
              <WishlistButton
                productId={product._id}
                variantSku={selectedVariant?.sku || product.variants?.[0]?.sku}
                className="absolute top-4 right-4 z-10"
              />
              {images.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImage}
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Mobile Thumbnails */}
            {images.length > 1 && (
              <div className="lg:hidden flex gap-2 mt-3 overflow-x-auto no-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`w-14 h-18 rounded overflow-hidden border-2 shrink-0 ${
                      i === activeImage ? 'border-[#B08D57]' : 'border-transparent opacity-60'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right Product Details Info Panel */}
          <div className="space-y-4">
            <div>
              <p className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#B08D57] mb-1">
                {product.brand || 'ZRIVE'}
              </p>
              <h1 className="font-display text-[22px] md:text-[26px] font-bold text-[#111] leading-tight mb-2">
                {product.name || product.title}
              </h1>

              <div className="flex items-center gap-2 mb-3">
                <div className="flex items-center gap-0.5">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <Star key={i} size={13} fill={i <= 4 ? '#B08D57' : 'none'} stroke="#B08D57" strokeWidth={1.5} />
                  ))}
                </div>
                <span className="text-[12px] text-[#666]">(4.2 Rating) · 128 Reviews</span>
              </div>

              <div className="flex items-baseline gap-3 mb-2">
                <span className="text-[24px] font-bold text-[#111]">{formatPrice(effectivePrice)}</span>
                <span className="text-[13px] text-[#999] line-through">
                  {formatPrice({ amount: (effectivePrice?.amount || 0) * 1.2, currency: effectivePrice?.currency || 'INR' })}
                </span>
                <span className="text-[11px] font-bold text-[#287A4B] bg-[#EAF5EE] px-2 py-0.5 rounded">20% OFF</span>
              </div>

              <StockStatus variant={selectedVariant} fallbackStatus={product.status} />
            </div>

            {variants.length > 0 && (
              <VariantSelector
                colors={colors}
                sizesForColor={sizesForColor}
                selectedColor={selectedColor}
                selectedSize={selectedSize}
                onSelectColor={setSelectedColor}
                onSelectSize={setSelectedSize}
                shakeSize={shakeSize}
                sizeError={sizeError}
              />
            )}

            {/* CTAs (Desktop) */}
            <div className="hidden md:flex flex-col gap-2.5 pt-4">
              <button
                type="button"
                onClick={handleAddToBag}
                className="w-full flex items-center justify-center gap-2 py-3.5 rounded bg-[#111111] text-white text-[12.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>
            </div>

            {/* Accordions */}
            <div className="pt-4 border-t border-[#EAEAEA]">
              <AccordionRow title="Product Specifications" defaultOpen>
                {product.description || 'Premium tailored apparel designed with high-grade cotton blends and clean minimalist silhouettes.'}
              </AccordionRow>
              <AccordionRow title="Shipping & Returns">
                Free shipping on orders above ₹999. Standard delivery within 3–7 business days. Easy 7-day hassle-free returns.
              </AccordionRow>
            </div>
          </div>
        </div>

        {/* You May Also Like */}
        {related.length > 0 && (
          <div className="mt-14 pt-8 border-t border-[#EAEAEA]">
            <h2 className="text-[11px] font-bold tracking-[0.14em] uppercase text-[#B08D57] mb-6">
              You May Also Like
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {related.map((p) => <RelatedProductCard key={p._id || p.id} product={p} />)}
            </div>
          </div>
        )}
      </div>

      {/* Mobile Sticky Bottom CTA Bar */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-[#EAEAEA] p-3 flex items-center gap-3 shadow-2xl">
        <WishlistButton
          productId={product._id}
          variantSku={selectedVariant?.sku || product.variants?.[0]?.sku}
          className="w-12 h-12 rounded border border-[#EAEAEA] flex items-center justify-center shrink-0"
        />
        <button
          type="button"
          onClick={handleAddToBag}
          className="flex-1 flex items-center justify-center gap-2 py-3 bg-[#111111] text-white rounded text-[12px] font-bold uppercase tracking-[0.06em]"
        >
          <ShoppingBag size={15} />
          Add to Bag
        </button>
      </div>
    </div>
  )
}

export default SingleProduct