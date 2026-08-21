import React, { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { Minus, Plus, Trash2, ShoppingBag, ShieldCheck, Truck, RefreshCw, Tag, ArrowRight, Lock, AlertTriangle, X } from 'lucide-react'
import useCart from '../hook/useCart'
import { formatPrice } from '../../home/pages/Home'
import { notify } from '../../../utils/toast'

const CartItemRow = ({ item, index, onIncrement, onDecrement, onRemove }) => {
  const variant = item.product?.variants
  const cover = variant?.images?.[0]?.url ?? item.product?.images?.[0]?.url

  const unitPrice = variant?.price?.amount != null
    ? variant.price
    : variant?.priceOverride != null
    ? { amount: variant.priceOverride, currency: item.product?.price?.currency || 'INR' }
    : (item.price ?? item.product?.price ?? { amount: 0, currency: 'INR' })

  return (
    <div className="flex gap-4 py-5 border-b border-[#EAEAEA] items-start w-full">
      {/* Thumbnail */}
      <div className="w-20 h-24 sm:w-24 sm:h-28 shrink-0 rounded-[6px] overflow-hidden bg-[#FAFAFA] border border-[#EAEAEA] relative">
        {cover ? (
          <img src={cover} alt={item.product?.title || 'Product'} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#999]">
            <ShoppingBag size={18} strokeWidth={1.5} />
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0 flex flex-col justify-between self-stretch">
        <div>
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-[10px] font-bold tracking-[0.1em] uppercase text-[#B08D57] mb-0.5 truncate">
                {item.product?.brand || item.product?.category || 'ZRIVE'}
              </p>
              <h3 className="text-[13.5px] font-medium text-[#111111] leading-snug truncate max-w-full">
                {item.product?.title || item.product?.name}
              </h3>

              {variant && (
                <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
                  {variant.size && (
                    <span className="border border-[#EAEAEA] bg-[#FAFAFA] rounded px-2 py-0.5 text-[10.5px] font-semibold text-[#555]">
                      Size: {variant.size}
                    </span>
                  )}
                  {variant.color && (
                    <span className="border border-[#EAEAEA] bg-[#FAFAFA] rounded px-2 py-0.5 text-[10.5px] font-semibold text-[#555]">
                      Color: {variant.color}
                    </span>
                  )}
                </div>
              )}
            </div>

            <button
              type="button"
              onClick={() => onRemove(item)}
              aria-label="Remove item"
              className="p-1 text-[#999999] hover:text-[#C43D3D] transition-colors shrink-0 cursor-pointer"
            >
              <Trash2 size={15} strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Quantity & Pricing */}
        <div className="flex items-end justify-between pt-3 mt-auto">
          <div className="flex items-center border border-[#EAEAEA] rounded bg-[#FAFAFA] shrink-0">
            <button
              type="button"
              onClick={() => onDecrement(item)}
              disabled={item.quantity <= 1}
              className="w-7 h-7 flex items-center justify-center text-[#111111] hover:bg-[#EAEAEA] transition-colors disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer"
            >
              <Minus size={11} strokeWidth={2} />
            </button>
            <span className="w-8 text-center text-[12px] font-semibold text-[#111111] tabular-nums">
              {item.quantity}
            </span>
            <button
              type="button"
              onClick={() => onIncrement(item)}
              className="w-7 h-7 flex items-center justify-center text-[#111111] hover:bg-[#EAEAEA] transition-colors cursor-pointer"
            >
              <Plus size={11} strokeWidth={2} />
            </button>
          </div>

          <div className="text-right shrink-0">
            <p className="text-[14.5px] font-bold text-[#111111]">
              {formatPrice({ ...unitPrice, amount: (unitPrice?.amount ?? 0) * item.quantity })}
            </p>
            {item.quantity > 1 && (
              <p className="text-[10px] text-[#777777]">{formatPrice(unitPrice)} each</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const EmptyCart = () => (
  <div className="flex flex-col items-center justify-center text-center px-4 py-16 bg-white rounded-[10px] border border-[#EAEAEA] max-w-lg mx-auto my-8">
    <div className="w-16 h-16 rounded-full bg-[#F5EFE5] flex items-center justify-center mb-4">
      <ShoppingBag size={28} strokeWidth={1.5} className="text-[#B08D57]" />
    </div>
    <h2 className="text-[20px] font-bold text-[#111111] mb-1">
      Your Bag is Empty
    </h2>
    <p className="text-[12.5px] text-[#666666] mb-6 max-w-xs leading-relaxed">
      Explore our collections and discover items to add to your bag.
    </p>
    <div className="flex flex-col sm:flex-row items-center gap-3 w-full sm:w-auto">
      <Link
        to="/all-products"
        className="w-full sm:w-auto bg-[#111111] text-white rounded px-6 py-3 text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#B08D57] transition-all"
      >
        Explore Catalog
      </Link>
      <Link
        to="/wishlist"
        className="w-full sm:w-auto border border-[#111111] text-[#111111] rounded px-6 py-3 text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#FAFAFA] transition-all"
      >
        View Wishlist
      </Link>
    </div>
  </div>
)

const Cart = () => {
  const { handleGetCart, handleAddToCart, handleRemoveCartItem } = useCart()
  const { items, totalPrice: subtotal, currency } = useSelector((state) => state.cart)
  const addresses = useSelector((state) => state.address?.addresses ?? [])
  const selectedAddress = useSelector((state) => state.address?.selectedAddress)
  const [loading, setLoading] = useState(true)
  const [itemToRemove, setItemToRemove] = useState(null)
  const [removing, setRemoving] = useState(false)
  const navigate = useNavigate()

  const handleProceedToCheckout = () => {
    if (!items || items.length === 0) {
      notify.error("Your shopping bag is empty.")
      return
    }
    const hasAddress = selectedAddress || addresses.length > 0
    navigate(hasAddress ? '/order-summary' : '/address')
  }

  const fetchCartItems = async () => {
    try {
      await handleGetCart()
    } catch (err) {
      notify.error(err, "Failed to load shopping bag.")
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchCartItems()
  }, [])

  useEffect(() => {
    if (!itemToRemove) return undefined

    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.body.style.overflow = previousOverflow
    }
  }, [itemToRemove])

  const handleIncrement = async (item) => {
    try {
      await handleAddToCart(item.product._id, item.variant)
      await fetchCartItems()
    } catch (err) {
      notify.error(err, "Could not update item quantity.")
    }
  }

  const handleDecrement = async (item) => {
    try {
      await handleRemoveCartItem(item.product._id, item.variant, "decrement")
      await fetchCartItems()
    } catch (err) {
      notify.error(err, "Could not update item quantity.")
    }
  }

  const removeItemFromBag = async (item) => {
    setRemoving(true)
    try {
      await handleRemoveCartItem(item.product._id, item.variant, "remove")
      notify.success("Removed from bag")
      await fetchCartItems()
    } catch (err) {
      notify.error(err, "Could not remove item from bag.")
    } finally {
      setRemoving(false)
      setItemToRemove(null)
    }
  }

  const handleRemove = (item) => {
    setItemToRemove(item)
  }

  const isFreeShipping = subtotal >= 999

  if (loading) {
    return (
      <div className="min-h-[60vh] bg-white flex flex-col items-center justify-center gap-3">
        <div className="w-8 h-8 border-2 border-[#EAEAEA] border-t-[#B08D57] rounded-full animate-spin" />
        <p className="text-[13px] text-[#666666]">Loading your shopping bag…</p>
      </div>
    )
  }

  return (
    <>
      <div className="min-h-screen bg-[#FFFFFF] text-[#111111]">
      <div className="max-w-[1240px] mx-auto px-4 md:px-8 py-6">
        <div className="mb-6 flex items-baseline justify-between border-b border-[#EAEAEA] pb-3">
          <h1 className="text-[24px] md:text-[28px] font-bold text-[#111111] leading-tight">
            Shopping Bag
          </h1>
          {items?.length > 0 && (
            <span className="text-[12px] font-medium text-[#666666]">
              {items.length} {items.length === 1 ? 'item' : 'items'}
            </span>
          )}
        </div>

        {(!items || items.length === 0) ? (
          <EmptyCart />
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8 items-start w-full">
            {/* Left: Items */}
            <div className="min-w-0 w-full">
              {/* Promo Banner */}
              <div className="flex items-center justify-between p-3.5 bg-[#F5EFE5] rounded-[6px] border border-[#D4B982] mb-4">
                <div className="flex items-center gap-2.5">
                  <Tag size={16} className="text-[#B08D57]" />
                  <div>
                    <p className="text-[12px] font-bold text-[#111111]">ZRIVE20 Code Applied</p>
                    <p className="text-[10.5px] text-[#666666]">Flat 20% discount reflected at final checkout</p>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-[#B08D57] bg-white px-2 py-0.5 rounded border border-[#B08D57]/30">APPLIED</span>
              </div>

              {/* Items List */}
              <div className="bg-white divide-y divide-[#EAEAEA]">
                {items.map((item, i) => (
                  <CartItemRow
                    key={item._id}
                    item={item}
                    index={i}
                    onIncrement={() => handleIncrement(item)}
                    onDecrement={() => handleDecrement(item)}
                    onRemove={() => handleRemove(item)}
                  />
                ))}
              </div>

              {/* Trust Strip */}
              <div className="grid grid-cols-3 gap-3 pt-6 mt-4 border-t border-[#EAEAEA]">
                <div className="flex items-center gap-2 p-3 rounded bg-[#FAFAFA]">
                  <Truck size={16} className="text-[#B08D57] shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#111111]">Free Express Delivery</p>
                    <p className="text-[10px] text-[#777]">Orders above ₹999</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded bg-[#FAFAFA]">
                  <RefreshCw size={16} className="text-[#B08D57] shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#111111]">7-Day Returns</p>
                    <p className="text-[10px] text-[#777]">Hassle-free exchange</p>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 rounded bg-[#FAFAFA]">
                  <ShieldCheck size={16} className="text-[#B08D57] shrink-0" />
                  <div>
                    <p className="text-[11px] font-bold text-[#111111]">Secure Escrow</p>
                    <p className="text-[10px] text-[#777]">Verified Merchant</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Right: Summary */}
            <div className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-[8px] p-5 lg:sticky lg:top-24 shadow-sm">
              <h2 className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57] mb-3 pb-2 border-b border-[#EAEAEA]">
                Price Details ({items.length} Items)
              </h2>

              <div className="space-y-2 text-[12.5px] mb-4">
                <div className="flex justify-between">
                  <span className="text-[#666]">Total MRP</span>
                  <span className="font-semibold text-[#111]">{formatPrice({ amount: subtotal, currency })}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">Shipping Fee</span>
                  <span className={`font-semibold ${isFreeShipping ? 'text-[#287A4B]' : 'text-[#111]'}`}>
                    {isFreeShipping ? 'FREE' : formatPrice({ amount: 99, currency })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#666]">GST Tax</span>
                  <span className="font-semibold text-[#111]">Included</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-3 border-t border-b border-[#EAEAEA] my-3">
                <div>
                  <span className="text-[12px] font-bold uppercase tracking-[0.06em] text-[#111]">Total Amount</span>
                </div>
                <span className="text-[20px] font-bold text-[#111]">
                  {formatPrice({ amount: isFreeShipping ? subtotal : subtotal + 99, currency })}
                </span>
              </div>

              <button
                type="button"
                onClick={handleProceedToCheckout}
                className="w-full flex items-center justify-center gap-2 bg-[#111111] text-white rounded py-3.5 text-[12px] font-bold tracking-[0.06em] uppercase hover:bg-[#B08D57] transition-all shadow-sm cursor-pointer"
              >
                Proceed to Checkout
                <ArrowRight size={15} />
              </button>

              <div className="mt-3 text-center">
                <p className="text-[10.5px] text-[#777] flex items-center justify-center gap-1">
                  <ShieldCheck size={12} className="text-[#287A4B]" />
                  Safe & Secure Checkout via Razorpay
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
      </div>

      {itemToRemove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={() => !removing && setItemToRemove(null)}
          />
          <div className="relative w-full max-w-sm rounded-t-2xl bg-white p-6 shadow-2xl sm:rounded-2xl">
            <button
              type="button"
              onClick={() => setItemToRemove(null)}
              disabled={removing}
              aria-label="Close confirmation"
              className="absolute right-4 top-4 text-[#999999] hover:text-[#111111] disabled:opacity-50"
            >
              <X size={18} />
            </button>
            <div className="mb-4 flex h-11 w-11 items-center justify-center rounded-full bg-[#C43D3D]/10">
              <AlertTriangle size={20} className="text-[#C43D3D]" />
            </div>
            <h2 className="mb-1.5 text-[18px] font-bold text-[#111111]">
              {items.length === 1 ? "Remove the last item?" : "Remove this item?"}
            </h2>
            <p className="mb-6 text-[13px] leading-relaxed text-[#666666]">
              {items.length === 1
                ? "Your bag will be empty. Are you sure you want to remove this item?"
                : "Are you sure you want to remove this item from your bag?"}
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setItemToRemove(null)}
                disabled={removing}
                className="flex-1 rounded border border-[#111111] py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-[#111111] hover:bg-[#FAFAFA] disabled:opacity-50"
              >
                Keep Item
              </button>
              <button
                type="button"
                onClick={() => removeItemFromBag(itemToRemove)}
                disabled={removing}
                className="flex-1 rounded bg-[#C43D3D] py-3 text-[11px] font-bold uppercase tracking-[0.06em] text-white hover:bg-[#A83232] disabled:opacity-60"
              >
                {removing ? "Removing..." : "Remove Item"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Cart