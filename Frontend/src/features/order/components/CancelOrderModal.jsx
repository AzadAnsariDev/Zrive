import React from "react";
import { AlertTriangle, X } from "lucide-react";

const CancelOrderModal = ({ open, onClose, onConfirm, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-2xl">
        <button
          type="button"
          onClick={onClose}
          disabled={loading}
          aria-label="Close cancellation dialog"
          className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full text-[#666666] hover:bg-[#F5F5F5] hover:text-[#111111] transition-colors disabled:opacity-50"
        >
          <X size={17} />
        </button>
        <div className="w-11 h-11 rounded-full bg-[#C43D3D]/10 flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-[#C43D3D]" strokeWidth={2} />
        </div>
        <h2 className="font-display text-xl text-ink mb-1.5">Cancel this order?</h2>
        <p className="text-sm text-ink-soft mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 rounded-full border border-[#EAEAEA] text-[#111111] text-xs tracking-[0.1em] uppercase font-medium hover:bg-[#FAFAFA] transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-full bg-[#C43D3D] text-white text-xs tracking-[0.1em] uppercase font-medium hover:bg-[#9F2E2E] transition-colors disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;