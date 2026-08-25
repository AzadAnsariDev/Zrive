import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  Mail, Phone, MapPin, Sparkles, Zap, Crown,
  CheckCircle, Check, Store, Loader2, ArrowLeft,
} from 'lucide-react'
import useSeller from '../hook/useSeller'
import { notify } from '../../../utils/toast'
import { SellerSettingsSkeleton } from '../../../components/common/Skeleton'

const PLANS = [
  {
    key: 'starter',
    name: 'Starter Boost',
    price: 199,
    days: 3,
    tagline: 'Perfect for weekend flash sales & new drops',
    badge: 'Basic',
    features: [
      '3 Days Search Priority Placement',
      'Verified Merchant Badge',
      '1 Sponsored Product Slot',
      'Daily impression analytics',
    ],
    recommended: false,
    icon: Sparkles,
  },
  {
    key: 'growth',
    name: 'Growth Accelerate',
    price: 299,
    days: 7,
    tagline: '7 Days Top-30% ranking & conversion traffic',
    badge: 'Recommended',
    features: [
      '7 Days Top 30% Search Ranking',
      '2.5× discovery multiplier',
      'Featured Gold Merchant Badge',
      '5 Sponsored Product Slots',
      'Conversion & cart-drop analytics',
    ],
    recommended: true,
    icon: Zap,
  },
  {
    key: 'elite',
    name: 'Elite Spotlight',
    price: 399,
    days: 15,
    tagline: '15 Days #1 ranking & category banner takeover',
    badge: 'VIP Elite',
    features: [
      '15 Days #1 Search Priority',
      '4× homepage visibility',
      'VIP Elite Trustmark on all listings',
      'Unlimited Sponsored Slots',
      '0% Platform Commission',
      '24/7 WhatsApp Concierge',
    ],
    recommended: false,
    icon: Crown,
  },
]

const SellerSettings = () => {
  const navigate = useNavigate()
  const { handleGetMyApplication, handleUpdateProfile, handleSubscribePlan } = useSeller()
  const application = useSelector((state) => state.seller.application)

  const [brandName, setBrandName] = useState('')
  const [businessEmail, setBusinessEmail] = useState('')
  const [businessPhone, setBusinessPhone] = useState('')
  const [description, setDescription] = useState('')
  const [category, setCategory] = useState('Fashion & Apparel')
  const [line1, setLine1] = useState('')
  const [line2, setLine2] = useState('')
  const [city, setCity] = useState('')
  const [stateName, setStateName] = useState('')
  const [pincode, setPincode] = useState('')

  const [savingProfile, setSavingProfile] = useState(false)
  const [subscribingKey, setSubscribingKey] = useState(null)
  const [showPlanModal, setShowPlanModal] = useState(null)
  const [activatedNoticePlan, setActivatedNoticePlan] = useState(null)

  useEffect(() => {
    handleGetMyApplication()
  }, [])

  useEffect(() => {
    if (application) {
      setBrandName(application.brandName || '')
      setBusinessEmail(application.businessEmail || '')
      setBusinessPhone(application.businessPhone || '')
      setDescription(application.description || '')
      setCategory(application.category || 'Fashion & Apparel')
      const addr = application.pickupAddress || {}
      setLine1(addr.addressLine1 || '')
      setLine2(addr.addressLine2 || '')
      setCity(addr.city || '')
      setStateName(addr.state || '')
      setPincode(addr.pincode || '')
    }
  }, [application])

  if (!application) {
    return <SellerSettingsSkeleton />
  }

  const onSaveProfile = async (e) => {
    e.preventDefault()
    if (!brandName.trim() || !businessEmail.trim() || !businessPhone.trim()) {
      notify.error('Brand Name, Email, and Phone are required.')
      return
    }
    setSavingProfile(true)
    try {
      await handleUpdateProfile({
        brandName: brandName.trim(),
        businessEmail: businessEmail.trim(),
        businessPhone: businessPhone.trim(),
        description: description.trim(),
        category,
        pickupAddress: { addressLine1: line1.trim(), addressLine2: line2.trim(), city: city.trim(), state: stateName.trim(), pincode: pincode.trim(), country: 'India' }
      })
      notify.success('Profile updated!')
    } catch { notify.error('Failed to update profile.') }
    finally { setSavingProfile(false) }
  }

  const onConfirmSubscribe = async () => {
    if (!showPlanModal) return
    const plan = showPlanModal
    setSubscribingKey(plan.key)
    try {
      await handleSubscribePlan(plan.key)
      setShowPlanModal(null)
      setActivatedNoticePlan(plan)
    } catch { notify.error('Plan activation failed.') }
    finally { setSubscribingKey(null) }
  }

  const isPlanActive = application?.plan?.activeTill && new Date(application.plan.activeTill) > new Date()

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
              <p className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57]">Merchant Account</p>
              <h1 className="text-[20px] font-bold text-[#111] mt-0.5">Profile & Preferences</h1>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 md:px-10 pt-8 space-y-10">

        {/* ── SaaS Booster Plans ─────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-2">
            <div>
              <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#B08D57]">Growth Engine</p>
              <h2 className="text-[16px] font-bold text-[#111] mt-0.5">Visibility Booster Plans</h2>
              <p className="text-[11.5px] text-[#888] mt-0.5">Boost your products to the top of search. More days = more sales.</p>
            </div>
            {isPlanActive && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#EAF5EE] border border-[#287A4B]/30 rounded-full text-[11px] font-bold text-[#287A4B]">
                <CheckCircle size={13} />
                {application.plan.name} active till{' '}
                {new Date(application.plan.activeTill).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </span>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {PLANS.map((plan) => {
              const Icon = plan.icon
              const isCurrent = isPlanActive && application.plan.name?.toLowerCase().includes(plan.key)

              return (
                <div
                  key={plan.key}
                  className={`relative bg-[#FAFAFA] rounded-xl p-6 border flex flex-col ${
                    plan.recommended
                      ? 'border-[#B08D57] ring-1 ring-[#B08D57]/40'
                      : 'border-[#EBEBEB] hover:border-[#B08D57]/50 transition-colors'
                  }`}
                >
                  {plan.badge && (
                    <span className={`absolute -top-2.5 left-5 text-[9px] font-bold uppercase px-2 py-0.5 rounded-full tracking-wide ${
                      plan.recommended ? 'bg-[#B08D57] text-[#0E0E0E]' : 'bg-[#111] text-white'
                    }`}>
                      {plan.badge}
                    </span>
                  )}

                  <div className="flex items-start justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#FAF8F5] border border-[#EBEBEB] flex items-center justify-center text-[#B08D57]">
                      <Icon size={18} />
                    </div>
                    <div className="text-right">
                      <span className="text-[22px] font-bold text-[#111]">₹{plan.price}</span>
                      <span className="text-[10.5px] text-[#AAA] block">/ {plan.days} Days</span>
                    </div>
                  </div>

                  <h3 className="text-[14px] font-bold text-[#111]">{plan.name}</h3>
                  <p className="text-[11.5px] text-[#888] mt-1 mb-4">{plan.tagline}</p>

                  <div className="space-y-1.5 mb-6 text-[11.5px] flex-1">
                    {plan.features.map((f, i) => (
                      <div key={i} className="flex items-start gap-2 text-[#444]">
                        <Check size={13} className="text-[#B08D57] shrink-0 mt-0.5" />
                        {f}
                      </div>
                    ))}
                  </div>

                  <button
                    onClick={() => !isCurrent && setShowPlanModal(plan)}
                    disabled={isCurrent}
                    className={`w-full py-2.5 rounded-lg text-[11.5px] font-bold uppercase tracking-wide cursor-pointer transition-all ${
                      isCurrent
                        ? 'bg-[#EAF5EE] text-[#287A4B] border border-[#287A4B]/30 cursor-default'
                        : plan.recommended
                        ? 'bg-[#B08D57] text-[#0E0E0E] hover:bg-[#D4B982] shadow'
                        : 'bg-[#111] text-white hover:bg-[#B08D57] transition-all'
                    }`}
                  >
                    {isCurrent ? '✓ Active' : `Activate ${plan.days}d Boost`}
                  </button>
                </div>
              )
            })}
          </div>
        </section>

        {/* ── Store Profile ───────────────────────────────────────────── */}
        <section className="bg-[#FAFAFA] border border-[#EBEBEB] rounded-xl p-7">
          <p className="text-[9.5px] font-bold uppercase tracking-widest text-[#B08D57] mb-1">Store Details</p>
          <h2 className="text-[14px] font-bold text-[#111] mb-6">Profile & Logistics</h2>

          <form onSubmit={onSaveProfile} className="space-y-5 text-[12.5px]">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {[
                { label: 'Brand / Store Name *', value: brandName, set: setBrandName, type: 'text', placeholder: 'Zara Studio' },
                { label: 'Business Email *', value: businessEmail, set: setBusinessEmail, type: 'email', placeholder: 'store@brand.com' },
                { label: 'Support Phone *', value: businessPhone, set: setBusinessPhone, type: 'tel', placeholder: '9876543210' },
              ].map((f) => (
                <div key={f.label}>
                  <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#AAA] mb-1.5">{f.label}</label>
                  <input
                    type={f.type}
                    value={f.value}
                    onChange={(e) => f.set(e.target.value)}
                    placeholder={f.placeholder}
                    required={f.label.includes('*')}
                    className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#B08D57] transition-colors"
                  />
                </div>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="md:col-span-2">
                <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#AAA] mb-1.5">Brand Bio</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Tell buyers about your brand story, materials, craftsmanship…"
                  className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#B08D57] transition-colors resize-none"
                />
              </div>
              <div>
                <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#AAA] mb-1.5">Primary Category</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#B08D57] transition-colors"
                >
                  {['Fashion & Apparel', 'Luxury Menswear', 'Streetwear & Oversized', 'Footwear & Sneakers', 'Accessories & Sunglasses'].map((c) => (
                    <option key={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Pickup Address */}
            <div className="pt-4 border-t border-[#EBEBEB] space-y-4">
              <div className="flex items-center gap-2">
                <MapPin size={14} className="text-[#B08D57]" />
                <span className="text-[10.5px] font-bold uppercase tracking-widest text-[#111]">Warehouse / Pickup Address</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#AAA] mb-1.5">Address Line 1</label>
                  <input type="text" value={line1} onChange={(e) => setLine1(e.target.value)} placeholder="Building / Street"
                    className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#B08D57] transition-colors" />
                </div>
                <div>
                  <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#AAA] mb-1.5">Address Line 2</label>
                  <input type="text" value={line2} onChange={(e) => setLine2(e.target.value)} placeholder="Landmark / Area"
                    className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#B08D57] transition-colors" />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                {[
                  { label: 'City', value: city, set: setCity },
                  { label: 'State', value: stateName, set: setStateName },
                  { label: 'Pincode', value: pincode, set: setPincode },
                ].map((f) => (
                  <div key={f.label}>
                    <label className="block text-[9.5px] font-bold uppercase tracking-widest text-[#AAA] mb-1.5">{f.label}</label>
                    <input type="text" value={f.value} onChange={(e) => f.set(e.target.value)}
                      className="w-full bg-white border border-[#EBEBEB] rounded-lg px-3 py-2.5 text-[13px] outline-none focus:border-[#B08D57] transition-colors" />
                  </div>
                ))}
              </div>
            </div>

            <div className="flex justify-end pt-3 border-t border-[#EBEBEB]">
              <button
                type="submit"
                disabled={savingProfile}
                className="flex items-center gap-1.5 px-6 py-2.5 bg-[#B08D57] text-[#0E0E0E] rounded-lg text-[12px] font-bold cursor-pointer disabled:opacity-50 hover:bg-[#D4B982] transition-all shadow"
              >
                {savingProfile ? <><Loader2 size={13} className="animate-spin" /> Saving…</> : 'Save Profile'}
              </button>
            </div>
          </form>
        </section>
      </div>

      {/* Plan Activation Confirmation Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#EBEBEB] rounded-2xl p-7 max-w-md w-full shadow-2xl space-y-5">
            <div className="pb-4 border-b border-[#EBEBEB]">
              <h3 className="text-[16px] font-bold text-[#111]">Activate {showPlanModal.name}</h3>
              <p className="text-[11.5px] text-[#888] mt-0.5">{showPlanModal.days} Days Boost for ₹{showPlanModal.price}</p>
            </div>

            <div className="bg-[#FAF8F5] p-4 rounded-lg space-y-2">
              {showPlanModal.features.map((f, i) => (
                <div key={i} className="flex items-center gap-2 text-[11.5px] text-[#444]">
                  <Check size={13} className="text-[#B08D57]" />
                  {f}
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-[#EBEBEB]">
              <button onClick={() => setShowPlanModal(null)} disabled={subscribingKey !== null}
                className="px-4 py-2 border border-[#EBEBEB] rounded-lg text-[11.5px] font-bold text-[#555] cursor-pointer">
                Cancel
              </button>
              <button onClick={onConfirmSubscribe} disabled={subscribingKey !== null}
                className="flex items-center gap-1.5 px-5 py-2 bg-[#B08D57] text-[#0E0E0E] rounded-lg text-[11.5px] font-bold cursor-pointer disabled:opacity-50 hover:bg-[#D4B982] transition-all">
                {subscribingKey ? <><Loader2 size={12} className="animate-spin" /> Activating…</> : `Pay ₹${showPlanModal.price} & Activate`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Plan Activated Notice Modal (Dev Disclaimer) */}
      {activatedNoticePlan && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white border border-[#EBEBEB] rounded-2xl p-7 max-w-md w-full shadow-2xl space-y-5 animate-fade-in-down">
            <div className="w-12 h-12 rounded-full bg-[#FAF8F5] border border-[#B08D57]/30 flex items-center justify-center text-[#B08D57] mx-auto">
              <Crown size={24} />
            </div>

            <div className="text-center space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#B08D57] bg-[#FAF8F5] px-2.5 py-1 rounded-full border border-[#B08D57]/20 inline-block">
                Plan Activated in UI
              </span>
              <h3 className="text-[18px] font-bold text-[#111]">
                You are upgraded to {activatedNoticePlan.name}!
              </h3>
              <div className="p-3.5 bg-[#FAF8F5] border border-[#B08D57]/20 rounded-xl text-left text-[12px] text-[#555] space-y-2 leading-relaxed">
                <p>
                  🎉 <strong>Badge & UI:</strong> Aapka live merchant badge aur plan status dashboard/sidebar me active ho gaya hai.
                </p>
                <p className="text-[#777]">
                  ℹ️ <strong>Note:</strong> Algorithm search priority & sponsored ranking feature abhi <strong>under development</strong> hai. Enjoy the exclusive merchant badge & UI features!
                </p>
              </div>
            </div>

            <button
              onClick={() => setActivatedNoticePlan(null)}
              className="w-full py-2.5 bg-[#111] text-white rounded-lg text-[12px] font-bold uppercase tracking-wide hover:bg-[#B08D57] transition-all cursor-pointer shadow"
            >
              Great, Enjoy!
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default SellerSettings
