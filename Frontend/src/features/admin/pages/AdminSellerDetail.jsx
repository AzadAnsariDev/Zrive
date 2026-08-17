import { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router'
import { useSelector } from 'react-redux'
import {
    ArrowLeft, Building2, CreditCard, MapPin, Wallet,
    CheckCircle2, XCircle, AlertTriangle, X, ImageIcon, ShieldCheck, Check,
} from 'lucide-react'
import { useAdmin } from '../hook/useAdmin'
import { notify } from '../../../utils/toast'

const RejectModal = ({ onClose, onConfirm, submitting }) => {
    const [reason, setReason] = useState('')

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
            <div className="relative w-full max-w-[420px] rounded-[10px] bg-[#131313] border border-white/15 p-6 text-white shadow-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <h3 className="font-display text-[18px] font-bold text-white">Reject Merchant Application</h3>
                    <button type="button" onClick={onClose} className="text-white/50 hover:text-white cursor-pointer">
                        <X size={18} />
                    </button>
                </div>

                <p className="text-[12.5px] text-white/70 leading-relaxed">
                    Specify the rejection reason below. The merchant will receive notification and can re-submit after fixing errors.
                </p>

                <div>
                    <label className="block text-[10.5px] font-bold uppercase tracking-[0.1em] text-[#B08D57] mb-2">Rejection Reason</label>
                    <textarea
                        rows={3}
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        placeholder="e.g. Uploaded PAN image is unreadable or blurry."
                        className="w-full bg-[#1c1b1b] border border-white/15 rounded-[6px] p-3 text-[13px] text-white outline-none focus:border-[#B08D57]"
                    />
                </div>

                <div className="flex justify-end gap-3 pt-2">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 border border-white/20 rounded-[6px] text-[12px] font-bold uppercase text-white/70 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        disabled={!reason.trim() || submitting}
                        onClick={() => onConfirm(reason.trim())}
                        className="px-5 py-2 bg-[#C43D3D] text-white rounded-[6px] text-[12px] font-bold uppercase disabled:opacity-50 cursor-pointer"
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
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        handleGetSellerDetail(sellerId)
    }, [sellerId])

    const onApprove = async () => {
        setSubmitting(true)
        const res = await handleApproveSeller(sellerId)
        setSubmitting(false)
        if (res.success) {
            notify.success('Merchant application approved successfully!')
        } else {
            notify.error(res.error, 'Failed to approve merchant application.')
        }
    }

    const onReject = async (reason) => {
        setSubmitting(true)
        const res = await handleRejectSeller(sellerId, reason)
        setSubmitting(false)
        if (res.success) {
            setShowRejectModal(false)
            notify.success('Merchant application rejected.')
        } else {
            notify.error(res.error, 'Failed to reject application.')
        }
    }

    if (loading?.sellers || !seller) {
        return (
            <div className="min-h-[50vh] flex items-center justify-center">
                <div className="w-8 h-8 border-2 border-white/20 border-t-[#B08D57] rounded-full animate-spin" />
            </div>
        )
    }

    const isApproved = seller.applicationStatus === 'approved'
    const isRejected = seller.applicationStatus === 'rejected'

    return (
        <div className="space-y-8">
            {/* Back Bar */}
            <button
                type="button"
                onClick={() => navigate('/admin/sellers')}
                className="flex items-center gap-2 text-[12px] font-bold text-white/60 hover:text-white transition-colors cursor-pointer"
            >
                <ArrowLeft size={16} />
                Back to Sellers Registry
            </button>

            {/* Banner */}
            <div className="bg-[#131313] border border-white/10 rounded-[12px] p-6 md:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase ${isApproved ? 'bg-[#287A4B]/20 text-[#287A4B] border border-[#287A4B]/40' : isRejected ? 'bg-[#C43D3D]/20 text-[#C43D3D] border border-[#C43D3D]/40' : 'bg-[#B08D57]/20 text-[#B08D57] border border-[#B08D57]/40'}`}>
                            {seller.applicationStatus?.replace('_', ' ')}
                        </span>
                        <span className="text-[12px] text-white/40">ID: #{seller._id?.slice(-8).toUpperCase()}</span>
                    </div>

                    <h1 className="font-display text-[30px] font-bold text-white">{seller.brandName}</h1>
                    <p className="text-[13px] text-white/60 mt-1">{seller.businessEmail} · {seller.businessPhone || 'No phone'}</p>
                </div>

                <div className="flex items-center gap-3">
                    {!isApproved && (
                        <button
                            onClick={onApprove}
                            disabled={submitting}
                            className="flex items-center gap-2 bg-[#287A4B] text-white px-6 py-3 rounded-[6px] text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#1E6039] transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <Check size={16} strokeWidth={3} />
                            Approve Merchant
                        </button>
                    )}

                    {!isRejected && (
                        <button
                            onClick={() => setShowRejectModal(true)}
                            disabled={submitting}
                            className="flex items-center gap-2 border border-[#C43D3D] text-[#C43D3D] px-5 py-3 rounded-[6px] text-[12px] font-bold uppercase tracking-[0.06em] hover:bg-[#C43D3D]/10 transition-all disabled:opacity-50 cursor-pointer"
                        >
                            <X size={16} />
                            Reject Application
                        </button>
                    )}
                </div>
            </div>

            {/* Application Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Address Card */}
                <div className="bg-[#131313] border border-white/10 rounded-[10px] p-6 space-y-4">
                    <h3 className="font-display text-[16px] font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                        <MapPin size={18} className="text-[#B08D57]" />
                        Courier Pickup Address
                    </h3>

                    {seller.pickupAddress ? (
                        <div className="text-[13px] text-white/70 space-y-1">
                            <p>{seller.pickupAddress.addressLine1}</p>
                            {seller.pickupAddress.addressLine2 && <p>{seller.pickupAddress.addressLine2}</p>}
                            <p>{seller.pickupAddress.city}, {seller.pickupAddress.state} - <strong className="text-white">{seller.pickupAddress.pincode}</strong></p>
                        </div>
                    ) : (
                        <p className="text-[12.5px] text-white/40">Pickup address not configured.</p>
                    )}
                </div>

                {/* Bank / Payout Card */}
                <div className="bg-[#131313] border border-white/10 rounded-[10px] p-6 space-y-4">
                    <h3 className="font-display text-[16px] font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                        <CreditCard size={18} className="text-[#B08D57]" />
                        Escrow Payout Account
                    </h3>

                    {seller.payout ? (
                        <div className="text-[13px] text-white/70 space-y-2">
                            <p><span className="text-white/40">UPI VPA:</span> <strong className="text-white">{seller.payout.upiId || 'N/A'}</strong></p>
                            <p><span className="text-white/40">Mobile:</span> <strong className="text-white">{seller.payout.upiMobile || 'N/A'}</strong></p>
                        </div>
                    ) : (
                        <p className="text-[12.5px] text-white/40">Payout account details missing.</p>
                    )}
                </div>
            </div>

            {/* PAN Verification Document */}
            <div className="bg-[#131313] border border-white/10 rounded-[10px] p-6 space-y-4">
                <h3 className="font-display text-[16px] font-bold text-white flex items-center gap-2 pb-3 border-b border-white/10">
                    <ShieldCheck size={18} className="text-[#B08D57]" />
                    Identity Document (PAN: {seller.panNumber || 'Not submitted'})
                </h3>

                {seller.panPhotoUrl ? (
                    <div className="max-w-md bg-black p-3 rounded-[8px] border border-white/15">
                        <img src={seller.panPhotoUrl} alt="PAN Card Document" className="w-full h-auto rounded" />
                    </div>
                ) : (
                    <p className="text-[12.5px] text-white/40">No PAN document photo uploaded.</p>
                )}
            </div>

            {showRejectModal && (
                <RejectModal
                    onClose={() => setShowRejectModal(false)}
                    onConfirm={onReject}
                    submitting={submitting}
                />
            )}
        </div>
    )
}

export default AdminSellerDetail