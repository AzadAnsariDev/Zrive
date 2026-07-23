import React, { useEffect, useState } from 'react'
import { Bell, Search, SlidersHorizontal, Plus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { useProduct } from '../hook/useProduct'
import { useSelector } from 'react-redux'
import EmptyProductState from '../components/EmptyProductState'
import { formatPrice } from '../../home/pages/Home'

// ---- Tabs ----
const FILTER_TABS = ['All', 'In Stock', 'Out of Stock']

const StatusDot = ({ status }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full ${
      status === 'In-Stock' ? 'bg-success' : 'bg-error'
    }`}
  />
)

const ImageSlider = ({ images, alt, className = '', arrowSize = 14, dotClassName = '' }) => {
  const [index, setIndex] = useState(0)
  const safeImages = images && images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop' }]
  const total = safeImages.length

  const goTo = (e, i) => {
    e.stopPropagation()
    setIndex((i + total) % total)
  }

  return (
    <div className={`relative group/slider overflow-hidden bg-cream-dark ${className}`}>
      <img src={safeImages[index]?.url || safeImages[index]} alt={alt} className="w-full h-full object-cover" />

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => goTo(e, index - 1)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-[3px] bg-charcoal/50 text-cream flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-charcoal"
          >
            <ChevronLeft size={arrowSize} strokeWidth={2} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => goTo(e, index + 1)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-[3px] bg-charcoal/50 text-cream flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity hover:bg-charcoal"
          >
            <ChevronRight size={arrowSize} strokeWidth={2} />
          </button>

          <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 ${dotClassName}`}>
            {safeImages.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={(e) => goTo(e, i)}
                className={`transition-all rounded-full ${
                  i === index ? 'w-3 h-1.5 bg-cream' : 'w-1.5 h-1.5 bg-cream/50 hover:bg-cream/80'
                }`}
              />
            ))}
          </div>

          <span className="absolute top-1.5 right-1.5 text-[9px] font-semibold tracking-[0.1em] uppercase px-1.5 py-0.5 rounded-[3px] bg-charcoal/50 text-cream">
            {index + 1}/{total}
          </span>
        </>
      )}
    </div>
  )
}

const ProductList = () => {
  const PRODUCTS = useSelector((state) => state.product.sellerProducts) || []
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeFilter === 'In Stock') return p.status === 'In-Stock'
    if (activeFilter === 'Out of Stock') return p.status === 'Out of Stock'
    return true
  })

  const { handleGetSellerProducts } = useProduct()

  useEffect(() => {
    handleGetSellerProducts()
  }, [])

  const totalStock = PRODUCTS.reduce((sum, p) => sum + (Number(p.stock) || 0), 0)
  const activeSales = PRODUCTS.filter((p) => p.status === 'In-Stock').length

  return (
    <div className="bg-cream text-ink min-h-full">
      {/* ============================================================ */}
      {/* MOBILE (< md)                                                 */}
      {/* ============================================================ */}
      <div className="md:hidden pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-6 pb-5">
          <h1 className="font-display text-[26px] font-medium tracking-tight">My Products</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center hover:text-gold transition-colors"
            >
              <Bell size={20} strokeWidth={1.5} />
            </button>
            <img
              src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
              alt="Profile"
              className="w-9 h-9 rounded-[3px] object-cover border border-border"
            />
          </div>
        </header>

        {/* Search + filter */}
        <div className="flex items-center gap-3 px-5 mb-5">
          <div className="flex-1 flex items-center gap-2 rounded-[3px] border border-border px-3.5 py-3 bg-cream-dark">
            <Search size={16} strokeWidth={1.5} className="text-ink-soft" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full text-[14px] outline-none placeholder:text-ink-soft bg-transparent text-ink"
            />
          </div>
          <button
            type="button"
            aria-label="Filters"
            className="w-[48px] h-[48px] shrink-0 flex items-center justify-center rounded-[3px] border border-border bg-surface hover:bg-cream-dark transition-colors"
          >
            <SlidersHorizontal size={17} strokeWidth={1.5} />
          </button>
        </div>

        {/* Add product */}
        <div className="px-5 mb-6">
          <Link
            to="/seller/inventory/new"
            className="w-full flex items-center justify-center gap-2 rounded-[3px] bg-charcoal text-cream py-3.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
          >
            <Plus size={15} strokeWidth={2.5} />
            Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 px-5 mb-8">
          <div className="rounded-[3px] border border-border bg-surface px-4 py-4">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
              Total Stock
            </div>
            <div className="font-display text-[26px] font-medium">{totalStock}</div>
          </div>
          <div className="rounded-[3px] border border-border bg-surface px-4 py-4">
            <div className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-1">
              Active Sales
            </div>
            <div className="font-display text-[26px] font-medium">{activeSales}</div>
          </div>
        </div>

        {/* Product list */}
        {PRODUCTS.length === 0 ? (
          <EmptyProductState />
        ) : (
          <div className="flex flex-col gap-4 px-5">
            {filteredProducts.map((product) => (
              <div
                key={product._id || product.id}
                className="flex rounded-[3px] border border-border bg-surface overflow-hidden"
              >
                <ImageSlider
                  images={product.images}
                  alt={product.title}
                  className="w-[110px] h-[120px] shrink-0"
                  arrowSize={11}
                />
                <div className="flex-1 flex flex-col justify-center px-4 py-3 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <p className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold mb-0.5 truncate">
                      {product.brand || 'Generic'}
                    </p>
                    <button
                      type="button"
                      aria-label="Product options"
                      className="shrink-0 text-ink-soft hover:text-ink"
                    >
                      <MoreVertical size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                  <h3 className="font-display text-[15.5px] font-medium leading-snug truncate mb-1">
                    {product.title}
                  </h3>
                  <div className="font-sans text-[15px] font-semibold mb-2">{formatPrice(product.price)}</div>
                  
                  <div className="flex items-center gap-1.5 mt-auto">
                    <StatusDot status={product.status} />
                    <span className={`text-[10px] font-semibold tracking-[0.1em] uppercase ${product.status === 'In-Stock' ? 'text-success' : 'text-error'}`}>
                      {product.status === 'In-Stock' ? `IN STOCK (${product.stock || 0})` : 'OUT OF STOCK'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* DESKTOP / LAPTOP (>= md)                                      */}
      {/* ============================================================ */}
      <div className="hidden md:block px-10 py-8 lg:px-14 lg:py-10">
        <div className="flex items-start justify-between gap-6 mb-8">
          <div>
            <h2 className="font-display text-[34px] font-medium tracking-tight leading-none mb-3">
              My Products
            </h2>
            <p className="text-[13px] text-ink-soft">
              Showing {filteredProducts.length} items in your premium inventory.
            </p>
          </div>
          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-2 rounded-[3px] border border-border px-3.5 py-3 bg-cream-dark w-64 lg:w-72 focus-within:border-ink transition-colors">
              <Search size={15} strokeWidth={1.5} className="text-ink-soft" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full text-[13.5px] outline-none placeholder:text-ink-soft bg-transparent text-ink"
              />
            </div>
            <Link
              to="/seller/inventory/new"
              className="flex items-center justify-center gap-2 rounded-[3px] bg-charcoal text-cream px-8 py-3.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Product
            </Link>
          </div>
        </div>

        {PRODUCTS.length === 0 ? (
          <EmptyProductState />
        ) : (
          <>
            {/* Filter tabs */}
            <div className="flex items-center gap-2 mb-8">
              {FILTER_TABS.map((tab) => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveFilter(tab)}
                  className={`px-5 py-2.5 rounded-[3px] text-[11px] font-semibold tracking-[0.1em] uppercase border transition-colors ${
                    activeFilter === tab
                      ? 'bg-charcoal text-cream border-charcoal'
                      : 'bg-surface text-ink border-border hover:bg-cream-dark'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Product grid */}
            <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 lg:gap-8">
              {filteredProducts.map((product) => (
                <div
                  key={product._id || product.id}
                  className="rounded-[3px] border border-border bg-surface overflow-hidden group"
                >
                  <div className="relative">
                    <ImageSlider images={product.images} alt={product.title} className="w-full aspect-[3/4]" />
                    <button
                      type="button"
                      aria-label="Product options"
                      className="absolute top-3 right-3 w-8 h-8 rounded-[3px] bg-cream/90 backdrop-blur flex items-center justify-center text-ink hover:bg-cream z-10 transition-colors"
                    >
                      <MoreVertical size={16} strokeWidth={1.5} />
                    </button>
                  </div>
                  <div className="px-5 py-5 border-t border-border">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[9px] font-semibold tracking-[0.16em] uppercase text-gold truncate mr-2">
                        {product.brand || 'Generic'}
                      </span>
                      <span
                        className={`flex items-center gap-1.5 text-[9px] font-semibold tracking-[0.1em] uppercase shrink-0 ${
                          product.status === 'In-Stock' ? 'text-success' : 'text-error'
                        }`}
                      >
                        <StatusDot status={product.status} />
                        {product.status === 'In-Stock' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </div>
                    <h3 className="font-display text-[16px] font-medium mb-1 truncate">{product.title}</h3>
                    <div className="font-sans text-[15px] font-semibold text-ink">{formatPrice(product.price)}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Pagination */}
            <div className="flex items-center justify-between mt-12 pt-6 border-t border-border">
              <span className="text-[12px] font-medium text-ink-soft">
                Showing 1-{filteredProducts.length} of {PRODUCTS.length} products
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  aria-label="Previous page"
                  className="w-9 h-9 rounded-[3px] border border-border flex items-center justify-center text-ink-soft hover:bg-cream-dark transition-colors"
                >
                  <ChevronLeft size={16} strokeWidth={1.5} />
                </button>
                {[1, 2, 3].map((n) => (
                  <button
                    key={n}
                    type="button"
                    className={`w-9 h-9 rounded-[3px] text-[12px] font-medium flex items-center justify-center transition-colors ${
                      n === 1
                        ? 'bg-charcoal text-cream'
                        : 'border border-border text-ink hover:bg-cream-dark'
                    }`}
                  >
                    {n}
                  </button>
                ))}
                <span className="w-9 h-9 flex items-center justify-center text-ink-soft text-[13px]">
                  ...
                </span>
                <button
                  type="button"
                  className="w-9 h-9 rounded-[3px] border border-border text-[12px] font-medium text-ink hover:bg-cream-dark flex items-center justify-center transition-colors"
                >
                  5
                </button>
                <button
                  type="button"
                  aria-label="Next page"
                  className="w-9 h-9 rounded-[3px] border border-border flex items-center justify-center text-ink hover:bg-cream-dark transition-colors"
                >
                  <ChevronRight size={16} strokeWidth={1.5} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default ProductList