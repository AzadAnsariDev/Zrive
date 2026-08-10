import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useProduct } from '../hook/useProduct'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  X, Plus, UploadCloud, Info, Camera, Banknote,
  Trash2, ImageIcon, Layers, ArrowLeft, Package,
} from 'lucide-react'
import { setError, setLoading } from '../../auth/state/authSlice'
import KycRequiredModal from '../../seller/components/KycRequiredModal'

// ---- Config -----------------------------------------------------------
const MAX_IMAGES = 6
const MAX_VARIANT_IMAGES = 4
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const CURRENCIES = ['INR', 'USD', 'JPY', 'EUR', 'GBP']
const CATEGORIES = [
  'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts',
  'Jackets', 'Hoodies', 'Sweatshirts', 'Blazers', 'Ethnic Wear',
]

// ---- Shared classnames --------------------------------------------------
const cardClasses = 'rounded-xl border border-border bg-surface p-5 md:p-6'
const cardHeadClasses = 'flex items-center justify-between mb-5'
const cardTitleClasses = 'text-[15px] font-semibold text-ink'
const labelClasses = 'block text-[11px] font-semibold tracking-[0.06em] text-gold mb-1.5'
const inputClasses =
  'w-full rounded-lg border border-border bg-cream-dark px-3.5 py-2.5 text-[13.5px] text-ink placeholder:text-ink-soft outline-none focus:border-ink transition-colors'
const errorClasses = 'text-[11.5px] text-error mt-1'

const emptyVariantForm = { size: '', color: '', sku: '', stock: '', priceAmount: '', images: [] }

