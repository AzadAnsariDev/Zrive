import React, { useState, useRef, useEffect, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { useProduct } from '../hook/useProduct'
import { useNavigate } from 'react-router'
import { useDispatch } from 'react-redux'
import { X, Plus, UploadCloud, ArrowRight } from 'lucide-react'
import { setError, setLoading } from '../../auth/state/authSlice'

// ---- Config -----------------------------------------------------------
const MAX_IMAGES = 7
const MAX_SIZE_MB = 5
const MAX_SIZE_BYTES = MAX_SIZE_MB * 1024 * 1024

const CURRENCIES = ['INR', 'USD', 'JPY', 'EUR', 'GBP']
const STATUSES = ['In-Stock', 'Out of Stock']
const CATEGORIES = [
  'T-Shirts',
  'Shirts',
  'Jeans',
  'Trousers',
  'Shorts',
  'Jackets',
  'Hoodies',
  'Sweatshirts',
  'Blazers',
  'Ethnic Wear',
]

// Small shared classnames
const inputClasses =
  'w-full rounded-[3px] border border-border bg-cream-dark px-4 py-3.5 text-[14px] text-ink placeholder:text-ink-soft outline-none focus:border-ink transition-colors'

const cardClasses = 'rounded-[3px] border border-border bg-surface shadow-sm p-6 lg:p-8'

const labelClasses =
  'block text-[11px] font-semibold tracking-[0.1em] uppercase text-ink-soft mb-2'

const errorClasses = 'text-[12px] text-error mt-1.5'

const SectionEyebrow = ({ num, label }) => (
  <div className="flex items-center gap-2.5 mb-2">
    <span className="text-[11px] font-semibold tracking-[0.08em] text-gold">{num}</span>
    <span className="w-4 h-px bg-border" />
    <span className="text-[11px] font-semibold tracking-[0.16em] uppercase text-gold">
      {label}
    </span>
  </div>
)

const CreateProduct = () => {
  const [images, setImages] = useState([])
  const [imageError, setImageError] = useState('')
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef(null)

  const { handleCreateProduct } = useProduct()
  const navigate = useNavigate()
  const dispatch = useDispatch()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    defaultValues: {
      name: '',
      description: '',
      priceAmount: '',
      priceCurrency: 'INR',
      category: '',
      status: 'In-Stock',
      stock: '',
    },
  })

  useEffect(() => {
    return () => images.forEach((img) => URL.revokeObjectURL(img.preview))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const addFiles = useCallback(
    (fileList) => {
      const incoming = Array.from(fileList)
      const remainingSlots = MAX_IMAGES - images.length

      if (remainingSlots <= 0) {
        setImageError(`You can only add up to ${MAX_IMAGES} photos.`)
        return
      }

      const accepted = []
      let rejectedForSize = false
      let rejectedForCount = false

      incoming.forEach((file) => {
        if (!file.type.startsWith('image/')) return
        if (file.size > MAX_SIZE_BYTES) {
          rejectedForSize = true
          return
        }
        if (accepted.length >= remainingSlots) {
          rejectedForCount = true
          return
        }
        accepted.push({
          id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 8)}`,
          file,
          preview: URL.createObjectURL(file),
        })
      })

      if (rejectedForSize && rejectedForCount) {
        setImageError(`Some photos were skipped — each photo must be under ${MAX_SIZE_MB}MB, and you can add up to ${MAX_IMAGES} in total.`)
      } else if (rejectedForSize) {
        setImageError(`Some photos were skipped — each photo must be under ${MAX_SIZE_MB}MB.`)
      } else if (rejectedForCount) {
        setImageError(`Only ${remainingSlots} more photo${remainingSlots === 1 ? '' : 's'} could be added (max ${MAX_IMAGES}).`)
      } else {
        setImageError('')
      }

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
    setImageError('')
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

  const handleDragOver = (e) => {
    e.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setIsDragging(false)
  }

  const openFilePicker = () => fileInputRef.current?.click()

  const onSubmit = async (data) => {
    const formData = new FormData()
    formData.append('title', data.name)
    formData.append('description', data.description)
    formData.append('priceAmount', data.priceAmount)
    formData.append('priceCurrency', data.priceCurrency)
    formData.append('category', data.category)
    formData.append('status', data.status)
    formData.append('stock', data.stock)

    images.forEach((img) => {
      formData.append('images', img.file)
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

  const cover = images[0]
  const rest = images.slice(1)

  const dropzoneClasses = (base) =>
    `${base} transition-colors ${
      isDragging
        ? 'border-gold bg-cream-dark'
        : 'border-border hover:border-gold hover:bg-cream-dark'
    }`

  return (
    <div className="bg-cream min-h-full">
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="
          px-5 pt-10 pb-32 max-w-md mx-auto
          md:max-w-2xl md:px-10 md:py-16
          lg:max-w-6xl lg:px-14 lg:py-16
          lg:grid lg:grid-cols-[420px_1fr] lg:gap-10 lg:items-start lg:pb-24
        "
      >
        {/* ---------------- Page title ---------------- */}
        <div className="mb-10 lg:col-span-2">
          <h1 className="font-display text-[32px] md:text-[42px] font-medium tracking-tight text-ink mb-2">
            List a Product
          </h1>
          <p className="text-[13.5px] md:text-[14px] text-ink-soft">
            Add a new item to your curated inventory.
          </p>
        </div>

        {/* ---------------- Photos ---------------- */}
        <div className="mb-8 lg:mb-0">
          <div className={cardClasses}>
            <SectionEyebrow num="01" label="Media" />
            <h2 className="font-display text-[22px] font-medium text-ink mb-1.5">Product Photos</h2>
            <p className="text-[13px] leading-relaxed text-ink-soft mb-6">
              Add up to {MAX_IMAGES} photos, {MAX_SIZE_MB}MB max each. Sharp, well-lit photos sell faster.
            </p>

            <input ref={fileInputRef} type="file" accept="image/*" multiple className="hidden" onChange={handleFileInputChange} />

            {!cover ? (
              <button
                type="button"
                onClick={openFilePicker}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                className={dropzoneClasses('w-full aspect-[4/3] rounded-[3px] border-2 border-dashed flex flex-col items-center justify-center gap-4 bg-surface')}
              >
                <span className="w-12 h-12 rounded-full flex items-center justify-center bg-cream-dark">
                  <UploadCloud size={20} strokeWidth={1} className="text-ink" />
                </span>
                <div className="text-center">
                  <span className="block text-[13px] font-semibold text-ink">Cover Photo</span>
                  <span className="block text-[12px] mt-1 text-ink-soft">
                    Drag &amp; drop or click to upload
                  </span>
                </div>
              </button>
            ) : (
              <div className="relative w-full aspect-[4/3] rounded-[3px] overflow-hidden border border-border">
                <img src={cover.preview} alt="Cover" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => removeImage(cover.id)}
                  aria-label="Remove cover photo"
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-charcoal/80 backdrop-blur flex items-center justify-center text-cream hover:bg-charcoal transition-colors"
                >
                  <X size={15} />
                </button>
                <span className="absolute bottom-4 left-4 text-[10px] font-semibold uppercase tracking-[0.1em] px-3 py-1.5 rounded-[3px] bg-charcoal/80 text-cream backdrop-blur">
                  Cover Photo
                </span>
              </div>
            )}

            {(rest.length > 0 || cover) && (
              <div className="grid grid-cols-3 gap-3 mt-3">
                {rest.map((img) => (
                  <div key={img.id} className="relative aspect-square rounded-[3px] overflow-hidden border border-border">
                    <img src={img.preview} alt="" className="w-full h-full object-cover" />
                    <button
                      type="button"
                      onClick={() => removeImage(img.id)}
                      aria-label="Remove photo"
                      className="absolute top-2 right-2 w-6 h-6 rounded-full bg-charcoal/80 backdrop-blur flex items-center justify-center text-cream hover:bg-charcoal transition-colors"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                {images.length < MAX_IMAGES && (
                  <button
                    type="button"
                    onClick={openFilePicker}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    className={dropzoneClasses('aspect-square rounded-[3px] border-2 border-dashed flex items-center justify-center bg-surface')}
                  >
                    <Plus size={20} strokeWidth={1} className="text-ink" />
                  </button>
                )}
              </div>
            )}

            <div className="flex items-center justify-between mt-5">
              <span className="text-[12px] font-medium text-ink-soft">
                {images.length}/{MAX_IMAGES} photos added
              </span>
              {imageError && <span className="text-[12px] font-medium max-w-[60%] text-right text-error">{imageError}</span>}
            </div>
          </div>
        </div>

        {/* ---------------- Right column ---------------- */}
        <div className="space-y-8">
          <div className={cardClasses}>
            <SectionEyebrow num="02" label="Details" />
            <h2 className="font-display text-[22px] font-medium text-ink mb-6">Product Details</h2>

            <div className="space-y-6 lg:grid lg:grid-cols-2 lg:gap-x-6 lg:gap-y-6 lg:space-y-0">
              <div className="lg:col-span-2">
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
                    <option value="" disabled>
                      Select category
                    </option>
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-ink-soft">▾</span>
                </div>
                {errors.category && <p className={errorClasses}>{errors.category.message}</p>}
              </div>

              <div>
                <label className={labelClasses}>Status</label>
                <div className="relative">
                  <select
                    defaultValue="In-Stock"
                    className={`${inputClasses} appearance-none`}
                    {...register('status', { required: 'Status is required' })}
                  >
                    {STATUSES.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-ink-soft">▾</span>
                </div>
                {errors.status && <p className={errorClasses}>{errors.status.message}</p>}
              </div>

              <div>
                <label className={labelClasses}>Price Amount</label>
                <input
                  type="number"
                  step="0.01"
                  min="100"
                  placeholder="0.00"
                  className={inputClasses}
                  {...register('priceAmount', { required: 'Price is required', min: { value: 100, message: 'Price cannot be negative' } })}
                />
                {errors.priceAmount && <p className={errorClasses}>{errors.priceAmount.message}</p>}
              </div>

              <div>
                <label className={labelClasses}>Currency</label>
                <div className="relative">
                  <select
                    defaultValue="INR"
                    className={`${inputClasses} appearance-none`}
                    {...register('priceCurrency', { required: 'Currency is required' })}
                  >
                    {CURRENCIES.map((cur) => (
                      <option key={cur} value={cur}>
                        {cur}
                      </option>
                    ))}
                  </select>
                  <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[11px] text-ink-soft">▾</span>
                </div>
                {errors.priceCurrency && <p className={errorClasses}>{errors.priceCurrency.message}</p>}
              </div>

              <div>
                <label className={labelClasses}>Stock Quantity</label>
                <input
                  type="number"
                  min="0"
                  step="1"
                  placeholder="e.g. 25"
                  className={inputClasses}
                  {...register('stock', { required: 'Stock quantity is required', min: { value: 0, message: 'Stock cannot be negative' } })}
                />
                {errors.stock && <p className={errorClasses}>{errors.stock.message}</p>}
              </div>

              <div className="lg:col-span-2">
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

          <div className="flex flex-col items-center lg:items-start gap-4 pt-4">
            <button
              type="submit"
              className="w-full lg:w-auto lg:px-12 flex items-center justify-center gap-3 rounded-[3px] py-4 text-[11px] font-semibold tracking-[0.1em] uppercase bg-charcoal text-cream hover:bg-ink transition-colors"
            >
              List Product
              <ArrowRight size={16} />
            </button>
            <p className="text-center lg:text-left text-[11px] leading-relaxed text-ink-soft">
              By listing, you agree to Zrive's Seller Terms &amp; Conditions.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateProduct