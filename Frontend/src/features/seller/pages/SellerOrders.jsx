import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  Clock, Check, X, Package, MapPin, Phone, RefreshCw, AlertCircle, Loader2, ChevronRight, ArrowLeft, ShoppingBag,
} from 'lucide-react'
import useSeller from '../hook/useSeller'

const FILTERS = [
  { key: 'all', label: 'All Orders' },
  { key: 'pending', label: 'Action Required' },
  { key: 'accepted', label: 'Accepted' },
  { key: 'rejected', label: 'Rejected' },
  { key: 'timeout', label: 'Timed Out' },
]

const formatMoney = (amount) => `₹${(Number(amount) || 0).toLocaleString('en-IN')}`

const isTimeoutOrder = (order) =>
  order.confirmationStatus === 'expired' ||
  order.confirmationStatus === 'timeout' ||
  order.cancelReason === 'seller_no_response' ||
  (order.confirmationStatus === 'pending' &&
    !!order.confirmationDeadline &&
    new Date(order.confirmationDeadline).getTime() < Date.now())

const isCancelledOrder = (order) =>
  order.orderStatus === 'cancelled' || Boolean(order.cancelReason)

const matchesFilter = (order, key) => {
  const isTimeout = isTimeoutOrder(order)
  switch (key) {
    case 'pending':
      return order.confirmationStatus === 'pending' && !isTimeout && !isCancelledOrder(order)
    case 'accepted':
      return order.confirmationStatus === 'accepted'
    case 'rejected':
      return (order.confirmationStatus === 'rejected' || order.orderStatus === 'cancelled') && !isTimeout
    case 'timeout':
      return isTimeout
    default:
      return true
  }
}

