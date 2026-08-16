import React, { useEffect, useState } from 'react'
import { Bell, Search, Plus, ChevronLeft, ChevronRight, ArrowLeft, Boxes, Layers, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router'
import { useProduct } from '../hook/useProduct'
import { useSelector } from 'react-redux'
import EmptyProductState from '../components/EmptyProductState'
import { formatPrice } from '../../home/pages/Home'

const FILTER_TABS = ['All', 'In Stock', 'Out of Stock']

const ImageSlider = ({ images, alt, className = '' }) => {
  const [index, setIndex] = useState(0)
  const safeImages = images && images.length > 0 ? images : [{ url: 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?q=80&w=500&auto=format&fit=crop' }]
  const total = safeImages.length

  const goTo = (e, i) => {
    e.stopPropagation()
    setIndex((i + total) % total)
  }

  return (
    <div className={`relative group/slider overflow-hidden bg-[#FAFAFA] ${className}`}>
      <img src={safeImages[index]?.url || safeImages[index]} alt={alt} className="w-full h-full object-cover" />

      {total > 1 && (
        <>
          <button
            type="button"
            onClick={(e) => goTo(e, index - 1)}
            className="absolute left-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
          >
            <ChevronLeft size={12} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={(e) => goTo(e, index + 1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-5 h-5 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
          >
            <ChevronRight size={12} strokeWidth={2} />
          </button>

          <span className="absolute top-1 right-1 text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-black/60 text-white">
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
  const [searchQuery, setSearchQuery] = useState('')

  const { handleGetSellerProducts } = useProduct()
  const navigate = useNavigate()

  useEffect(() => {
    handleGetSellerProducts()
  }, [])

  const filteredProducts = PRODUCTS.filter((p) => {
    const matchesFilter =
      activeFilter === 'In Stock'
        ? p.status === 'In-Stock'
        : activeFilter === 'Out of Stock'
        ? p.status === 'Out of Stock'
        : true

    if (!matchesFilter) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      p.title?.toLowerCase().includes(q) ||
      p.name?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    )
  })

  const inStockCount = PRODUCTS.filter((p) => p.status === 'In-Stock').length
  const outStockCount = PRODUCTS.filter((p) => p.status === 'Out of Stock').length

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Top Header Bar */}
      <div className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/seller')}
            className="flex items-center gap-2 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Dashboard
          </button>

          <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            <Boxes size={14} />
            Merchant Inventory & Variants
          </div>
        </div>
      </div>

      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-12 pt-8">
        {/* Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8 pb-4 border-b border-[#E5E5E5]">
          <div>
            <h1 className="font-display text-[28px] md:text-[34px] font-bold text-[#111111]">
              Product Catalog
            </h1>
            <p className="text-[13px] text-[#666666] mt-0.5">
              Manage product listings, size/color variants, and live stock.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="relative w-full md:w-64">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999999]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search catalog..."
                className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] pl-9 pr-3 py-2 text-[12.5px] outline-none focus:border-[#B08D57]"
              />
            </div>

            <button
              onClick={() => navigate('/seller/inventory/new')}
              className="flex items-center gap-2 bg-[#111111] text-white px-5 py-2.5 rounded-[6px] text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all shadow-md shrink-0"
            >
              <Plus size={15} />
              Add Product
            </button>
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-4 mb-6 border-b border-[#E5E5E5]">
          {FILTER_TABS.map((tab) => {
            const active = activeFilter === tab
            return (
              <button
                key={tab}
                onClick={() => setActiveFilter(tab)}
                className={`px-4 py-2 rounded-[6px] text-[12px] font-bold tracking-[0.04em] transition-all whitespace-nowrap ${
                  active
                    ? 'bg-[#111111] text-white shadow-sm'
                    : 'bg-[#FAFAFA] text-[#666666] border border-[#E5E5E5] hover:border-[#111111]'
                }`}
              >
                {tab} {tab === 'In Stock' ? `(${inStockCount})` : tab === 'Out of Stock' ? `(${outStockCount})` : `(${PRODUCTS.length})`}
              </button>
            )
          })}
        </div>

        {/* Content */}
        {filteredProducts.length === 0 ? (
          <EmptyProductState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredProducts.map((p) => (
              <div
                key={p._id || p.id}
                className="bg-white border border-[#E5E5E5] rounded-[10px] overflow-hidden hover:border-[#B08D57] transition-all duration-300 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <ImageSlider images={p.images} alt={p.title || p.name} className="aspect-[3/4] w-full" />

                  <div className="p-4">
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span className="text-[10px] font-bold uppercase tracking-[0.1em] text-[#B08D57]">
                        {p.category || 'Menswear'}
                      </span>
                      <span
                        className={`text-[9.5px] font-bold uppercase px-2 py-0.5 rounded ${
                          p.status === 'In-Stock' ? 'bg-[#EAF5EE] text-[#287A4B]' : 'bg-[#FCECEC] text-[#C43D3D]'
                        }`}
                      >
                        {p.status || 'In-Stock'}
                      </span>
                    </div>

                    <h3 className="font-display text-[15px] font-bold text-[#111111] truncate">
                      {p.title || p.name}
                    </h3>
                    <p className="text-[14px] font-bold text-[#111111] mt-1">{formatPrice(p.price)}</p>

                    <div className="mt-3 pt-3 border-t border-[#E5E5E5] text-[11px] text-[#666666] flex items-center justify-between">
                      <span>Variants: <strong className="text-[#111111]">{p.variants?.length || 0}</strong></span>
                      <span>Brand: <strong className="text-[#111111]">{p.brand || 'ZRIVE'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-4 pt-0 grid grid-cols-2 gap-2">
                  <button
                    onClick={() => navigate(`/seller/inventory/${p._id}/addVariant`)}
                    className="py-2 px-3 rounded-[6px] border border-[#E5E5E5] text-[#111111] text-[11px] font-bold uppercase tracking-[0.04em] hover:bg-[#FAFAFA] hover:border-[#111111] transition-all flex items-center justify-center gap-1"
                  >
                    <Layers size={13} />
                    Add Variant
                  </button>
                  <button
                    onClick={() => navigate(`/product/${p._id}`)}
                    className="py-2 px-3 rounded-[6px] bg-[#111111] text-white text-[11px] font-bold uppercase tracking-[0.04em] hover:bg-[#B08D57] transition-all flex items-center justify-center gap-1"
                  >
                    View Product
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default ProductList