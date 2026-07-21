import React, { useEffect } from 'react'
import { useSelector } from 'react-redux'
import { Heart, Image as ImageIcon } from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { formatPrice } from '../../home/pages/Home'

// Filter chips — UI only for now (onClick placeholders), wire these up to
// real sort/price/color logic once that's ready on the backend.
//
// NOTE: intentionally no "Size" filter here — there's no size data on the
// backend yet. Add it back to this array once that's available:
//   { key: 'size', label: 'Size' },
const FILTERS = [
  { key: 'sort', label: 'Sort' },
  { key: 'price', label: 'Price' },
  { key: 'color', label: 'Color' },
]

const ProductCardSkeleton = () => (
  <div>
    <div className="animate-pulse aspect-[3/4] rounded-2xl bg-gray-100 mb-3" />
    <div className="animate-pulse h-3.5 w-3/4 rounded bg-gray-100 mb-2" />
    <div className="animate-pulse h-3.5 w-1/2 rounded bg-gray-100" />
  </div>
)

const ProductCard = ({ product }) => (
  <div>
    <div className="relative aspect-[3/4] rounded-2xl overflow-hidden bg-gray-50 mb-3">
      {product.images ? (
        <img src={product.images[0].url} alt={product.title} className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <ImageIcon size={22} strokeWidth={1.5} className="text-gray-300" />
        </div>
      )}
      <button
        type="button"
        aria-label="Add to wishlist"
        onClick={() => {}}
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center hover:bg-white transition-colors"
      >
        <Heart size={14} strokeWidth={1.75} />
      </button>
    </div>
    <h3 className="text-[13.5px] font-semibold leading-snug">{product.title}</h3>
    <p className="text-[13px] text-gray-500 mt-1">
      {formatPrice(product.price)} 
      {/* Size range is product data (not the removed filter) — only shown
          if the product actually has it. */}
      {product.sizes?.length > 0 && <span> · {product.sizes.join('-')}</span>}
    </p>
  </div>
)

const AllProducts = () => {
  const { handleGetProducts } = useProduct()

  useEffect(() => {
    handleGetProducts()
  }, [])

  const products = useSelector((state) => state.product.products)
  const isLoading = products === undefined
  const isEmpty = !isLoading && products?.length === 0

  return (
    <div className="bg-white text-black min-h-screen">
      {/* Sticky filter bar — sits just under the main navbar. Adjust the
          `top` offset if your Navbar's height changes. */}
      <div className="sticky top-[65px] md:top-[81px] z-10 bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 pt-6 pb-5">
          <div className="flex gap-2.5 overflow-x-auto no-scrollbar md:flex-wrap">
            {FILTERS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => {}}
                className="flex-shrink-0 text-[13px] font-medium px-4 py-2 rounded-full border border-gray-200 hover:border-gray-300 hover:bg-gray-50 transition-colors"
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Product grid — generous gaps on desktop for breathing room. */}
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 py-8 md:py-10">
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <p className="text-[15px] font-medium mb-1.5">No products found</p>
            <p className="text-[13px] text-gray-500">Check back soon, or try a different filter.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5 md:gap-7 lg:gap-8">
            {isLoading
              ? Array.from({ length: 8 }).map((_, i) => <ProductCardSkeleton key={i} />)
              : products.map((product) => <ProductCard key={product.id} product={product} />)}
          </div>
        )}
      </div>
    </div>
  )
}

export default AllProducts