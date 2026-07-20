import React, { useEffect, useState } from 'react'
import { Bell, Search, SlidersHorizontal, Plus, MoreVertical, ChevronLeft, ChevronRight } from 'lucide-react'
import { Link } from 'react-router'
import { useProduct } from '../hook/useProduct'
import { useSelector } from 'react-redux'

// ---- Mock data (backend already wired — just swap this for the real fetch) ----
const FILTER_TABS = ['All', 'In Stock', 'Out of Stock']

const StatusDot = ({ status }) => (
  <span
    className={`inline-block w-1.5 h-1.5 rounded-full ${
      status === 'In-Stock' ? 'bg-green-500' : 'bg-red-500'
    }`}
  />
)

// Shows every image for a product (cover + up to 6 more, so 1-7 total).
// Arrows only render when there's more than one image; dots show position
// and are also clickable. Works the same on the mobile row thumbnail and
// the desktop card — just pass a different className for sizing.
const ImageSlider = ({ images, alt, className = '', arrowSize = 14, dotClassName = '' }) => {
  const [index, setIndex] = useState(0)
  const total = images.length

  if (!total) return null

  const goTo = (e, i) => {
    e.stopPropagation()
    setIndex((i + total) % total)
  }

  return (
    <div className={`relative group/slider overflow-hidden ${className}`}>
      <img src={images[index].url} alt={alt} className="w-full h-full object-cover" />

      {total > 1 && (
        <>
          <button
            type="button"
            aria-label="Previous photo"
            onClick={(e) => goTo(e, index - 1)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
          >
            <ChevronLeft size={arrowSize} />
          </button>
          <button
            type="button"
            aria-label="Next photo"
            onClick={(e) => goTo(e, index + 1)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
          >
            <ChevronRight size={arrowSize} />
          </button>

          <div className={`absolute bottom-1.5 left-1/2 -translate-x-1/2 flex items-center gap-1 ${dotClassName}`}>
            {images.map((_, i) => (
              <button
                key={i}
                type="button"
                aria-label={`Show photo ${i + 1}`}
                onClick={(e) => goTo(e, i)}
                className={`rounded-full transition-all ${
                  i === index ? 'w-3 h-1.5 bg-white' : 'w-1.5 h-1.5 bg-white/60'
                }`}
              />
            ))}
          </div>

          <span className="absolute top-1.5 right-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-black/50 text-white">
            {index + 1}/{total}
          </span>
        </>
      )}
    </div>
  )
}

// This page renders inside <SellerLayout /> (sidebar + mobile bottom nav
// already provided there) — it only owns its own content, no app shell.
const ProductList = () => {
  const PRODUCTS = useSelector((state) => state.product.sellerProduct)
  const [activeFilter, setActiveFilter] = useState('All')

  const filteredProducts = PRODUCTS.filter((p) => {
    if (activeFilter === 'In Stock') return p.status === 'In-Stock'
    if (activeFilter === 'Out of Stock') return p.status === 'out-of-stock'
    return true
  })

  const { handleGetProductList } = useProduct()

  useEffect(()=>{
    handleGetProductList()
},[])



  const totalStock = PRODUCTS.reduce((sum, p) => sum + p.stock, 0)
  const activeSales = PRODUCTS.filter((p) => p.status === 'In-Stock').length

  return (
    <div className="bg-gray-50 text-black min-h-full">
      {/* ============================================================ */}
      {/* MOBILE (< md)                                                 */}
      {/* ============================================================ */}
      <div className="md:hidden pb-24">
        {/* Header */}
        <header className="flex items-center justify-between px-5 pt-6 pb-5">
          <h1 className="text-[26px] font-bold tracking-tight">My Products</h1>
          <div className="flex items-center gap-3">
            <button
              type="button"
              aria-label="Notifications"
              className="w-9 h-9 flex items-center justify-center"
            >
              <Bell size={20} strokeWidth={1.75} />
            </button>
            <img
              src="https://images.unsplash.com/photo-1633332755192-727a05c4013d?q=80&w=200&auto=format&fit=crop"
              alt="Profile"
              className="w-9 h-9 rounded-full object-cover border border-gray-200"
            />
          </div>
        </header>

        {/* Search + filter */}
        <div className="flex items-center gap-3 px-5 mb-4">
          <div className="flex-1 flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-3 bg-white">
            <Search size={16} className="text-gray-400" />
            <input
              type="text"
              placeholder="Search inventory..."
              className="w-full text-[14px] outline-none placeholder:text-gray-400 bg-transparent"
            />
          </div>
          <button
            type="button"
            aria-label="Filters"
            className="w-[52px] h-[52px] shrink-0 flex items-center justify-center rounded-lg border border-gray-300 bg-white"
          >
            <SlidersHorizontal size={17} strokeWidth={1.75} />
          </button>
        </div>

        {/* Add product */}
        <div className="px-5 mb-5">
             <Link
              to="/seller/inventory/new"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-black text-white py-3 text-[13px] font-bold hover:opacity-90 transition-opacity"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Product
            </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 gap-4 px-5 mb-6">
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-4">
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-500 mb-1.5">
              Total Stock
            </div>
            <div className="text-[26px] font-bold">{totalStock}</div>
          </div>
          <div className="rounded-lg border border-gray-200 bg-white px-4 py-4">
            <div className="text-[11px] font-semibold tracking-[0.1em] uppercase text-gray-500 mb-1.5">
              Active Sales
            </div>
            <div className="text-[26px] font-bold">{activeSales}</div>
          </div>
        </div>

        {/* Product list */}
        <div className="flex flex-col gap-4 px-5">
          {PRODUCTS.map((product) => (
            <div
              key={product.id}
              className="flex rounded-lg border border-gray-200 bg-white overflow-hidden"
            >
              <ImageSlider
                images={product.images}
                alt={product.title}
                className="w-[110px] h-[110px] shrink-0"
                arrowSize={11}
              />
              <div className="flex-1 flex flex-col justify-center px-4 py-3 min-w-0">
                <div className="flex items-start justify-between gap-2">
                  <h3 className="text-[15.5px] font-bold leading-snug truncate">
                    {product.title}
                  </h3>
                  <button
                    type="button"
                    aria-label="Product options"
                    className="shrink-0 text-gray-500"
                  >
                    <MoreVertical size={16} />
                  </button>
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 mb-2.5">
                  <StatusDot status={product.status} />
                  <span className="text-[12px] font-medium text-gray-500">
                    {product.status === 'In-Stock'
                      ? `IN STOCK (${product.stock})`
                      : 'OUT OF STOCK'}
                  </span>
                </div>
                <div className="text-[17px] font-bold">${product.price.amount}</div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ============================================================ */}
      {/* DESKTOP / LAPTOP (>= md)                                      */}
      {/* ============================================================ */}
      <div className="hidden md:block px-10 py-8 lg:px-14 lg:py-10">
        <div className="flex items-start justify-between gap-6 mb-6">
          <div>
            <h2 className="text-[34px] font-bold tracking-tight leading-none mb-2">
              My Products
            </h2>
            <p className="text-[14px] text-gray-500">
              Showing {filteredProducts.length} items in your premium inventory.
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-2 rounded-lg border border-gray-300 px-3.5 py-2.5 bg-white w-64 lg:w-72">
              <Search size={15} className="text-gray-400" />
              <input
                type="text"
                placeholder="Search inventory..."
                className="w-full text-[13.5px] outline-none placeholder:text-gray-400 bg-transparent"
              />
            </div>
            <Link
              to="/seller/inventory/new"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-black text-white py-3 text-[13px] font-bold hover:opacity-90 transition-opacity"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Product
            </Link>
          </div>
        </div>

        {/* Filter tabs */}
        <div className="flex items-center gap-2 mb-7">
          {FILTER_TABS.map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveFilter(tab)}
              className={`px-4 py-2 rounded-lg text-[12.5px] font-semibold tracking-wide uppercase border transition-colors ${
                activeFilter === tab
                  ? 'bg-black text-white border-black'
                  : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-100'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredProducts.map((product) => (
            <div
              key={product.id}
              className="rounded-xl border border-gray-200 bg-white overflow-hidden"
            >
              <div className="relative">
                <ImageSlider images={product.images} alt={product.title} className="w-full h-56" />
                <button
                  type="button"
                  aria-label="Product options"
                  className="absolute top-3 right-11 w-8 h-8 rounded-md bg-white/90 backdrop-blur flex items-center justify-center text-gray-600 hover:bg-white z-10"
                >
                  <MoreVertical size={15} />
                </button>
              </div>
              <div className="px-5 py-4">
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[11px] font-semibold tracking-[0.08em] uppercase text-gray-500">
                    {product.category}
                  </span>
                  <span
                    className={`flex items-center gap-1.5 text-[11px] font-semibold uppercase ${
                      product.status === 'In-Stock' ? 'text-green-600' : 'text-red-600'
                    }`}
                  >
                    <StatusDot status={product.status} />
                    {product.status === 'In-Stock' ? 'In Stock' : 'Out of Stock'}
                  </span>
                </div>
                <h3 className="text-[16.5px] font-bold mb-1">{product.title}</h3>
                <div className="text-[15px] font-bold text-gray-800">${product.price.amount}</div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
          <span className="text-[13.5px] text-gray-500">
            Showing 1-{filteredProducts.length} of 54 products
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              aria-label="Previous page"
              className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-400"
            >
              <ChevronLeft size={16} />
            </button>
            {[1, 2, 3].map((n) => (
              <button
                key={n}
                type="button"
                className={`w-9 h-9 rounded-lg text-[13px] font-semibold flex items-center justify-center ${
                  n === 1
                    ? 'bg-black text-white'
                    : 'border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {n}
              </button>
            ))}
            <span className="w-9 h-9 flex items-center justify-center text-gray-400 text-[13px]">
              ...
            </span>
            <button
              type="button"
              className="w-9 h-9 rounded-lg border border-gray-300 text-[13px] font-semibold text-gray-700 hover:bg-gray-100 flex items-center justify-center"
            >
              5
            </button>
            <button
              type="button"
              aria-label="Next page"
              className="w-9 h-9 rounded-lg border border-gray-300 flex items-center justify-center text-gray-700 hover:bg-gray-100"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductList