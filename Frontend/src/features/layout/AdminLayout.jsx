import { NavLink, Outlet } from 'react-router'
import {
  Search, Bell,
  LayoutGrid, ShoppingBag, Store, Users, Landmark, Megaphone, Settings,
  Home, ClipboardList, Package, MoreHorizontal,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { LogOut } from 'lucide-react'
import { useAdmin } from '../admin/hook/useAdmin'
import { useState } from 'react'

const SIDEBAR_LINKS = [
  { label: 'Overview', path: '/admin', icon: LayoutGrid, end: true },
  { label: 'Sellers', path: '/admin/sellers', icon: Users },
  { label: 'Commerce', path: '/admin/commerce', icon: ShoppingBag },
  { label: 'Marketplace', path: '/admin/marketplace', icon: Store },
  { label: 'Finance', path: '/admin/finance', icon: Landmark },
  { label: 'Marketing', path: '/admin/marketing', icon: Megaphone },
  { label: 'System', path: '/admin/system', icon: Settings },
]

const MOBILE_LINKS = [
  { label: 'Home', path: '/admin', icon: Home, end: true },
  { label: 'Orders', path: '/admin/commerce', icon: ClipboardList },
  { label: 'Sellers', path: '/admin/sellers', icon: Users },
  { label: 'Products', path: '/admin/marketplace', icon: Package },
  { label: 'More', path: '/admin/system', icon: MoreHorizontal },
]

const AdminLayout = () => {

  const [showMenu, setShowMenu] = useState(false)
  const { admin } = useSelector((state) => state.admin)
  const { handleAdminLogout } = useAdmin()
  const navigate = useNavigate()

  const onLogout = async () => {
    await handleAdminLogout()
    navigate('/admin/login')
  }



  return (
    <div className="min-h-screen bg-cream flex">
      {/* ---------- Desktop Sidebar ---------- */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[184px] lg:shrink-0 bg-charcoal min-h-screen sticky top-0">
        <div className="px-4 pt-5 pb-3.5">
          <h1 className="font-display text-[15px] font-semibold text-cream tracking-tight">ZRIVE</h1>
          <p className="text-[8.5px] uppercase tracking-[0.1em] text-cream/40 mt-0.5">Admin Panel</p>
        </div>

        <nav className="flex-1 px-2.5 space-y-0.5">
          {SIDEBAR_LINKS.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2 px-2.5 py-2 rounded-[3px] text-[11.5px] font-medium transition-colors ${isActive
                  ? 'bg-cream/10 text-cream'
                  : 'text-cream/55 hover:text-cream hover:bg-cream/5'
                }`
              }
            >
              <Icon size={14} strokeWidth={1.75} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="px-2.5 pb-3.5">
          <button
            type="button"
            className="w-full rounded-[3px] bg-cream/10 px-2.5 py-2 text-[10px] font-semibold tracking-[0.04em] text-cream hover:bg-cream/15 transition-colors"
          >
            + Add Product
          </button>
        </div>
      </aside>

      {/* ---------- Right column ---------- */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* ---------- Topbar ---------- */}
        <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur-sm border-b border-border">
          <div className="flex items-center justify-between gap-4 px-5 lg:px-6 py-4 lg:py-2.5">
            <h1 className="font-display text-[19px] font-semibold text-ink lg:hidden">ZRIVE</h1>

            <div className="hidden lg:flex items-center gap-2 flex-1 max-w-[300px] rounded-[3px] border border-border bg-surface px-2.5 py-1.5">
              <Search size={12} className="text-ink-soft shrink-0" />
              <input
                type="text"
                placeholder="Search orders, sellers, products... ⌘K"
                className="w-full bg-transparent outline-none text-[11.5px] text-ink placeholder:text-ink-soft"
              />
            </div>

            <div className="flex items-center gap-3 lg:gap-3">
              <button type="button" aria-label="Search" className="lg:hidden text-ink-soft hover:text-ink transition-colors">
                <Search size={19} />
              </button>
              <button type="button" aria-label="Notifications" className="text-ink-soft hover:text-ink transition-colors">
                <Bell size={17} className="lg:size-[15px]" />
              </button>
              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((p) => !p)}
                  className="w-8 h-8 lg:w-[26px] lg:h-[26px] rounded-full bg-cream-dark border border-border overflow-hidden shrink-0"
                />
                {showMenu && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                    <div className="absolute right-0 top-full mt-2 w-44 rounded-[3px] border border-border bg-surface shadow-lg z-50 py-1.5">
                      <p className="px-3.5 py-2 text-[11.5px] text-ink-soft truncate border-b border-border">
                        {admin?.email}
                      </p>
                      <button
                        type="button"
                        onClick={onLogout}
                        className="w-full flex items-center gap-2 px-3.5 py-2.5 text-[12px] text-ink hover:bg-cream-dark transition-colors"
                      >
                        <LogOut size={14} /> Logout
                      </button>
                    </div>
                  </>
                )}
              </div>
              <button
                type="button"
                className="hidden lg:block rounded-[3px] bg-charcoal px-3 py-1.5 text-[10px] font-semibold tracking-[0.05em] uppercase text-cream hover:bg-ink transition-colors"
              >
                Add Product
              </button>
            </div>
          </div>
        </header>

        {/* ---------- Page content ---------- */}
        <main className="flex-1 px-5 py-6 lg:px-6 lg:py-5 pb-24 lg:pb-5">
          <Outlet />
        </main>
      </div>

      {/* ---------- Mobile bottom nav ---------- */}
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-surface border-t border-border flex items-stretch">
        {MOBILE_LINKS.map(({ label, path, icon: Icon, end }) => (
          <NavLink
            key={path}
            to={path}
            end={end}
            className={({ isActive }) =>
              `flex-1 flex flex-col items-center justify-center gap-1 py-2.5 text-[10.5px] font-medium transition-colors ${isActive ? 'text-gold-deep' : 'text-ink-soft'
              }`
            }
          >
            <Icon size={19} strokeWidth={1.75} />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}

export default AdminLayout