const CreateProduct = () => {
  // ---- general product images ----
  const [images, setImages] = useState([])
  const [imageError, setImageError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  // ---- variants (batch, local state — nothing hits the server till Publish) ----
  const [variants, setVariants] = useState([])
  const [variantsError, setVariantsError] = useState('')
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [variantForm, setVariantForm] = useState(emptyVariantForm)
  const [variantFieldErrors, setVariantFieldErrors] = useState({})
  const variantFileInputRef = useRef(null)
  const [showKycModal, setShowKycModal] = useState(false)
  const user = useSelector((state) => state.auth.user)
  const application = useSelector((state) => state.seller.application)

  const { handleCreateProduct } = useProduct()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '', description: '', priceAmount: '',
      priceCurrency: 'INR', category: '',
      weight: '', length: '', width: '', height: '',
    },
  })

  useEffect(() => {
    return () => {
      images.forEach((img) => URL.revokeObjectURL(img.preview))
      variants.forEach((v) => v.images.forEach((img) => URL.revokeObjectURL(img.preview)))
      variantForm.images.forEach((img) => URL.revokeObjectURL(img.preview))
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ---------------- General images ----------------
  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList)
      const remainingSlots = MAX_IMAGES - images.length
      if (remainingSlots <= 0) {
        setImageError(`You can only add up to ${MAX_IMAGES} photos.`)
        return
      }
      const accepted = []
      incoming.forEach((file) => {
        if (!file.type.startsWith('image/')) return
        if (file.size > MAX_SIZE_BYTES) return
        if (accepted.length >= remainingSlots) return
        accepted.push({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: URL.createObjectURL(file),
        })
      })
      setImageError('')
      if (accepted.length) setImages((prev) => [...prev, ...accepted])
    },
    [images.length]
  )

  const removeImage = (id) => {
    setImages((prev) => {
      const target = prev.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((img) => img.id !== id)
    })
  }

  const handleFileInputChange = (e) => {
    if (e.target.files?.length) addFiles(e.target.files)
    e.target.value = ''
  }
  const handleDrop = (e) => {
    e.preventDefault()
    setIsDragging(false)
    if (e.dataTransfer.files?.length) addFiles(e.dataTransfer.files)
  }
  const handleDragOver = (e) => { e.preventDefault(); setIsDragging(true) }
  const handleDragLeave = (e) => { e.preventDefault(); setIsDragging(false) }
  const openFilePicker = () => fileInputRef.current?.click()

  // ---------------- Variant form (inline, local only) ----------------
  const openVariantForm = () => {
    setVariantForm(emptyVariantForm)
    setVariantFieldErrors({})
    setShowVariantForm(true)
  }

  const closeVariantForm = () => {
    variantForm.images.forEach((img) => URL.revokeObjectURL(img.preview))
    setVariantForm(emptyVariantForm)
    setVariantFieldErrors({})
    setShowVariantForm(false)
  }

  const handleVariantFieldChange = (field, value) => {
    setVariantForm((prev) => ({ ...prev, [field]: value }))
  }

  const addVariantImages = (fileList) => {
    const incoming = Array.from(fileList)
    const remainingSlots = MAX_VARIANT_IMAGES - variantForm.images.length
    if (remainingSlots <= 0) return
    const accepted = []
    incoming.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      if (file.size > MAX_SIZE_BYTES) return
      if (accepted.length >= remainingSlots) return
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
        file,
        preview: URL.createObjectURL(file),
      })
    })
    if (accepted.length) {
      setVariantForm((prev) => ({ ...prev, images: [...prev.images, ...accepted] }))
      setVariantFieldErrors((prev) => ({ ...prev, images: undefined }))
    }
  }

  const removeVariantFormImage = (id) => {
    setVariantForm((prev) => {
      const target = prev.images.find((img) => img.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return { ...prev, images: prev.images.filter((img) => img.id !== id) }
    })
  }

  const validateVariantForm = () => {
    const errs = {}
    if (!variantForm.size.trim()) errs.size = 'Required'
    if (!variantForm.color.trim()) errs.color = 'Required'
    if (!variantForm.sku.trim()) errs.sku = 'Required'
    if (variantForm.stock === '' || Number(variantForm.stock) < 0) errs.stock = 'Required'
    if (variantForm.images.length === 0) errs.images = 'At least one image is required'
    setVariantFieldErrors(errs)
    return Object.keys(errs).length === 0
  }

  const saveVariant = () => {
    if (!validateVariantForm()) return
    setVariants((prev) => [...prev, { id: `v-${Date.now()}`, ...variantForm }])
    setVariantsError('')
    setVariantForm(emptyVariantForm)
    setVariantFieldErrors({})
    setShowVariantForm(false)
  }

  const removeVariant = (id) => {
    setVariants((prev) => {
      const target = prev.find((v) => v.id === id)
      if (target) target.images.forEach((img) => URL.revokeObjectURL(img.preview))
      return prev.filter((v) => v.id !== id)
    })
  }

  // ---------------- Submit ----------------
  const onSubmit = async (data) => {
    if (user?.role !== 'seller') {
      setShowKycModal(true)
      return
    }

    if (variants.length === 0) {
      setVariantsError('Add at least one variant before publishing.')
      return
    }

    const formData = new FormData()
    formData.append('title', data.name)
    formData.append('description', data.description)
    formData.append('priceAmount', data.priceAmount)
    formData.append('priceCurrency', data.priceCurrency)
    formData.append('category', data.category)

    const shippingDefaults = {
      weight: Number(data.weight),
      dimensions: {
        length: Number(data.length),
        width: Number(data.width),
        height: Number(data.height),
      },
    }
    formData.append('shippingDefaults', JSON.stringify(shippingDefaults))

    const variantsPayload = variants.map(({ size, color, sku, stock, priceAmount }) => {
      const v = { size, color, sku, stock }
      if (priceAmount) {
        v.price = { amount: Number(priceAmount), currency: data.priceCurrency || 'INR' }
      }
      return v
    })
    formData.append('variants', JSON.stringify(variantsPayload))

    images.forEach((img) => formData.append('images', img.file))
    variants.forEach((v, index) => {
      v.images.forEach((img) => formData.append(`variantImages_${index}`, img.file))
    })

    dispatch(setLoading(true))
    try {
      await handleCreateProduct(formData)
      navigate('/')
    } catch (err) {
      dispatch(setError(err.message))
    } finally {
      dispatch(setLoading(false))
    }
  }

  const dropzoneClasses = (base) =>
    `${base} transition-colors ${isDragging ? 'border-gold bg-cream-dark' : 'border-border hover:border-gold hover:bg-cream-dark'
    }`

  return (
    <div className="bg-cream min-h-full">
      <form onSubmit={handleSubmit(onSubmit)} className="max-w-[1240px] mx-auto">
        {/* ---------------- Sticky Header ---------------- */}
        <div className="sticky top-0 z-20 bg-cream/95 backdrop-blur-sm border-b border-border px-4 md:px-8 py-3 md:py-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="sm:hidden text-ink-soft hover:text-ink transition-colors"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="font-display text-[20px] md:text-[24px] font-medium text-ink">List a Product</h1>
              <p className="text-[12px] md:text-[13px] text-ink-soft mt-0.5 hidden sm:block">
                Add details, media and variants.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="hidden sm:block rounded-lg border border-border bg-surface px-4 py-2.5 text-[12.5px] font-medium text-ink-soft hover:bg-cream-dark transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-lg bg-charcoal px-4 py-2 sm:px-5 sm:py-2.5 text-[12px] sm:text-[12.5px] font-semibold text-cream hover:bg-ink transition-colors"
            >
              <span className="sm:hidden">Publish</span>
              <span className="hidden sm:inline">Publish Product</span>
            </button>
          </div>
        </div>

        <div className="px-4 pt-6 pb-8 md:px-8 md:pt-8 md:pb-8">
          <div className="grid lg:grid-cols-[1fr_300px] gap-5 items-start">
            {/* ================= LEFT: main content ================= */}
            <div className="space-y-5">
              {/* Product Details */}
              <div className={cardClasses}>
                <div className={cardHeadClasses}>
                  <h2 className={cardTitleClasses}>Product Details</h2>
                  <Info size={16} className="text-ink-soft/50" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>Product Name</label>
                    <input
                      type="text"
                      placeholder="e.g. Premium Silk Shirt"
                      className={inputClasses}
                      {...register('name', { required: 'Product name is required' })}
                    />
                    {errors.name && <p className={errorClasses}>{errors.name.message}</p>}
                  </div>

                  <div>
                    <label className={labelClasses}>Category</label>
                    <div className="relative">
                      <select
                        defaultValue=""
                        className={`${inputClasses} appearance-none`}
                        {...register('category', { required: 'Category is required' })}
                      >
                        <option value="" disabled>Select category</option>
                        {CATEGORIES.map((cat) => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-soft">▾</span>
                    </div>
                    {errors.category && <p className={errorClasses}>{errors.category.message}</p>}
                  </div>

                  <div>
                    <label className={labelClasses}>Description</label>
                    <textarea
                      rows={4}
                      placeholder="Describe the materials, fit, and condition..."
                      className={`${inputClasses} resize-none`}
                      {...register('description', { required: 'Description is required' })}
                    />
                    {errors.description && <p className={errorClasses}>{errors.description.message}</p>}
                  </div>
                </div>
              </div>

              {/* Pricing */}
              <div className={cardClasses}>
                <div className={cardHeadClasses}>
                  <h2 className={cardTitleClasses}>Pricing</h2>
                  <Banknote size={16} className="text-ink-soft/50" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClasses}>Price</label>
                    <input
                      type="number"
                      step="0.01"
                      min="100"
                      placeholder="0.00"
                      className={inputClasses}
                      {...register('priceAmount', { required: 'Price is required', min: { value: 100, message: 'Min ₹100' } })}
                    />
                    {errors.priceAmount && <p className={errorClasses}>{errors.priceAmount.message}</p>}
                  </div>
                  <div>
                    <label className={labelClasses}>Currency</label>
                    <div className="relative">
                      <select
                        defaultValue="INR"
                        className={`${inputClasses} appearance-none`}
                        {...register('priceCurrency', { required: true })}
                      >
                        {CURRENCIES.map((cur) => (
                          <option key={cur} value={cur}>{cur}</option>
                        ))}
                      </select>
                      <span className="pointer-events-none absolute right-3.5 top-1/2 -translate-y-1/2 text-[11px] text-ink-soft">▾</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Shipping */}
              <div className={cardClasses}>
                <div className={cardHeadClasses}>
                  <h2 className={cardTitleClasses}>Shipping Details</h2>
                  <Package size={16} className="text-ink-soft/50" />
                </div>

                <div className="space-y-4">
                  <div>
                    <label className={labelClasses}>Weight (kg)</label>
                    <input
                      type="number"
                      step="0.01"
                      min="0.01"
                      placeholder="0.5"
                      className={inputClasses}
                      {...register('weight', { required: 'Weight is required', min: { value: 0.01, message: 'Must be greater than 0' } })}
                    />
                    {errors.weight && <p className={errorClasses}>{errors.weight.message}</p>}
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className={labelClasses}>Length (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="20"
                        className={inputClasses}
                        {...register('length', { required: 'Required', min: { value: 0.1, message: 'Invalid' } })}
                      />
                      {errors.length && <p className={errorClasses}>{errors.length.message}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>Width (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="15"
                        className={inputClasses}
                        {...register('width', { required: 'Required', min: { value: 0.1, message: 'Invalid' } })}
                      />
                      {errors.width && <p className={errorClasses}>{errors.width.message}</p>}
                    </div>
                    <div>
                      <label className={labelClasses}>Height (cm)</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.1"
                        placeholder="10"
                        className={inputClasses}
                        {...register('height', { required: 'Required', min: { value: 0.1, message: 'Invalid' } })}
                      />
                      {errors.height && <p className={errorClasses}>{errors.height.message}</p>}
                    </div>
                  </div>
                </div>
              </div>

              {/* Variants */}
              <div className={cardClasses}>
                <div className={cardHeadClasses}>
                  <div className="flex items-center gap-2">
                    <h2 className={cardTitleClasses}>Variants</h2>
                    <Layers size={14} className="text-ink-soft/50" />
                  </div>
                  {!showVariantForm && (
                    <button
                      type="button"
                      onClick={openVariantForm}
                      className="flex items-center gap-1.5 text-[12.5px] font-semibold text-gold hover:text-gold-deep transition-colors"
                    >
                      <Plus size={14} /> Add Variant
                    </button>
                  )}
                </div>

                {variants.length === 0 && !showVariantForm && (
                  <p className="text-[13px] text-ink-soft py-2">
                    No variants yet. Add at least one size/color combination to publish.
                  </p>
                )}

                {variants.length > 0 && (
                  <div className="divide-y divide-border -mx-1 mb-1">
                    {variants.map((v) => (
                      <div key={v.id} className="flex items-center gap-4 py-3 px-1">
                        <div className="w-11 h-11 shrink-0 rounded-lg bg-cream-dark overflow-hidden flex items-center justify-center">
                          {v.images[0] ? (
                            <img src={v.images[0].preview} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <ImageIcon size={15} className="text-ink-soft" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0 grid grid-cols-2 sm:grid-cols-4 gap-x-3 gap-y-0.5">
                          <span className="text-[13px] font-medium text-ink">{v.size}</span>
                          <span className="text-[13px] text-ink-soft">{v.color}</span>
                          <span className="text-[11.5px] text-ink-soft truncate">{v.sku}</span>
                          <span className="text-[12.5px] text-ink-soft">
                            {v.stock} in stock{v.priceAmount ? ` · ₹${v.priceAmount}` : ''}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeVariant(v.id)}
                          className="text-ink-soft hover:text-error transition-colors shrink-0"
                          aria-label="Remove variant"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {showVariantForm && (
                  <div className="rounded-lg border border-dashed border-gold bg-cream-dark p-4 mt-2">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
                      <div>
                        <label className={labelClasses}>Size</label>
                        <input
                          type="text"
                          placeholder="M"
                          value={variantForm.size}
                          onChange={(e) => handleVariantFieldChange('size', e.target.value)}
                          className={`${inputClasses} bg-surface`}
                        />
                        {variantFieldErrors.size && <p className={errorClasses}>{variantFieldErrors.size}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>Color</label>
                        <input
                          type="text"
                          placeholder="Black"
                          value={variantForm.color}
                          onChange={(e) => handleVariantFieldChange('color', e.target.value)}
                          className={`${inputClasses} bg-surface`}
                        />
                        {variantFieldErrors.color && <p className={errorClasses}>{variantFieldErrors.color}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>SKU</label>
                        <input
                          type="text"
                          placeholder="ZRV-01"
                          value={variantForm.sku}
                          onChange={(e) => handleVariantFieldChange('sku', e.target.value)}
                          className={`${inputClasses} bg-surface`}
                        />
                        {variantFieldErrors.sku && <p className={errorClasses}>{variantFieldErrors.sku}</p>}
                      </div>
                      <div>
                        <label className={labelClasses}>Stock</label>
                        <input
                          type="number"
                          min="0"
                          placeholder="0"
                          value={variantForm.stock}
                          onChange={(e) => handleVariantFieldChange('stock', e.target.value)}
                          className={`${inputClasses} bg-surface`}
                        />
                        {variantFieldErrors.stock && <p className={errorClasses}>{variantFieldErrors.stock}</p>}
                      </div>
                    </div>

                    <div className="grid sm:grid-cols-2 gap-3 mb-3">
                      <div>
                        <label className={labelClasses}>Variant Price (optional)</label>
                        <input
                          type="number"
                          placeholder="Leave blank to use base price"
                          value={variantForm.priceAmount}
                          onChange={(e) => handleVariantFieldChange('priceAmount', e.target.value)}
                          className={`${inputClasses} bg-surface`}
                        />
                      </div>
                      <div>
                        <label className={labelClasses}>Images</label>
                        <input
                          ref={variantFileInputRef}
                          type="file"
                          accept="image/*"
                          multiple
                          className="hidden"
                          onChange={(e) => { if (e.target.files?.length) addVariantImages(e.target.files); e.target.value = '' }}
                        />
                        <button
                          type="button"
                          onClick={() => variantFileInputRef.current?.click()}
                          className="w-full rounded-lg border border-dashed border-border bg-surface px-3.5 py-2.5 text-[12.5px] text-ink-soft hover:border-gold transition-colors flex items-center justify-center gap-2"
                        >
                          <UploadCloud size={14} /> Upload images
                        </button>
                        {variantFieldErrors.images && <p className={errorClasses}>{variantFieldErrors.images}</p>}
                      </div>
                    </div>

                    {variantForm.images.length > 0 && (
                      <div className="flex flex-wrap gap-2 mb-4">
                        {variantForm.images.map((img) => (
                          <div key={img.id} className="relative w-14 h-14 rounded-lg overflow-hidden border border-border">
                            <img src={img.preview} alt="" className="w-full h-full object-cover" />
                            <button
                              type="button"
                              onClick={() => removeVariantFormImage(img.id)}
                              className="absolute top-0.5 right-0.5 w-4 h-4 rounded-full bg-charcoal/80 flex items-center justify-center text-cream"
                            >
                              <X size={10} />
                            </button>
                          </div>
                        ))}
                      </div>
                    )}

                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={saveVariant}
                        className="rounded-lg bg-charcoal px-4 py-2 text-[12px] font-semibold text-cream hover:bg-ink transition-colors"
                      >
                        Add
                      </button>
                      <button
                        type="button"
                        onClick={closeVariantForm}
                        className="rounded-lg border border-border bg-surface px-4 py-2 text-[12px] font-medium text-ink-soft hover:bg-cream-dark transition-colors"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}

                {variantsError && <p className={errorClasses}>{variantsError}</p>}
              </div>
            </div>

            {/* ================= RIGHT: media + summary ================= */}
            <div className="space-y-5">
              {/* Product Media */}
              <div className={cardClasses}>
                <div className={cardHeadClasses}>
                  <h2 className={cardTitleClasses}>Product Media</h2>
                  <Camera size={16} className="text-ink-soft/50" />
                </div>

                <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInputChange} />

                <button
                  type="button"
                  onClick={openFilePicker}
                  onDrop={handleDrop}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  className={dropzoneClasses('w-full rounded-lg border-2 border-dashed py-6 flex flex-col items-center justify-center gap-2 bg-cream-dark/40 mb-3')}
                >
                  <UploadCloud size={18} className="text-gold" />
                  <span className="text-[11.5px] text-ink-soft text-center leading-relaxed px-2">
                    Click or drag images to upload
                  </span>
                </button>

                {images.length > 0 && (
                  <div className="grid grid-cols-3 gap-2">
                    {images.map((img, i) => (
                      <div key={img.id} className="relative aspect-square rounded-lg overflow-hidden border border-border">
                        <img src={img.preview} alt="" className="w-full h-full object-cover" />
                        {i === 0 && (
                          <span className="absolute top-1 left-1 text-[8.5px] font-semibold uppercase tracking-wide px-1.5 py-0.5 rounded bg-charcoal text-cream">
                            Cover
                          </span>
                        )}
                        <button
                          type="button"
                          onClick={() => removeImage(img.id)}
                          className="absolute top-1 right-1 w-5 h-5 rounded-full bg-charcoal/80 flex items-center justify-center text-cream"
                        >
                          <X size={11} />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
                {imageError && <p className={`${errorClasses} mt-2`}>{imageError}</p>}
              </div>

              {/* Listing Summary */}
              <div className={cardClasses}>
                <div className={cardHeadClasses}>
                  <h2 className={cardTitleClasses}>Listing Summary</h2>
                </div>
                <div className="space-y-0 -mt-1">
                  <div className="flex justify-between py-2.5 border-t border-border text-[12.5px]">
                    <span className="text-ink-soft">Variants</span>
                    <span className="font-medium text-ink">{variants.length}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-t border-border text-[12.5px]">
                    <span className="text-ink-soft">Product Images</span>
                    <span className="font-medium text-ink">{images.length}</span>
                  </div>
                  <div className="flex justify-between py-2.5 border-t border-border text-[12.5px]">
                    <span className="text-ink-soft">Total Stock</span>
                    <span className="font-medium text-ink">
                      {variants.reduce((sum, v) => sum + (Number(v.stock) || 0), 0)}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </form>
      {showKycModal && (
        <KycRequiredModal
          onClose={() => setShowKycModal(false)}
          onGoToKyc={() => navigate('/seller/become-seller/verify')}
          applicationStatus={application.applicationStatus}
        />
      )}
    </div>
  )
}

export default CreateProduct