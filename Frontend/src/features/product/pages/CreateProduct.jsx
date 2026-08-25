import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useProduct } from '../hook/useProduct'
import { useNavigate } from 'react-router'
import { useDispatch, useSelector } from 'react-redux'
import {
  X, Plus, UploadCloud, Info, Camera, Banknote,
  Trash2, ImageIcon, Layers, ArrowLeft, Package, Check,
} from 'lucide-react'
import { setError, setLoading } from '../../auth/state/authSlice'
import KycRequiredModal from '../../seller/components/KycRequiredModal'
import { notify } from '../../../utils/toast'

const MAX_IMAGES = 6
const MAX_VARIANT_IMAGES = 4
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const CURRENCIES = ['INR', 'USD', 'JPY', 'EUR', 'GBP']
const CATEGORIES = [
  'T-Shirts', 'Shirts', 'Jeans', 'Trousers', 'Shorts',
  'Jackets', 'Hoodies', 'Sweatshirts', 'Blazers', 'Accessories',
]

const emptyVariantForm = { size: '', color: '', sku: '', stock: '', priceAmount: '', images: [] }

const CreateProduct = () => {
  const [images, setImages] = useState([])
  const [imageError, setImageError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const [submitAttempted, setSubmitAttempted] = useState(false)
  const fileInputRef = useRef(null)

  const [variants, setVariants] = useState([])
  const [variantsError, setVariantsError] = useState('')
  const [showVariantForm, setShowVariantForm] = useState(false)
  const [variantForm, setVariantForm] = useState(emptyVariantForm)
  const [variantFieldErrors, setVariantFieldErrors] = useState({})
  const variantFileInputRef = useRef(null)
  const [showKycModal, setShowKycModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
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
  }, [])

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList)
      const remainingSlots = MAX_IMAGES - images.length
      if (remainingSlots <= 0) {
        setImageError(`You can only add up to ${MAX_IMAGES} photos.`)
        notify.warning(`Maximum ${MAX_IMAGES} photos allowed.`)
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
      const target = prev.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((i) => i.id !== id)
    })
  }

  const addVariantFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList)
      const remainingSlots = MAX_VARIANT_IMAGES - variantForm.images.length
      if (remainingSlots <= 0) {
        notify.warning(`Maximum ${MAX_VARIANT_IMAGES} variant photos allowed.`)
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
      if (accepted.length) setVariantForm((prev) => ({ ...prev, images: [...prev.images, ...accepted] }))
    },
    [variantForm.images.length]
  )

  const removeVariantImage = (id) => {
    setVariantForm((prev) => {
      const target = prev.images.find((i) => i.id === id)
      if (target) URL.revokeObjectURL(target.preview)
      return { ...prev, images: prev.images.filter((i) => i.id !== id) }
    })
  }

  const handleAddVariant = () => {
    const errs = {}
    if (!variantForm.size.trim()) errs.size = 'Required'
    if (!variantForm.color.trim()) errs.color = 'Required'
    if (!variantForm.sku.trim()) errs.sku = 'Required'
    if (!variantForm.stock || Number(variantForm.stock) < 0) errs.stock = 'Invalid stock'
    if (variantForm.images.length === 0) errs.images = 'At least 1 variant image is required'
    if (Object.keys(errs).length > 0) {
      setVariantFieldErrors(errs)
      notify.error('Please fill in all required variant fields including image.')
      return
    }

    const newVariant = {
      id: Math.random().toString(36).slice(2, 8),
      size: variantForm.size.trim().toUpperCase(),
      color: variantForm.color.trim(),
      sku: variantForm.sku.trim().toUpperCase(),
      stock: Number(variantForm.stock),
      priceOverride: variantForm.priceAmount ? Number(variantForm.priceAmount) : null,
      images: variantForm.images,
    }

    setVariants((prev) => [...prev, newVariant])
    setVariantForm(emptyVariantForm)
    setVariantFieldErrors({})
    setShowVariantForm(false)
    setVariantsError('')
    notify.success('Variant added to list')
  }

  const removeVariant = (id) => {
    setVariants((prev) => {
      const target = prev.find((v) => v.id === id)
      if (target) target.images.forEach((img) => URL.revokeObjectURL(img.preview))
      return prev.filter((v) => v.id !== id)
    })
    notify.success('Variant removed')
  }

  const onSubmit = async (data) => {
    setSubmitAttempted(true)
    if (application?.applicationStatus !== 'approved') {
      setShowKycModal(true)
      return
    }

    if (images.length === 0) {
      setImageError('At least 1 main product image is required.')
      notify.error('Please upload at least 1 main product photo.')
      return
    }

    if (variants.length === 0) {
      setVariantsError('At least one variant is required.')
      notify.error('Please add at least one variant (size + color + image) before publishing.')
      return
    }

    const fd = new FormData()

    fd.append('title', data.name.trim())
    fd.append('description', data.description.trim())
    fd.append('category', data.category)
    fd.append('priceAmount', String(Number(data.priceAmount)))
    fd.append('priceCurrency', data.priceCurrency || 'INR')

    fd.append('shippingDefaults', JSON.stringify({
      weight: Number(data.weight),
      dimensions: {
        length: Number(data.length),
        width: Number(data.width),
        height: Number(data.height),
      },
    }))

    images.forEach((img) => fd.append('images', img.file))

    const variantsPayload = variants.map((v) => ({
      size: v.size,
      color: v.color,
      sku: v.sku,
      stock: v.stock,
      priceOverride: v.priceOverride ?? null,
    }))
    fd.append('variants', JSON.stringify(variantsPayload))

    // Map each variant's files to corresponding variantImages_index field for backend upload
    variants.forEach((v, index) => {
      v.images.forEach((img) => fd.append(`variantImages_${index}`, img.file))
    })

    setSubmitting(true)
    try {
      const ok = await handleCreateProduct(fd)
      if (ok) {
        notify.success('Product created and published successfully!')
        navigate('/seller/inventory')
      }
    } catch (err) {
      notify.error(err, 'Failed to create product listing.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header bar */}
      <div className="border-b border-[#E5E5E5] bg-[#FAFAFA]">
        <div className="max-w-[1200px] mx-auto px-5 md:px-8 py-4 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/seller/inventory')}
            className="flex items-center gap-2 text-[12px] font-medium text-[#666666] hover:text-[#111111] transition-colors cursor-pointer"
          >
            <ArrowLeft size={15} strokeWidth={2} />
            Back to Inventory
          </button>
          <span className="text-[11px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            New Product Wizard
          </span>
        </div>
      </div>

      <div className="max-w-[1000px] mx-auto px-5 md:px-8 pt-8">
        <div className="mb-8 border-b border-[#E5E5E5] pb-4">
          <h1 className="font-display text-[28px] md:text-[36px] font-bold text-[#111111]">
            Create New Product Listing
          </h1>
          <p className="text-[13px] text-[#666666] mt-0.5">
            Add high quality images, dimensions, and size/color variants for your catalog.
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
          {/* Section 1: Basic Info */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[10px] p-6 md:p-8 space-y-6">
            <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#B08D57] pb-3 border-b border-[#E5E5E5]">
              1. Basic Product Details
            </h2>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#666666] mb-2">Product Title *</label>
              <input
                type="text"
                placeholder="e.g. Classic Oversized Heavyweight Tee"
                className="w-full bg-white border border-[#E5E5E5] rounded-[6px] px-4 py-3 text-[13px] text-[#111111] outline-none focus:border-[#B08D57]"
                {...register('name', { required: 'Title is required' })}
              />
              {errors.name && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.name.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#666666] mb-2">Category *</label>
                <select
                  className="w-full bg-white border border-[#E5E5E5] rounded-[6px] px-4 py-3 text-[13px] text-[#111111] outline-none focus:border-[#B08D57]"
                  {...register('category', { required: 'Category is required' })}
                >
                  <option value="">Select Category</option>
                  {CATEGORIES.map((c) => (
                    <option key={c.id} value={c.label}>{c.label}</option>
                  ))}
                </select>
                {errors.category && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.category.message}</p>}
              </div>

              <div>
                <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#666666] mb-2">Base Price (₹) *</label>
                <div className="flex gap-2">
                  <select
                    className="w-24 bg-white border border-[#E5E5E5] rounded-[6px] px-3 py-3 text-[13px] font-bold text-[#111111] outline-none"
                    {...register('priceCurrency')}
                  >
                    {CURRENCIES.map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                  <input
                    type="number"
                    placeholder="1999"
                    className="flex-1 bg-white border border-[#E5E5E5] rounded-[6px] px-4 py-3 text-[13px] text-[#111111] outline-none focus:border-[#B08D57]"
                    {...register('priceAmount', { required: 'Price is required', min: 1 })}
                  />
                </div>
                {errors.priceAmount && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.priceAmount.message}</p>}
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold uppercase tracking-[0.1em] text-[#666666] mb-2">Description *</label>
              <textarea
                rows={4}
                placeholder="Describe fabric composition, fit type, care instructions..."
                className="w-full bg-white border border-[#E5E5E5] rounded-[6px] px-4 py-3 text-[13px] text-[#111111] outline-none focus:border-[#B08D57]"
                {...register('description', { required: 'Description is required' })}
              />
              {errors.description && <p className="text-[11px] text-[#C43D3D] mt-1">{errors.description.message}</p>}
            </div>
          </div>

          {/* Section 2: Media Upload */}
          <div className={`bg-[#FAFAFA] border rounded-[10px] p-6 md:p-8 space-y-6 ${
            submitAttempted && images.length === 0 ? 'border-[#C43D3D]' : 'border-[#E5E5E5]'
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#B08D57]">
                2. Product Media ({images.length}/{MAX_IMAGES})
              </h2>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#C43D3D] bg-[#FCECEC] px-2 py-0.5 rounded">
                Required · Min 1
              </span>
            </div>

            <label className={`border-2 border-dashed rounded-[10px] p-8 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
              submitAttempted && images.length === 0
                ? 'border-[#C43D3D] bg-[#FFF8F8]'
                : 'border-[#E5E5E5] hover:border-[#B08D57] bg-white'
            }`}>
              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="image/*"
                onChange={(e) => addFiles(e.target.files)}
                className="hidden"
              />
              <UploadCloud size={32} className={submitAttempted && images.length === 0 ? 'text-[#C43D3D]' : 'text-[#B08D57]'} style={{marginBottom: 8}} />
              <p className="text-[13.5px] font-bold text-[#111111]">Upload High Resolution Photos</p>
              <p className="text-[11.5px] text-[#777777] mt-0.5">At least 1 required. Up to 6 photos, max 5MB each.</p>
            </label>

            {imageError && <p className="text-[11.5px] text-[#C43D3D] font-medium">{imageError}</p>}

            {images.length > 0 && (
              <div className="grid grid-cols-3 sm:grid-cols-6 gap-4">
                {images.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-[6px] overflow-hidden border border-[#E5E5E5] group">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                    >
                      <X size={13} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Section 3: Package Dimensions */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[10px] p-6 md:p-8 space-y-6">
            <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#B08D57] pb-3 border-b border-[#E5E5E5]">
              3. Package Dimensions (For Shiprocket Courier Calculation)
            </h2>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666666] mb-1.5">Weight (KG) *</label>
                <input
                  type="number"
                  step="0.1"
                  placeholder="0.5"
                  className="w-full bg-white border border-[#E5E5E5] rounded-[6px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#B08D57]"
                  {...register('weight', { required: 'Required' })}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666666] mb-1.5">Length (CM) *</label>
                <input
                  type="number"
                  step="any"
                  placeholder="30"
                  className="w-full bg-white border border-[#E5E5E5] rounded-[6px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#B08D57]"
                  {...register('length', { required: 'Required' })}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666666] mb-1.5">Width (CM) *</label>
                <input
                  type="number"
                  step="any"
                  placeholder="20"
                  className="w-full bg-white border border-[#E5E5E5] rounded-[6px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#B08D57]"
                  {...register('width', { required: 'Required' })}
                />
              </div>

              <div>
                <label className="block text-[10.5px] font-bold uppercase text-[#666666] mb-1.5">Height (CM) *</label>
                <input
                  type="number"
                  step="any"
                  placeholder="5"
                  className="w-full bg-white border border-[#E5E5E5] rounded-[6px] px-3.5 py-2.5 text-[13px] outline-none focus:border-[#B08D57]"
                  {...register('height', { required: 'Required' })}
                />
              </div>
            </div>
          </div>

          {/* Section 4: Variants */}
          <div className="bg-[#FAFAFA] border border-[#E5E5E5] rounded-[10px] p-6 md:p-8 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-[#E5E5E5]">
              <h2 className="text-[12px] font-bold tracking-[0.14em] uppercase text-[#B08D57]">
                4. Variants & Stock ({variants.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowVariantForm(!showVariantForm)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] bg-[#111111] text-white text-[11px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all cursor-pointer"
              >
                <Plus size={14} />
                Add Variant
              </button>
            </div>

            {showVariantForm && (
              <div className="bg-white p-5 rounded-[8px] border border-[#E5E5E5] space-y-4">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Size (e.g. M, L) *</label>
                    <input
                      type="text"
                      placeholder="M"
                      value={variantForm.size}
                      onChange={(e) => { setVariantForm({ ...variantForm, size: e.target.value }); setVariantFieldErrors((p) => ({ ...p, size: '' })) }}
                      className={`w-full bg-[#FAFAFA] border rounded p-2 text-[12.5px] outline-none ${
                        variantFieldErrors.size ? 'border-[#C43D3D]' : 'border-[#E5E5E5]'
                      }`}
                    />
                    {variantFieldErrors.size && <p className="text-[10px] text-[#C43D3D] mt-0.5">{variantFieldErrors.size}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Color (e.g. Navy) *</label>
                    <input
                      type="text"
                      placeholder="Navy"
                      value={variantForm.color}
                      onChange={(e) => { setVariantForm({ ...variantForm, color: e.target.value }); setVariantFieldErrors((p) => ({ ...p, color: '' })) }}
                      className={`w-full bg-[#FAFAFA] border rounded p-2 text-[12.5px] outline-none ${
                        variantFieldErrors.color ? 'border-[#C43D3D]' : 'border-[#E5E5E5]'
                      }`}
                    />
                    {variantFieldErrors.color && <p className="text-[10px] text-[#C43D3D] mt-0.5">{variantFieldErrors.color}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">SKU Code *</label>
                    <input
                      type="text"
                      placeholder="TEE-NAVY-M"
                      value={variantForm.sku}
                      onChange={(e) => { setVariantForm({ ...variantForm, sku: e.target.value }); setVariantFieldErrors((p) => ({ ...p, sku: '' })) }}
                      className={`w-full bg-[#FAFAFA] border rounded p-2 text-[12.5px] outline-none ${
                        variantFieldErrors.sku ? 'border-[#C43D3D]' : 'border-[#E5E5E5]'
                      }`}
                    />
                    {variantFieldErrors.sku && <p className="text-[10px] text-[#C43D3D] mt-0.5">{variantFieldErrors.sku}</p>}
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold uppercase text-[#666] mb-1">Stock Count *</label>
                    <input
                      type="number"
                      placeholder="50"
                      value={variantForm.stock}
                      onChange={(e) => { setVariantForm({ ...variantForm, stock: e.target.value }); setVariantFieldErrors((p) => ({ ...p, stock: '' })) }}
                      className={`w-full bg-[#FAFAFA] border rounded p-2 text-[12.5px] outline-none ${
                        variantFieldErrors.stock ? 'border-[#C43D3D]' : 'border-[#E5E5E5]'
                      }`}
                    />
                    {variantFieldErrors.stock && <p className="text-[10px] text-[#C43D3D] mt-0.5">{variantFieldErrors.stock}</p>}
                  </div>
                </div>

                {/* Variant Images — REQUIRED */}
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <label className="block text-[10px] font-bold uppercase text-[#666]">Variant Images *</label>
                    <span className="text-[9px] font-bold uppercase tracking-wider text-[#C43D3D] bg-[#FCECEC] px-1.5 py-0.5 rounded">
                      Min 1 required
                    </span>
                  </div>

                  <label className={`border-2 border-dashed rounded-[8px] px-4 py-5 flex flex-col items-center justify-center cursor-pointer transition-colors text-center ${
                    variantFieldErrors.images ? 'border-[#C43D3D] bg-[#FFF8F8]' : 'border-[#E5E5E5] hover:border-[#B08D57] bg-[#FAFAFA]'
                  }`}>
                    <input
                      ref={variantFileInputRef}
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => { addVariantFiles(e.target.files); setVariantFieldErrors((p) => ({ ...p, images: '' })) }}
                      className="hidden"
                    />
                    <Camera size={22} className={variantFieldErrors.images ? 'text-[#C43D3D]' : 'text-[#B08D57]'} style={{marginBottom: 4}} />
                    <p className="text-[12px] font-bold text-[#111]">Upload Variant Photos</p>
                    <p className="text-[10.5px] text-[#777] mt-0.5">Up to {MAX_VARIANT_IMAGES} photos for this color/size</p>
                  </label>

                  {variantFieldErrors.images && (
                    <p className="text-[11px] text-[#C43D3D] mt-1 font-medium">{variantFieldErrors.images}</p>
                  )}

                  {variantForm.images.length > 0 && (
                    <div className="flex gap-2 mt-3 flex-wrap">
                      {variantForm.images.map((img) => (
                        <div key={img.id} className="relative w-16 h-16 rounded-[6px] overflow-hidden border border-[#E5E5E5] group">
                          <img src={img.preview} alt="" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => removeVariantImage(img.id)}
                            className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/70 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                          >
                            <X size={10} />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => { setShowVariantForm(false); setVariantForm(emptyVariantForm); setVariantFieldErrors({}) }}
                    className="px-4 py-2 border rounded text-[11px] font-bold uppercase cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleAddVariant}
                    className="px-5 py-2 bg-[#B08D57] text-[#0e0e0e] rounded text-[11px] font-bold uppercase cursor-pointer"
                  >
                    Save Variant
                  </button>
                </div>
              </div>
            )}

            {variants.length > 0 && (
              <div className="space-y-2">
                {variants.map((v) => (
                  <div key={v.id} className="flex items-center justify-between p-3.5 bg-white border border-[#E5E5E5] rounded-[6px]">
                    <div className="flex items-center gap-3 text-[12.5px]">
                      <span className="font-bold text-[#111111]">{v.sku}</span>
                      <span className="text-[#666666]">Size: {v.size} · Color: {v.color}</span>
                      <span className="text-[#287A4B] font-bold">Stock: {v.stock}</span>
                    </div>
                    <button type="button" onClick={() => removeVariant(v.id)} className="text-[#C43D3D] cursor-pointer">
                      <Trash2 size={15} />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex justify-end pt-4">
            <button
              type="submit"
              disabled={submitting}
              className="flex items-center gap-2 bg-[#111111] text-white px-10 py-4 rounded-[6px] text-[13px] font-bold uppercase tracking-[0.08em] hover:bg-[#B08D57] transition-all shadow-lg cursor-pointer disabled:opacity-50"
            >
              {submitting ? 'Publishing...' : 'Publish Product to Storefront'}
              <Check size={16} strokeWidth={3} />
            </button>
          </div>
        </form>
      </div>

      {showKycModal && <KycRequiredModal onClose={() => setShowKycModal(false)} />}
    </div>
  )
}

export default CreateProduct