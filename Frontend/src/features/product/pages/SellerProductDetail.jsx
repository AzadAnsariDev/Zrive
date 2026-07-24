import React, { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus, Pencil, X, ImageIcon } from 'lucide-react'
import { useProduct } from '../hook/useProduct'

const CATEGORY_LABEL = {
  'T-Shirts': 'T-Shirts',
  Shirts: 'Shirts',
  Jeans: 'Jeans',
  Trousers: 'Trousers',
  Shorts: 'Shorts',
  Jackets: 'Jackets',
  Hoodies: 'Hoodies',
  Sweatshirts: 'Sweatshirts',
  Blazers: 'Blazers',
  'Ethnic Wear': 'Ethnic Wear',
}

const InfoRow = ({ label, value }) => (
  <div className="flex justify-between py-3 border-t border-border">
    <span className="text-[10px] font-semibold tracking-[0.12em] uppercase text-ink-soft">
      {label}
    </span>
    <span className="text-[12px] text-ink text-right">{value}</span>
  </div>
)

const VariantCard = ({ variant, basePrice, currency, isEditing, onToggleEdit, editForm }) => {
  const effectivePrice = variant.priceOverride ?? basePrice
  const cover = variant.images?.[0]?.url

  return (
    <div className="border-t border-border pt-6 pb-6">
      <div className="flex items-center gap-5">
        <div className="w-16 h-16 shrink-0 rounded-[3px] bg-cream-dark overflow-hidden flex items-center justify-center">
          {cover ? (
            <img src={cover} alt="" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon size={18} strokeWidth={1.5} className="text-ink-soft" />
          )}
        </div>

        <div className="flex-1 flex flex-wrap items-center gap-x-6 gap-y-1">
          <div className="flex items-center gap-2">
            <span className="border border-border rounded-[3px] px-3 py-1 text-[11px] font-semibold text-ink">
              {variant.size}
            </span>
            <span className="border border-border rounded-[3px] px-3 py-1 text-[11px] font-semibold text-ink">
              {variant.color}
            </span>
          </div>
          <span className="text-[11px] text-ink-soft">SKU · {variant.sku}</span>
          <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-ink-soft">
            {variant.stock > 0 ? `${variant.stock} in stock` : 'Out of stock'}
          </span>
          <span className="text-[13px] font-semibold text-ink">
            {currency} {effectivePrice}
          </span>
        </div>

        <button
          type="button"
          onClick={onToggleEdit}
          className="flex items-center gap-1.5 text-[11px] font-semibold tracking-[0.08em] uppercase text-ink-soft hover:text-ink transition-colors"
        >
          <Pencil size={13} strokeWidth={1.75} />
          {isEditing ? 'Close' : 'Edit'}
        </button>
      </div>

      {isEditing && <div className="mt-6 pl-[84px]">{editForm}</div>}
    </div>
  )
}

const SellerProductDetail = () => {
  const { productId } = useParams()
  const [product, setProduct] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeImage, setActiveImage] = useState(0)
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

  // ---------------- Add Variant form ----------------
  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
    formState: { errors: addErrors, isSubmitting: isAddSubmitting },
  } = useForm()

  const onSubmitAddVariant = async (data) => {
    const formData = new FormData()
    formData.append('size', data.size)
    formData.append('color', data.color)
    formData.append('sku', data.sku)
    formData.append('stock', data.stock)
    if (data.priceOverride) formData.append('priceOverride', data.priceOverride)
    if (data.images && data.images.length > 0) {
      Array.from(data.images).forEach((file) => formData.append('images', file))
    }

    await handleAddVariant(productId, formData)
    resetAdd()
    setShowAddForm(false)
    fetchProductDetail()
  }

  // ---------------- Edit Variant form (stub — wire the API call later) ----------------
  const {
    register: registerEdit,
    handleSubmit: handleSubmitEdit,
    reset: resetEdit,
  } = useForm()

  const openEditVariant = (variant) => {
    if (editingVariantId === variant._id) {
      setEditingVariantId(null)
      return
    }
    setEditingVariantId(variant._id)
    resetEdit({
      size: variant.size,
      color: variant.color,
      sku: variant.sku,
      stock: variant.stock,
      priceOverride: variant.priceOverride ?? '',
    })
  }

  const onSubmitEditVariant = async (data) => {
    // TODO: wire to a handleEditVariant(productId, variantId, formData) hook call once available
    console.log('Edit variant submit —', editingVariantId, data)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-[13px] text-ink-soft">Loading product…</p>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-cream flex items-center justify-center">
        <p className="text-[13px] text-ink-soft">Product not found.</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="max-w-[1440px] mx-auto px-5 md:px-8 lg:px-14 py-10 md:py-16">
        {/* ── Back + breadcrumb ── */}
        <Link
          to="/seller/inventory"
          className="inline-flex items-center gap-2 text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft hover:text-ink transition-colors mb-8"
        >
          <ArrowLeft size={14} strokeWidth={1.75} />
          Back to Inventory
        </Link>

        {/* ── Title row ── */}
        <div className="flex flex-wrap items-start justify-between gap-4 mb-12">
          <div>
            <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">
              {CATEGORY_LABEL[product.category] ?? product.category}
            </span>
            <h1 className="font-display font-normal text-[32px] md:text-[40px] leading-[1.05] text-ink">
              {product.title}
            </h1>
          </div>
          <span
            className={`text-[11px] font-semibold tracking-[0.1em] uppercase ${
              product.status === 'In-Stock' ? 'text-success' : 'text-error'
            }`}
          >
            {product.status}
          </span>
        </div>

        {/* ── Details grid ── */}
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-16 mb-20">
          {/* Gallery */}
          <div>
            <div className="aspect-square rounded-[3px] overflow-hidden bg-cream-dark">
              {product.images?.[activeImage]?.url ? (
                <img
                  src={product.images[activeImage].url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <ImageIcon size={28} strokeWidth={1.25} className="text-ink-soft" />
                </div>
              )}
            </div>
            {product.images?.length > 1 && (
              <div className="flex gap-3 mt-4">
                {product.images.map((img, i) => (
                  <button
                    key={img.url + i}
                    type="button"
                    onClick={() => setActiveImage(i)}
                    className={`w-16 h-16 rounded-[3px] overflow-hidden bg-cream-dark border ${
                      activeImage === i ? 'border-charcoal' : 'border-transparent'
                    }`}
                  >
                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Details panel */}
          <div>
            <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-3">
              The Details
            </span>
            <p className="text-[14px] leading-relaxed text-ink-soft mb-8">
              {product.description}
            </p>

            <div className="text-[20px] font-semibold text-ink mb-2">
              {product.price?.currency} {product.price?.amount}
            </div>

            <div className="space-y-0">
              <InfoRow label="Category" value={CATEGORY_LABEL[product.category] ?? product.category} />
              <InfoRow label="Total Stock" value={product.stock} />
              <InfoRow label="Status" value={product.status} />
              <InfoRow
                label="Listed On"
                value={new Date(product.createdAt).toLocaleDateString('en-IN', {
                  day: 'numeric',
                  month: 'short',
                  year: 'numeric',
                })}
              />
            </div>
          </div>
        </div>

        {/* ── Variants section ── */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold">
              Variants · {product.variants?.length ?? 0}
            </span>
            <button
              type="button"
              onClick={() => setShowAddForm((s) => !s)}
              className="flex items-center gap-2 bg-charcoal text-cream rounded-[3px] px-5 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
            >
              {showAddForm ? <X size={14} strokeWidth={2} /> : <Plus size={14} strokeWidth={2} />}
              {showAddForm ? 'Cancel' : 'Add Variant'}
            </button>
          </div>

          {(!product.variants || product.variants.length === 0) && !showAddForm && (
            <p className="text-[13px] text-ink-soft border-t border-border pt-6 mt-4">
              No variants yet. Add the first size/color combination to make this product sellable.
            </p>
          )}

          <div className="mt-4">
            {product.variants?.map((variant) => (
              <VariantCard
                key={variant._id}
                variant={variant}
                basePrice={product.price?.amount}
                currency={product.price?.currency}
                isEditing={editingVariantId === variant._id}
                onToggleEdit={() => openEditVariant(variant)}
                editForm={
                  <form
                    onSubmit={handleSubmitEdit(onSubmitEditVariant)}
                    className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5"
                  >
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                        Size
                      </label>
                      <input
                        {...registerEdit('size', { required: true })}
                        className="w-full rounded-[3px] border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                        Color
                      </label>
                      <input
                        {...registerEdit('color', { required: true })}
                        className="w-full rounded-[3px] border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                        SKU
                      </label>
                      <input
                        {...registerEdit('sku', { required: true })}
                        className="w-full rounded-[3px] border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                        Stock
                      </label>
                      <input
                        type="number"
                        {...registerEdit('stock', { required: true, min: 0 })}
                        className="w-full rounded-[3px] border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink outline-none focus:border-charcoal"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                        Price Override
                      </label>
                      <input
                        type="number"
                        placeholder={`Default ₹${product.price?.amount}`}
                        {...registerEdit('priceOverride')}
                        className="w-full rounded-[3px] border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-soft outline-none focus:border-charcoal"
                      />
                    </div>

                    <div className="sm:col-span-2 lg:col-span-3 flex gap-3 pt-1">
                      <button
                        type="submit"
                        className="bg-charcoal text-cream rounded-[3px] px-6 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
                      >
                        Save Changes
                      </button>
                      <button
                        type="button"
                        onClick={() => setEditingVariantId(null)}
                        className="border border-charcoal text-charcoal rounded-[3px] px-6 py-2.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-cream-dark transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </form>
                }
              />
            ))}
          </div>

          {/* ── Inline Add Variant form ── */}
          {showAddForm && (
            <form
              onSubmit={handleSubmitAdd(onSubmitAddVariant)}
              className="border-t border-border pt-8 mt-6"
            >
              <span className="block text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-5">
                New Variant
              </span>

              <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-5">
                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    Size
                  </label>
                  <input
                    placeholder="M"
                    aria-invalid={addErrors.size ? 'true' : 'false'}
                    className={`w-full rounded-[3px] border bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-soft outline-none focus:border-charcoal ${
                      addErrors.size ? 'border-error' : 'border-border'
                    }`}
                    {...registerAdd('size', { required: 'Size is required' })}
                  />
                  {addErrors.size && (
                    <p className="mt-1 text-[11px] text-error">{addErrors.size.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    Color
                  </label>
                  <input
                    placeholder="Black"
                    aria-invalid={addErrors.color ? 'true' : 'false'}
                    className={`w-full rounded-[3px] border bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-soft outline-none focus:border-charcoal ${
                      addErrors.color ? 'border-error' : 'border-border'
                    }`}
                    {...registerAdd('color', { required: 'Color is required' })}
                  />
                  {addErrors.color && (
                    <p className="mt-1 text-[11px] text-error">{addErrors.color.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    SKU
                  </label>
                  <input
                    placeholder="ZRV-SHT-BLK-M"
                    aria-invalid={addErrors.sku ? 'true' : 'false'}
                    className={`w-full rounded-[3px] border bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-soft outline-none focus:border-charcoal ${
                      addErrors.sku ? 'border-error' : 'border-border'
                    }`}
                    {...registerAdd('sku', { required: 'SKU is required' })}
                  />
                  {addErrors.sku && (
                    <p className="mt-1 text-[11px] text-error">{addErrors.sku.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    Stock
                  </label>
                  <input
                    type="number"
                    placeholder="0"
                    aria-invalid={addErrors.stock ? 'true' : 'false'}
                    className={`w-full rounded-[3px] border bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-soft outline-none focus:border-charcoal ${
                      addErrors.stock ? 'border-error' : 'border-border'
                    }`}
                    {...registerAdd('stock', { required: 'Stock is required', min: { value: 0, message: 'Stock cannot be negative' } })}
                  />
                  {addErrors.stock && (
                    <p className="mt-1 text-[11px] text-error">{addErrors.stock.message}</p>
                  )}
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    Price Override
                  </label>
                  <input
                    type="number"
                    placeholder={`Default ₹${product.price?.amount ?? ''}`}
                    className="w-full rounded-[3px] border border-border bg-surface px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-soft outline-none focus:border-charcoal"
                    {...registerAdd('priceOverride')}
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-1.5">
                    Images
                  </label>
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="w-full rounded-[3px] border border-border bg-surface px-3.5 py-2.5 text-[12px] text-ink-soft outline-none focus:border-charcoal file:mr-3 file:rounded-[3px] file:border-0 file:bg-cream-dark file:px-3 file:py-1.5 file:text-[11px] file:font-semibold file:uppercase file:tracking-[0.05em] file:text-ink"
                    {...registerAdd('images')}
                  />
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isAddSubmitting}
                  className="bg-charcoal text-cream rounded-[3px] px-7 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors disabled:opacity-60"
                >
                  {isAddSubmitting ? 'Adding…' : 'Add Variant'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    resetAdd()
                    setShowAddForm(false)
                  }}
                  className="border border-charcoal text-charcoal rounded-[3px] px-7 py-3 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-cream-dark transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerProductDetail