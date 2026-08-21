import React, { useState, useRef, useEffect, useCallback } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router'
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
  LogIn,
  Sparkles,
  TrendingUp,
} from 'lucide-react'
import SellerNavIcon from '../../seller/components/SellerNavIcon'
import SearchResultsPanel from '../components/SearchResultsPanel'
import { useProduct } from '../../product/hook/useProduct'
import { useDebounce } from '../components/useDebounce'
import { CATEGORY_MENU } from '../../../constant/Categories'
import useNotification from '../../notification/hook/useNotification'

const DESKTOP_LINKS = [
  { label: 'New Arrivals', to: '/new-arrivals', icon: Sparkles },
  { label: 'Trending', to: '/all-products', icon: TrendingUp },
  { label: 'Collections', to: '/collections' },
  { label: 'Orders', to: '/orders' },
]

const MOBILE_NAV = [
  { key: 'home', icon: HomeIcon, label: 'Home', to: '/' },
  { key: 'categories', icon: LayoutGrid, label: 'Categories', to: null },
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
  const [profileOpen, setProfileOpen] = useState(false)
  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const closeTimer = useRef(null)

  // ── Search ────────────────────────────────────────────────────────
  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const desktopSearchRef = useRef(null)

  const { handleSearchProducts, handleClearSearchResults } = useProduct()
  const {
    handleGetNotifications,
    handleMarkAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
  } = useNotification()
  const searchResults = useSelector((state) => state.product.searchResults)
  const searchLoading = useSelector((state) => state.product.loading.search)
  const debouncedQuery = useDebounce(query, 400)

  // Auth state from Redux
  const user = useSelector((state) => state.auth?.user)
  const cartItems = useSelector((state) => state.cart?.items ?? [])
  const notifications = useSelector((state) => state.inAppNotification?.items ?? [])
  const unreadCount = useSelector((state) => state.inAppNotification?.unreadCount ?? 0)
  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)

  useEffect(() => {
    if (user) handleGetNotifications()
  }, [user])

  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) { handleClearSearchResults(); return }
    handleSearchProducts(trimmed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  useEffect(() => {
    const handleClickOutsideSearch = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setSearchOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutsideSearch)
    return () => document.removeEventListener('mousedown', handleClickOutsideSearch)
  }, [])

  useEffect(() => {
    if (mobileSearchOpen) document.body.style.overflow = 'hidden'
    else if (!mobileCatOpen) document.body.style.overflow = ''
    return () => { if (!mobileCatOpen) document.body.style.overflow = '' }
  }, [mobileSearchOpen, mobileCatOpen])

  useEffect(() => {
    setCatOpen(false); setSearchOpen(false); setMobileSearchOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    const handler = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setNotifOpen(false)
      if (profileRef.current && !profileRef.current.contains(e.target)) setProfileOpen(false)
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  useEffect(() => {
    document.body.style.overflow = mobileCatOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileCatOpen])

  const closeMobileSearch = () => { setMobileSearchOpen(false); setQuery('') }
  const handleSelectResult = (path) => {
    setSearchOpen(false); setMobileSearchOpen(false); setQuery('')
    navigate(path)
  }

  const goToCategory = (slug) => {
    setCatOpen(false); setMobileCatOpen(false)
    navigate(`/all-products?category=${slug}`)
  }

  const openMenu = () => { clearTimeout(closeTimer.current); setCatOpen(true) }
  const scheduleClose = () => { closeTimer.current = setTimeout(() => setCatOpen(false), 120) }
  const closeImmediately = () => { clearTimeout(closeTimer.current); setCatOpen(false) }

  // User initials for avatar
  const userInitials = user?.fullName
    ? user.fullName.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.name?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  // Standard clean light mode styling tokens
  const navBg = 'bg-white/95 border-[#E5E5E5]'
  const textPrimary = 'text-[#111111]'
  const textSoft = 'text-[#666666]'
  const surfaceBg = 'bg-white'
  const cardBg = 'bg-white border-[#E5E5E5]'
  const hoverBg = 'hover:bg-[#F7F7F5]'

  return (
    <>
      {/* ─── ANNOUNCEMENT BAR ────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-center gap-6 px-4 py-2 text-[11px] font-medium tracking-[0.08em] uppercase bg-[#111111] text-[#D4B982]">
        <span>⚡ FLAT 20% OFF YOUR FIRST ORDER — USE: ZRIVE20</span>
        <span className="text-[#555]">|</span>
        <span>FREE SHIPPING ABOVE ₹999</span>
        <span className="text-[#555]">|</span>
        <span>7-DAY EASY RETURNS</span>
      </div>

      {/* ─── MOBILE HEADER ─────────────────────────────────────── */}
      <header className={`md:hidden sticky top-0 z-30 flex items-center justify-between px-5 py-3.5 backdrop-blur-xl border-b ${navBg}`}>
        <button
          type="button"
          aria-label="Search"
          onClick={() => setMobileSearchOpen(true)}
          className={`${textSoft} hover:text-[#B08D57] transition-colors`}
        >
          <Search size={18} strokeWidth={1.5} />
        </button>

        <NavLink to="/" className={`font-display text-[20px] font-semibold tracking-[0.12em] ${textPrimary}`}>
          ZRIVE
        </NavLink>

        <div className="flex items-center gap-4">
          <SellerNavIcon />
          <NavLink
            to="/wishlist"
            aria-label="Wishlist"
            className={`flex h-5 w-5 items-center justify-center ${textSoft} hover:text-[#B08D57] transition-colors`}
          >
            <Heart size={18} strokeWidth={1.5} />
          </NavLink>
          <div className="relative">
            <button
              type="button"
              aria-label="Notifications"
              onClick={() => setNotifOpen((open) => !open)}
              className={`relative flex h-5 w-5 items-center justify-center ${textSoft} hover:text-[#B08D57] transition-colors`}
            >
              <Bell size={18} strokeWidth={1.5} />
              {unreadCount > 0 && (
                <span className="absolute -right-2 -top-2 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#B08D57] px-1 text-[9px] font-bold text-[#0e0e0e]">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            {notifOpen && (
              <div className={`absolute right-0 top-full mt-4 w-[min(20rem,calc(100vw-2rem))] border shadow-2xl overflow-hidden rounded-[8px] animate-fade-in-down z-50 ${cardBg}`}>
                <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
                  <span className={`text-[11px] font-semibold tracking-[0.1em] uppercase ${textPrimary}`}>Notifications</span>
                  {notifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => handleDeleteAllNotifications()}
                      className="text-[10px] font-semibold text-[#666] hover:text-[#C43D3D]"
                    >
                      Clear all
                    </button>
                  )}
                </div>
                <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E5E5]">
                  {notifications.length === 0 ? (
                    <p className={`px-4 py-8 text-center text-[12px] ${textSoft}`}>No notifications</p>
                  ) : notifications.map((notification) => (
                    <div key={notification._id} className="flex items-start gap-3 px-4 py-3">
                      {!notification.isRead && <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-[#B08D57]" />}
                      <button
                        type="button"
                        onClick={() => {
                          handleMarkAsRead(notification._id)
                          setNotifOpen(false)
                          navigate(notification.url || '/orders')
                        }}
                        className={`min-w-0 flex-1 text-left ${notification.isRead ? 'pl-4' : ''}`}
                      >
                        <p className={`text-[12.5px] leading-snug ${textPrimary}`}>{notification.title}</p>
                        <p className={`mt-0.5 text-[11px] ${textSoft}`}>{notification.message}</p>
                      </button>
                      <button
                        type="button"
                        aria-label="Delete notification"
                        onClick={() => handleDeleteNotification(notification._id)}
                        className="shrink-0 text-[#999] hover:text-[#C43D3D]"
                      >
                        <X size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
          <NavLink to="/cart" aria-label="Cart" className={`relative ${textSoft} hover:text-[#B08D57] transition-colors`}>
            <ShoppingBag size={18} strokeWidth={1.5} />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#B08D57] text-[#0e0e0e] text-[9px] font-bold flex items-center justify-center">
                {cartCount > 9 ? '9+' : cartCount}
              </span>
            )}
          </NavLink>
        </div>
      </header>

      {/* ─── DESKTOP NAVBAR ────────────────────────────────────── */}
      <header
        className={`hidden md:block sticky top-0 z-30 w-full backdrop-blur-xl border-b ${navBg}`}
        onMouseLeave={scheduleClose}
      >
        <div className="w-full max-w-[1440px] mx-auto flex items-center gap-8 lg:gap-12 px-8 lg:px-12 py-4">

          {/* Logo */}
          <NavLink to="/" className={`font-display text-[22px] font-semibold tracking-[0.12em] flex-shrink-0 ${textPrimary} hover:text-[#B08D57] transition-colors`}>
            ZRIVE
          </NavLink>

          {/* Primary Nav */}
          <nav className="flex items-center gap-6 flex-shrink-0">
            <NavLink
              to="/"
              end
              onMouseEnter={closeImmediately}
              className={({ isActive }) =>
                `relative text-[12.5px] font-medium tracking-[0.04em] transition-colors pb-0.5 ${isActive
                  ? `${textPrimary} after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#B08D57] after:rounded-full`
                  : `${textSoft} hover:text-[#B08D57]`
                }`
              }
            >
              Home
            </NavLink>

            <button
              type="button"
              onMouseEnter={openMenu}
              className={`relative flex items-center gap-1 text-[12.5px] font-medium tracking-[0.04em] transition-colors pb-0.5 outline-none ${catOpen ? 'text-[#B08D57]' : `${textSoft} hover:text-[#B08D57]`}`}
            >
              Categories
              <ChevronDown size={12} strokeWidth={2} className={`transition-transform duration-200 ${catOpen ? 'rotate-180' : ''}`} />
            </button>

            {DESKTOP_LINKS.map(({ label, to }) => (
              <NavLink
                key={label}
                to={to}
                end={to === '/'}
                onMouseEnter={closeImmediately}
                className={({ isActive }) =>
                  `relative text-[12.5px] font-medium tracking-[0.04em] transition-colors pb-0.5 ${isActive
                    ? `${textPrimary} after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[1.5px] after:bg-[#B08D57] after:rounded-full`
                    : `${textSoft} hover:text-[#B08D57]`
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </nav>

          {/* Search */}
          <div className="flex-1 flex justify-center">
            <div className="relative w-full max-w-lg" ref={desktopSearchRef}>
              <Search size={14} strokeWidth={1.5} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#B08D57]" />
              <input
                type="text"
                value={query}
                onChange={(e) => { setQuery(e.target.value); setSearchOpen(true) }}
                onFocus={() => query.trim() && setSearchOpen(true)}
                placeholder="Search for brands, clothes, accessories…"
                className="w-full rounded-[6px] border border-[#E5E5E5] pl-10 pr-4 py-2.5 text-[12.5px] outline-none transition-all bg-[#F5F5F5] text-[#111] placeholder:text-[#999] focus:border-[#B08D57] focus:bg-white"
              />
              {searchOpen && query.trim() && (
                <div className={`absolute left-0 right-0 top-full mt-2 border shadow-2xl rounded-[6px] max-h-[70vh] overflow-y-auto z-50 ${cardBg}`}>
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

          {/* Icon Cluster */}
          <div className="flex items-center gap-4 flex-shrink-0">
            <SellerNavIcon />

            <NavLink to="/wishlist" aria-label="Wishlist" className={`${textSoft} hover:text-[#B08D57] transition-colors`}>
              <Heart size={18} strokeWidth={1.5} />
            </NavLink>

            {/* Notifications */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((o) => !o)}
                className={`relative ${textSoft} hover:text-[#B08D57] transition-colors`}
              >
                <Bell size={18} strokeWidth={1.5} />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#B08D57] text-[#0e0e0e] text-[9px] font-bold flex items-center justify-center">
                    {unreadCount}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className={`absolute right-0 top-full mt-3 w-80 border shadow-2xl overflow-hidden rounded-[8px] animate-fade-in-down z-50 ${cardBg}`}>
                  <div className="flex items-center justify-between px-4 py-3 border-b border-[#E5E5E5]">
                    <span className={`text-[11px] font-semibold tracking-[0.1em] uppercase ${textPrimary}`}>Notifications</span>
                    <div className="flex items-center gap-3">
                      {unreadCount > 0 && <span className="text-[11px] text-[#B08D57]">{unreadCount} unread</span>}
                      {notifications.length > 0 && (
                        <button
                          type="button"
                          onClick={() => handleDeleteAllNotifications()}
                          className="text-[10px] font-semibold text-[#666] hover:text-[#C43D3D]"
                        >
                          Clear all
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="max-h-72 overflow-y-auto divide-y divide-[#E5E5E5]">
                    {notifications.length === 0 ? (
                      <p className={`px-4 py-8 text-center text-[12px] ${textSoft}`}>No notifications</p>
                    ) : notifications.map((notification) => (
                      <div key={notification._id} className={`flex items-start gap-3 px-4 py-3 ${hoverBg}`}>
                        {!notification.isRead && <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-1.5 flex-shrink-0" />}
                        <button
                          type="button"
                          onClick={() => {
                            handleMarkAsRead(notification._id)
                            setNotifOpen(false)
                            navigate(notification.url || '/orders')
                          }}
                          className={`min-w-0 flex-1 text-left ${notification.isRead ? 'pl-4' : ''}`}
                        >
                          <p className={`text-[12.5px] leading-snug ${textPrimary}`}>{notification.title}</p>
                          <p className={`text-[11px] mt-0.5 ${textSoft}`}>{notification.message}</p>
                        </button>
                        <button
                          type="button"
                          aria-label="Delete notification"
                          onClick={() => handleDeleteNotification(notification._id)}
                          className="shrink-0 text-[#999] hover:text-[#C43D3D]"
                        >
                          <X size={14} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Cart */}
            <NavLink to="/cart" aria-label="Cart" className={`relative ${textSoft} hover:text-[#B08D57] transition-colors`}>
              <ShoppingBag size={18} strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-[#B08D57] text-[#0e0e0e] text-[9px] font-bold flex items-center justify-center">
                  {cartCount > 9 ? '9+' : cartCount}
                </span>
              )}
            </NavLink>

            {/* Login / Profile */}
            {user ? (
              <div className="relative" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen(o => !o)}
                  className="w-8 h-8 rounded-full bg-[#B08D57] text-[#0e0e0e] text-[11px] font-bold flex items-center justify-center hover:ring-2 hover:ring-[#B08D57]/40 transition-all"
                >
                  {userInitials}
                </button>
                {profileOpen && (
                  <div className={`absolute right-0 top-full mt-3 w-52 border shadow-2xl overflow-hidden rounded-[8px] animate-fade-in-down z-50 ${cardBg}`}>
                    <div className="px-4 py-3 border-b border-[#E5E5E5]">
                      <p className={`text-[13px] font-semibold ${textPrimary}`}>{user.fullName || user.name}</p>
                      <p className={`text-[11px] ${textSoft}`}>{user.email}</p>
                    </div>
                    {[
                      { label: 'My Profile', to: '/profile' },
                      { label: 'My Orders', to: '/orders' },
                      { label: 'Wishlist', to: '/wishlist' },
                      { label: 'Seller Dashboard', to: '/seller' },
                    ].map(({ label, to }) => (
                      <Link key={label} to={to} className={`flex items-center px-4 py-2.5 text-[12.5px] transition-colors ${textSoft} ${hoverBg} hover:text-[#B08D57]`}>
                        {label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            ) : (
              <Link
                to="/login"
                className="flex items-center gap-1.5 px-4 py-2 rounded-[6px] border border-[#B08D57] text-[#B08D57] text-[12px] font-semibold tracking-[0.06em] uppercase hover:bg-[#B08D57] hover:text-[#0e0e0e] transition-all duration-200"
              >
                <LogIn size={13} strokeWidth={2} />
                Login
              </Link>
            )}
          </div>
        </div>

        {/* ── Mega Menu ─────────────────────────────────── */}
        {catOpen && (
          <div onMouseEnter={openMenu} className={`absolute left-0 right-0 top-full w-full border-t shadow-2xl z-40 animate-fade-in-down ${surfaceBg} border-[#E5E5E5]`}>
            <div className="max-w-[1440px] mx-auto px-8 lg:px-12 py-8 grid grid-cols-5 gap-8">
              {CATEGORY_MENU.map((group) => (
                <div key={group.title}>
                  <button
                    type="button"
                    onClick={() => goToCategory(group.groupSlug)}
                    className="text-[11px] font-bold tracking-[0.1em] uppercase text-[#B08D57] hover:text-[#8C6B3E] transition-colors mb-3 block"
                  >
                    {group.title}
                  </button>
                  <ul className="space-y-2">
                    {group.items.map((item) => (
                      <li key={item.slug}>
                        <button
                          type="button"
                          onClick={() => goToCategory(item.slug)}
                          className={`text-[12.5px] transition-colors text-left hover:text-[#B08D57] ${textSoft}`}
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

      {/* ─── MOBILE BOTTOM NAV ──────────────────────────────────── */}
      <nav className={`md:hidden fixed bottom-0 left-0 right-0 z-30 backdrop-blur-xl border-t ${navBg}`}>
        <div className="flex items-center px-2 py-2">
          {MOBILE_NAV.map(({ key, icon: Icon, label, to }) => {
            if (!to) {
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setMobileCatOpen(true)}
                  className={`flex-1 flex flex-col items-center gap-0.5 py-1 transition-colors ${mobileCatOpen ? 'text-[#B08D57]' : textSoft}`}
                >
                  <Icon size={17} strokeWidth={mobileCatOpen ? 2 : 1.5} />
                  <span className="text-[9px] leading-none font-medium">{label}</span>
                </button>
              )
            }
            return (
              <NavLink
                key={key}
                to={to}
                end={to === '/'}
                className={({ isActive }) =>
                  `flex-1 flex flex-col items-center gap-0.5 py-1 transition-colors ${isActive ? 'text-[#B08D57]' : textSoft}`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={17} strokeWidth={isActive ? 2 : 1.5} />
                    <span className="text-[9px] leading-none font-medium">{label}</span>
                  </>
                )}
              </NavLink>
            )
          })}
        </div>
      </nav>

      {/* ─── MOBILE CATEGORY SHEET ──────────────────────────────── */}
      {mobileCatOpen && (
        <div className="md:hidden fixed inset-0 z-40">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileCatOpen(false)} />
          <div className={`absolute bottom-0 left-0 right-0 rounded-t-[20px] max-h-[85vh] flex flex-col animate-fade-in-up ${surfaceBg}`}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-[#E5E5E5] flex-shrink-0">
              <span className={`font-display text-[17px] ${textPrimary}`}>Shop By Category</span>
              <button type="button" onClick={() => setMobileCatOpen(false)} className={`${textSoft} hover:text-[#B08D57] transition-colors`}>
                <X size={18} strokeWidth={1.5} />
              </button>
            </div>
            <div className="overflow-y-auto px-5 py-3 pb-6">
              {CATEGORY_MENU.map((group) => {
                const isOpen = mobileActiveGroup === group.title
                return (
                  <div key={group.title} className="border-b border-[#E5E5E5]">
                    <button
                      type="button"
                      onClick={() => setMobileActiveGroup(isOpen ? null : group.title)}
                      className="w-full flex items-center justify-between py-4"
                    >
                      <span className={`text-[13px] font-semibold ${textPrimary}`}>{group.title}</span>
                      <ChevronRight size={14} strokeWidth={2} className={`${textSoft} transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                    </button>
                    {isOpen && (
                      <div className="pb-4 grid grid-cols-2 gap-x-4 gap-y-3">
                        {group.items.map((item) => (
                          <button
                            key={item.slug}
                            type="button"
                            onClick={() => goToCategory(item.slug)}
                            className={`text-[12.5px] text-left hover:text-[#B08D57] transition-colors ${textSoft}`}
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

      {/* ─── MOBILE SEARCH OVERLAY ──────────────────────────────── */}
      {mobileSearchOpen && (
        <div className={`md:hidden fixed inset-0 z-50 flex flex-col ${surfaceBg}`}>
          <div className="flex items-center gap-3 px-5 py-3 border-b border-[#E5E5E5] flex-shrink-0">
            <button type="button" onClick={closeMobileSearch} className={`${textSoft} hover:text-[#B08D57] transition-colors flex-shrink-0`}>
              <ArrowLeft size={19} strokeWidth={1.5} />
            </button>
            <div className="flex-1 relative">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#B08D57]" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search brands, styles, collections…"
                className="w-full rounded-[6px] pl-9 pr-4 py-2.5 text-[14px] outline-none border bg-[#F5F5F5] border-transparent text-[#111] placeholder:text-[#999]"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto">
            {!query.trim() ? (
              <div className="flex flex-col items-center text-center px-6 py-14">
                <Search size={28} strokeWidth={1.2} className={`${textSoft} mb-4`} />
                <p className={`text-[14px] font-medium ${textPrimary} mb-1`}>Discover Your Style</p>
                <p className={`text-[12.5px] ${textSoft}`}>Search for brands, clothing, or accessories</p>
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