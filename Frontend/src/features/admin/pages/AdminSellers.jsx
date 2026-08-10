import { useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { ChevronRight, Search } from 'lucide-react'
import { useAdmin } from '../hook/useAdmin'

const STATUS_CONFIG = {
  pending_verification: {
    label: 'Pending',
    dot: 'bg-amber-500',
    ping: true,
    badgeBg: 'bg-amber-50',
    badgeText: 'text-amber-700',
    border: 'border-l-amber-400',
    avatarBg: 'bg-amber-50',
    avatarText: 'text-amber-700',
  },
  approved: {
    label: 'Verified',
    dot: 'bg-emerald-500',
    ping: false,
    badgeBg: 'bg-emerald-50',
    badgeText: 'text-emerald-700',
    border: 'border-l-emerald-400',
    avatarBg: 'bg-emerald-50',
    avatarText: 'text-emerald-700',
  },
  rejected: {
    label: 'Rejected',
    dot: 'bg-rose-500',
    ping: false,
    badgeBg: 'bg-rose-50',
    badgeText: 'text-rose-700',
    border: 'border-l-rose-400',
    avatarBg: 'bg-rose-50',
    avatarText: 'text-rose-700',
  },
}

const StatusDot = ({ status }) => {
  const cfg = STATUS_CONFIG[status]
  return (
    <span className="relative flex w-[7px] h-[7px] shrink-0">
      {cfg.ping && (
        <span className={`absolute inline-flex h-full w-full rounded-full ${cfg.dot} opacity-75 animate-ping`} />
      )}
      <span className={`relative inline-flex rounded-full w-[7px] h-[7px] ${cfg.dot}`} />
    </span>
  )
}

const timeAgo = (dateStr) => {
  const diffMs = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diffMs / 60000)
  if (mins < 1) return 'just now'
  if (mins < 60) return `${mins}m ago`
  const hrs = Math.floor(mins / 60)
  if (hrs < 24) return `${hrs}h ago`
  const days = Math.floor(hrs / 24)
  return `${days}d ago`
}

const initials = (name = '') =>
  name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('') || '?'

const SellerRow = ({ seller, onClick }) => {
  const cfg = STATUS_CONFIG[seller.applicationStatus]

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-center gap-4 pl-4 pr-3 py-3.5 rounded-lg border border-border border-l-[3px] ${cfg.border} bg-surface hover:shadow-[0_1px_8px_rgba(0,0,0,0.06)] hover:border-border transition-all text-left group`}
    >
      <div className={`w-9 h-9 shrink-0 rounded-full ${cfg.avatarBg} flex items-center justify-center`}>
        <span className={`text-[12px] font-semibold ${cfg.avatarText}`}>{initials(seller.brandName)}</span>
      </div>

      <div className="flex-1 min-w-0">
        <h3 className="text-[13.5px] font-semibold text-ink truncate leading-tight">{seller.brandName}</h3>
        <p className="text-[12px] text-ink-soft truncate mt-0.5">
          {seller.businessEmail}
          {seller.userId?.username ? ` · ${seller.userId.username}` : ''}
        </p>
      </div>

      <div className="flex flex-col items-end gap-1 shrink-0 w-[104px]">
        <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10.5px] font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
          <StatusDot status={seller.applicationStatus} />
          {cfg.label}
        </span>
        <span className="text-[10.5px] text-ink-soft/70 tabular-nums">{timeAgo(seller.createdAt)}</span>
      </div>

      <ChevronRight size={16} className="text-ink-soft/30 group-hover:text-gold group-hover:translate-x-0.5 shrink-0 transition-all" />
    </button>
  )
}

const SectionHeader = ({ label, count, dotClass }) => (
  <div className="flex items-center gap-2 mb-2.5 mt-6 first:mt-0">
    <span className={`w-[6px] h-[6px] rounded-full ${dotClass}`} />
    <h2 className="text-[10.5px] font-bold uppercase tracking-[0.09em] text-ink-soft">{label}</h2>
    <span className="text-[10.5px] text-ink-soft/50 font-medium">{count}</span>
    <div className="flex-1 h-px bg-border" />
  </div>
)

const AdminSellers = () => {
  const navigate = useNavigate()
  const { handleGetAllSellers } = useAdmin()
  const { sellers, loading, error } = useSelector((state) => state.admin)

  useEffect(() => {
    handleGetAllSellers()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const grouped = useMemo(() => {
    const pending = sellers.filter((s) => s.applicationStatus === 'pending_verification')
    const approved = sellers.filter((s) => s.applicationStatus === 'approved')
    const rejected = sellers.filter((s) => s.applicationStatus === 'rejected')
    return { pending, approved, rejected }
  }, [sellers])

  return (
    <div className="max-w-[760px]">
      <div className="mb-6">
        <h1 className="font-display text-[22px] font-medium text-ink">Sellers</h1>
        <p className="text-[12.5px] text-ink-soft mt-1">
          Review new applications, verify KYC, and manage the seller directory.
        </p>
      </div>

      {loading.fetch && sellers.length === 0 && (
        <div className="flex items-center justify-center py-24">
          <p className="text-[13px] text-ink-soft">Loading sellers...</p>
        </div>
      )}

      {error && !loading.fetch && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 mb-5">
          <p className="text-[12.5px] text-rose-600">{error}</p>
        </div>
      )}

      {!loading.fetch && sellers.length === 0 && !error && (
        <div className="flex flex-col items-center justify-center text-center py-24">
          <Search size={20} className="text-ink-soft/40 mb-3" strokeWidth={1.5} />
          <h3 className="text-[13.5px] font-medium text-ink mb-1">No sellers yet</h3>
          <p className="text-[12.5px] text-ink-soft">Applications will show up here once sellers apply.</p>
        </div>
      )}

      <div className='flex flex-col gap-6'>
      {grouped.pending.length > 0 && (
        <div>
          <SectionHeader label="Pending Verification" count={grouped.pending.length} dotClass="bg-amber-500" />
          <div className="space-y-1.5">
            {grouped.pending.map((seller) => (
              <SellerRow key={seller._id} seller={seller} onClick={() => navigate(`/admin/sellers/${seller._id}`)} />
            ))}
          </div>
        </div>
      )}

      {grouped.approved.length > 0 && (
        <div>
          <SectionHeader label="Verified" count={grouped.approved.length} dotClass="bg-emerald-500" />
          <div className="space-y-1.5">
            {grouped.approved.map((seller) => (
              <SellerRow key={seller._id} seller={seller} onClick={() => navigate(`/admin/sellers/${seller._id}`)} />
            ))}
          </div>
        </div>
      )}

      {grouped.rejected.length > 0 && (
        <div>
          <SectionHeader label="Rejected" count={grouped.rejected.length} dotClass="bg-rose-500" />
          <div className="space-y-1.5">
            {grouped.rejected.map((seller) => (
              <SellerRow key={seller._id} seller={seller} onClick={() => navigate(`/admin/sellers/${seller._id}`)} />
            ))}
          </div>
        </div>
      )}

      </div>
    </div>
  )
}

export default AdminSellers