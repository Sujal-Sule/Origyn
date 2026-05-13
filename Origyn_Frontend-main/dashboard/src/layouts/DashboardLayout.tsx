import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  LayoutDashboard, Package, AlertTriangle, BarChart3, Users, Activity,
  Hexagon, Settings, Coins, ShieldAlert, Bell, ChevronLeft, ChevronRight,
  Search, LogOut, Menu, Globe
} from 'lucide-react';
import clsx from 'clsx';
import { useAuthStore } from '../lib/authStore';

const navItems = [
  { icon: LayoutDashboard, label: 'Overview', path: '/dashboard' },
  { icon: Globe, label: 'Live Map', path: '/dashboard/map' },
  { icon: Package, label: 'Products', path: '/dashboard/products' },
  { icon: AlertTriangle, label: 'Alerts', path: '/dashboard/alerts' },
  { icon: ShieldAlert, label: 'Recall', path: '/dashboard/recall' },
  { icon: BarChart3, label: 'Analytics', path: '/dashboard/analytics' },
  { icon: Users, label: 'Users', path: '/dashboard/users' },
  { icon: Hexagon, label: 'Blockchain', path: '/dashboard/blockchain' },
  { icon: Coins, label: 'Tokens', path: '/dashboard/tokens' },
  { icon: Activity, label: 'IoT Monitor', path: '/dashboard/iot' },
  { icon: Settings, label: 'Settings', path: '/dashboard/settings' },
];

export default function DashboardLayout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    navigate('/auth/login');
  };

  return (
    <div className="flex h-screen bg-navy-950 text-white overflow-hidden">
      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 z-40 lg:hidden"
            onClick={() => setMobileOpen(false)}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <aside
        className={clsx(
          'fixed lg:relative z-50 h-full border-r border-white/[0.06] bg-navy-800/70 backdrop-blur-2xl flex flex-col transition-all duration-300',
          collapsed ? 'w-[72px]' : 'w-64',
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        )}
      >
        {/* Logo */}
        <div className={clsx('h-16 flex items-center border-b border-white/[0.06] px-4', collapsed ? 'justify-center' : 'justify-between')}>
          {!collapsed && (
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.3)]">
                <span className="text-navy-950 font-black text-sm">O</span>
              </div>
              <span className="text-lg font-bold tracking-tight">ORIGYN</span>
            </Link>
          )}
          {collapsed && (
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-green to-accent-blue flex items-center justify-center shadow-[0_0_15px_rgba(0,255,136,0.3)]">
              <span className="text-navy-950 font-black text-sm">O</span>
            </div>
          )}
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="hidden lg:flex items-center justify-center w-6 h-6 rounded-md bg-navy-600 hover:bg-navy-700 text-gray-400 hover:text-white transition-colors"
          >
            {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = item.path === '/dashboard'
              ? location.pathname === '/dashboard'
              : location.pathname.startsWith(item.path);
            const Icon = item.icon;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileOpen(false)}
                className={clsx(
                  'flex items-center gap-3 rounded-xl transition-all duration-200 relative group',
                  collapsed ? 'px-3 py-3 justify-center' : 'px-3 py-2.5',
                  isActive
                    ? 'bg-accent-green/[0.08] text-accent-green border border-accent-green/20'
                    : 'text-gray-500 hover:bg-white/[0.04] hover:text-gray-300 border border-transparent'
                )}
              >
                <Icon size={18} className={isActive ? 'drop-shadow-[0_0_6px_rgba(0,255,136,0.6)]' : ''} />
                {!collapsed && <span className="text-sm font-medium">{item.label}</span>}
                {collapsed && (
                  <div className="absolute left-full ml-2 px-2 py-1 bg-navy-700 text-white text-xs rounded-md opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity whitespace-nowrap z-50">
                    {item.label}
                  </div>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User */}
        {!collapsed && (
          <div className="p-3 border-t border-white/[0.06]">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-navy-600/30">
              <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-green to-accent-blue flex-shrink-0 flex items-center justify-center text-xs font-bold text-navy-950">
                {user?.name?.charAt(0) || 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold truncate">{user?.name || 'Admin'}</p>
                <p className="text-[10px] text-gray-500 truncate capitalize">{user?.role || 'admin'}</p>
              </div>
              <button onClick={handleLogout} title="Logout">
                <LogOut size={14} className="text-gray-500 hover:text-accent-red cursor-pointer ml-auto flex-shrink-0 transition-colors" />
              </button>
            </div>
          </div>
        )}
      </aside>

      {/* Main */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top bar */}
        <header className="h-14 border-b border-white/[0.06] bg-navy-800/30 backdrop-blur-xl flex items-center justify-between px-4 lg:px-6 flex-shrink-0 z-10">
          <div className="flex items-center gap-3">
            <button onClick={() => setMobileOpen(true)} className="lg:hidden text-gray-400 hover:text-white">
              <Menu size={20} />
            </button>
            <div className="relative hidden sm:block">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={15} />
              <input
                type="text"
                placeholder="Search products, tx hash, batch..."
                className="bg-navy-800/60 border border-white/[0.06] rounded-lg pl-9 pr-4 py-1.5 text-sm w-72 lg:w-96 focus:outline-none focus:border-accent-green/40 transition-colors placeholder:text-gray-600"
              />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-accent-green/[0.06] border border-accent-green/10">
              <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
              <span className="text-[11px] font-medium text-accent-green">Live</span>
            </div>
            <button className="relative p-2 text-gray-500 hover:text-white rounded-lg hover:bg-white/[0.04] transition-colors">
              <Bell size={18} />
            </button>
            <div
              onClick={handleLogout}
              className="w-8 h-8 rounded-full bg-gradient-to-tr from-accent-green to-accent-blue border-2 border-navy-800 cursor-pointer flex items-center justify-center text-xs font-bold text-navy-950"
            >
              {user?.name?.charAt(0) || 'A'}
            </div>
          </div>
        </header>

        {/* Page */}
        <div className="flex-1 overflow-auto p-4 lg:p-6">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
