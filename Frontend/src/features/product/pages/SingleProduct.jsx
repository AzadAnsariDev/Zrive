import React, { useEffect, useRef, useState } from 'react'
import { useNavigate, useParams, Link } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Heart,
  ChevronDown,
  Image as ImageIcon,
  Share2,
  Shield,
  Truck,
  RefreshCw,
  Star,
  ShoppingBag,
  Zap,
  Ruler,
} from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { formatPrice } from '../../home/pages/Home'
import useCart from '../../cart/hook/useCart'
import useAddress from '../../address/hook/useAddress'
import { setSelectedAddress } from '../../address/state/addressSlice'
import WishlistButton from '../../wishlist/components/WishlistButton'
import SizeChartModal, {
  isCategoryWithoutSizeChart,
  isFootwearCategory,
} from '../components/SizeChartModal'
import { notify } from '../../../utils/toast'
import { useReview } from '../../review/hook/useReview'
import ReviewSummary from '../../review/components/ReviewSummary'
import ReviewList from '../../review/components/ReviewList'
import ReviewForm from '../../review/components/ReviewForm'
import { SingleProductSkeleton } from '../../../components/common/Skeleton'

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
        className="w-full flex items-center justify-between py-3.5 text-left cursor-pointer"
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
      ? <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#287A4B]"><span className="w-2 h-2 rounded-full bg-[#287A4B]" />Select size & color</span>
      : null
  }
  if (variant.stock === 0)
    return <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#C43D3D]"><span className="w-2 h-2 rounded-full bg-[#C43D3D]" />Out of Stock</span>
  if (variant.stock < 5)
    return <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#A56A16]"><span className="w-2 h-2 rounded-full bg-[#A56A16] animate-pulse" />Only {variant.stock} left in stock</span>
  return <span className="inline-flex items-center gap-1.5 text-[11.5px] font-semibold text-[#287A4B]"><span className="w-2 h-2 rounded-full bg-[#287A4B]" />In Stock</span>
}

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

const VariantSelector = ({
  colors,
  sizesForColor,
  selectedColor,
  selectedSize,
  onSelectColor,
  onSelectSize,
  shakeSize,
  sizeError,
  category,
  onOpenSizeChart,
}) => {
  const isSizeChartHidden = isCategoryWithoutSizeChart(category)

  return (
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
                className={`px-3.5 py-1.5 text-[12px] font-medium rounded border transition-all cursor-pointer ${
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
          {isSizeChartHidden ? (
            <span className="text-[11px] font-medium text-[#999999] opacity-40 cursor-not-allowed select-none">
              Size Chart (N/A)
            </span>
          ) : (
            <button
              type="button"
              onClick={onOpenSizeChart}
              className="text-[11.5px] font-bold text-[#111111] underline hover:text-[#B08D57] transition-colors flex items-center gap-1 cursor-pointer"
            >
              <Ruler size={13} className="text-[#B08D57]" />
              Size Chart
            </button>
          )}
        </div>
        <div className={`flex flex-wrap gap-2 ${shakeSize ? 'shake-once' : ''}`}>
          {sizesForColor.map(({ size, stock }) => (
            <button
              key={size}
              type="button"
              disabled={stock === 0}
              onClick={() => onSelectSize(size)}
              className={`min-w-[44px] h-10 px-3.5 text-[12px] font-semibold rounded border transition-all cursor-pointer ${
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
}

const SingleProduct = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const dispatch = useDispatch()
  const { handleGetProductDetail } = useProduct()
  const { handleGetAllAddresses } = useAddress()
  const { handleGetProductReviews, handleCheckEligibility, handleCreateReview } = useReview()

  const [product, setProduct] = useState(null)
  const [activeImage, setActiveImage] = useState(0)
  const [sizeChartOpen, setSizeChartOpen] = useState(false)
  const [selectedColor, setSelectedColor] = useState(null)
  const [selectedSize, setSelectedSize] = useState(null)
  const [sizeError, setSizeError] = useState(false)
  const [shakeSize, setShakeSize] = useState(false)
  const [isBuyingNow, setIsBuyingNow] = useState(false)

  const [showReviewForm, setShowReviewForm] = useState(false)
  const [reviews, setReviews] = useState([])
  const [reviewPagination, setReviewPagination] = useState({ total: 0, page: 1, totalPages: 1 })
  const [reviewsLoading, setReviewsLoading] = useState(false)
  const [canReview, setCanReview] = useState(false)
  const [submittingReview, setSubmittingReview] = useState(false)

  const addresses = useSelector((state) => state.address?.addresses ?? [])
  const selectedAddress = useSelector((state) => state.address?.selectedAddress)
  const isLoggedIn = useSelector((state) => state.auth?.user)

  async function fetchProductDetail() {
    try {
      const p = await handleGetProductDetail(productId)
      setProduct(p)
    } catch (err) {
      notify.error(err, "Could not load product details.")
    }
  }

  useEffect(() => { fetchProductDetail() }, [productId])

  useEffect(() => {
    if (product?.variants?.length) {
      setSelectedColor(product.variants[0].color)
      setSelectedSize(product.variants[0].size)
    }
  }, [product])

  useEffect(() => {
    if (!productId) return
    loadReviews(1)
    if (isLoggedIn) {
      handleCheckEligibility(productId).then((res) => {
        if (res) setCanReview(res.canReview)
      })
    }
  }, [productId, isLoggedIn])

  const loadReviews = async (page = 1) => {
    setReviewsLoading(true)
    const result = await handleGetProductReviews(productId, { page, limit: 5 })
    if (result) {
      setReviews((prev) => (page === 1 ? result.reviews : [...prev, ...result.reviews]))
      setReviewPagination(result.pagination)
    }
    setReviewsLoading(false)
  }

  const handleSubmitReview = async (data) => {
    setSubmittingReview(true)
    try {
      await handleCreateReview(productId, data)
      setShowReviewForm(false)
      setCanReview(false)
      loadReviews(1)
      fetchProductDetail()
      notify.success("Review submitted!")
    } catch (err) {
      throw err
    } finally {
      setSubmittingReview(false)
    }
  }

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

  const handleAddToBag = async () => {
    if (!canAddToCart) {
      setSizeError(true)
      setShakeSize(true)
      notify.error("Please select a size to continue.")
      return
    }
    try {
      await handleAddToCart(product._id, selectedVariant?._id)
      notify.success("Added to bag")
    } catch (err) {
      notify.error(err, "Could not add product to bag.")
    }
  }

  const handleBuyNow = async () => {
    if (!canAddToCart) {
      setSizeError(true)
      setShakeSize(true)
      notify.error("Please select a size to continue.")
      return
    }
    setIsBuyingNow(true)
    try {
      await handleAddToCart(product._id, selectedVariant?._id)

      let deliveryAddress = selectedAddress
      let availableAddresses = addresses

      if (!deliveryAddress && availableAddresses.length === 0) {
        const result = await handleGetAllAddresses()
        availableAddresses = result?.addresses || []
      }

      if (!deliveryAddress) {
        deliveryAddress = availableAddresses.find((address) => address.isDefault) || availableAddresses[0]
      }

      if (deliveryAddress) {
        dispatch(setSelectedAddress(deliveryAddress))
        navigate('/order-summary', { state: { address: deliveryAddress } })
      } else {
        navigate('/address')
      }
    } catch (err) {
      notify.error(err, "Something went wrong. Redirecting to cart.")
      navigate('/cart')
    } finally {
      setIsBuyingNow(false)
    }
  }

  if (!product) {
    return <SingleProductSkeleton />
  }

  return (
    <div className="bg-white text-[#111111] min-h-screen pb-24 md:pb-12">
      <ShakeKeyframes />

      {sizeChartOpen && (
        <SizeChartModal
          onClose={() => setSizeChartOpen(false)}
          category={product.category}
          selectedSize={selectedSize}
        />
      )}

      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-4 md:py-8">
        {/* Responsive Breadcrumb */}
        <div className="flex items-center gap-2 mb-6 text-[12px] text-[#666]">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="flex items-center gap-1 font-semibold text-[#111111] hover:text-[#B08D57] transition-colors cursor-pointer"
          >
            <ArrowLeft size={16} />
            <span>Back</span>
          </button>
          <span className="hidden sm:inline">/</span>
          <Link to="/all-products" className="hidden sm:inline hover:text-[#111]">All Products</Link>
          <span className="hidden sm:inline">/</span>
          <span className="hidden sm:inline text-[#111] font-semibold truncate max-w-[240px]">{product.name || product.title}</span>
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
                className={`aspect-[3/4] rounded overflow-hidden border-2 transition-all cursor-pointer ${
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
                    className="absolute left-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white cursor-pointer"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImage}
                    className="absolute right-3 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 flex items-center justify-center shadow hover:bg-white cursor-pointer"
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
                    className={`w-14 h-18 rounded overflow-hidden border-2 shrink-0 cursor-pointer ${
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

              {product.totalReviews > 0 ? (
                <div className="flex items-center gap-2 mb-3">
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} size={13} fill={i <= Math.round(product.avgRating) ? '#B08D57' : 'none'} stroke="#B08D57" strokeWidth={1.5} />
                    ))}
                  </div>
                  <span className="text-[12px] text-[#666]">
                    ({product.avgRating.toFixed(1)} Rating) · {product.totalReviews} {product.totalReviews === 1 ? 'Review' : 'Reviews'}
                  </span>
                </div>
              ) : (
                <p className="text-[11.5px] font-medium text-[#999] mb-3">Be the first to believe in this piece</p>
              )}

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
                category={product.category}
                onOpenSizeChart={() => setSizeChartOpen(true)}
              />
            )}

            {/* CTAs (Desktop) */}
            <div className="hidden md:grid grid-cols-2 gap-3 pt-4">
              <button
                type="button"
                onClick={handleAddToBag}
                className="flex items-center justify-center gap-2 py-3.5 rounded-lg border-2 border-[#111111] bg-white text-[#111111] text-[12.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#F9F9F9] active:scale-[0.99] transition-all cursor-pointer"
              >
                <ShoppingBag size={16} />
                Add to Bag
              </button>

              <button
                type="button"
                onClick={handleBuyNow}
                disabled={isBuyingNow}
                className="flex items-center justify-center gap-2 py-3.5 rounded-lg bg-[#111111] text-white text-[12.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] active:scale-[0.99] transition-all shadow-sm disabled:opacity-50 cursor-pointer"
              >
                <Zap size={16} className="fill-current" />
                {isBuyingNow ? 'Processing...' : 'Buy Now'}
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

        {/* Ratings & Reviews */}
        <ReviewSummary
          product={product}
          canReview={canReview}
          onWriteReview={() => setShowReviewForm(true)}
        />
        <ReviewList
          reviews={reviews}
          pagination={reviewPagination}
          onLoadMore={() => loadReviews(reviewPagination.page + 1)}
          loading={reviewsLoading}
        />

        {showReviewForm && (
          <ReviewForm
            onClose={() => setShowReviewForm(false)}
            onSubmit={handleSubmitReview}
            submitting={submittingReview}
          />
        )}

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
      <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-[#EAEAEA] px-3.5 py-2.5 pb-[max(0.625rem,env(safe-area-inset-bottom))] flex items-center gap-2.5 shadow-[0_-4px_25px_rgba(0,0,0,0.08)]">
        <WishlistButton
          productId={product._id}
          variantSku={selectedVariant?.sku || product.variants?.[0]?.sku}
          className="w-11 h-11 rounded-lg border border-[#EAEAEA] bg-white flex items-center justify-center shrink-0 shadow-sm active:scale-95 transition-all text-[#111]"
        />
        <button
          type="button"
          onClick={handleAddToBag}
          className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-lg border-2 border-[#111111] bg-white text-[#111111] text-[12px] font-bold uppercase tracking-[0.04em] active:scale-[0.98] transition-all hover:bg-[#FAFAFA] cursor-pointer"
        >
          <ShoppingBag size={15} />
          Add to Bag
        </button>
        <button
          type="button"
          onClick={handleBuyNow}
          disabled={isBuyingNow}
          className="flex-1 h-11 flex items-center justify-center gap-1.5 rounded-lg bg-[#111111] text-white text-[12px] font-bold uppercase tracking-[0.04em] active:scale-[0.98] transition-all hover:bg-[#B08D57] shadow-sm disabled:opacity-50 cursor-pointer"
        >
          <Zap size={15} className="fill-current" />
          {isBuyingNow ? 'Buying...' : 'Buy Now'}
        </button>
      </div>
    </div>
  )
}

export default SingleProduct