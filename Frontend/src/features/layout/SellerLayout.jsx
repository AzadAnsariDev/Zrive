import React from 'react'
import { NavLink, Outlet, Link } from 'react-router'
import {
  LayoutDashboard,
  Archive,
  ShoppingBag,
  BarChart2,
  Wallet,
  Settings,
  ShoppingCart,
  User,
  Plus,
  Crown,
  ChevronRight,
} from 'lucide-react'
import { useSelector } from 'react-redux'
import ZriveLogo from '../auth/components/ZriveLogo'
import ScrollToTop from '../../components/common/ScrollToTop'

const SIDEBAR_LINKS = [
  { to: '/seller', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/inventory', label: 'Inventory', icon: Archive },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/seller/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/seller/payments', label: 'Payments', icon: Wallet },
  { to: '/seller/settings', label: 'Settings', icon: Settings },
]

// Mobile: Analytics accessible from Dashboard, Payments on bottom nav
const MOBILE_NAV_LINKS = [
  { to: '/seller', label: 'Home', icon: LayoutDashboard },
  { to: '/seller/inventory', label: 'Inventory', icon: Archive },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/seller/payments', label: 'Payments', icon: Wallet },
  { to: '/seller/settings', label: 'Profile', icon: User },
]

const SellerLayout = () => {
  const user = useSelector((state) => state.auth.user)
  const application = useSelector((state) => state.seller.application)

  const isPlanActive =
    application?.plan?.activeTill &&
    new Date(application.plan.activeTill) > new Date()

  const brandInitial =
    application?.brandName?.[0]?.toUpperCase() ||
    user?.name?.[0]?.toUpperCase() ||
    'S'

  return (
    <div className="min-h-screen bg-white text-[#111] font-sans">
      <ScrollToTop />

      {/* ─── DESKTOP SIDEBAR ──────────────────────────────────── */}
      <div className="hidden md:flex h-screen overflow-hidden">

        {/* Sidebar */}
        <aside className="w-56 shrink-0 h-screen flex flex-col bg-[#FAFAFA] border-r border-[#EBEBEB]">

          {/* Logo row */}
          <div className="px-5 py-5 flex items-center justify-between border-b border-[#EBEBEB]">
            <ZriveLogo />
          </div>

          {/* Active Plan Badge */}
          {isPlanActive && (
            <div className="mx-4 mt-3 px-3 py-2 rounded-md bg-[#FAF8F5] border border-[#B08D57]/25 flex items-center gap-2">
              <Crown size={12} className="text-[#B08D57] shrink-0" />
              <span className="text-[10px] font-bold text-[#B08D57] uppercase tracking-wide truncate">
                {application.plan.name}
              </span>
              <span className="ml-auto text-[8.5px] font-bold px-1.5 py-0.5 rounded bg-[#B08D57] text-[#0E0E0E] uppercase">
                Live
              </span>
            </div>
          )}

          {/* Nav */}
          <nav className="flex-1 px-3 pt-4 space-y-0.5 overflow-y-auto">
            <p className="px-2 pb-1 text-[9px] font-bold uppercase tracking-widest text-[#BBBBBB]">
              Menu
            </p>
            {SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/seller'}
                className={({ isActive }) =>
                  `flex items-center gap-2.5 px-3 py-2 rounded-md text-[12px] font-medium transition-all ${
                    isActive
                      ? 'bg-[#111] text-white font-semibold'
                      : 'text-[#555] hover:bg-[#EFEFEF] hover:text-[#111]'
                  }`
                }
              >
                <Icon size={14} strokeWidth={2} />
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Bottom: profile + add product */}
          <div className="px-3 pb-4 pt-3 border-t border-[#EBEBEB] space-y-2">
            {/* Profile link */}
            <Link
              to="/seller/settings"
              className="flex items-center gap-2.5 px-3 py-2 rounded-md hover:bg-[#EFEFEF] transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-[#F5EFE5] border border-[#B08D57]/30 flex items-center justify-center text-[11px] font-bold text-[#B08D57] shrink-0">
                {brandInitial}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[11.5px] font-bold text-[#111] truncate group-hover:text-[#B08D57] transition-colors">
                  {application?.brandName || user?.name || 'My Store'}
                </p>
                <p className="text-[9.5px] text-[#AAA]">Settings</p>
              </div>
              <ChevronRight size={12} className="text-[#CCC] shrink-0" />
            </Link>

            {/* Add Product */}
            <Link
              to="/seller/inventory/new"
              className="flex items-center justify-center gap-1.5 w-full py-2 rounded-md bg-[#111] text-white text-[11px] font-bold uppercase tracking-wide hover:bg-[#B08D57] transition-all shadow-sm"
            >
              <Plus size={13} strokeWidth={2.5} />
              Add Product
            </Link>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 h-screen overflow-y-auto min-w-0 bg-white">
          <Outlet />
        </main>
      </div>

      {/* ─── MOBILE (bottom tab bar) ──────────────────── */}
      <div className="md:hidden min-h-screen pb-16 bg-white">
        <Outlet />

        <nav className="fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EBEBEB]">
          <div className="flex items-stretch">
            {MOBILE_NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                end={to === '/seller'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[9px] font-medium tracking-wide transition-colors ${
                    isActive
                      ? 'text-[#B08D57]'
                      : 'text-[#AAA] hover:text-[#111]'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} strokeWidth={isActive ? 2.2 : 1.6} />
                    <span>{label}</span>
                  </>
                )}
              </NavLink>
            ))}
          </div>
        </nav>
      </div>
    </div>
  )
}

export default SellerLayout