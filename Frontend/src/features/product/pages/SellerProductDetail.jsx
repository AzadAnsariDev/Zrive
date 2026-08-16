import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus, Pencil, X, ImageIcon, Layers, Check } from 'lucide-react'
import { useProduct } from '../hook/useProduct'

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-[#E5E5E5] text-[13px]">
    <span className="text-[#666666] font-medium">{label}</span>
    <span className="font-semibold text-[#111111]">{value}</span>
  </div>
)

const VariantCard = ({ variant, basePrice, currency, isEditing, onToggleEdit, editForm }) => {
  const effectivePrice = variant.price?.amount ?? basePrice
  const cover = variant.images?.[0]?.url

  return (
    <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[8px] p-4 mb-3">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[6px] bg-white border border-[#E5E5E5] overflow-hidden flex items-center justify-center shrink-0">
            {cover ? (
              <img src={cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={18} strokeWidth={1.5} className="text-[#999999]" />
            )}
          </div>

          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-[#111111] text-white px-2 py-0.5 rounded text-[11px] font-bold">
                Size: {variant.size}
              </span>
              <span className="bg-[#F5EFE5] text-[#B08D57] px-2 py-0.5 rounded text-[11px] font-bold">
                Color: {variant.color}
              </span>
            </div>
            <p className="text-[11px] text-[#777777]">SKU: {variant.sku}</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div>
            <p className="text-[10px] uppercase font-bold text-[#999999]">Stock</p>
            <p className={`text-[13px] font-bold ${variant.stock > 0 ? 'text-[#287A4B]' : 'text-[#C43D3D]'}`}>
              {variant.stock > 0 ? `${variant.stock} units` : 'Out of stock'}
            </p>
          </div>

          <div>
            <p className="text-[10px] uppercase font-bold text-[#999999]">Variant Price</p>
            <p className="text-[14px] font-bold text-[#111111]">₹{effectivePrice}</p>
          </div>

          <button
            type="button"
            onClick={onToggleEdit}
            className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#B08D57] hover:underline"
          >
            <Pencil size={12} />
            {isEditing ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {isEditing && <div className="mt-4 pt-4 border-t border-[#E5E5E5]">{editForm}</div>}
    </div>
  )
}

const SellerProductDetail = () => {
  const { productId } = useParams()
  const navigate = useNavigate()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [showAddForm, setShowAddForm] = useState(false)
  const [editingVariantId, setEditingVariantId] = useState(null)

  const { handleGetProductDetail, handleAddVariant } = useProduct()

  async function fetchProductDetail() {
    setLoading(true)
    const data = await handleGetProductDetail(productId)
    setProduct(data)
    setLoading(false)
  }

  useEffect(() => {
    fetchProductDetail()
  }, [productId])

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
  } = useForm()

  const onAddVariant = async (data) => {
    const payload = {
      size: data.size.toUpperCase(),
      color: data.color,
      sku: data.sku.toUpperCase(),
      stock: Number(data.stock),
      priceOverride: data.price ? Number(data.price) : undefined,
    }

    const ok = await handleAddVariant(productId, payload)
    if (ok) {
      setShowAddForm(false)
      resetAdd()
      fetchProductDetail()
    }
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#E5E5E5] border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header bar */}
      <div className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/seller/inventory')}
            className="flex items-center gap-2 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Inventory
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Variant Manager
          </span>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-5 md:px-8 pt-8">
        <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[10px] p-6 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#B08D57]">{product.category || 'Menswear'}</p>
            <h1 className="font-display text-[26px] font-bold text-[#111111]">{product.name || product.title}</h1>
            <p className="text-[13px] text-[#666666] mt-1">Base Price: <strong className="text-[#111111]">₹{product.price?.amount || product.price}</strong></p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-2 bg-[#111111] text-white px-5 py-3 rounded-[6px] text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all shrink-0"
          >
            <Plus size={16} />
            Add New Variant
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white border border-[#E5E5E5] rounded-[10px] p-6 mb-8 shadow-sm">
            <h3 className="font-display text-[18px] font-bold text-[#111111] pb-3 border-b border-[#E5E5E5] mb-4">
              Add Size / Color Variant
            </h3>

            <form onSubmit={handleSubmitAdd(onAddVariant)} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Size (e.g. L)</label>
                  <input
                    type="text"
                    placeholder="L"
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] p-2.5 text-[13px] outline-none"
                    {...registerAdd('size', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Color (e.g. Black)</label>
                  <input
                    type="text"
                    placeholder="Black"
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] p-2.5 text-[13px] outline-none"
                    {...registerAdd('color', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="TEE-BLK-L"
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] p-2.5 text-[13px] outline-none"
                    {...registerAdd('sku', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Stock Count</label>
                  <input
                    type="number"
                    placeholder="25"
                    className="w-full bg-[#FAFAFA] border border-[#E5E5E5] rounded-[6px] p-2.5 text-[13px] outline-none"
                    {...registerAdd('stock', { required: true })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-[#E5E5E5]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-5 py-2.5 border rounded-[6px] text-[12px] font-bold uppercase text-[#555555]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-[#B08D57] text-[#0e0e0e] rounded-[6px] text-[12px] font-bold uppercase hover:bg-[#D4B982]"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Variants */}
        <div className="bg-white border border-[#E5E5E5] rounded-[10px] p-6 shadow-sm">
          <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#B08D57] mb-4 pb-3 border-b border-[#E5E5E5]">
            Active Variants ({product.variants?.length || 0})
          </h2>

          {product.variants?.length === 0 ? (
            <p className="text-[13px] text-[#666666] py-6 text-center">No variants created yet. Click 'Add New Variant' above.</p>
          ) : (
            product.variants?.map((v) => (
              <VariantCard
                key={v._id || v.sku}
                variant={v}
                basePrice={product.price?.amount || product.price}
                currency="₹"
                isEditing={editingVariantId === v._id}
                onToggleEdit={() => setEditingVariantId(editingVariantId === v._id ? null : v._id)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerProductDetail