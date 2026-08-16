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

const isExpired = (order) =>
  order.confirmationStatus === 'pending' &&
  !!order.confirmationDeadline &&
  new Date(order.confirmationDeadline).getTime() < Date.now()

const matchesFilter = (order, key) => {
  switch (key) {
    case 'pending':
      return order.confirmationStatus === 'pending' && !isExpired(order)
    case 'accepted':
      return order.confirmationStatus === 'accepted'
    case 'rejected':
      return order.confirmationStatus === 'rejected'
    case 'timeout':
      return isExpired(order) || order.confirmationStatus === 'timeout'
    default:
      return true
  }
}

const SellerOrders = () => {
  const navigate = useNavigate()
  const { handleGetSellerOrders, handleAcceptOrder, handleRejectOrder } = useSeller()
  const orders = useSelector((state) => state.seller.orders || [])
  const loading = useSelector((state) => state.seller.loading?.orders)

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
      <div className="border-b border-[#EAEAEA] bg-[#FAFAFA]">
        <div className="max-w-[1400px] mx-auto px-4 md:px-8 py-3 flex items-center justify-between">
          <button
            type="button"
            onClick={() => navigate('/seller/')}
            className="flex items-center gap-1 text-[11px] font-medium text-[#666666] hover:text-[#111111]"
          >
            <ArrowLeft size={13} />
            Back to Dashboard
          </button>
          <span className="text-[10.5px] font-bold text-[#B08D57] uppercase tracking-[0.08em]">
            Merchant Order Fulfillment
          </span>
        </div>
      </div>

      <div className="max-w-[1400px] mx-auto px-4 md:px-8 pt-6">
        <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#EAEAEA] pb-3">
          <div>
            <h1 className="text-[22px] md:text-[26px] font-bold text-[#111111]">
              Order Fulfillment Queue
            </h1>
            <p className="text-[12px] text-[#666666] mt-0.5">
              Review and confirm buyer orders within your deadline.
            </p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
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
                const pending = order.confirmationStatus === 'pending' && !isExpired(order)
                const isBusy = actingOrderId === order._id

                return (
                  <div key={order._id} className="p-4 md:p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#FAFAFA]">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#111]">#{order._id?.slice(-8).toUpperCase()}</span>
                        <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded bg-[#F5EFE5] text-[#B08D57]">
                          {order.confirmationStatus}
                        </span>
                      </div>
                      <p className="text-[12px] text-[#666]">
                        Customer: <strong className="text-[#111]">{order.address?.fullName || 'Buyer'}</strong> · Pincode: <strong>{order.address?.pincode}</strong>
                      </p>
                      <p className="text-[12px] text-[#666]">
                        Items: <strong>{order.orderItems?.length || 1}</strong> · Revenue: <strong className="text-[#111]">{formatMoney(order.sellerAmount?.amount)}</strong>
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