import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { ChevronRight, Search, ShieldAlert, CheckCircle, Clock, XCircle, ArrowLeft } from 'lucide-react'
import { useAdmin } from '../hook/useAdmin'

const STATUS_CONFIG = {
  pending_verification: {
    label: 'Pending KYC',
    badgeBg: 'bg-[#FBF2E2] text-[#A56A16] border-[#A56A16]/30',
  },
  approved: {
    label: 'Verified Merchant',
    badgeBg: 'bg-[#EAF5EE] text-[#287A4B] border-[#287A4B]/30',
  },
  rejected: {
    label: 'Rejected',
    badgeBg: 'bg-[#FCECEC] text-[#C43D3D] border-[#C43D3D]/30',
  },
  basic: {
    label: 'Basic Info Only',
    badgeBg: 'bg-white/10 text-white/70 border-white/20',
  },
}

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || 'M'

const AdminSellers = () => {
  const navigate = useNavigate()
  const { handleGetPendingSellers } = useAdmin()
  const sellers = useSelector((state) => state.admin.pendingSellers || [])
  const loading = useSelector((state) => state.admin.loading?.sellers)

  const [searchQuery, setSearchQuery] = useState('')
  const [filterStatus, setFilterStatus] = useState('all')

  useEffect(() => {
    handleGetPendingSellers()
  }, [])

  const filteredSellers = sellers.filter((s) => {
    const statusMatch =
      filterStatus === 'all' ? true : s.applicationStatus === filterStatus

    if (!statusMatch) return false
    if (!searchQuery.trim()) return true
    const q = searchQuery.toLowerCase()
    return (
      s.brandName?.toLowerCase().includes(q) ||
      s.businessEmail?.toLowerCase().includes(q) ||
      s.businessPhone?.toLowerCase().includes(q)
    )
  })

  const pendingCount = sellers.filter((s) => s.applicationStatus === 'pending_verification').length
  const approvedCount = sellers.filter((s) => s.applicationStatus === 'approved').length

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-white/10">
        <div>
          <h1 className="font-display text-[26px] font-bold text-white">Merchant Registry</h1>
          <p className="text-[13px] text-white/60 mt-0.5">
            Review merchant KYC documents, approve brand applications, or revoke access.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] bg-[#A56A16]/20 text-[#D4B982] px-3 py-1.5 rounded-full border border-[#A56A16]/40">
            {pendingCount} Pending Reviews
          </span>
          <span className="text-[11px] font-bold uppercase tracking-[0.08em] bg-[#287A4B]/20 text-[#287A4B] px-3 py-1.5 rounded-full border border-[#287A4B]/40">
            {approvedCount} Verified Sellers
          </span>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        {/* Search Input */}
        <div className="relative flex-1 max-w-md">
          <Search size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/40" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search merchant name, email, or phone..."
            className="w-full bg-[#131313] border border-white/15 rounded-[6px] pl-10 pr-4 py-2.5 text-[13px] text-white placeholder:text-white/30 outline-none focus:border-[#B08D57]"
          />
        </div>

        {/* Status Pills */}
        <div className="flex items-center gap-2 overflow-x-auto no-scrollbar">
          {[
            { key: 'all', label: 'All' },
            { key: 'pending_verification', label: 'Pending KYC' },
            { key: 'approved', label: 'Approved' },
            { key: 'rejected', label: 'Rejected' },
          ].map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3.5 py-1.5 rounded-[6px] text-[12px] font-bold transition-all whitespace-nowrap ${
                filterStatus === f.key
                  ? 'bg-[#B08D57] text-[#0e0e0e]'
                  : 'bg-[#131313] text-white/60 border border-white/10 hover:text-white'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Sellers List */}
      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-[#131313] border border-white/10 rounded-[8px] animate-pulse" />
          ))}
        </div>
      ) : filteredSellers.length === 0 ? (
        <div className="p-12 text-center bg-[#131313] border border-white/10 rounded-[10px]">
          <ShieldAlert size={32} className="text-[#B08D57] mx-auto mb-2" />
          <p className="font-display text-[18px] font-bold text-white">No Merchant Applications Found</p>
          <p className="text-[12.5px] text-white/50 mt-1">Try adjusting search query or status filter.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredSellers.map((seller) => {
            const cfg = STATUS_CONFIG[seller.applicationStatus] || STATUS_CONFIG.basic

            return (
              <div
                key={seller._id}
                onClick={() => navigate(`/admin/sellers/${seller._id}`)}
                className="bg-[#131313] border border-white/10 rounded-[10px] p-4 md:p-5 flex items-center justify-between gap-4 hover:border-[#B08D57] cursor-pointer transition-all duration-200 group"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-11 h-11 rounded-full bg-[#B08D57] text-[#0e0e0e] font-bold text-[14px] flex items-center justify-center shrink-0 border border-white/20">
                    {initials(seller.brandName)}
                  </div>

                  <div className="min-w-0">
                    <div className="flex items-center gap-3">
                      <h3 className="font-display text-[16px] font-bold text-white truncate">{seller.brandName}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-[0.06em] px-2.5 py-0.5 rounded-full border ${cfg.badgeBg}`}>
                        {cfg.label}
                      </span>
                    </div>
                    <p className="text-[12.5px] text-white/50 mt-0.5 truncate">
                      {seller.businessEmail} · {seller.businessPhone || 'No phone'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  <span className="text-[11.5px] font-bold uppercase tracking-[0.06em] text-[#B08D57] group-hover:underline">
                    Review Application &rarr;
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

export default AdminSellers