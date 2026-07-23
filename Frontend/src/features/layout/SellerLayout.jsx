import React, { useEffect } from 'react'
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
import { useSelector } from 'react-redux'
import { useAuth } from '../auth/hook/useAuth'
import ZriveLogo from '../auth/components/ZriveLogo'

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



const SellerLayout = () => {


  const user = useSelector((state)=> state.auth.user)
  console.log(user)

  return (
    <div className="min-h-screen bg-cream text-ink font-sans">
      {/* ============================================================ */}
      {/* DESKTOP / TABLET (>= md) — sidebar, full height              */}
      {/* ============================================================ */}
      <div className="hidden md:flex h-screen overflow-hidden">
        <aside className="w-64 shrink-0 h-screen flex flex-col justify-between border-r border-border bg-cream">
          <div>
            <div className="px-6 pt-7 pb-8">
              <ZriveLogo />
            </div>

            <nav className="flex flex-col gap-1 px-3">
              {SIDEBAR_LINKS.map(({ to, label, icon: Icon }) => (
                <NavLink
                  key={to}
                  to={to}
                  className={({ isActive }) =>
                    `flex items-center gap-3 px-3.5 py-2.5 rounded-[3px] text-[13px] font-medium tracking-[0.04em] transition-colors border-l-2 ${
                      isActive
                        ? 'bg-charcoal text-cream border-gold'
                        : 'text-ink-soft border-transparent hover:text-ink hover:bg-cream-dark'
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
            <div className="flex items-center gap-3 px-2 py-2 mb-4">
              <img
                src="https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=200&auto=format&fit=crop"
                alt="Seller profile"
                className="w-9 h-9 rounded-full object-cover"
              />
              <div className="min-w-0">
                <div className="text-[13px] font-bold text-ink truncate">Seller Profile</div>
                <div className="text-[11.5px] text-ink-soft">Manage Account</div>
              </div>
            </div>
            <Link
              to="/seller/inventory/new"
              className="w-full flex items-center justify-center gap-2 rounded-[3px] bg-charcoal text-cream py-3.5 text-[11px] font-semibold tracking-[0.1em] uppercase hover:bg-ink transition-colors"
            >
              <Plus size={15} strokeWidth={2.5} />
              Add Product
            </Link>
          </div>
        </aside>

        {/* Page content — every seller page renders here, and this is the
            only part of the screen that scrolls. The sidebar never moves. */}
        <main className="flex-1 h-screen overflow-y-auto min-w-0 bg-cream">
          <Outlet />
        </main>
      </div>

      {/* ============================================================ */}
      {/* MOBILE (< md) — bottom tab bar                                */}
      {/* ============================================================ */}
      <div className="md:hidden min-h-screen pb-20 bg-cream">
        <Outlet />

        <nav className="fixed bottom-0 left-0 right-0 z-20 bg-cream/95 backdrop-blur border-t border-border">
          <div className="max-w-md mx-auto flex items-center px-2 py-2.5">
            {MOBILE_NAV_LINKS.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-1 py-1 transition-colors ${
                    isActive ? 'text-ink' : 'text-ink-soft'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={19} strokeWidth={isActive ? 2 : 1.5} />
                    <span className={`text-[10px] tracking-[0.06em] ${isActive ? 'font-semibold' : 'font-medium'}`}>
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