import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Heart, Image as ImageIcon } from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { formatPrice } from '../../home/pages/Home'
import { useNavigate } from 'react-router'

// Filter chips — UI only for now (onClick placeholders), wire these up to
// real sort/price/color logic once that's ready on the backend.
//
// NOTE: intentionally no "Size" filter here — there's no size data on the
// backend yet.
const FILTERS = [
  { key: 'sort', label: 'Sort' },
  { key: 'price', label: 'Price' },
  { key: 'color', label: 'Color' },
]

const ProductCardSkeleton = () => (
  <div>
    <div className="animate-pulse aspect-[3/4] overflow-hidden bg-cream-dark mb-3" />
    <div className="animate-pulse h-2 w-1/4 bg-cream-dark mb-2" />
    <div className="animate-pulse h-3.5 w-3/4 bg-cream-dark mb-2" />
    <div className="animate-pulse h-3 w-1/2 bg-cream-dark" />
  </div>
)

const ProductCard = ({ product }) => {
  const navigate = useNavigate()
  return (
    <div className="group cursor-pointer" onClick={() => navigate(`/product/${product._id}`)}>
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-dark mb-3">
        {product.images ? (
          <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <ImageIcon size={22} strokeWidth={1} className="text-ink-soft" />
          </div>
        )}
        <button
          type="button"
          aria-label="Add to wishlist"
          onClick={(e) => { e.stopPropagation(); }}
          className="absolute top-3 right-3 text-ink-soft hover:text-ink transition-colors"
        >
          <Heart size={18} strokeWidth={1} />
        </button>
      </div>
      <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">
        {product.brand || "Generic"}
      </p>
      <h3 className="font-display text-[14px] text-ink mb-1 truncate">{product.title}</h3>
      <p className="font-sans text-[13px] font-semibold text-ink">
        {formatPrice(product.price)}
      </p>
    </div>
  )
}

const AllProducts = () => {
  const { handleGetProducts } = useProduct()
  useEffect(() => {
    handleGetProducts()
  }, [])

  const products = useSelector((state) => state.product.products)
  const isLoading = products === undefined
  const isEmpty = !isLoading && products?.length === 0

  return (
    <div className="bg-cream text-ink min-h-screen">
      {/* Header & Filters */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 pt-6 md:pt-8 pb-4">
        <h1 className="font-display text-[32px] md:text-[42px] font-medium text-ink mb-8">All Products</h1>
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.key}
              type="button"
              className="px-6 py-3 border border-border text-ink text-[11px] font-semibold tracking-[0.1em] uppercase rounded-[3px] hover:bg-charcoal hover:text-cream hover:border-charcoal transition-colors whitespace-nowrap"
            >
              {filter.label}
            </button>
          ))}
        </div>
      </div>

      {/* Product grid */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 py-6 md:py-8">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="font-display text-[22px] font-medium text-ink mb-2">No products found</p>
            <p className="text-[13px] text-ink-soft">Check back soon, or try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-4 lg:gap-5">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product._id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllProducts