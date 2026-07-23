import React, { useState, useRef, useEffect } from 'react'
import { NavLink } from 'react-router'
import {
  Search,
  Heart,
  Bell,
  ShoppingBag,
  User,
  Home as HomeIcon,
  LayoutGrid,
  ShoppingCart,
  Package,
} from 'lucide-react'

// Placeholder notifications — replace with a real useNotifications() hook
// once the backend endpoint exists.
const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Your order #10234 has been shipped', time: '2h ago', unread: true },
  { id: 2, text: 'Price drop on an item in your wishlist', time: '1d ago', unread: true },
  { id: 3, text: 'Flash sale starts tomorrow — 30% off', time: '2d ago', unread: false },
]

// ---- Nav data -------------------------------------------------------------
// `to` values are real routes — every route referenced here MUST exist as a
// child under the UserLayout route in router.jsx, or the link 404s.
const DESKTOP_LINKS = [
  { label: 'Home', to: '/' },
  { label: 'Categories', to: '/categories' },
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Orders', to: '/orders' },
  { label: 'Sale', to: '/sale' },
]

const MOBILE_NAV = [
  { key: 'home', icon: HomeIcon, label: 'Home', to: '/' },
  { key: 'categories', icon: LayoutGrid, label: 'Categories', to: '/categories' },
  { key: 'cart', icon: ShoppingCart, label: 'Cart', to: '/cart' },
  { key: 'orders', icon: Package, label: 'Orders', to: '/orders' },
  { key: 'profile', icon: User, label: 'Profile', to: '/profile' },
]

const Navbar = () => {
  const [notifOpen, setNotifOpen] = useState(false)
  const notifRef = useRef(null)

  // Close the dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length

  return (
    <>
      {/* ================= MOBILE HEADER (< md) ================= */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-cream/95 backdrop-blur border-b border-border">
        <NavLink to="/" className="font-display text-[19px] font-medium tracking-[0.06em] text-ink">
          ZRIVE
        </NavLink>
        <div className="flex items-center gap-5">
          <button type="button" aria-label="Search" onClick={() => {}} className="text-ink hover:text-gold transition-colors">
            <Search size={18} strokeWidth={1.5} />
          </button>
          <NavLink to="/cart" aria-label="Cart" className="relative text-ink hover:text-gold transition-colors">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold" />
          </NavLink>
        </div>
      </header>

      {/* ================= DESKTOP / TABLET TOP NAVBAR (>= md) =================
          Single-tier layout: logo, main nav, search, utilities.
          Full-width bar bg + border; content sits inside a max-w container. */}
      <header className="hidden md:block sticky top-0 z-30 w-full bg-cream/95 backdrop-blur border-b border-border">
        {/* — Main Nav — */}
        <div className="w-full max-w-[1440px] mx-auto flex items-center gap-10 lg:gap-14 px-8 lg:px-14 py-4">
          {/* Logo */}
          <NavLink to="/" className="font-display text-[22px] font-medium tracking-[0.08em] text-ink flex-shrink-0">
            ZRIVE
          </NavLink>

          {/* Primary nav links */}
          <nav className="flex items-center gap-7 flex-shrink-0">
            {DESKTOP_LINKS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `relative text-[13px] font-medium tracking-[0.04em] transition-colors pb-0.5 ${
                    isActive
                      ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gold'
                      : 'text-ink-soft hover:text-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Search — editorial bottom-border-only style */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search size={14} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                placeholder="Search collections…"
                onChange={() => {}}
                className="w-full bg-transparent border-0 border-b border-border focus:border-ink pl-6 pr-4 py-2 text-[13px] text-ink placeholder:text-ink-soft outline-none transition-colors"
              />
            </div>
          </div>

          {/* Icon cluster */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <NavLink to="/wishlist" aria-label="Wishlist" className="text-ink hover:text-gold transition-colors">
              <Heart size={18} strokeWidth={1.5} />
            </NavLink>

            {/* Notifications dropdown */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((open) => !open)}
                className="relative text-ink hover:text-gold transition-colors"
              >
                <Bell size={18} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 border border-border bg-surface shadow-lg overflow-hidden rounded-[3px]">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-border">
                    <span className="text-[11px] font-semibold tracking-[0.1em] uppercase text-ink">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] text-ink-soft">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-border">
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {}}
                        className="w-full flex items-start gap-2.5 text-left px-4 py-3 hover:bg-cream-dark transition-colors"
                      >
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 flex-shrink-0" />}
                        <div className={n.unread ? '' : 'pl-4'}>
                          <p className="text-[12.5px] text-ink leading-snug">{n.text}</p>
                          <p className="text-[11px] text-ink-soft mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/cart" aria-label="Cart" className="relative text-ink hover:text-gold transition-colors">
              <ShoppingBag size={18} strokeWidth={1.5} />
              <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold" />
            </NavLink>

            <NavLink to="/profile" aria-label="Profile" className="text-ink hover:text-gold transition-colors">
              <User size={18} strokeWidth={1.5} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAV (< md only) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-cream/95 backdrop-blur border-t border-border">
        <div className="flex items-center px-2 py-2">
          {MOBILE_NAV.map(({ key, icon: Icon, label, to }) => (
            <NavLink
              key={key}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-1 transition-colors ${
                  isActive ? 'text-ink' : 'text-ink-soft'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} strokeWidth={isActive ? 2 : 1.5} />
                  <span className={`text-[10px] tracking-[0.06em] ${isActive ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>
    </>
  )
}

export default Navbar