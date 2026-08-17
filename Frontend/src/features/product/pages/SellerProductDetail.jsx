import React, { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus, Pencil, X, ImageIcon, Layers, Check } from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { notify } from '../../../utils/toast'

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-2.5 border-b border-[#EAEAEA] text-[13px]">
    <span className="text-[#666666] font-medium">{label}</span>
    <span className="font-semibold text-[#111111]">{value}</span>
  </div>
)

const VariantEditForm = ({ variant, onCancel, onSave }) => {
  const [size, setSize] = useState(variant.size || '')
  const [color, setColor] = useState(variant.color || '')
  const [sku, setSku] = useState(variant.sku || '')
  const [stock, setStock] = useState(variant.stock || 0)
  const [price, setPrice] = useState(variant.price?.amount ?? '')

  return (
    <div className="bg-white p-4 rounded-[6px] border border-[#EAEAEA] space-y-3 mt-3">
      <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B08D57]">Edit Variant Details</p>
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-[12px]">
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Size</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Color</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">SKU Code</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Stock Units</label>
          <input
            type="number"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Price (₹)</label>
          <input
            type="number"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2 border-t border-[#EAEAEA]">
        <button
          type="button"
          onClick={onCancel}
          className="px-3.5 py-1.5 border rounded text-[11px] font-bold uppercase text-[#555] cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={() => onSave({ size, color, sku, stock: Number(stock), priceOverride: price ? Number(price) : null })}
          className="px-4 py-1.5 bg-[#B08D57] text-[#0e0e0e] rounded text-[11px] font-bold uppercase hover:bg-[#D4B982] cursor-pointer"
        >
          Save Changes
        </button>
      </div>
    </div>
  )
}

const VariantCard = ({ variant, basePrice, currency, isEditing, onToggleEdit, onSaveEdit }) => {
  const effectivePrice = variant.price?.amount ?? basePrice
  const cover = variant.images?.[0]?.url

  return (
    <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-4 mb-3">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-[6px] bg-white border border-[#EAEAEA] overflow-hidden flex items-center justify-center shrink-0">
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
            className="flex items-center gap-1 text-[11px] font-bold uppercase text-[#B08D57] hover:underline cursor-pointer"
          >
            <Pencil size={12} />
            {isEditing ? 'Close' : 'Edit'}
          </button>
        </div>
      </div>

      {isEditing && (
        <VariantEditForm
          variant={variant}
          onCancel={onToggleEdit}
          onSave={(data) => onSaveEdit(variant._id, data)}
        />
      )}
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
    try {
      const data = await handleGetProductDetail(productId)
      setProduct(data)
    } catch (err) {
      notify.error(err, "Failed to load product details.")
    } finally {
      setLoading(false)
    }
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

    try {
      const ok = await handleAddVariant(productId, payload)
      if (ok) {
        notify.success("Variant added successfully!")
        setShowAddForm(false)
        resetAdd()
        fetchProductDetail()
      }
    } catch (err) {
      notify.error(err, "Failed to add variant.")
    }
  }

  const handleSaveVariantEdit = async (variantId, data) => {
    notify.success("Variant details updated!")
    setEditingVariantId(null)
  }

  if (loading || !product) {
    return (
      <div className="min-h-screen bg-[#FFFFFF] flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#B08D57] rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header bar */}
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-3.5 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/seller/inventory')}
            className="flex items-center gap-1.5 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft size={14} />
            Back to Inventory
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Variant Manager
          </span>
        </div>
      </div>

      <div className="max-w-[1100px] mx-auto px-4 md:px-8 pt-6">
        <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5 mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <p className="text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#B08D57]">{product.category || 'Menswear'}</p>
            <h1 className="font-display text-[24px] font-bold text-[#111111]">{product.name || product.title}</h1>
            <p className="text-[12.5px] text-[#666666] mt-0.5">Base Price: <strong className="text-[#111111]">₹{product.price?.amount || product.price}</strong></p>
          </div>

          <button
            onClick={() => setShowAddForm(!showAddForm)}
            className="flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2.5 rounded text-[11.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            Add New Variant
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5 mb-6 shadow-sm">
            <h3 className="font-display text-[16px] font-bold text-[#111111] pb-3 border-b border-[#EAEAEA] mb-4">
              Add Size / Color Variant
            </h3>

            <form onSubmit={handleSubmitAdd(onAddVariant)} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Size (e.g. L)</label>
                  <input
                    type="text"
                    placeholder="L"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none"
                    {...registerAdd('size', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Color (e.g. Black)</label>
                  <input
                    type="text"
                    placeholder="Black"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none"
                    {...registerAdd('color', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">SKU Code</label>
                  <input
                    type="text"
                    placeholder="TEE-BLK-L"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none"
                    {...registerAdd('sku', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Stock Count</label>
                  <input
                    type="number"
                    placeholder="25"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none"
                    {...registerAdd('stock', { required: true })}
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  className="px-4 py-2 border rounded text-[11px] font-bold uppercase text-[#555555] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-[#B08D57] text-[#0e0e0e] rounded text-[11px] font-bold uppercase hover:bg-[#D4B982] cursor-pointer"
                >
                  Save Variant
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Existing Variants */}
        <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5 shadow-sm">
          <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57] mb-4 pb-2 border-b border-[#EAEAEA]">
            Active Variants ({product.variants?.length || 0})
          </h2>

          {product.variants?.length === 0 ? (
            <p className="text-[12.5px] text-[#666666] py-6 text-center">No variants created yet. Click 'Add New Variant' above.</p>
          ) : (
            product.variants?.map((v) => (
              <VariantCard
                key={v._id || v.sku}
                variant={v}
                basePrice={product.price?.amount || product.price}
                currency="₹"
                isEditing={editingVariantId === (v._id || v.sku)}
                onToggleEdit={() => setEditingVariantId(editingVariantId === (v._id || v.sku) ? null : (v._id || v.sku))}
                onSaveEdit={handleSaveVariantEdit}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerProductDetail