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
    <div className="flex flex-col items-center px-6 py-20 text-center">
      {/* ---- Illustration ---- */}
      <div className="relative mb-8 w-[200px] h-[200px] flex items-center justify-center">
        {/* ambient ring behind the card */}
        <span className="absolute inset-0 rounded-full border border-gray-200" />
        {/* accent squares */}
        <span className="absolute -top-2 right-2 w-9 h-9 rounded-2xl bg-amber-100" />
        <span className="absolute -bottom-4 -left-6 w-11 h-11 rounded-2xl border border-gray-200 bg-white" />

        <div className="relative w-[130px] h-[130px] rounded-2xl border border-gray-200 bg-white shadow-sm flex items-center justify-center">
          <Package size={44} strokeWidth={1.5} className="text-black" />
        </div>
      </div>

      {/* ---- Copy ---- */}
      <h2 className="text-[28px] font-bold tracking-tight mb-2.5">No products found</h2>
      <p className="max-w-[420px] text-[14.5px] leading-relaxed text-gray-500 mb-8">
        Start selling your premium men's fashion by adding your first product. Your inventory
        will appear here once listed.
      </p>

      {/* ---- CTA ---- */}
      <button
        type="button"
        onClick={() => navigate('/seller/inventory/new')}
        className="flex items-center gap-2 rounded-xl px-7 py-3.5 text-[14px] font-bold tracking-tight bg-black text-white shadow-lg shadow-black/10 hover:opacity-90 active:scale-[0.99] transition-all"
      >
        <Plus size={16} strokeWidth={2.5} />
        Add Product
      </button>

      {/* ---- Feature strip ---- */}
      <div className="w-full max-w-3xl mt-16 pt-10 border-t border-gray-200 grid grid-cols-1 sm:grid-cols-3 gap-8 text-left">
        {FEATURES.map(({ icon: Icon, title, body }) => (
          <div key={title}>
            <Icon size={18} strokeWidth={1.75} className="text-amber-600 mb-2.5" />
            <h3 className="text-[11px] font-semibold tracking-[0.08em] uppercase text-black mb-1.5">
              {title}
            </h3>
            <p className="text-[13px] leading-relaxed text-gray-500">{body}</p>
          </div>
        ))}
      </div>
    </div>
  )
}

export default EmptyProductState