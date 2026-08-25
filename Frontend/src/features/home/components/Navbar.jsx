import React, { useState, useRef, useEffect } from 'react'
import { NavLink, useNavigate, useLocation, Link } from 'react-router'
import { useSelector } from 'react-redux'
import {
  Search,
  Menu,
  Heart,
  Bell,
  ShoppingBag,
  ShoppingCart,
  User,
  Home as HomeIcon,
  Package,
  ChevronDown,
  X,
  ChevronRight,
  ArrowLeft,
  ArrowRight,
  LogIn,
  LogOut,
  Sparkles,
  Store,
  Compass,
  Flame,
  ArrowUpRight,
} from 'lucide-react'
import SellerNavIcon from '../../seller/components/SellerNavIcon'
import SearchResultsPanel from '../components/SearchResultsPanel'
import { useProduct } from '../../product/hook/useProduct'
import { useDebounce } from '../components/useDebounce'
import { CATEGORIES as MENS_CATEGORIES, CATEGORY_MENU } from '../../../constant/Categories'
import useNotification from '../../notification/hook/useNotification'
import { useAuth } from '../../auth/hook/useAuth'

const DESKTOP_LINKS = [
  { label: 'New Arrivals', to: '/new-arrivals', badge: 'NEW', badgeColor: 'bg-emerald-500 text-white' },
  { label: 'Trending', to: '/all-products', badge: 'HOT', badgeColor: 'bg-[#ff3f6c] text-white', icon: Flame },
  { label: 'Orders', to: '/orders' },
]

const MOBILE_NAV = [
  { key: 'home', icon: HomeIcon, label: 'Home', to: '/' },
  { key: 'cart', icon: ShoppingCart, label: 'Cart', to: '/cart' },
  { key: 'orders', icon: Package, label: 'Orders', to: '/orders' },
  { key: 'profile', icon: User, label: 'Profile', to: '/profile' },
]

const Navbar = () => {
  const navigate = useNavigate()
  const location = useLocation()
  const { handleLogout } = useAuth()

  const [notifOpen, setNotifOpen] = useState(false)
  const [catOpen, setCatOpen] = useState(false)
  const [mobileCatOpen, setMobileCatOpen] = useState(false)
  const [profileOpen, setProfileOpen] = useState(false)
  const [sellerModalOpen, setSellerModalOpen] = useState(false)

  const notifRef = useRef(null)
  const profileRef = useRef(null)
  const megaMenuRef = useRef(null)
  const closeTimer = useRef(null)

  const [query, setQuery] = useState('')
  const [searchOpen, setSearchOpen] = useState(false)
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false)
  const [isSearchFocused, setIsSearchFocused] = useState(false)
  const desktopSearchRef = useRef(null)

  const { handleSearchProducts, handleClearSearchResults } = useProduct()
  const {
    handleGetNotifications,
    handleMarkAsRead,
    handleDeleteNotification,
    handleDeleteAllNotifications,
  } = useNotification()

  const searchResults = useSelector((state) => state.product?.searchResults ?? [])
  const searchLoading = useSelector((state) => state.product?.loading?.search ?? false)
  const debouncedQuery = useDebounce(query, 350)

  const user = useSelector((state) => state.auth?.user)
  const cartItems = useSelector((state) => state.cart?.items ?? [])
  const wishlistItems = useSelector((state) => state.wishlist?.items ?? state.wishlist?.variantSkus ?? [])
  const notifications = useSelector((state) => state.inAppNotification?.items ?? [])
  const unreadCount = useSelector((state) => state.inAppNotification?.unreadCount ?? 0)

  const cartCount = cartItems.reduce((sum, item) => sum + (item.quantity || 1), 0)
  const wishlistCount = Array.isArray(wishlistItems) ? wishlistItems.length : 0

  // Fetch notifications for authenticated user
  useEffect(() => {
    if (user) handleGetNotifications()
  }, [user])

  useEffect(() => {
    if (!user || !notifOpen) return undefined
    handleGetNotifications()
    const refreshTimer = window.setInterval(handleGetNotifications, 15000)
    return () => window.clearInterval(refreshTimer)
  }, [user, notifOpen])

  // Search trigger on debounce
  useEffect(() => {
    const trimmed = debouncedQuery.trim()
    if (!trimmed) {
      handleClearSearchResults()
      return
    }
    handleSearchProducts(trimmed)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedQuery])

  // Handle outside clicks
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (desktopSearchRef.current && !desktopSearchRef.current.contains(e.target)) {
        setSearchOpen(false)
        setIsSearchFocused(false)
      }
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(e.target)) {
        setProfileOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  // Lock scroll on mobile drawer/search/modal
  useEffect(() => {
    if (mobileSearchOpen || mobileCatOpen || sellerModalOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [mobileSearchOpen, mobileCatOpen, sellerModalOpen])

  // Reset overlays on route change
  useEffect(() => {
    setCatOpen(false)
    setSearchOpen(false)
    setMobileSearchOpen(false)
    setMobileCatOpen(false)
    setProfileOpen(false)
    setNotifOpen(false)
  }, [location.pathname])

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

  const goToCategory = (slug) => {
    setCatOpen(false)
    setMobileCatOpen(false)
    navigate(`/all-products?category=${slug}`)
  }

  const openMegaMenu = () => {
    clearTimeout(closeTimer.current)
    setCatOpen(true)
  }

  const scheduleMegaMenuClose = () => {
    closeTimer.current = setTimeout(() => setCatOpen(false), 150)
  }

  const closeImmediately = () => {
    clearTimeout(closeTimer.current)
    setCatOpen(false)
  }

  const handleSellerClick = () => {
    if (!user) {
      setSellerModalOpen(true)
    } else if (user.role === 'seller') {
      navigate('/seller')
    } else {
      navigate('/become-seller')
    }
  }

  // User initials for avatar
  const userInitials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2) || 'U'

  return (
    <>
      {/* ─── 1. ORIGINAL ANNOUNCEMENT BAR ────────────────────────────────── */}
      <div className="hidden md:flex items-center justify-center gap-6 px-4 py-2 text-[11px] font-medium tracking-[0.08em] uppercase bg-[#111111] text-[#D4B982]">
        <span>⚡ FLAT 20% OFF YOUR FIRST ORDER — USE: ZRIVE20</span>
        <span className="text-[#555]">|</span>
        <span>FREE SHIPPING ABOVE ₹999</span>
        <span className="text-[#555]">|</span>
        <span>7-DAY EASY RETURNS</span>
      </div>

      {/* ─── 2. MAIN HEADER (Expansive Search & Sleek Proportions) ──────── */}
      <header
        className="sticky top-0 z-30 w-full bg-white/95 backdrop-blur-md border-b border-[#EAEAEA] shadow-[0_2px_10px_rgba(0,0,0,0.03)]"
        onMouseLeave={scheduleMegaMenuClose}
      >
        <div className="w-full max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 h-[62px] flex items-center justify-between gap-4 lg:gap-8">
          {/* Left: Mobile Menu Toggle & Brand Logo & Navigation */}
          <div className="flex items-center gap-3 sm:gap-6 flex-shrink-0">
            <button
              type="button"
              aria-label="Open mobile menu"
              onClick={() => setMobileCatOpen(true)}
              className="md:hidden p-1.5 -ml-1.5 text-[#222] hover:text-black rounded-md hover:bg-gray-100 transition-colors"
            >
              <Menu size={21} />
            </button>

            {/* Brand Logo: Clean ZRIVE without Studio */}
            <NavLink
              to="/"
              className="inline-flex items-center select-none focus:outline-none group pr-1"
              onClick={closeImmediately}
            >
              <span className="font-display text-[21px] sm:text-[23px] font-black tracking-[0.09em] text-[#111111] leading-none group-hover:text-[#B08D57] transition-colors">
                ZRIVE
              </span>
            </NavLink>

            {/* Desktop Navigation Links */}
            <nav className="hidden md:flex items-center gap-1">
              <NavLink
                to="/"
                end
                onMouseEnter={closeImmediately}
                className={({ isActive }) =>
                  `px-3 py-1.5 text-[12.5px] font-semibold tracking-tight rounded-md transition-all ${
                    isActive
                      ? 'text-[#111] bg-gray-100/90'
                      : 'text-[#555] hover:text-[#111] hover:bg-gray-50'
                  }`
                }
              >
                Home
              </NavLink>

              {/* Categories Mega Menu Trigger */}
              <button
                type="button"
                onMouseEnter={openMegaMenu}
                onClick={() => setCatOpen((prev) => !prev)}
                className={`flex items-center gap-1 px-3 py-1.5 text-[12.5px] font-semibold tracking-tight rounded-md transition-all outline-none ${
                  catOpen
                    ? 'text-[#111] bg-gray-100/90'
                    : 'text-[#555] hover:text-[#111] hover:bg-gray-50'
                }`}
              >
                Categories
                <ChevronDown
                  size={13}
                  className={`transition-transform duration-200 text-[#888] ${catOpen ? 'rotate-180 text-[#111]' : ''}`}
                />
              </button>

              {DESKTOP_LINKS.map(({ label, to, badge, badgeColor, icon: Icon }) => (
                <NavLink
                  key={label}
                  to={to}
                  onMouseEnter={closeImmediately}
                  className={({ isActive }) =>
                    `relative flex items-center gap-1.5 px-3 py-1.5 text-[12.5px] font-semibold tracking-tight rounded-md transition-all ${
                      isActive
                        ? 'text-[#111] bg-gray-100/90'
                        : 'text-[#555] hover:text-[#111] hover:bg-gray-50'
                    }`
                  }
                >
                  {Icon && <Icon size={13} className="text-[#ff3f6c]" />}
                  {label}
                  {badge && (
                    <span
                      className={`text-[8.5px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider ${badgeColor}`}
                    >
                      {badge}
                    </span>
                  )}
                </NavLink>
              ))}
            </nav>
          </div>

          {/* Center: Wide SaaS Search Bar (Expansive width) */}
          <div className="flex-1 max-w-2xl mx-3 lg:mx-6 hidden sm:block" ref={desktopSearchRef}>
            <div className="relative w-full">
              <Search
                size={15}
                strokeWidth={2}
                className={`absolute left-3.5 top-1/2 -translate-y-1/2 transition-colors ${
                  isSearchFocused ? 'text-[#111]' : 'text-[#888]'
                }`}
              />
              <input
                type="text"
                value={query}
                onFocus={() => {
                  setIsSearchFocused(true)
                  if (query.trim()) setSearchOpen(true)
                }}
                onChange={(e) => {
                  setQuery(e.target.value)
                  setSearchOpen(true)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && query.trim()) {
                    setSearchOpen(false)
                    navigate(`/all-products?search=${encodeURIComponent(query.trim())}`)
                  }
                }}
                placeholder="Search for products, brands, trends and styles..."
                className="w-full bg-[#F4F4F5] hover:bg-[#EFEFEF] focus:bg-white text-[#111] placeholder:text-[#8E8E93] text-[12.5px] rounded-lg pl-9 pr-8 py-2 outline-none border border-transparent focus:border-[#111111] focus:ring-1 focus:ring-[#111111]/10 transition-all shadow-inner"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('')
                    handleClearSearchResults()
                  }}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888] hover:text-[#111] p-0.5 rounded-full hover:bg-gray-200 transition-colors"
                >
                  <X size={13} />
                </button>
              )}

              {/* Search Results Dropdown Panel */}
              {searchOpen && query.trim() && (
                <div className="absolute left-0 right-0 top-full mt-2 bg-white border border-[#EAEAEA] shadow-2xl rounded-xl max-h-[75vh] overflow-y-auto z-50 animate-fade-in-down divide-y divide-gray-100">
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

          {/* Right: Actions & User Menu */}
          <div className="flex items-center gap-1 sm:gap-1.5 flex-shrink-0">
            {/* Mobile Search Trigger */}
            <button
              type="button"
              aria-label="Open mobile search"
              onClick={() => setMobileSearchOpen(true)}
              className="sm:hidden p-2 text-[#444] hover:text-[#111] hover:bg-gray-100 rounded-lg transition-colors"
            >
              <Search size={19} />
            </button>

            {/* Become a Seller Icon Button (Desktop only on top navbar) */}
            <div className="hidden md:block">
              <SellerNavIcon onRequireAuth={() => setSellerModalOpen(true)} />
            </div>

            {/* Wishlist Icon with Tooltip */}
            <div className="relative group flex items-center">
              <NavLink
                to="/wishlist"
                aria-label="Wishlist"
                className="relative p-2 text-[#555] hover:text-[#111] hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              >
                <Heart size={18} strokeWidth={1.8} className="group-hover:scale-105 transition-transform" />
                {wishlistCount > 0 && (
                  <span className="absolute 0.5 top-1 right-1 min-w-[15px] h-[15px] rounded-full bg-[#ff3f6c] text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                    {wishlistCount > 99 ? '99+' : wishlistCount}
                  </span>
                )}
              </NavLink>

              <div className="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-md bg-[#111111] text-white text-[10.5px] font-medium px-2 py-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50 shadow-lg border border-white/10">
                Wishlist
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#111111]" />
              </div>
            </div>

            {/* Notifications Dropdown with Tooltip */}
            <div className="relative group" ref={notifRef}>
              <button
                type="button"
                aria-label="Notifications"
                onClick={() => setNotifOpen((o) => !o)}
                className="relative p-2 text-[#555] hover:text-[#111] hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              >
                <Bell size={18} strokeWidth={1.8} className="group-hover:scale-105 transition-transform" />
                {unreadCount > 0 && (
                  <span className="absolute 0.5 top-1 right-1 min-w-[15px] h-[15px] rounded-full bg-[#B08D57] text-[#111] text-[9px] font-extrabold flex items-center justify-center px-0.5 shadow-sm ring-2 ring-white">
                    {unreadCount > 9 ? '9+' : unreadCount}
                  </span>
                )}
              </button>

              {!notifOpen && (
                <div className="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-md bg-[#111111] text-white text-[10.5px] font-medium px-2 py-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50 shadow-lg border border-white/10">
                  Notifications
                  <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#111111]" />
                </div>
              )}

              {notifOpen && (
                <div className="absolute right-0 top-full mt-2 w-80 sm:w-88 bg-white border border-[#EAEAEA] shadow-2xl rounded-xl overflow-hidden z-50 animate-fade-in-down">
                  <div className="flex items-center justify-between px-4 py-3 bg-[#FBFBFA] border-b border-[#EAEAEA]">
                    <div className="flex items-center gap-2">
                      <span className="text-[12px] font-bold text-[#111] tracking-tight">Notifications</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-semibold bg-[#B08D57]/20 text-[#8C6B3E] px-1.5 py-0.5 rounded-full">
                          {unreadCount} new
                        </span>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <button
                        type="button"
                        onClick={() => handleDeleteAllNotifications()}
                        className="text-[11px] font-medium text-[#777] hover:text-[#c43d3d] transition-colors"
                      >
                        Clear all
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-[#F0F0F0]">
                    {notifications.length === 0 ? (
                      <div className="py-8 text-center px-4">
                        <Bell size={24} className="mx-auto text-[#BBB] mb-2 stroke-[1.2]" />
                        <p className="text-[12px] font-medium text-[#444]">No notifications yet</p>
                        <p className="text-[11px] text-[#888] mt-0.5">We'll alert you about orders & sales here</p>
                      </div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n._id}
                          className={`flex items-start gap-3 px-4 py-3 hover:bg-[#F9F9F8] transition-colors ${
                            !n.isRead ? 'bg-[#FCF9F3]/60' : ''
                          }`}
                        >
                          {!n.isRead && (
                            <span className="w-1.5 h-1.5 rounded-full bg-[#B08D57] mt-1.5 flex-shrink-0" />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              handleMarkAsRead(n._id)
                              setNotifOpen(false)
                              navigate(n.url || '/orders')
                            }}
                            className={`min-w-0 flex-1 text-left ${n.isRead ? 'pl-3' : ''}`}
                          >
                            <p className="text-[12px] font-semibold text-[#111] leading-snug">{n.title}</p>
                            <p className="text-[11px] text-[#666] mt-0.5 line-clamp-2">{n.message}</p>
                          </button>
                          <button
                            type="button"
                            aria-label="Delete notification"
                            onClick={() => handleDeleteNotification(n._id)}
                            className="text-[#999] hover:text-[#c43d3d] p-1 rounded transition-colors flex-shrink-0"
                          >
                            <X size={13} />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Cart Button with Tooltip (Desktop only on top navbar) */}
            <div className="hidden md:flex relative group items-center">
              <NavLink
                to="/cart"
                aria-label="Shopping Cart"
                className="relative p-2 text-[#555] hover:text-[#111] hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center"
              >
                <ShoppingBag size={18} strokeWidth={1.8} className="group-hover:scale-105 transition-transform" />
                {cartCount > 0 && (
                  <span className="absolute 0.5 top-1 right-1 min-w-[15px] h-[15px] rounded-full bg-[#111] text-white text-[9px] font-bold flex items-center justify-center px-0.5 shadow-sm">
                    {cartCount > 99 ? '99+' : cartCount}
                  </span>
                )}
              </NavLink>

              <div className="hidden md:block pointer-events-none absolute left-1/2 -translate-x-1/2 top-full mt-1.5 whitespace-nowrap rounded-md bg-[#111111] text-white text-[10.5px] font-medium px-2 py-1 opacity-0 translate-y-1 group-hover:opacity-100 group-hover:translate-y-0 transition-all duration-150 z-50 shadow-lg border border-white/10">
                Bag
                <div className="absolute -top-1 left-1/2 -translate-x-1/2 border-4 border-transparent border-b-[#111111]" />
              </div>
            </div>

            {/* ─── AUTH / PROFILE ACTION (Premium Login or Profile Menu) ─── */}
            {user ? (
              <div className="relative ml-1" ref={profileRef}>
                <button
                  type="button"
                  onClick={() => setProfileOpen((o) => !o)}
                  className="flex items-center gap-2 p-1 pl-1.5 pr-2.5 rounded-full hover:bg-gray-100 border border-transparent hover:border-gray-200 transition-all"
                >
                  <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#111111] to-[#333333] text-white text-[11px] font-bold flex items-center justify-center ring-2 ring-white shadow-sm">
                    {userInitials}
                  </div>
                  <span className="hidden lg:inline-block text-[12px] font-medium text-[#222] max-w-[80px] truncate">
                    {user.fullName?.split(' ')[0] || user.name?.split(' ')[0] || 'Account'}
                  </span>
                  <ChevronDown size={12} className="text-[#888] hidden lg:block" />
                </button>

                {profileOpen && (
                  <div className="absolute right-0 top-full mt-2 w-60 bg-white border border-[#EAEAEA] shadow-2xl rounded-xl overflow-hidden z-50 animate-fade-in-down divide-y divide-gray-100">
                    <div className="px-4 py-3 bg-[#FBFBFA]">
                      <div className="flex items-center justify-between">
                        <p className="text-[13px] font-bold text-[#111] truncate">
                          {user.fullName || user.name || 'User'}
                        </p>
                        <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded bg-gray-200 text-[#444]">
                          {user.role === 'seller' ? 'Seller' : 'Customer'}
                        </span>
                      </div>
                      <p className="text-[11.5px] text-[#777] truncate mt-0.5">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/profile"
                        className="flex items-center gap-2.5 px-4 py-2 text-[12.5px] font-medium text-[#444] hover:text-[#111] hover:bg-gray-50 transition-colors"
                      >
                        <User size={14} className="text-[#777]" />
                        My Profile
                      </Link>
                      <Link
                        to="/orders"
                        className="flex items-center gap-2.5 px-4 py-2 text-[12.5px] font-medium text-[#444] hover:text-[#111] hover:bg-gray-50 transition-colors"
                      >
                        <Package size={14} className="text-[#777]" />
                        My Orders
                      </Link>
                      <Link
                        to="/wishlist"
                        className="flex items-center gap-2.5 px-4 py-2 text-[12.5px] font-medium text-[#444] hover:text-[#111] hover:bg-gray-50 transition-colors"
                      >
                        <Heart size={14} className="text-[#777]" />
                        Wishlist ({wishlistCount})
                      </Link>
                      <Link
                        to={user.role === 'seller' ? '/seller' : '/become-seller'}
                        className="flex items-center justify-between px-4 py-2 text-[12.5px] font-medium text-[#B08D57] hover:bg-[#F5EFE5]/50 transition-colors"
                      >
                        <span className="flex items-center gap-2.5">
                          <Store size={14} />
                          {user.role === 'seller' ? 'Seller Dashboard' : 'Become a Seller'}
                        </span>
                        <ArrowUpRight size={13} />
                      </Link>
                    </div>

                    <div className="py-1">
                      <button
                        type="button"
                        onClick={async () => {
                          setProfileOpen(false)
                          if (handleLogout) await handleLogout()
                          navigate('/')
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2 text-[12.5px] font-medium text-[#C43D3D] hover:bg-red-50 transition-colors"
                      >
                        <LogOut size={14} />
                        Sign Out
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              /* EYE-CATCHING LUXURY LOGIN BUTTON */
              <div className="flex items-center ml-1">
                <Link
                  to="/login"
                  className="relative inline-flex items-center justify-center gap-2 px-4 py-1.5 rounded-full text-[12px] font-bold tracking-wide transition-all duration-300 bg-[#111111] hover:bg-black text-white hover:shadow-[0_4px_16px_rgba(0,0,0,0.18)] hover:scale-[1.02] active:scale-[0.98] border border-black/10 group shadow-sm"
                >
                  <div className="w-4 h-4 rounded-full bg-white/15 group-hover:bg-[#B08D57] flex items-center justify-center transition-colors">
                    <User size={10} strokeWidth={2.5} className="text-white group-hover:text-[#111] transition-colors" />
                  </div>
                  <span className="font-semibold text-[12px]">Login</span>
                </Link>
              </div>
            )}
          </div>
        </div>

        {/* ─── 3. MEGA MENU DROPDOWN (Myntra / E-commerce Grid) ──────── */}
        {catOpen && (
          <div
            ref={megaMenuRef}
            onMouseEnter={openMegaMenu}
            onMouseLeave={scheduleMegaMenuClose}
            className="absolute left-0 right-0 top-full w-full bg-white border-b border-[#EAEAEA] shadow-2xl z-40 animate-fade-in-down"
          >
            <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-7">
              <div className="grid grid-cols-5 gap-8">
                {CATEGORY_MENU.map((group) => (
                  <div key={group.title} className="space-y-3">
                    <button
                      type="button"
                      onClick={() => goToCategory(group.groupSlug)}
                      className="text-[12px] font-extrabold uppercase tracking-wider text-[#111111] hover:text-[#B08D57] transition-colors flex items-center gap-1.5"
                    >
                      {group.title}
                    </button>
                    <ul className="space-y-1.5 border-l border-gray-100 pl-3">
                      {group.items.map((item) => (
                        <li key={item.slug}>
                          <button
                            type="button"
                            onClick={() => goToCategory(item.slug)}
                            className="text-[12.5px] text-[#666] hover:text-[#111] hover:translate-x-0.5 transition-all text-left block w-full py-0.5 font-normal"
                          >
                            {item.label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>

              {/* Bottom Mega Menu Bar with quick curated collections */}
              <div className="mt-6 pt-4 border-t border-gray-100 flex items-center justify-between text-[11.5px] text-[#666]">
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-[#111]">Popular:</span>
                  {['T-Shirts', 'Casual Shirts', 'Denim Jackets', 'Sneakers', 'Sunglasses'].map((tag) => (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => {
                        setCatOpen(false)
                        navigate(`/all-products?search=${encodeURIComponent(tag)}`)
                      }}
                      className="hover:text-[#B08D57] transition-colors"
                    >
                      {tag}
                    </button>
                  ))}
                </div>

                <Link
                  to="/all-products"
                  onClick={closeImmediately}
                  className="font-semibold text-[#B08D57] hover:underline flex items-center gap-1"
                >
                  Explore Full Catalog
                  <ChevronRight size={12} />
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ─── 4. MOBILE DRAWER (Slide-over Categories & Links) ─────────── */}
      {mobileCatOpen && (
        <div className="md:hidden fixed inset-0 z-50">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-fade-in"
            onClick={() => setMobileCatOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-[85vw] max-w-[340px] bg-white flex flex-col shadow-2xl animate-fade-in-left">
            {/* Drawer Header */}
            <div className="bg-[#111111] text-white p-5 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#222] border border-white/10 text-white flex items-center justify-center font-bold text-sm">
                  {user ? userInitials : <User size={18} />}
                </div>
                <div>
                  <p className="font-bold text-[14px] leading-tight">
                    {user ? user.fullName || user.name : 'Welcome to Zrive'}
                  </p>
                  <p className="text-[11px] text-[#D4B982] mt-0.5">
                    {user ? user.email : 'Shop luxury styles effortlessly'}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setMobileCatOpen(false)}
                className="text-white/70 hover:text-white p-1"
              >
                <X size={20} />
              </button>
            </div>

            {/* If not logged in, Login / Register Banner */}
            {!user && (
              <div className="p-4 bg-[#F8F6F2] border-b border-[#EAEAEA] flex items-center justify-between">
                <div>
                  <p className="text-[12px] font-bold text-[#111]">Login or Sign Up</p>
                  <p className="text-[10.5px] text-[#777]">Unlock wishlist, orders & offers</p>
                </div>
                <Link
                  to="/login"
                  onClick={() => setMobileCatOpen(false)}
                  className="px-3.5 py-1.5 rounded-lg bg-[#111] text-white text-[11.5px] font-semibold tracking-wide"
                >
                  Login
                </Link>
              </div>
            )}

            {/* Category Navigation */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-5">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#111]">
                    Top Categories
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileCatOpen(false)
                      navigate('/all-products')
                    }}
                    className="text-[11px] font-semibold text-[#B08D57]"
                  >
                    View All
                  </button>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  {MENS_CATEGORIES.slice(0, 6).map((c) => (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => goToCategory(c.id)}
                      className="group flex flex-col items-center text-center p-1.5 rounded-lg hover:bg-gray-50 border border-gray-100"
                    >
                      <div className="w-14 h-14 rounded-md overflow-hidden bg-gray-100 mb-1.5">
                        <img src={c.image} alt={c.label} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                      </div>
                      <span className="text-[10px] font-semibold text-[#333] truncate w-full">{c.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quick Links List */}
              <div className="border-t border-gray-100 pt-3 space-y-1">
                <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#999] block mb-2 px-2">
                  Explore
                </span>
                <Link
                  to="/new-arrivals"
                  onClick={() => setMobileCatOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#333] rounded-lg hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles size={15} className="text-emerald-600" />
                    New Arrivals
                  </span>
                  <span className="text-[9px] font-bold uppercase bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded">NEW</span>
                </Link>
                <Link
                  to="/all-products"
                  onClick={() => setMobileCatOpen(false)}
                  className="flex items-center justify-between px-3 py-2 text-[13px] font-medium text-[#333] rounded-lg hover:bg-gray-50"
                >
                  <span className="flex items-center gap-2">
                    <Flame size={15} className="text-[#ff3f6c]" />
                    Trending Styles
                  </span>
                  <span className="text-[9px] font-bold uppercase bg-rose-100 text-[#ff3f6c] px-1.5 py-0.5 rounded">HOT</span>
                </Link>
                <button
                  type="button"
                  onClick={() => {
                    setMobileCatOpen(false)
                    handleSellerClick()
                  }}
                  className="w-full flex items-center justify-between px-3 py-2 text-[13px] font-semibold text-[#B08D57] rounded-lg hover:bg-[#F5EFE5]/50 text-left"
                >
                  <span className="flex items-center gap-2">
                    <Store size={15} />
                    Become a Seller
                  </span>
                  <ArrowUpRight size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ─── 5. MOBILE FULL-SCREEN SEARCH OVERLAY ─────────────────────── */}
      {mobileSearchOpen && (
        <div className="md:hidden fixed inset-0 z-50 bg-white flex flex-col animate-fade-in">
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#EAEAEA]">
            <button
              type="button"
              onClick={closeMobileSearch}
              className="p-1.5 text-[#555] hover:text-[#111]"
            >
              <ArrowLeft size={20} />
            </button>
            <div className="flex-1 relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#888]" />
              <input
                autoFocus
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search products, styles, brands..."
                className="w-full bg-[#F4F4F5] text-[#111] placeholder:text-[#888] text-[14px] rounded-lg pl-9 pr-8 py-2.5 outline-none border border-transparent focus:border-[#111]"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => setQuery('')}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#888] p-1"
                >
                  <X size={14} />
                </button>
              )}
            </div>
          </div>

          <div className="flex-1 overflow-y-auto">
            {!query.trim() ? (
              <div className="px-5 py-8 text-center">
                <Search size={32} className="mx-auto text-gray-300 mb-3" strokeWidth={1.3} />
                <p className="text-[14px] font-bold text-[#111]">Search the Zrive Catalog</p>
                <p className="text-[12px] text-[#777] mt-1 max-w-xs mx-auto">
                  Find T-Shirts, Shirts, Jeans, Jackets, Perfumes and more.
                </p>
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

      {/* ─── 6. MOBILE BOTTOM NAVIGATION (4 Icons: Home, Cart, Orders, Profile) ─── */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 z-30 bg-white/95 backdrop-blur-md border-t border-[#EAEAEA] shadow-[0_-2px_10px_rgba(0,0,0,0.04)]">
        <div className="flex items-center justify-around py-2 px-1">
          {MOBILE_NAV.map(({ key, icon: Icon, label, to }) => (
            <NavLink
              key={key}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex flex-col items-center gap-1 py-1 px-3 transition-colors ${
                  isActive ? 'text-[#111] font-semibold' : 'text-[#888] hover:text-[#111]'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="relative flex items-center justify-center">
                    <Icon size={18} strokeWidth={isActive ? 2.2 : 1.6} />
                    {key === 'cart' && cartCount > 0 && (
                      <span className="absolute -top-1 -right-2 min-w-[14px] h-[14px] rounded-full bg-[#111] text-white text-[8.5px] font-bold flex items-center justify-center px-0.5">
                        {cartCount > 9 ? '9+' : cartCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] leading-none tracking-tight">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </div>
      </nav>

      {/* ─── 7. "FIRST LOGIN TO BECOME SELLER" MODAL POPUP ───────────── */}
      {sellerModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-sm transition-opacity"
            onClick={() => setSellerModalOpen(false)}
          />

          <div className="relative w-full max-w-sm bg-white rounded-2xl p-6 shadow-2xl border border-[#EAEAEA] z-10 animate-fade-in-up text-center">
            <button
              type="button"
              onClick={() => setSellerModalOpen(false)}
              className="absolute top-4 right-4 text-[#888] hover:text-[#111] p-1 rounded-full hover:bg-gray-100 transition-colors"
            >
              <X size={18} />
            </button>

            <div className="w-14 h-14 rounded-2xl bg-[#F5EFE5] text-[#B08D57] flex items-center justify-center mx-auto mb-4 shadow-inner">
              <Store size={28} strokeWidth={2} />
            </div>

            <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#F5F5F5] text-[#555] text-[10.5px] font-semibold tracking-wider uppercase mb-2">
              <Sparkles size={11} className="text-[#B08D57]" /> Seller Portal
            </div>

            <h3 className="text-[18px] font-bold text-[#111111] tracking-tight">
              First Login to become a Seller
            </h3>
            <p className="text-[12.5px] text-[#666666] mt-2 mb-6 leading-relaxed">
              Please sign in to your Zrive account to register your store, manage products, and start selling.
            </p>

            <div className="space-y-2.5">
              <button
                type="button"
                onClick={() => {
                  setSellerModalOpen(false)
                  navigate('/login')
                }}
                className="w-full py-2.5 px-4 rounded-xl bg-[#111111] hover:bg-black text-white text-[13px] font-semibold flex items-center justify-center gap-2 shadow-md hover:shadow-lg transition-all active:scale-[0.98]"
              >
                <LogIn size={15} />
                Login to Continue
              </button>

              <button
                type="button"
                onClick={() => {
                  setSellerModalOpen(false)
                  navigate('/register')
                }}
                className="w-full py-2.5 px-4 rounded-xl border border-[#E5E5E5] bg-white hover:bg-[#F9F9F9] text-[#111111] text-[12.5px] font-semibold flex items-center justify-center gap-2 transition-all"
              >
                Create an Account
                <ArrowRight size={14} className="text-[#666]" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

export default Navbar