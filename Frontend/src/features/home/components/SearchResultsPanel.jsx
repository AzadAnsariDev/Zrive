import React from "react"
import { ArrowRight, SearchX } from "lucide-react"

const formatPrice = (priceObj) => {
  if (!priceObj) return ""
  const amount = priceObj.amount ?? priceObj.value
  if (amount === undefined || amount === null) return ""
  return `₹${amount}`
}

const getProductImage = (product) => {
  if (product?.images?.length > 0) return product.images[0]?.url || ""
  return product?.variants?.[0]?.images?.[0]?.url || ""
}

const ResultSkeleton = () => (
  <div className="flex items-center gap-3 px-4 py-3 animate-pulse">
    <div className="w-12 h-14 bg-cream-dark flex-shrink-0" />
    <div className="flex-1 space-y-2">
      <div className="h-2.5 bg-cream-dark w-3/5" />
      <div className="h-2.5 bg-cream-dark w-2/5" />
    </div>
  </div>
)

const SearchResultsPanel = ({ query, results, loading, onSelect }) => {
  const hasQuery = query.trim().length > 0

  if (!hasQuery) return null

  return (
    <div className="divide-y divide-border">
      {loading ? (
        <>
          <ResultSkeleton />
          <ResultSkeleton />
          <ResultSkeleton />
        </>
      ) : results.length > 0 ? (
        <>
          {results.map((product) => (
            <button
              key={product._id}
              type="button"
              onClick={() => onSelect(`/product/${product._id}`)}
              className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-cream-dark transition-colors"
            >
              <div className="w-12 h-14 bg-cream-dark flex-shrink-0 overflow-hidden">
                <img
                  src={getProductImage(product)}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="text-[9px] font-semibold tracking-[0.14em] uppercase text-gold mb-0.5 truncate">
                  {product.category}
                </p>
                <p className="text-[13px] text-ink truncate">{product.title}</p>
              </div>

              <span className="text-[12px] font-semibold text-ink flex-shrink-0">
                {formatPrice(product.price)}
              </span>
            </button>
          ))}

          <button
            type="button"
            onClick={() => onSelect(`/all-products?search=${encodeURIComponent(query)}`)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-ink hover:text-gold transition-colors"
          >
            View all results for "{query}"
            <ArrowRight size={13} />
          </button>
        </>
      ) : (
        <div className="flex flex-col items-center text-center px-6 py-10">
          <SearchX size={22} strokeWidth={1.4} className="text-ink-soft mb-3" />
          <p className="text-[13px] text-ink mb-1">No results for "{query}"</p>
          <p className="text-[12px] text-ink-soft">Try a different name, brand, or category.</p>
        </div>
      )}
    </div>
  )
}

export default SearchResultsPanel