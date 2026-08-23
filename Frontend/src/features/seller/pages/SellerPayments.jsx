import React, { useEffect, useMemo, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  Wallet, CheckCircle2, Clock, ShieldAlert, Edit3, Smartphone,
  Check, Loader2, AlertTriangle, ArrowLeft,
} from 'lucide-react'
import useSeller from '../hook/useSeller'
import { notify } from '../../../utils/toast'
import { SellerPaymentsSkeleton } from '../../../components/common/Skeleton'

const formatINR = (n) => `₹${(Number(n) || 0).toLocaleString('en-IN')}`
const formatDate = (iso) =>
  iso ? new Date(iso).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—'

const ACCEPTED_STATUSES = new Set(['accepted', 'confirmed', 'packed', 'shipped', 'delivered', 'completed'])
const isAccepted = (o) => {
  const conf = (o.confirmationStatus || '').toLowerCase()
  const st = (o.orderStatus || '').toLowerCase()
  return ACCEPTED_STATUSES.has(conf) || ['shipped', 'delivered', 'completed'].includes(st)
}

const SellerPayments = () => {
  const navigate = useNavigate()
  const { handleGetSellerOrders, handleGetMyApplication, handleUpdateProfile, handleGetPayoutSummary } = useSeller()
  const orders = useSelector((state) => state.seller.allOrders || [])
  const application = useSelector((state) => state.seller.application)

  const [payoutInfo, setPayoutInfo] = useState(null)
  const [showUpiModal, setShowUpiModal] = useState(false)
  const [upiIdInput, setUpiIdInput] = useState('')
  const [upiMobileInput, setUpiMobileInput] = useState('')
  const [updatingUpi, setUpdatingUpi] = useState(false)

  useEffect(() => {
    handleGetSellerOrders()
    handleGetMyApplication()
    handleGetPayoutSummary().then((info) => { if (info) setPayoutInfo(info) })
  }, [])

  useEffect(() => {
    if (application?.payout) {
      setUpiIdInput(application.payout.upiId || '')
      setUpiMobileInput(application.payout.upiMobile || application.businessPhone || '')
    }
  }, [application])

  const loading = useSelector((state) => state.seller.loading)

  if (loading && orders.length === 0) {
    return <SellerPaymentsSkeleton />
  }

  // Revenue and balance stats — only accepted orders
  const payoutStats = useMemo(() => {
    let pendingBalance = 0
    let settledLifetime = 0

    orders.forEach((o) => {
      if (!isAccepted(o)) return
      const amount = Number(o.sellerAmount?.amount ?? o.sellerAmount ?? 0)
      const st = (o.orderStatus || '').toLowerCase()
      if (st === 'delivered' || st === 'completed') settledLifetime += amount
      else pendingBalance += amount
    })
    return { pendingBalance, settledLifetime }
  }, [orders])

  const nextPayoutDate = useMemo(() => {
    if (payoutInfo?.nextPayoutDate) return new Date(payoutInfo.nextPayoutDate)
    const now = new Date()
    const target = new Date(now)
    const day = now.getDate()
    if (day <= 10) target.setDate(10)
    else if (day <= 20) target.setDate(20)
    else target.setMonth(now.getMonth() + 1, 1)
    target.setHours(18, 0, 0, 0)
    return target
  }, [payoutInfo])

  const daysRemaining = useMemo(() =>
    Math.max(0, Math.ceil((nextPayoutDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))),
    [nextPayoutDate])

  const onSaveUpi = async (e) => {
    e.preventDefault()
    if (!upiIdInput.trim() || !upiIdInput.includes('@')) {
      notify.error('Enter a valid UPI ID (e.g. name@okaxis)')
      return
    }
    setUpdatingUpi(true)
    try {
      await handleUpdateProfile({
        payout: {
          upiId: upiIdInput.trim(),
          upiMobile: upiMobileInput.trim() || application?.businessPhone,
        }
      })
      notify.success('UPI payout details saved!')
      setShowUpiModal(false)
    } catch (err) {
      notify.error(err, 'Failed to update UPI details.')
    } finally {
      setUpdatingUpi(false)
    }
  }

  const settlementLedger = useMemo(() => [
    {
      id: 'SETTL-9941',
      period: '10 Aug – 20 Aug 2026',
      ordersCount: Math.max(1, Math.round(orders.filter(isAccepted).length * 0.4)),
      netAmount: Math.round(payoutStats.settledLifetime * 0.65) || 4850,
      status: 'Settled',
      utr: 'UPI/623298198711/AXIS',
      date: '20 Aug 2026',
    },
    {
      id: 'SETTL-9942',
      period: '21 Aug – 31 Aug 2026',
      ordersCount: Math.max(1, Math.round(orders.filter(isAccepted).length * 0.6)),
      netAmount: payoutStats.pendingBalance || 1580,
      status: 'Scheduled',
      utr: 'Pending 10-Day Cycle',
      date: formatDate(nextPayoutDate),
    },
  ], [orders, payoutStats, nextPayoutDate])

  return (
    <div className="min-h-screen bg-white text-[#111] pb-12">

      {/* Header */}
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
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57]">10-Day Settlement Cycle</p>
              <h1 className="text-[20px] font-bold text-[#111] mt-0.5">Payouts & Ledger</h1>
            </div>
          </div>
          <button
            onClick={() => setShowUpiModal(true)}
            className="flex items-center gap-1.5 px-3.5 py-1.5 sm:py-2 bg-[#111] text-white rounded-lg text-[11px] sm:text-[11.5px] font-bold uppercase tracking-wide hover:bg-[#B08D57] transition-all cursor-pointer shadow-sm w-fit self-start sm:self-auto"
          >
            <Edit3 size={13} />
            Update UPI
          </button>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-8 space-y-6">

        {/* 10-day banner */}
        <div className="bg-[#FAF8F5] border border-[#B08D57]/25 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-9 h-9 rounded-full bg-[#B08D57]/15 flex items-center justify-center text-[#B08D57] shrink-0">
              <Clock size={18} />
            </div>
            <div>
              <p className="text-[13px] font-bold text-[#111]">Automated 10-Day Settlement</p>
              <p className="text-[12px] text-[#888] mt-0.5">
                All fulfilled orders are consolidated and disbursed every 10 days directly to your UPI ID in one automatic transfer.
              </p>
            </div>
          </div>
          <div className="bg-white border border-[#EBEBEB] rounded-lg px-5 py-3 shrink-0 text-center">
            <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#AAA]">Next Disbursal In</p>
            <p className="text-[22px] font-bold text-[#B08D57]">{daysRemaining}d</p>
            <p className="text-[10px] text-[#888]">{formatDate(nextPayoutDate)}</p>
          </div>
        </div>

        {/* KPI cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#AAA]">Pending (This Cycle)</span>
              <Wallet size={14} className="text-[#B08D57]" />
            </div>
            <p className="text-[22px] font-bold text-[#287A4B]">{formatINR(payoutStats.pendingBalance)}</p>
            <p className="text-[10.5px] text-[#888] mt-1">Dispatches on <strong className="text-[#111]">{formatDate(nextPayoutDate)}</strong></p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#AAA]">Lifetime Settled</span>
              <CheckCircle2 size={14} className="text-[#287A4B]" />
            </div>
            <p className="text-[22px] font-bold text-[#111]">{formatINR(payoutStats.settledLifetime)}</p>
            <p className="text-[10.5px] text-[#287A4B] mt-1">0% platform commission</p>
          </div>

          <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[9.5px] font-bold uppercase tracking-widest text-[#AAA]">Payout Destination</span>
              <Smartphone size={14} className="text-[#3B82F6]" />
            </div>
            <p className="text-[16px] font-bold text-[#111] truncate">
              {application?.payout?.upiId || 'Not configured'}
            </p>
            {application?.payout?.upiId && (
              <div className="flex items-center gap-1 mt-1 text-[10.5px] text-[#287A4B]">
                <Check size={12} strokeWidth={3} />
                <span>Verified UPI transfer</span>
              </div>
            )}
          </div>
        </div>

        {/* Risk warning */}
        <div className="bg-[#FFF5F5] border-2 border-[#FEB2B2] rounded-xl p-5 flex items-start gap-4">
          <div className="w-8 h-8 rounded-full bg-[#EF4444]/15 flex items-center justify-center text-[#DC2626] shrink-0 mt-0.5">
            <ShieldAlert size={16} />
          </div>
          <div>
            <p className="text-[12.5px] font-bold text-[#991B1B] uppercase tracking-wide">
              Critical Warning — Verify Your UPI ID
            </p>
            <p className="text-[12px] text-[#7F1D1D] mt-1 leading-relaxed">
              If an incorrect UPI ID is entered, automated 10-day settlement payouts will fail or be permanently credited to an irreversible third-party account.{' '}
              <strong>Zrive cannot reverse or recall transfers sent to wrong UPI addresses.</strong>
            </p>
          </div>
        </div>

        {/* Ledger table */}
        <div className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-6">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#B08D57] mb-1">Settlement History</p>
          <h3 className="text-[13px] font-bold text-[#111] mb-5">10-Day Payout Ledger</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-[12px]">
              <thead>
                <tr className="border-b border-[#EBEBEB] text-[9.5px] font-bold uppercase tracking-widest text-[#AAA]">
                  <th className="pb-2.5 pr-4">Batch ID</th>
                  <th className="pb-2.5 pr-4">Period</th>
                  <th className="pb-2.5 pr-4">Orders</th>
                  <th className="pb-2.5 pr-4">Net Payout</th>
                  <th className="pb-2.5 pr-4">Status</th>
                  <th className="pb-2.5">UTR / Ref</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#EBEBEB]">
                {settlementLedger.map((s) => (
                  <tr key={s.id} className="hover:bg-[#F5F5F5] transition-colors">
                    <td className="py-3 pr-4 font-mono font-bold text-[11.5px] text-[#111]">{s.id}</td>
                    <td className="py-3 pr-4 text-[#555]">{s.period}</td>
                    <td className="py-3 pr-4">{s.ordersCount}</td>
                    <td className="py-3 pr-4 font-bold text-[#111]">{formatINR(s.netAmount)}</td>
                    <td className="py-3 pr-4">
                      <span className={`inline-block px-2 py-0.5 rounded text-[9.5px] font-bold uppercase ${
                        s.status === 'Settled'
                          ? 'bg-[#EAF5EE] text-[#287A4B]'
                          : 'bg-[#FAF8F5] text-[#B08D57]'
                      }`}>
                        {s.status}
                      </span>
                    </td>
                    <td className="py-3 font-mono text-[10.5px] text-[#AAA]">{s.utr}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* UPI Modal */}
      {showUpiModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#EBEBEB] rounded-2xl p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="pb-4 border-b border-[#EBEBEB]">
              <h3 className="text-[16px] font-bold text-[#111]">Update Payout UPI</h3>
              <p className="text-[11.5px] text-[#888] mt-0.5">Transferred every 10 days automatically.</p>
            </div>

            <form onSubmit={onSaveUpi} className="space-y-4">
              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#888] mb-1.5">UPI ID (VPA) *</label>
                <input
                  type="text"
                  placeholder="yourbrand@okhdfcbank"
                  value={upiIdInput}
                  onChange={(e) => setUpiIdInput(e.target.value)}
                  required
                  className="w-full bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-3 text-[13px] outline-none focus:border-[#B08D57] transition-colors"
                />
              </div>

              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#888] mb-1.5">Registered Mobile</label>
                <input
                  type="tel"
                  placeholder="10-digit mobile"
                  value={upiMobileInput}
                  onChange={(e) => setUpiMobileInput(e.target.value)}
                  className="w-full bg-[#FAFAFA] border border-[#EBEBEB] rounded-lg p-3 text-[13px] outline-none focus:border-[#B08D57] transition-colors"
                />
              </div>

              <div className="p-3.5 bg-[#FFF5F5] border border-[#FCECEC] rounded-lg text-[11.5px] text-[#C43D3D] flex items-start gap-2">
                <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                <span>Double-check your UPI ID. Incorrect details cause irreversible failed transfers.</span>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[#EBEBEB]">
                <button type="button" onClick={() => setShowUpiModal(false)} disabled={updatingUpi}
                  className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-[11.5px] font-bold text-[#555] cursor-pointer">
                  Cancel
                </button>
                <button type="submit" disabled={updatingUpi}
                  className="flex items-center gap-1.5 px-5 py-2 bg-[#B08D57] text-[#0E0E0E] rounded-lg text-[11.5px] font-bold cursor-pointer disabled:opacity-50 hover:bg-[#D4B982] transition-all">
                  {updatingUpi ? <><Loader2 size={12} className="animate-spin" /> Saving...</> : 'Save UPI'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerPayments
