import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
    ArrowLeft, Building2, CreditCard, MapPin, Wallet,
    CheckCircle2, XCircle, AlertTriangle, X, ImageIcon,
} from 'lucide-react'
import { useAdmin } from '../hook/useAdmin'

const STATUS_CONFIG = {
    pending_verification: { label: 'Pending Verification', badgeBg: 'bg-amber-50', badgeText: 'text-amber-700', dot: 'bg-amber-500' },
    approved: { label: 'Verified', badgeBg: 'bg-emerald-50', badgeText: 'text-emerald-700', dot: 'bg-emerald-500' },
    rejected: { label: 'Rejected', badgeBg: 'bg-rose-50', badgeText: 'text-rose-700', dot: 'bg-rose-500' },
    basic: { label: 'Basic (Incomplete)', badgeBg: 'bg-cream-dark', badgeText: 'text-ink-soft', dot: 'bg-ink-soft' },
}

const cardClasses = 'rounded-lg border border-border bg-surface p-5'
const cardHeadClasses = 'flex items-center gap-2 mb-4'
const cardTitleClasses = 'text-[12.5px] font-semibold text-ink'
const fieldLabelClasses = 'text-[10.5px] font-semibold uppercase tracking-[0.06em] text-ink-soft mb-1'
const fieldValueClasses = 'text-[13px] text-ink'

const RejectModal = ({ onClose, onConfirm, submitting }) => {
    const [reason, setReason] = useState('')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
            <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
            <div className="relative w-full max-w-[400px] rounded-lg bg-surface border border-border shadow-xl p-7">
                <button type="button" onClick={onClose} aria-label="Close" className="absolute top-4 right-4 text-ink-soft hover:text-ink transition-colors">
                    <X size={16} />
                </button>

                <div className="mx-auto mb-4 flex items-center justify-center w-11 h-11 rounded-full bg-rose-50">
                    <XCircle size={20} className="text-rose-600" strokeWidth={1.75} />
                </div>

                <h3 className="font-display text-[18px] font-medium text-ink mb-1.5 text-center">Reject Application</h3>
                <p className="text-[12.5px] text-ink-soft text-center mb-5">
                    The seller will see this reason and can resubmit their details.
                </p>

                <label className={fieldLabelClasses}>Rejection Reason</label>
                <textarea
                    rows={3}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="e.g. PAN photo is blurry, please re-upload a clearer image"
                    className="w-full rounded-[3px] border border-border bg-cream-dark px-3.5 py-2.5 text-[13px] text-ink placeholder:text-ink-soft outline-none focus:border-ink transition-colors resize-none mb-5"
                />

                <div className="flex gap-2.5">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 rounded-[3px] border border-border bg-surface py-2.5 text-[11.5px] font-semibold text-ink-soft hover:bg-cream-dark transition-colors"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!reason.trim() || submitting}
                        onClick={() => onConfirm(reason.trim())}
                        className="flex-1 rounded-[3px] bg-rose-600 py-2.5 text-[11.5px] font-semibold text-cream hover:bg-rose-700 transition-colors disabled:opacity-50"
                    >
                        {submitting ? 'Rejecting...' : 'Confirm Reject'}
                    </button>
                </div>
            </div>
        </div>
    )
}

const AdminSellerDetail = () => {
    const { sellerId } = useParams()
    const navigate = useNavigate()
    const { handleGetSellerDetail, handleApproveSeller, handleRejectSeller } = useAdmin()
    const { selectedSeller: seller, loading } = useSelector((state) => state.admin)

    const [showRejectModal, setShowRejectModal] = useState(false)
    const [actionError, setActionError] = useState(null)

    useEffect(() => {
        handleGetSellerDetail(sellerId)
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [sellerId])

    const onApprove = async () => {
        setActionError(null)
        const res = await handleApproveSeller(sellerId)
        if (!res.success) setActionError(res.error)
    }

    const onReject = async (reason) => {
        setActionError(null)
        const res = await handleRejectSeller(sellerId, reason)
        if (res.success) {
            setShowRejectModal(false)
        } else {
            setActionError(res.error)
            setShowRejectModal(false)
        }
    }

    if (loading.fetch && !seller) {
        return (
            <div className="flex items-center justify-center py-24">
                <p className="text-[13px] text-ink-soft">Loading application...</p>
            </div>
        )
    }

    if (!seller) return null

    const cfg = STATUS_CONFIG[seller.applicationStatus] || STATUS_CONFIG.basic
    const isPending = seller.applicationStatus === 'pending_verification'

    return (
        <div className="max-w-[760px] mx-auto">
            {/* Back + header */}
            <button
                type="button"
                onClick={() => navigate('/admin/sellers')}
                className="flex items-center gap-1.5 text-[12px] text-ink-soft hover:text-ink transition-colors mb-5"
            >
                <ArrowLeft size={14} /> Back to Sellers
            </button>

            <div className="flex items-start justify-between gap-4 mb-6">
                <div>
                    <h1 className="font-display text-[22px] font-medium text-ink">{seller.brandName}</h1>
                    <p className="text-[12.5px] text-ink-soft mt-1">
                        {seller.businessEmail}
                        {seller.userId?.username ? ` · ${seller.userId.username}` : ''}
                    </p>
                </div>
                <span className={`shrink-0 inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-semibold ${cfg.badgeBg} ${cfg.badgeText}`}>
                    <span className={`w-[6px] h-[6px] rounded-full ${cfg.dot}`} />
                    {cfg.label}
                </span>
            </div>

            {seller.applicationStatus === 'rejected' && seller.rejectionReason && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 mb-5">
                    <AlertTriangle size={15} className="text-rose-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[12px] font-semibold text-rose-700">Rejection Reason</p>
                        <p className="text-[12.5px] text-rose-600 mt-0.5">{seller.rejectionReason}</p>
                    </div>
                </div>
            )}

            {actionError && (
                <div className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 mb-5">
                    <AlertTriangle size={15} className="text-rose-600 mt-0.5 shrink-0" />
                    <div>
                        <p className="text-[12px] font-semibold text-rose-700">Approval Failed</p>
                        <p className="text-[12.5px] text-rose-600 mt-0.5">{actionError}</p>
                    </div>
                </div>
            )}

            <div className="space-y-4">
                {/* Business Info */}
                <div className={cardClasses}>
                    <div className={cardHeadClasses}>
                        <Building2 size={15} className="text-ink-soft" strokeWidth={1.75} />
                        <h2 className={cardTitleClasses}>Business Details</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className={fieldLabelClasses}>Brand Name</p>
                            <p className={fieldValueClasses}>{seller.brandName}</p>
                        </div>
                        <div>
                            <p className={fieldLabelClasses}>Business Email</p>
                            <p className={fieldValueClasses}>{seller.businessEmail}</p>
                        </div>
                        <div>
                            <p className={fieldLabelClasses}>Business Phone</p>
                            <p className={fieldValueClasses}>{seller.businessPhone || '—'}</p>
                        </div>
                        <div>
                            <p className={fieldLabelClasses}>Applied</p>
                            <p className={fieldValueClasses}>{new Date(seller.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</p>
                        </div>
                    </div>
                </div>

                {/* KYC */}
                <div className={cardClasses}>
                    <div className={cardHeadClasses}>
                        <CreditCard size={15} className="text-ink-soft" strokeWidth={1.75} />
                        <h2 className={cardTitleClasses}>KYC — PAN Details</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex flex-col">
                            <p className={fieldLabelClasses}>PAN Number</p>
                            <p className={`${fieldValueClasses} tracking-wide font-mono`}>{seller.kyc?.panNumber || '—'}</p>
                        </div>

                        <div className="flex flex-col">
                            <p className={fieldLabelClasses}>PAN Photo</p>
                            {seller.kyc?.panPhotoUrl ? (
                                <a
                                    href={seller.kyc.panPhotoUrl}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="group relative block w-20 h-20 rounded-[3px] border border-border overflow-hidden hover:border-gold transition-colors"
                                >
                                    <img src={seller.kyc.panPhotoUrl} alt="PAN" className="block w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-ink/0 group-hover:bg-ink/60 transition-colors flex items-center justify-center">
                                        <span className="text-[9.5px] font-semibold text-cream opacity-0 group-hover:opacity-100 transition-opacity text-center px-1 leading-tight">
                                            See Large
                                        </span>
                                    </div>
                                </a>
                            ) : (
                                <div className="flex items-center gap-2 text-[12px] text-ink-soft">
                                    <ImageIcon size={14} /> Not uploaded
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Pickup Address */}
                <div className={cardClasses}>
                    <div className={cardHeadClasses}>
                        <MapPin size={15} className="text-ink-soft" strokeWidth={1.75} />
                        <h2 className={cardTitleClasses}>Pickup Address</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <p className={fieldLabelClasses}>Address Line 1</p>
                            <p className={fieldValueClasses}>{seller.pickupAddress?.addressLine1 || '—'}</p>
                        </div>
                        {seller.pickupAddress?.addressLine2 && (
                            <div className="col-span-2">
                                <p className={fieldLabelClasses}>Address Line 2</p>
                                <p className={fieldValueClasses}>{seller.pickupAddress.addressLine2}</p>
                            </div>
                        )}
                        <div>
                            <p className={fieldLabelClasses}>City</p>
                            <p className={fieldValueClasses}>{seller.pickupAddress?.city || '—'}</p>
                        </div>
                        <div>
                            <p className={fieldLabelClasses}>State</p>
                            <p className={fieldValueClasses}>{seller.pickupAddress?.state || '—'}</p>
                        </div>
                        <div>
                            <p className={fieldLabelClasses}>Pincode</p>
                            <p className={fieldValueClasses}>{seller.pickupAddress?.pincode || '—'}</p>
                        </div>
                    </div>
                </div>

                {/* Payout */}
                <div className={cardClasses}>
                    <div className={cardHeadClasses}>
                        <Wallet size={15} className="text-ink-soft" strokeWidth={1.75} />
                        <h2 className={cardTitleClasses}>Payout Details</h2>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className={fieldLabelClasses}>UPI ID</p>
                            <p className={fieldValueClasses}>{seller.payout?.upiId || '—'}</p>
                        </div>
                        <div>
                            <p className={fieldLabelClasses}>UPI Mobile</p>
                            <p className={fieldValueClasses}>{seller.payout?.upiMobile || '—'}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Actions */}
            {
                isPending && (
                    <div className="flex gap-3 mt-6 sticky bottom-5">
                        <button
                            type="button"
                            onClick={() => setShowRejectModal(true)}
                            disabled={loading.create}
                            className="flex-1 flex items-center justify-center gap-2 rounded-[3px] border border-border bg-surface py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase text-ink hover:bg-cream-dark transition-colors disabled:opacity-50"
                        >
                            <XCircle size={15} /> Reject
                        </button>
                        <button
                            type="button"
                            onClick={onApprove}
                            disabled={loading.create}
                            className="flex-1 flex items-center justify-center gap-2 rounded-[3px] bg-charcoal py-3 text-[11.5px] font-semibold tracking-[0.05em] uppercase text-cream hover:bg-ink transition-colors disabled:opacity-50"
                        >
                            <CheckCircle2 size={15} /> {loading.create ? 'Approving...' : 'Approve'}
                        </button>
                    </div>
                )
            }

            {
                showRejectModal && (
                    <RejectModal
                        onClose={() => setShowRejectModal(false)}
                        onConfirm={onReject}
                        submitting={loading.create}
                    />
                )
            }
        </div >
    )
}

export default AdminSellerDetail