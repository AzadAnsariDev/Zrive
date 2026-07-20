import React from 'react'
import { NavLink, Outlet, Link } from 'react-router'
import {
  LayoutDashboard,
  Archive,
  ShoppingBag,
  BarChart2,
  Wallet,
  Settings,
  Home,
  ShoppingCart,
  User,
  Plus,
} from 'lucide-react'

// ---------------------------------------------------------------------
// SINGLE SOURCE OF TRUTH for seller navigation.
// Adding a new seller page later? Add one line here (sidebar) and, only
// if it should also appear in the mobile tab bar, one line in
// MOBILE_NAV_LINKS. Nothing else in the app needs to change.
// `to` must match the route path you register in your router.
// ---------------------------------------------------------------------
const SIDEBAR_LINKS = [
  { to: '/seller/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/seller/inventory', label: 'Inventory', icon: Archive },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingBag },
  { to: '/seller/analytics', label: 'Analytics', icon: BarChart2 },
  { to: '/seller/payments', label: 'Payments', icon: Wallet },
  { to: '/seller/settings', label: 'Settings', icon: Settings },
]

// Mobile bottom nav is intentionally a shorter subset (only 4 slots fit).
const MOBILE_NAV_LINKS = [
  { to: '/seller/dashboard', label: 'Home', icon: Home },
  { to: '/seller/inventory', label: 'Inventory', icon: Archive },
  { to: '/seller/orders', label: 'Orders', icon: ShoppingCart },
  { to: '/seller/settings', label: 'Profile', icon: User },
]

const Logo = () => (
  <div className="flex items-center gap-2.5">
    <span className="w-9 h-9 rounded-lg bg-black flex items-center justify-center shrink-0">
      <span className="text-amber-400 text-[12px] font-extrabold tracking-tight">ZR</span>
    </span>
    <div className="leading-tight">
      <div className="text-[13.5px] font-bold tracking-[0.16em] text-amber-500">ZRIVE</div>
      <div className="text-[11px] text-gray-500">Seller</div>
    </div>
  </div>
)

const SellerLayout = () => {
  return (
    <div className="min-h-screen bg-gray-50 text-black">
      {/* ============================================================ */}
      {/* DESKTOP / TABLET (>= md) — sidebar, full height              */}
      {/* ============================================================ */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <aside className="w-64 shrink-0 h-screen flex flex-col justify-between border-r border-gray-200 bg-gray-50">
          <div>
            <div className="px-6 pt-7 pb-8">
              <Logo />
            </div>

            <nav className="flex flex-col gap-1 px-3">
              {SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-[14px] transition-colors border ${
                      isActive
                        ? 'font-bold bg-gray-100 border-transparent border-r-2 border-r-black'
                        : 'font-medium text-gray-600 border-transparent hover:border-gray-300'
                    }`
                  }
                >
                  <Icon size={17} strokeWidth={1.75} />
                  {label}
                </NavLink>
              ))}
            </nav>
          </div>

          <div className="px-4 pb-6">
            <div className="flex items-center gap-3 px-2 py-2 mb-3">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                alt="Seller profile"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-[13px] font-bold truncate">Seller Profile</div>
                <div className="text-[11.5px] text-gray-500">Manage Account</div>
              </div>
            </div>
            <Link
              to="/seller/inventory/new"
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-black text-white py-3 text-[13px] font-bold hover:opacity-90 transition-opacity"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Product
            </Link>
          </div>
        </aside>

        {/* Page content — every seller page renders here, and this is the
            only part of the screen that scrolls. The sidebar never moves. */}
        <main className="flex-1 h-screen overflow-y-auto min-w-0">
          <Outlet />
        </main>
      </div>

      {/* ============================================================ */}
      {/* MOBILE (< md) — bottom tab bar                                */}
      {/* ============================================================ */}
      <div className="md:hidden min-h-screen pb-20">
        <Outlet />

        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-white/95 backdrop-blur border-t border-gray-200">
          <div className="max-w-md mx-auto flex items-center px-2 py-2.5">
            {MOBILE_NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-1 py-1 ${
                    isActive ? 'text-black' : 'text-gray-500'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={isActive ? 2.25 : 1.75} />
                    <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>
                      {label}
                    </span>
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