const SellerOrders = () => {
  const navigate = useNavigate()
  const { handleGetSellerOrders, handleAcceptOrder, handleRejectOrder } = useSeller()
  const orders = useSelector((state) => state.seller.allOrders || [])
  const loading = useSelector((state) => state.seller.loading)

  const [activeFilter, setActiveFilter] = useState('all')
  const [actingOrderId, setActingOrderId] = useState(null)
  const [rejectModalOrder, setRejectModalOrder] = useState(null)
  const [rejectReason, setRejectReason] = useState('out_of_stock')

  useEffect(() => {
    handleGetSellerOrders()
  }, [])

  const filteredOrders = useMemo(
    () => orders.filter((o) => matchesFilter(o, activeFilter)),
    [orders, activeFilter]
  )

  const onAccept = async (orderId) => {
    setActingOrderId(orderId)
    await handleAcceptOrder(orderId)
    setActingOrderId(null)
  }

  const onConfirmReject = async () => {
    if (!rejectModalOrder) return
    setActingOrderId(rejectModalOrder._id)
    await handleRejectOrder(rejectModalOrder._id, rejectReason)
    setActingOrderId(null)
    setRejectModalOrder(null)
  }

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111111] pb-16">
      {/* Header Bar */}
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57]">Merchant Fulfillment</p>
              <h1 className="text-[20px] font-bold text-[#111] mt-0.5">Order Fulfillment Queue</h1>
              <p className="text-[11px] text-[#888] mt-0.5">Review and confirm buyer orders within deadline.</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-6 space-y-6">
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-3 border-b border-[#EBEBEB]">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`px-3 py-1.5 rounded text-[11px] font-bold uppercase transition-all whitespace-nowrap ${
                activeFilter === f.key
                  ? 'bg-[#111111] text-white'
                  : 'bg-[#FAFAFA] text-[#666666] border border-[#EAEAEA] hover:border-[#111111]'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Orders Table Container */}
        <div className="bg-white border border-[#EAEAEA] rounded-[6px] overflow-hidden shadow-sm">
          {loading ? (
            <div className="p-8 text-center text-[#666] text-[12px]">Loading merchant orders…</div>
          ) : filteredOrders.length === 0 ? (
            <div className="p-12 text-center text-[#666] text-[12px]">No orders found for this filter.</div>
          ) : (
            <div className="divide-y divide-[#EAEAEA]">
              {filteredOrders.map((order) => {
                const isTimeout = isTimeoutOrder(order)
                const cancelled = isCancelledOrder(order)
                const pending = order.confirmationStatus === 'pending' && !isTimeout && !isCancelledOrder(order)
                const isBusy = actingOrderId === order._id

                const address = order.shippingAddress || order.address
                const buyerName = address?.name || address?.fullName || order.user?.name || 'Buyer'
                const pincode = address?.pincode || '—'

                const displayStatus = isTimeout
                  ? 'TIMED OUT'
                  : cancelled
                  ? 'CANCELLED'
                  : (order.confirmationStatus || order.orderStatus || 'PENDING').toUpperCase()

                return (
                  <div key={order._id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAFAFA]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#111]">#{order._id?.slice(-8).toUpperCase()}</span>
                        <span
                          className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                            isTimeout
                              ? 'bg-[#FCECEC] text-[#C43D3D]'
                              : cancelled
                              ? 'bg-[#FCECEC] text-[#C43D3D]'
                              : order.confirmationStatus === 'accepted'
                              ? 'bg-[#EAF5EE] text-[#287A4B]'
                              : order.confirmationStatus === 'rejected'
                              ? 'bg-[#FCECEC] text-[#C43D3D]'
                              : 'bg-[#F5EFE5] text-[#B08D57]'
                          }`}
                        >
                          {displayStatus}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#666]">
                        Customer: <strong className="text-[#111]">{buyerName}</strong> · Pincode: <strong>{pincode}</strong>
                      </p>
                      <p className="text-[12px] text-[#666]">
                        Items: <strong>{order.orderItems?.length || 1}</strong> · Revenue: <strong className="text-[#111]">{formatMoney(order.sellerAmount?.amount ?? order.sellerAmount ?? 0)}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-3">
                      {pending && (
                        <>
                          <button
                            onClick={() => onAccept(order._id)}
                            disabled={isBusy}
                            className="px-4 py-2 bg-[#287A4B] text-white rounded text-[11px] font-bold uppercase hover:bg-[#1E6039]"
                          >
                            {isBusy ? 'Processing...' : 'Accept Order'}
                          </button>
                          <button
                            onClick={() => setRejectModalOrder(order)}
                            disabled={isBusy}
                            className="px-4 py-2 border border-[#C43D3D] text-[#C43D3D] rounded text-[11px] font-bold uppercase hover:bg-[#FCECEC]"
                          >
                            Reject
                          </button>
                        </>
                      )}
                      <button
                        onClick={() => navigate(`/seller/orders/${order._id}`)}
                        className="px-4 py-2 bg-[#111111] text-white rounded text-[11px] font-bold uppercase hover:bg-[#B08D57]"
                      >
                        Details &rarr;
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Reject Modal */}
      {rejectModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-[8px] border border-[#EAEAEA] p-6 max-w-sm w-full space-y-4">
            <h3 className="font-display text-[16px] font-bold text-[#111]">Reject Sub-Order</h3>
            <p className="text-[12px] text-[#666]">Select reason for order rejection:</p>
            <select
              value={rejectReason}
              onChange={(e) => setRejectReason(e.target.value)}
              className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded p-2.5 text-[12.5px] outline-none"
            >
              <option value="out_of_stock">Out of Stock</option>
              <option value="pricing_error">Pricing Error</option>
              <option value="logistics_issue">Logistics / Address Unserviceable</option>
            </select>
            <div className="flex justify-end gap-2 pt-2">
              <button onClick={() => setRejectModalOrder(null)} className="px-4 py-2 border rounded text-[11px] font-bold uppercase">Cancel</button>
              <button onClick={onConfirmReject} className="px-5 py-2 bg-[#C43D3D] text-white rounded text-[11px] font-bold uppercase">Confirm Reject</button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerOrders