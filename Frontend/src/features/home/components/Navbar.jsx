import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation } from 'react-router'
import { useSelector } from 'react-redux'
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
  ChevronDown,
  X,
  ChevronRight,
  ArrowLeft,
} from 'lucide-react'
import SellerNavIcon from '../../seller/components/SellerNavIcon'
import SearchResultsPanel from '../components/SearchResultsPanel'
import { useProduct } from '../../product/hook/useProduct'
import { useDebounce } from '../components/useDebounce'
import { CATEGORY_MENU } from '../../../constant/Categories'

// Placeholder notifications — replace with a real useNotifications() hook
// once the backend endpoint exists.
const MOCK_NOTIFICATIONS = [
  { id: 1, text: 'Your order #10234 has been shipped', time: '2h ago', unread: true },
  { id: 2, text: 'Price drop on an item in your wishlist', time: '1d ago', unread: true },
  { id: 3, text: 'Flash sale starts tomorrow — 30% off', time: '2d ago', unread: false },
]

const DESKTOP_LINKS = [
  { label: 'New Arrivals', to: '/new-arrivals' },
  { label: 'Orders', to: '/orders' },
  { label: 'Collections', to: 'collections' },
]

const MOBILE_NAV = [
  { key: 'home', icon: HomeIcon, label: 'Home', to: '/' },
  { key: 'categories', icon: LayoutGrid, label: 'Categories' },
  { key: 'cart', icon: ShoppingCart, label: 'Cart', to: '/cart' },
  { key: 'orders', icon: Package, label: 'Orders', to: '/orders' },
  { key: 'profile', icon: User, label: 'Profile', to: '/profile' },
]

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const [notifOpen, setNotifOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const [mobileActiveGroup, setMobileActiveGroup] = useState(null)
  const notifRef = useRef(null)
  const closeTimer = useRef(null)

  /* =========================================================
     SEARCH — shared state, two renderings (desktop dropdown +
     mobile full-screen), one debounce + one backend call.
  ========================================================= */

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)       // desktop dropdown visibility
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false) // mobile full-screen overlay
  const desktopSearchRef = useRef(null)

  const { handleSearchProducts, handleClearSearchResults } = useProduct()
  const searchResults = useSelector((state) => state.product.searchResults)
  const searchLoading = useSelector((state) => state.product.loading.search)

  const debouncedQuery = useDebounce(query, 400)

  useEffect(() => {
    const trimmed = debouncedQuery.trim()

    if (!trimmed) {
      handleClearSearchResults()
      return
    }

    handleSearchProducts(trimmed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  // Close the desktop search dropdown on outside click.
  useEffect(() => {
    const handleClickOutsideSearch = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutsideSearch)
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch)
  }, [])

  // Lock body scroll while the mobile search overlay is open.
  useEffect(() => {
    if (mobileSearchOpen) document.body.style.overflow = 'hidden'
    else if (!mobileCatOpen) document.body.style.overflow = ''
    return () => {
      if (!mobileCatOpen) document.body.style.overflow = ''
    }
  }, [mobileSearchOpen, mobileCatOpen])

  const closeMobileSearch = () => {
    setMobileSearchOpen(false)
    setQuery('')
  }

  const handleSelectResult = (path) => {
    setSearchOpen(false)
    setMobileSearchOpen(false)
    setQuery('')
    navigate(path)
  }

  /* ========================================================= */

  // Close the categories dropdown + both search UIs whenever the route
  // changes. Navbar lives in the layout so it never unmounts between page
  // navigations — without this, these stay open on the new page.
  useEffect(() => {
    setCatOpen(false)
    setSearchOpen(false)
    setMobileSearchOpen(false)
  }, [location.pathname])

  // Close the notifications dropdown on outside click.
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock body scroll while the mobile category sheet is open.
  useEffect(() => {
    document.body.style.overflow = mobileCatOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileCatOpen])

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length

  const goToCategory = (slug) => {
    setCatOpen(false)
    setMobileCatOpen(false)
    navigate(`/all-products?category=${slug}`)
  }

  const openMenu = () => {
    clearTimeout(closeTimer.current)
    setCatOpen(true)
  }
  const scheduleClose = () => {
    closeTimer.current = setTimeout(() => setCatOpen(false), 120)
  }
  const closeImmediately = () => {
    clearTimeout(closeTimer.current)
    setCatOpen(false)
  }

  return (
    <>
      {/* ================= MOBILE HEADER (< md) ================= */}
      <header className="md:hidden sticky top-0 z-20 flex items-center justify-between px-5 py-3 bg-cream/95 backdrop-blur border-b border-border">
        <NavLink to="/" className="font-display text-[19px] font-medium tracking-[0.06em] text-ink">
          ZRIVE
        </NavLink>
        <div className="flex items-center gap-5">
          <button
            type="button"
            aria-label="Search"
            onClick={() => setMobileSearchOpen(true)}
            className="text-ink hover:text-gold transition-colors"
          >
            <Search size={18} strokeWidth={1.5} />
          </button>
          <SellerNavIcon />
          <NavLink to="/cart" aria-label="Cart" className="relative text-ink hover:text-gold transition-colors">
            <ShoppingBag size={18} strokeWidth={1.5} />
            <span className="absolute -top-1 -right-1 w-1.5 h-1.5 rounded-full bg-gold" />
          </NavLink>
        </div>
      </header>

      {/* ================= DESKTOP / TABLET TOP NAVBAR (>= md) ================= */}
      <header
        className="hidden md:block sticky top-0 z-30 w-full bg-cream/95 backdrop-blur border-b border-border relative"
        onMouseLeave={scheduleClose}
      >
        <div className="w-full max-w-[1440px] mx-auto flex items-center gap-10 lg:gap-14 px-8 lg:px-14 py-4">
          {/* Logo */}
          <NavLink to="/" className="font-display text-[22px] font-medium tracking-[0.08em] text-ink flex-shrink-0">
            ZRIVE
          </NavLink>

          {/* Primary nav links */}
          <nav className="flex items-center gap-7 flex-shrink-0">
            <NavLink
              to="/"
              end
              onMouseEnter={closeImmediately}
              className={({ isActive }) =>
                `relative text-[13px] font-medium tracking-[0.04em] transition-colors pb-0.5 ${isActive
                  ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gold'
                  : 'text-ink-soft hover:text-ink'
                }`
              }
            >
              Home
            </NavLink>

            <button
              type="button"
              onMouseEnter={openMenu}
              className={`relative flex items-center gap-1 text-[13px] font-medium tracking-[0.04em] transition-colors pb-0.5 outline-none focus:outline-none focus-visible:ring-1 focus-visible:ring-gold/50 ${catOpen ? 'text-ink' : 'text-ink-soft hover:text-ink'
                }`}
            >
              Categories
              <ChevronDown
                size={13}
                strokeWidth={1.5}
                className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`}
              />
            </button>

            {DESKTOP_LINKS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                onMouseEnter={closeImmediately}
                className={({ isActive }) =>
                  `relative text-[13px] font-medium tracking-[0.04em] transition-colors pb-0.5 ${isActive
                    ? 'text-ink after:absolute after:bottom-0 after:left-0 after:right-0 after:h-px after:bg-gold'
                    : 'text-ink-soft hover:text-ink'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Search — editorial bottom-border-only style + live dropdown */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-md" ref={desktopSearchRef}>
              <Search size={14} strokeWidth={1.5} className="absolute left-0 top-1/2 -translate-y-1/2 text-ink-soft" />
              <input
                type="text"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onFocus={() => query.trim() && setSearchOpen(true)}
                placeholder="Search collections…"
                className="w-full bg-transparent border-0 border-b border-border focus:border-ink pl-6 pr-4 py-2 text-[13px] text-ink placeholder:text-ink-soft outline-none transition-colors"
              />

              {searchOpen && query.trim() && (
                <div className="absolute left-0 right-0 top-full mt-3 bg-surface border border-border shadow-lg rounded-[3px] max-h-[70vh] overflow-y-auto z-40">
                  <SearchResultsPanel
                    query={query}
                    results={searchResults}
                    loading={searchLoading}
                    onSelect={handleSelectResult}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Icon cluster */}
          <div className="flex items-center gap-5 flex-shrink-0">
            <SellerNavIcon />

            <NavLink to="/wishlist" aria-label="Wishlist" className="text-ink hover:text-gold transition-colors">
              <Heart size={18} strokeWidth={1.5} />
            </NavLink>

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
                        onClick={() => { }}
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

        {/* ---- Mega Menu Panel (Myntra-style, full-width, hover) ---- */}
        {catOpen && (
          <div
            onMouseEnter={openMenu}
            className="absolute left-0 right-0 top-full w-full bg-surface border-t border-border shadow-lg z-40"
          >
            <div className="max-w-[1440px] mx-auto px-8 lg:px-14 py-8 grid grid-cols-5 gap-8">
              {CATEGORY_MENU.map((group) => (
                <div key={group.title}>
                  <button
                    type="button"
                    onClick={() => goToCategory(group.groupSlug)}
                    className="text-[12px] font-semibold tracking-[0.08em] uppercase text-gold hover:text-ink transition-colors mb-3 block"
                  >
                    {group.title}
                  </button>
                  <ul className="space-y-2.5">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          onClick={() => goToCategory(item.slug)}
                          className="text-[13px] text-ink-soft hover:text-ink transition-colors text-left"
                        >
                          {item.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* ================= MOBILE BOTTOM NAV (< md only) ================= */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-20 bg-cream/95 backdrop-blur border-t border-border">
        <div className="flex items-center px-2 py-1">
          {MOBILE_NAV.map(({ key, icon: Icon, label, to }) => {
            if (!to) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMobileCatOpen(true)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-0.5 transition-colors ${mobileCatOpen ? 'text-ink' : 'text-ink-soft'
                    }`}
                >
                  <Icon size={16} strokeWidth={mobileCatOpen ? 2 : 1.5} />
                  <span className={`text-[9px] leading-none ${mobileCatOpen ? 'font-semibold' : 'font-medium'}`}>
                    {label}
                  </span>
                </button>
              )
            }
            return (
              <NavLink
                key={key}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-0.5 py-0.5 transition-colors ${isActive ? 'text-ink' : 'text-ink-soft'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={16} strokeWidth={isActive ? 2 : 1.5} />
                    <span className={`text-[9px] leading-none ${isActive ? 'font-semibold' : 'font-medium'}`}>
                      {label}
                    </span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* ================= MOBILE CATEGORY BOTTOM SHEET (accordion) ================= */}
      {mobileCatOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/40" onClick={() => setMobileCatOpen(false)} />
          <div className="absolute bottom-0 left-0 right-0 bg-surface rounded-t-[12px] max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between px-5 py-4 border-b border-border flex-shrink-0">
              <span className="font-display text-[16px] text-ink">Shop By Category</span>
              <button
                type="button"
                aria-label="Close"
                onClick={() => setMobileCatOpen(false)}
                className="text-ink-soft hover:text-ink transition-colors"
              >
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-3">
              {CATEGORY_MENU.map((group) => {
                const isOpen = mobileActiveGroup === group.title
                return (
                  <div key={group.title} className="border-b border-border">
                    <button
                      type="button"
                      onClick={() => setMobileActiveGroup(isOpen ? null : group.title)}
                      className="w-full flex items-center justify-between py-4"
                    >
                      <span className="text-[13px] font-semibold text-ink">{group.title}</span>
                      <ChevronRight
                        size={15}
                        strokeWidth={1.5}
                        className={`text-ink-soft transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`}
                      />
                    </button>
                    {isOpen && (
                      <div className="pb-4 grid grid-cols-2 gap-x-4 gap-y-3">
                        {group.items.map((item) => (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => goToCategory(item.slug)}
                            className="text-[12.5px] text-ink-soft text-left"
                          >
                            {item.label}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= MOBILE SEARCH — full-screen overlay ================= */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-cream flex flex-col">
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border flex-shrink-0">
            <button
              type="button"
              onClick={closeMobileSearch}
              aria-label="Close search"
              className="text-ink-soft hover:text-ink transition-colors flex-shrink-0"
            >
              <ArrowLeft size={19} strokeWidth={1.5} />
            </button>

            <input
              autoFocus
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search collections…"
              className="flex-1 bg-cream-dark rounded-[3px] px-4 py-2.5 text-[14px] text-ink placeholder:text-ink-soft outline-none"
            />
          </div>

          <div className="flex-1 overflow-y-auto">
            {!query.trim() ? (
              <div className="flex flex-col items-center text-center px-6 py-14">
                <Search size={22} strokeWidth={1.4} className="text-ink-soft mb-3" />
                <p className="text-[13px] text-ink-soft">Start typing to search products</p>
              </div>
            ) : (
              <SearchResultsPanel
                query={query}
                results={searchResults}
                loading={searchLoading}
                onSelect={handleSelectResult}
              />
            )}
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar