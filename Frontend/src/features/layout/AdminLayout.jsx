import { NavLink, Outlet } from 'react-router'
import {
  Search, Bell,
  LayoutGrid, ShoppingBag, Store, Users, Landmark, Megaphone, Settings,
  Home, ClipboardList, Package, MoreHorizontal, LogOut, ShieldCheck,
} from 'lucide-react'
import { useNavigate } from 'react-router'
import { useSelector } from 'react-redux'
import { useAdmin } from '../admin/hook/useAdmin'
import { useState } from 'react'

const SIDEBAR_LINKS = [
  { label: 'Overview', path: '/admin', icon: LayoutGrid, end: true },
  { label: 'Sellers Registry', path: '/admin/sellers', icon: Users },
  { label: 'Commerce Orders', path: '/admin/commerce', icon: ShoppingBag },
  { label: 'Marketplace Catalog', path: '/admin/marketplace', icon: Store },
  { label: 'Escrow Finance', path: '/admin/finance', icon: Landmark },
  { label: 'Marketing Banners', path: '/admin/marketing', icon: Megaphone },
  { label: 'System Settings', path: '/admin/system', icon: Settings },
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
    <div className="min-h-screen bg-[#0e0e0e] text-[#e5e2e1] flex">
      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col lg:w-[220px] lg:shrink-0 bg-[#131313] border-r border-white/10 min-h-screen sticky top-0">
        <div className="px-6 pt-6 pb-4 border-b border-white/10 flex items-center justify-between">
          <div>
            <h1 className="font-display text-[18px] font-bold text-white tracking-wide">ZRIVE</h1>
            <p className="text-[9px] uppercase tracking-[0.14em] text-[#B08D57] font-bold">Admin Console</p>
          </div>
          <span className="w-2 h-2 rounded-full bg-[#287A4B] animate-pulse" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-1">
          {SIDEBAR_LINKS.map(({ label, path, icon: Icon, end }) => (
            <NavLink
              key={path}
              to={path}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-[6px] text-[12.5px] font-bold transition-all ${
                  isActive
                    ? 'bg-[#B08D57] text-[#0e0e0e] shadow-md'
                    : 'text-white/60 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <Icon size={16} strokeWidth={2} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-full bg-[#B08D57] text-[#0e0e0e] font-bold text-[10px] flex items-center justify-center">
                AD
              </div>
              <span className="text-[12px] font-semibold text-white truncate max-w-[100px]">Admin</span>
            </div>
            <button
              onClick={onLogout}
              title="Logout"
              className="text-white/50 hover:text-[#C43D3D] transition-colors"
            >
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Topbar */}
        <header className="sticky top-0 z-30 bg-[#131313]/90 backdrop-blur border-b border-white/10 px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <h1 className="font-display text-[18px] font-bold text-white lg:hidden">ZRIVE Admin</h1>
            <span className="hidden lg:inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-[0.08em] text-[#B08D57] bg-[#B08D57]/10 px-3 py-1 rounded-full border border-[#B08D57]/20">
              <ShieldCheck size={13} />
              Secured Console Session
            </span>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={onLogout}
              className="flex items-center gap-1.5 text-[11.5px] font-bold uppercase text-white/60 hover:text-[#C43D3D] transition-colors"
            >
              <LogOut size={14} />
              Sign Out
            </button>
          </div>
        </header>

        {/* Page Content Outlet */}
        <main className="flex-1 p-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}

export default AdminLayout