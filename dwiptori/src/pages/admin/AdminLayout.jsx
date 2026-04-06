import { useState } from 'react';
import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, CreditCard, Users, Phone,
  LogOut, Waves, Menu, X, ChevronRight, Home
} from 'lucide-react';

const LINKS = [
  { to: '/admin',          label: 'Overview',      icon: LayoutDashboard, end: true },
  { to: '/admin/payments', label: 'Payments',      icon: CreditCard },
  { to: '/admin/members',  label: 'Members',       icon: Users },
  { to: '/admin/numbers',  label: 'Pay Numbers',   icon: Phone },
];

export default function AdminLayout() {
  const { profile, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  const Sidebar = ({ mobile = false }) => (
    <aside className={`${mobile
      ? 'fixed inset-0 z-50 flex'
      : 'hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0'}`}>
      {mobile && (
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`relative flex flex-col bg-tide-950 text-white
        ${mobile ? 'w-72 ml-auto h-full shadow-2xl' : 'w-64 h-full'}`}>
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-white/10">
          <div className="w-9 h-9 rounded-xl bg-tide-500 flex items-center justify-center">
            <Waves className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="font-display font-bold text-lg">Dwiptori</div>
            <div className="text-tide-400 text-xs">Admin Panel</div>
          </div>
          {mobile && (
            <button onClick={() => setSidebarOpen(false)} className="ml-auto text-white/60 hover:text-white">
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Nav */}
        <nav className="flex-1 px-4 py-6 space-y-1">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink key={to} to={to} end={end}
              onClick={() => mobile && setSidebarOpen(false)}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all
                ${isActive
                  ? 'bg-tide-600 text-white shadow-glow'
                  : 'text-tide-300 hover:bg-white/10 hover:text-white'}`
              }>
              <Icon className="w-4 h-4" />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="px-4 pb-6 border-t border-white/10 pt-4 space-y-2">
          <NavLink to="/dashboard"
            className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-tide-300
                       hover:bg-white/10 hover:text-white transition-all">
            <Home className="w-4 h-4" /> Member View
          </NavLink>
          <div className="flex items-center gap-3 px-3 py-2 mt-2">
            <div className="w-8 h-8 rounded-full bg-tide-600 flex items-center justify-center
                            text-white text-sm font-bold">
              {profile?.name?.[0]?.toUpperCase()}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-medium text-white truncate">{profile?.name}</div>
              <div className="text-xs text-tide-400 truncate">{profile?.email}</div>
            </div>
            <button onClick={handleLogout} className="text-tide-400 hover:text-coral-400 transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-slate-100">
      <Sidebar />
      {sidebarOpen && <Sidebar mobile />}

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar (mobile) */}
        <div className="lg:hidden sticky top-0 z-40 flex items-center gap-3 bg-tide-950 px-4 py-3">
          <button onClick={() => setSidebarOpen(true)} className="text-white">
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <Waves className="w-4 h-4 text-tide-400" />
            <span className="font-display font-bold text-white">Admin Panel</span>
          </div>
        </div>

        <main className="p-6 lg:p-8 page-enter">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
