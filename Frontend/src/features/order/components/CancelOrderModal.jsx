import React from "react";
import { AlertTriangle } from "lucide-react";

const CancelOrderModal = ({ open, onClose, onConfirm, loading }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      <div
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        onClick={!loading ? onClose : undefined}
      />
      <div className="relative w-full sm:max-w-sm bg-surface rounded-t-2xl sm:rounded-2xl p-6">
        <div className="w-11 h-11 rounded-full bg-error/10 flex items-center justify-center mb-4">
          <AlertTriangle size={20} className="text-error" strokeWidth={2} />
        </div>
        <h2 className="font-display text-xl text-ink mb-1.5">Cancel this order?</h2>
        <p className="text-sm text-ink-soft mb-6">This action cannot be undone.</p>
        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 py-3.5 rounded-full border border-border text-ink text-xs tracking-[0.1em] uppercase font-medium hover:bg-cream-dark transition-colors disabled:opacity-50"
          >
            Keep Order
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 py-3.5 rounded-full bg-error text-cream text-xs tracking-[0.1em] uppercase font-medium hover:bg-error/90 transition-colors disabled:opacity-60"
          >
            {loading ? "Cancelling..." : "Cancel Order"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CancelOrderModal;