import {
  Lock,
  Clock,
  ArrowRight,
  X
} from "lucide-react";

const KycRequiredModal = ({ onClose, onGoToKyc, applicationStatus }) => {
  const isPending = applicationStatus === 'pending_verification'

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-6">
      <div className="absolute inset-0 bg-ink/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-[380px] rounded-[3px] bg-surface border border-border shadow-xl p-7 text-center animate-[modalIn_0.25s_ease_forwards]">
        <style>{`
          @keyframes modalIn {
            from { opacity: 0; transform: translateY(10px) scale(0.98); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 text-ink-soft hover:text-ink transition-colors"
        >
          <X size={16} />
        </button>

        <div className="mx-auto mb-5 flex items-center justify-center w-12 h-12 rounded-full bg-gold/15">
          {isPending ? (
            <Clock size={20} className="text-gold-deep" strokeWidth={1.5} />
          ) : (
            <Lock size={20} className="text-gold-deep" strokeWidth={1.5} />
          )}
        </div>

        <h3 className="font-display text-[20px] font-medium text-ink mb-2">
          {isPending ? 'KYC Under Review' : 'Complete Your KYC'}
        </h3>
        <p className="text-[13px] leading-relaxed text-ink-soft mb-6">
          {isPending
            ? "We've received your details and they're being verified. This usually takes a short while — you'll be notified once approved."
            : 'Listing products is unlocked once your pickup address, payout details, and PAN are verified — it only takes a few minutes.'}
        </p>

        {isPending ? (
          <button
            type="button"
            onClick={onClose}
            className="w-full flex items-center justify-center gap-2 rounded-[3px] bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink"
          >
            Got It
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={onGoToKyc}
              className="w-full flex items-center justify-center gap-2 rounded-[3px] bg-charcoal py-3.5 text-[11px] font-semibold tracking-[0.1em] uppercase text-cream transition-colors hover:bg-ink"
            >
              Complete KYC
              <ArrowRight size={14} />
            </button>
            <button
              type="button"
              onClick={onClose}
              className="w-full mt-2.5 py-2 text-[12px] text-ink-soft hover:text-ink transition-colors"
            >
              Maybe later
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default KycRequiredModal