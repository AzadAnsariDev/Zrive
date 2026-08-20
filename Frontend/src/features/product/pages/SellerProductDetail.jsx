import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useForm } from 'react-hook-form'
import { ArrowLeft, Plus, Pencil, X, ImageIcon, UploadCloud, Loader2, Trash2 } from 'lucide-react'
import { useProduct } from '../hook/useProduct'
import { notify } from '../../../utils/toast'

const MAX_IMAGES_PER_VARIANT = 5

const VariantEditForm = ({ variant, onCancel, onSave, isSaving }) => {
  const [size, setSize] = useState(variant.size || '')
  const [color, setColor] = useState(variant.color || '')
  const [sku, setSku] = useState(variant.sku || '')
  const [stock, setStock] = useState(variant.stock ?? 0)
  const [price, setPrice] = useState(variant.price?.amount ?? '')

  const [existingImages, setExistingImages] = useState(variant.images || [])
  const [newImages, setNewImages] = useState([])
  const fileInputRef = useRef(null)

  useEffect(() => {
    return () => {
      newImages.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [newImages])

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files || [])
    const totalCurrent = existingImages.length + newImages.length
    const remainingSlots = MAX_IMAGES_PER_VARIANT - totalCurrent

    if (remainingSlots <= 0) {
      notify.warning(`Maximum ${MAX_IMAGES_PER_VARIANT} photos allowed per variant.`)
      return
    }

    const accepted = []
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      if (accepted.length >= remainingSlots) return
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
      })
    })

    if (accepted.length) {
      setNewImages((prev) => [...prev, ...accepted])
    }
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const removeExistingImage = (indexToRemove) => {
    if (existingImages.length + newImages.length <= 1) {
      notify.error('A variant must have at least 1 image.')
      return
    }
    setExistingImages((prev) => prev.filter((_, i) => i !== indexToRemove))
  }

  const removeNewImage = (idToRemove) => {
    if (existingImages.length + newImages.length <= 1) {
      notify.error('A variant must have at least 1 image.')
      return
    }
    setNewImages((prev) => {
      const target = prev.find((img) => img.id === idToRemove)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((img) => img.id !== idToRemove)
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!size.trim() || !color.trim() || !sku.trim()) {
      notify.error('Size, Color, and SKU are required.')
      return
    }

    const totalImages = existingImages.length + newImages.length
    if (totalImages === 0) {
      notify.error('Please upload or keep at least 1 photo for this variant.')
      return
    }

    const formData = new FormData()
    formData.append('size', size.trim().toUpperCase())
    formData.append('color', color.trim())
    formData.append('sku', sku.trim().toUpperCase())
    formData.append('stock', Number(stock) || 0)
    if (price !== '' && price !== undefined) {
      formData.append('priceOverride', Number(price))
    }
    formData.append('existingImages', JSON.stringify(existingImages))
    newImages.forEach((img) => {
      formData.append('images', img.file)
    })

    onSave(formData)
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-4.5 rounded-[6px] border border-[#EAEAEA] space-y-4 mt-3">
      <div className="flex items-center justify-between pb-2 border-b border-[#EAEAEA]">
        <p className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#B08D57]">
          Edit Variant Details & Media
        </p>
        <span className="text-[10.5px] text-[#888]">
          Total Photos: {existingImages.length + newImages.length} / {MAX_IMAGES_PER_VARIANT}
        </span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 text-[12px]">
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Size *</label>
          <input
            type="text"
            value={size}
            onChange={(e) => setSize(e.target.value)}
            required
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none focus:border-[#B08D57]"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Color *</label>
          <input
            type="text"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            required
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none focus:border-[#B08D57]"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">SKU Code *</label>
          <input
            type="text"
            value={sku}
            onChange={(e) => setSku(e.target.value)}
            required
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none focus:border-[#B08D57]"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Stock Units *</label>
          <input
            type="number"
            min="0"
            value={stock}
            onChange={(e) => setStock(e.target.value)}
            required
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none focus:border-[#B08D57]"
          />
        </div>
        <div>
          <label className="block text-[9.5px] font-bold uppercase text-[#666] mb-1">Price (₹)</label>
          <input
            type="number"
            min="0"
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            placeholder="Default product price"
            className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12px] outline-none focus:border-[#B08D57]"
          />
        </div>
      </div>

      {/* Variant Images Section */}
      <div className="space-y-2 pt-2 border-t border-[#EAEAEA]">
        <label className="block text-[10px] font-bold uppercase text-[#666]">
          Variant Photos (ImageKit)
        </label>

        <div className="flex flex-wrap items-center gap-3">
          {/* Existing uploaded images */}
          {existingImages.map((img, idx) => (
            <div key={img.url || idx} className="relative w-16 h-20 rounded-[6px] border border-[#EAEAEA] bg-[#FAFAFA] overflow-hidden group">
              <img src={img.url} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeExistingImage(idx)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/75 hover:bg-[#C43D3D] text-white rounded-full flex items-center justify-center transition-colors shadow"
                title="Remove photo"
              >
                <X size={11} />
              </button>
              {idx === 0 && (
                <span className="absolute bottom-0 inset-x-0 bg-black/60 text-white text-[8px] font-bold text-center py-0.5 uppercase">
                  Cover
                </span>
              )}
            </div>
          ))}

          {/* Newly picked image previews */}
          {newImages.map((img) => (
            <div key={img.id} className="relative w-16 h-20 rounded-[6px] border-2 border-dashed border-[#B08D57] bg-[#FAF8F5] overflow-hidden group">
              <img src={img.preview} alt="" className="w-full h-full object-cover" />
              <button
                type="button"
                onClick={() => removeNewImage(img.id)}
                className="absolute top-1 right-1 w-5 h-5 bg-black/75 hover:bg-[#C43D3D] text-white rounded-full flex items-center justify-center transition-colors shadow"
                title="Remove new photo"
              >
                <X size={11} />
              </button>
              <span className="absolute bottom-0 inset-x-0 bg-[#B08D57] text-[#0e0e0e] text-[8px] font-bold text-center py-0.5 uppercase">
                New
              </span>
            </div>
          ))}

          {/* Upload Button */}
          {existingImages.length + newImages.length < MAX_IMAGES_PER_VARIANT && (
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="w-16 h-20 rounded-[6px] border border-dashed border-[#CCCCCC] hover:border-[#B08D57] hover:bg-[#FAFAFA] flex flex-col items-center justify-center text-[#888888] hover:text-[#111111] transition-all cursor-pointer"
            >
              <UploadCloud size={16} />
              <span className="text-[9px] font-bold uppercase mt-1">Add Photo</span>
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>
      </div>

      <div className="flex justify-end gap-2 pt-3 border-t border-[#EAEAEA]">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSaving}
          className="px-4 py-1.5 border rounded text-[11px] font-bold uppercase text-[#555] hover:bg-[#F5F5F5] cursor-pointer disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isSaving}
          className="flex items-center gap-1.5 px-5 py-1.5 bg-[#B08D57] text-[#0e0e0e] rounded text-[11px] font-bold uppercase hover:bg-[#D4B982] cursor-pointer disabled:opacity-50"
        >
          {isSaving ? (
            <>
              <Loader2 size={12} className="animate-spin" />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </button>
      </div>
    </form>
  )
}

const VariantCard = ({ variant, basePrice, isEditing, onToggleEdit, onSaveEdit, isSaving }) => {
  const effectivePrice = variant.price?.amount ?? basePrice
  const cover = variant.images?.[0]?.url
  const photoCount = variant.images?.length || 0

  return (
    <div className="bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-4 mb-3">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex items-center gap-4">
          <div className="relative w-14 h-16 rounded-[6px] bg-white border border-[#EAEAEA] overflow-hidden flex items-center justify-center shrink-0">
            {cover ? (
              <img src={cover} alt="" className="w-full h-full object-cover" />
            ) : (
              <ImageIcon size={18} strokeWidth={1.5} className="text-[#999999]" />
            )}
            {photoCount > 1 && (
              <span className="absolute bottom-0 right-0 bg-black/70 text-white text-[8px] px-1 py-0.5 rounded-tl font-bold">
                {photoCount}
              </span>
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
          onSave={(formData) => onSaveEdit(variant._id, formData)}
          isSaving={isSaving}
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
  const [isSavingEdit, setIsSavingEdit] = useState(false)
  const [isAddingVariant, setIsAddingVariant] = useState(false)

  // Add form images state
  const [addImages, setAddImages] = useState([])
  const addFileInputRef = useRef(null)

  const { handleGetProductDetail, handleAddVariant, handleUpdateVariant } = useProduct()

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

  useEffect(() => {
    return () => {
      addImages.forEach((img) => URL.revokeObjectURL(img.preview))
    }
  }, [addImages])

  const {
    register: registerAdd,
    handleSubmit: handleSubmitAdd,
    reset: resetAdd,
  } = useForm()

  const handleAddFiles = (e) => {
    const files = Array.from(e.target.files || [])
    const remainingSlots = MAX_IMAGES_PER_VARIANT - addImages.length

    if (remainingSlots <= 0) {
      notify.warning(`Maximum ${MAX_IMAGES_PER_VARIANT} photos allowed per variant.`)
      return
    }

    const accepted = []
    files.forEach((file) => {
      if (!file.type.startsWith('image/')) return
      if (accepted.length >= remainingSlots) return
      accepted.push({
        id: `${file.name}-${file.lastModified}-${Math.random().toString(36).slice(2, 7)}`,
        file,
        preview: URL.createObjectURL(file),
      })
    })

    if (accepted.length) {
      setAddImages((prev) => [...prev, ...accepted])
    }
    if (addFileInputRef.current) addFileInputRef.current.value = ''
  }

  const removeAddImage = (idToRemove) => {
    setAddImages((prev) => {
      const target = prev.find((img) => img.id === idToRemove)
      if (target) URL.revokeObjectURL(target.preview)
      return prev.filter((img) => img.id !== idToRemove)
    })
  }

  const onAddVariant = async (data) => {
    if (addImages.length === 0) {
      notify.error('Please attach at least 1 photo for this new variant.')
      return
    }

    const formData = new FormData()
    formData.append('size', data.size.trim().toUpperCase())
    formData.append('color', data.color.trim())
    formData.append('sku', data.sku.trim().toUpperCase())
    formData.append('stock', Number(data.stock) || 0)
    if (data.price) {
      formData.append('priceOverride', Number(data.price))
    }
    addImages.forEach((img) => {
      formData.append('images', img.file)
    })

    setIsAddingVariant(true)
    try {
      const ok = await handleAddVariant(productId, formData)
      if (ok) {
        notify.success("Variant added successfully with photos!")
        setShowAddForm(false)
        resetAdd()
        setAddImages([])
        fetchProductDetail()
      }
    } catch (err) {
      notify.error(err, "Failed to add variant.")
    } finally {
      setIsAddingVariant(false)
    }
  }

  const handleSaveVariantEdit = async (variantId, formData) => {
    setIsSavingEdit(true)
    try {
      const ok = await handleUpdateVariant(productId, variantId, formData)
      if (ok) {
        notify.success("Variant details and media updated successfully!")
        setEditingVariantId(null)
        fetchProductDetail()
      }
    } catch (err) {
      notify.error(err, "Failed to update variant.")
    } finally {
      setIsSavingEdit(false)
    }
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
            onClick={() => {
              setShowAddForm(!showAddForm)
              setAddImages([])
            }}
            className="flex items-center gap-1.5 bg-[#111111] text-white px-4 py-2.5 rounded text-[11.5px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all shrink-0 cursor-pointer"
          >
            <Plus size={15} />
            {showAddForm ? 'Close Add Form' : 'Add New Variant'}
          </button>
        </div>

        {/* Add Form */}
        {showAddForm && (
          <div className="bg-white border border-[#EAEAEA] rounded-[8px] p-5 mb-6 shadow-sm">
            <h3 className="font-display text-[16px] font-bold text-[#111111] pb-3 border-b border-[#EAEAEA] mb-4">
              Add Size / Color Variant
            </h3>

            <form onSubmit={handleSubmitAdd(onAddVariant)} className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Size (e.g. L) *</label>
                  <input
                    type="text"
                    placeholder="L"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none focus:border-[#B08D57]"
                    {...registerAdd('size', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Color (e.g. Black) *</label>
                  <input
                    type="text"
                    placeholder="Black"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none focus:border-[#B08D57]"
                    {...registerAdd('color', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">SKU Code *</label>
                  <input
                    type="text"
                    placeholder="TEE-BLK-L"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none focus:border-[#B08D57]"
                    {...registerAdd('sku', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Stock Count *</label>
                  <input
                    type="number"
                    min="0"
                    placeholder="25"
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none focus:border-[#B08D57]"
                    {...registerAdd('stock', { required: true })}
                  />
                </div>
                <div>
                  <label className="block text-[10px] font-bold uppercase text-[#666666] mb-1">Price (₹ optional)</label>
                  <input
                    type="number"
                    min="0"
                    placeholder={String(product.price?.amount || product.price || '')}
                    className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2 text-[12.5px] outline-none focus:border-[#B08D57]"
                    {...registerAdd('price')}
                  />
                </div>
              </div>

              {/* Add Variant Photos */}
              <div className="pt-2 border-t border-[#EAEAEA] space-y-2">
                <div className="flex items-center justify-between">
                  <label className="block text-[10px] font-bold uppercase text-[#666666]">
                    Variant Photos * (ImageKit upload)
                  </label>
                  <span className="text-[10px] text-[#888]">
                    {addImages.length} / {MAX_IMAGES_PER_VARIANT} photos
                  </span>
                </div>

                <div className="flex flex-wrap items-center gap-3">
                  {addImages.map((img, idx) => (
                    <div key={img.id} className="relative w-16 h-20 rounded-[6px] border border-[#EAEAEA] bg-[#FAFAFA] overflow-hidden group">
                      <img src={img.preview} alt="" className="w-full h-full object-cover" />
                      <button
                        type="button"
                        onClick={() => removeAddImage(img.id)}
                        className="absolute top-1 right-1 w-5 h-5 bg-black/75 hover:bg-[#C43D3D] text-white rounded-full flex items-center justify-center transition-colors shadow"
                        title="Remove photo"
                      >
                        <X size={11} />
                      </button>
                      {idx === 0 && (
                        <span className="absolute bottom-0 inset-x-0 bg-[#B08D57] text-[#0e0e0e] text-[8px] font-bold text-center py-0.5 uppercase">
                          Cover
                        </span>
                      )}
                    </div>
                  ))}

                  {addImages.length < MAX_IMAGES_PER_VARIANT && (
                    <button
                      type="button"
                      onClick={() => addFileInputRef.current?.click()}
                      className="w-16 h-20 rounded-[6px] border border-dashed border-[#CCCCCC] hover:border-[#B08D57] hover:bg-[#FAFAFA] flex flex-col items-center justify-center text-[#888888] hover:text-[#111111] transition-all cursor-pointer"
                    >
                      <UploadCloud size={16} />
                      <span className="text-[9px] font-bold uppercase mt-1">Add Photo</span>
                    </button>
                  )}

                  <input
                    ref={addFileInputRef}
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleAddFiles}
                    className="hidden"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-[#EAEAEA]">
                <button
                  type="button"
                  onClick={() => setShowAddForm(false)}
                  disabled={isAddingVariant}
                  className="px-4 py-2 border rounded text-[11px] font-bold uppercase text-[#555555] hover:bg-[#F5F5F5] cursor-pointer disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAddingVariant}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#B08D57] text-[#0e0e0e] rounded text-[11px] font-bold uppercase hover:bg-[#D4B982] cursor-pointer disabled:opacity-50"
                >
                  {isAddingVariant ? (
                    <>
                      <Loader2 size={12} className="animate-spin" />
                      Uploading & Saving...
                    </>
                  ) : (
                    'Save Variant'
                  )}
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
            <p className="text-[12.5px] text-[#666666] py-6 text-center">
              No variants created yet. Click 'Add New Variant' above.
            </p>
          ) : (
            product.variants?.map((v) => (
              <VariantCard
                key={v._id || v.sku}
                variant={v}
                basePrice={product.price?.amount || product.price}
                isEditing={editingVariantId === (v._id || v.sku)}
                onToggleEdit={() =>
                  setEditingVariantId(editingVariantId === (v._id || v.sku) ? null : (v._id || v.sku))
                }
                onSaveEdit={handleSaveVariantEdit}
                isSaving={isSavingEdit && editingVariantId === (v._id || v.sku)}
              />
            ))
          )}
        </div>
      </div>
    </div>
  )
}

export default SellerProductDetail