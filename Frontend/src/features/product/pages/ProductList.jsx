import React, { useEffect, useState } from 'react'
import { Search, Plus, ChevronLeft, ChevronRight, ArrowLeft, Layers } from 'lucide-react'
import { useNavigate } from 'react-router'
import { useProduct } from '../hook/useProduct'
import { useSelector } from 'react-redux'
import EmptyProductState from '../components/EmptyProductState'
import { SellerInventorySkeleton } from '../../../components/common/Skeleton'
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
            className="absolute left-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
          >
            <ChevronLeft size={10} strokeWidth={2} />
          </button>
          <button
            type="button"
            onClick={(e) => goTo(e, index + 1)}
            className="absolute right-1 top-1/2 -translate-y-1/2 w-4 h-4 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover/slider:opacity-100 transition-opacity"
          >
            <ChevronRight size={10} strokeWidth={2} />
          </button>

          <span className="absolute top-1 right-1 text-[8px] font-bold px-1 py-0.5 rounded bg-black/60 text-white">
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

  const loading = useSelector((state) => state.product?.loading?.products || state.product?.loading?.fetch || state.seller?.loading)

  const { handleGetSellerProducts } = useProduct()
  const navigate = useNavigate()

  useEffect(() => {
    handleGetSellerProducts()
  }, [])

  if (loading && PRODUCTS.length === 0) {
    return <SellerInventorySkeleton />
  }

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
    <div className="min-h-screen bg-white text-[#111] pb-16">
      {/* Header */}
      <div className="border-b border-[#EBEBEB] bg-[#FAFAFA]">
        <div className="max-w-5xl mx-auto px-6 md:px-10 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <button
              onClick={() => navigate('/seller')}
              className="md:hidden mt-1 p-1.5 rounded-full bg-[#EBEBEB] text-[#111] hover:bg-[#D4D4D4] transition-colors cursor-pointer"
            >
              <ArrowLeft size={16} />
            </button>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57]">Merchant Inventory</p>
              <h1 className="text-[20px] font-bold text-[#111] mt-0.5">Product Catalog</h1>
              <p className="text-[11px] text-[#888] mt-0.5">Manage product listings, size/color variants, and live stock.</p>
            </div>
          </div>

          <button
            onClick={() => navigate('/seller/inventory/new')}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-[#111] text-white rounded-lg text-[11.5px] font-bold uppercase tracking-wide hover:bg-[#B08D57] transition-all cursor-pointer shadow-sm w-fit self-start sm:self-auto"
          >
            <Plus size={14} />
            Add Product
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-6 space-y-6">
        {/* Controls Bar: Search & Filter Tabs */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#EBEBEB]">
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            {FILTER_TABS.map((tab) => {
              const active = activeFilter === tab
              return (
                <button
                  key={tab}
                  onClick={() => setActiveFilter(tab)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-bold tracking-wide transition-all whitespace-nowrap cursor-pointer ${
                    active
                      ? 'bg-[#111] text-white shadow-sm'
                      : 'bg-[#FAFAFA] text-[#666] border border-[#EBEBEB] hover:border-[#111]'
                  }`}
                >
                  {tab} {tab === 'In Stock' ? `(${inStockCount})` : tab === 'Out of Stock' ? `(${outStockCount})` : `(${PRODUCTS.length})`}
                </button>
              )
            })}
          </div>

          <div className="relative w-full sm:w-60">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#999]" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search catalog..."
              className="w-full bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg pl-8 pr-3 py-1.5 text-[12px] outline-none focus:border-[#B08D57] transition-colors"
            />
          </div>
        </div>

        {/* Content: Spacious, zoomed-out, compact cards */}
        {filteredProducts.length === 0 ? (
          <EmptyProductState />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((p) => (
              <div
                key={p._id || p.id}
                className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl overflow-hidden hover:border-[#B08D57] transition-all duration-200 shadow-sm flex flex-col justify-between"
              >
                <div>
                  <ImageSlider images={p.images} alt={p.title || p.name} className="aspect-[4/5] w-full" />

                  <div className="p-3 space-y-1">
                    <div className="flex items-center justify-between gap-1.5">
                      <span className="text-[9px] font-bold uppercase tracking-wider text-[#B08D57] truncate">
                        {p.category || 'Menswear'}
                      </span>
                      <span
                        className={`text-[8.5px] font-bold uppercase px-1.5 py-0.5 rounded shrink-0 ${
                          p.status === 'In-Stock' ? 'bg-[#EAF5EE] text-[#287A4B]' : 'bg-[#FCECEC] text-[#C43D3D]'
                        }`}
                      >
                        {p.status || 'In-Stock'}
                      </span>
                    </div>

                    <h3
                      onClick={() => navigate(`/seller/inventory/${p._id}/addVariant`)}
                      className="text-[12.5px] font-bold text-[#111] truncate cursor-pointer hover:text-[#B08D57]"
                      title={p.title || p.name}
                    >
                      {p.title || p.name}
                    </h3>
                    <p className="text-[13px] font-bold text-[#111]">{formatPrice(p.price)}</p>

                    <div className="pt-2 border-t border-[#EBEBEB] text-[10px] text-[#777] flex items-center justify-between">
                      <span>Variants: <strong className="text-[#111]">{p.variants?.length || 0}</strong></span>
                      <span>Brand: <strong className="text-[#111]">{p.brand || 'ZRIVE'}</strong></span>
                    </div>
                  </div>
                </div>

                <div className="p-3 pt-0 grid grid-cols-2 gap-1.5">
                  <button
                    onClick={() => navigate(`/seller/inventory/${p._id}/addVariant`)}
                    className="py-1.5 px-2 rounded-md border border-[#EBEBEB] bg-white text-[#111] text-[10px] font-bold uppercase tracking-wide hover:border-[#111] transition-all flex items-center justify-center gap-1 cursor-pointer"
                  >
                    <Layers size={11} />
                    Variant
                  </button>
                  <button
                    onClick={() => navigate(`/seller/inventory/${p._id}/addVariant`)}
                    className="py-1.5 px-2 rounded-md bg-[#111] text-white text-[10px] font-bold uppercase tracking-wide hover:bg-[#B08D57] transition-all flex items-center justify-center cursor-pointer"
                  >
                    Manage
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