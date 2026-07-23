import React from 'react'
import { useNavigate } from 'react-router'
import { Plus, Package, ShieldCheck, Wallet, Rocket } from 'lucide-react'

// Renders inside the Inventory page's content area (sidebar + topbar are
// already provided by <SellerLayout />). Shown when the seller has zero
// products listed.

const FEATURES = [
  {
    icon: ShieldCheck,
    title: 'Authenticity',
    body: 'Every listing is reviewed by our curators to ensure quality.',
  },
  {
    icon: Wallet,
    title: 'Fast Payouts',
    body: 'Secure processing with industry-leading low fees.',
  },
  {
    icon: Rocket,
    title: 'Global Reach',
    body: 'Access our network of 50k+ luxury collectors worldwide.',
  },
]

const EmptyProductState = () => {
  const navigate = useNavigate()

  return (
    <div className="flex flex-col items-center px-6 py-20 text-center bg-transparent">
      {/* ---- Illustration ---- */}
      <div className="relative mb-10 w-[200px] h-[200px] flex items-center justify-center">
        {/* ambient ring behind the card */}
        <span className="absolute inset-0 rounded-full border border-border opacity-50" />
        {/* accent squares */}
        <span className="absolute -top-2 right-2 w-9 h-9 rounded-[3px] bg-cream-dark" />
        <span className="absolute -bottom-4 -left-6 w-11 h-11 rounded-[3px] border border-border bg-surface" />

        <div className="relative w-[130px] h-[130px] rounded-[3px] border border-border bg-surface flex items-center justify-center">
          <Package size={44} strokeWidth={1} className="text-ink" />
        </div>
      </div>

      {/* ---- Copy ---- */}
      <h2 className="font-display text-[32px] font-medium tracking-tight mb-3 text-ink">No products found</h2>
      <p className="max-w-[420px] text-[14px] leading-relaxed text-ink-soft mb-10">
        Start selling your premium men's fashion by adding your first product. Your curated inventory
        will appear here once listed.
      </p>

      {/* ---- CTA ---- */}
      <button
        type="button"
        onClick={() => navigate('/seller/inventory/new')}
        className="flex items-center gap-3 rounded-[3px] px-8 py-4 text-[11px] font-semibold tracking-[0.1em] uppercase bg-charcoal text-cream hover:bg-ink transition-colors"
      >
        <Plus size={16} strokeWidth={2.5} />
        Add Product
      </button>

      {/* ---- Feature strip ---- */}
      <div className="w-full max-w-3xl mt-20 pt-12 border-t border-border grid grid-cols-1 sm:grid-cols-3 gap-10 text-left">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <Icon size={20} strokeWidth={1.5} className="text-gold mb-4" />
            <h3 className="text-[10px] font-semibold tracking-[0.16em] uppercase text-gold mb-2">
              {title}
            </h3>
            <p className="text-[13px] leading-relaxed text-ink-soft">{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmptyProductState