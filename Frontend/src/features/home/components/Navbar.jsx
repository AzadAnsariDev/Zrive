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

// Placeholder data — replace with the real notifications feed once the
// backend endpoint exists (e.g. from a useNotifications() hook).
const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Your order #10234 has been shipped', time: '2h ago', unread: true },
  { id: 2, text: 'Price drop on an item in your wishlist', time: '1d ago', unread: true },
  { id: 3, text: 'Flash sale starts tomorrow — 30% off', time: '2d ago', unread: false },
]

// ---- Nav data -------------------------------------------------------------
// `to` values are real routes — every route referenced here MUST exist as a
// child under the UserLayout route in router.jsx, or the link 404s.
// Active state is derived from the current URL via NavLink automatically.
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

// Shared active/inactive classnames for the desktop text links.
const desktopLinkClasses = ({ isActive }) =>
  `text-[13.5px] transition-colors ${
    isActive ? 'text-black font-semibold' : 'text-gray-500 font-medium hover:text-black'
  }`

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
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 py-4 bg-white/95 backdrop-blur border-b border-gray-100">
        <NavLink to="/" className="text-[17px] font-extrabold tracking-[0.08em]">
          ZRIVE
        </NavLink>
        <div className="flex items-center gap-4">
          <button type="button" aria-label="Search" onClick={() => {}} className="hover:opacity-60 transition-opacity">
            <Search size={19} strokeWidth={1.75} />
          </button>
          <NavLink to="/cart" aria-label="Cart" className="relative hover:opacity-60 transition-opacity">
            <ShoppingBag size={19} strokeWidth={1.75} />
            <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600" />
          </NavLink>
        </div>
      </header>

      {/* ================= DESKTOP / TABLET TOP NAVBAR (>= md) =================
          Bar spans full width (bg + border), but its content sits inside a
          centered max-width container so spacing stays deliberate and
          premium on very wide screens instead of stretching thin. */}
      <header className="hidden md:flex sticky top-0 z-30 w-full bg-white/95 backdrop-blur border-b border-gray-100">
        <div className="w-full max-w-[1440px] mx-auto flex items-center gap-10 lg:gap-14 px-8 lg:px-14 py-5">
          <NavLink to="/" className="text-[19px] font-extrabold tracking-[0.08em] flex-shrink-0">
            ZRIVE
          </NavLink>

          <nav className="flex items-center gap-8 flex-shrink-0">
            {DESKTOP_LINKS.map(({ label, to }) => (
              <NavLink key={label} to={to} end={to === '/'} className={desktopLinkClasses}>
                {label}
              </NavLink>
            ))}
          </nav>

          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md">
              <Search size={15} strokeWidth={1.75} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search collections..."
                onChange={() => {}}
                className="w-full rounded-full bg-gray-100 border border-transparent focus:border-gray-300 focus:bg-white pl-11 pr-4 py-2.5 text-[13px] outline-none transition-colors"
              />
            </div>
          </div>

          <div className="flex items-center gap-6 flex-shrink-0">
            {/* Wishlist is a persistent list, same idea as Cart/Orders — it
                gets its own page. Add `{ path: 'wishlist', element: <Wishlist /> }`
                under UserLayout's children in router.jsx. */}
            <NavLink to="/wishlist" aria-label="Wishlist" className="hover:opacity-60 transition-opacity">
              <Heart size={18} strokeWidth={1.75} />
            </NavLink>

            {/* Notifications are transient, so they live in a dropdown
                instead of a full page. */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((open) => !open)}
                className="relative hover:opacity-60 transition-opacity"
              >
                <Bell size={18} strokeWidth={1.75} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600" />
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 top-full mt-3 w-80 rounded-2xl border border-gray-200 bg-white shadow-lg overflow-hidden">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
                    <span className="text-[13px] font-semibold">Notifications</span>
                    {unreadCount > 0 && (
                      <span className="text-[11px] text-gray-500">{unreadCount} unread</span>
                    )}
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-gray-100">
                    {MOCK_NOTIFICATIONS.map((n) => (
                      <button
                        key={n.id}
                        type="button"
                        onClick={() => {}}
                        className="w-full flex items-start gap-2.5 text-left px-4 py-3 hover:bg-gray-50 transition-colors"
                      >
                        {n.unread && <span className="w-1.5 h-1.5 rounded-full bg-black mt-1.5 flex-shrink-0" />}
                        <div className={n.unread ? '' : 'pl-4'}>
                          <p className="text-[13px] leading-snug">{n.text}</p>
                          <p className="text-[11px] text-gray-500 mt-0.5">{n.time}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <NavLink to="/cart" aria-label="Cart" className="relative hover:opacity-60 transition-opacity">
              <ShoppingBag size={18} strokeWidth={1.75} />
              <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-red-600" />
            </NavLink>
            <NavLink to="/profile" aria-label="Profile" className="hover:opacity-60 transition-opacity">
              <User size={18} strokeWidth={1.75} />
            </NavLink>
          </div>
        </div>
      </header>

      {/* ================= MOBILE BOTTOM NAV (< md only) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-transparent border-t border-neutral-800">
        <div className="flex items-center px-2 py-1">
          {MOBILE_NAV.map(({ key, icon: Icon, label, to }) => (
            <NavLink
              key={key}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex-1 flex flex-col items-center gap-1 py-1 ${isActive ? 'text-black' : 'text-neutral-500'}`
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={19} strokeWidth={isActive ? 2.25 : 1.75} />
                  <span className={`text-[10px] ${isActive ? 'font-bold' : 'font-medium'}`}>{label}</span>
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