import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import {
  LayoutDashboard, CreditCard, FileText, User,
  LogOut, Menu, X, Shield, ChevronRight
} from 'lucide-react';

function DwiptoriLogo() {
  return (
    <div className="flex items-center gap-3">
      <img src="/dwiptori_logo.jpg" alt="Dwiptori Logo" className="w-10 h-10 rounded-full object-cover" />
      <div>
        <div className="font-display font-bold text-lg leading-tight text-tide-800">Dwiptori</div>
        <div className="text-xs text-tide-500 font-bengali leading-tight">দ্বীপ তরী</div>
      </div>
    </div>
  );
}

export default function Navbar({ links }) {
  const { profile, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  async function handleLogout() {
    await logout();
    navigate('/login');
  }

  return (
    <nav className="sticky top-0 z-50 bg-white/90 backdrop-blur-md border-b border-slate-200/80 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          <DwiptoriLogo />
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to}
                className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>
                <Icon className="w-4 h-4" />
                {label}
              </NavLink>
            ))}
          </div>
          <div className="hidden md:flex items-center gap-3">
            {isAdmin && (
              <NavLink to="/admin"
                className="flex items-center gap-1.5 text-xs font-medium text-tide-600 bg-tide-50 hover:bg-tide-100 px-3 py-1.5 rounded-lg transition-colors">
                <Shield className="w-3.5 h-3.5" />
                Admin Panel
              </NavLink>
            )}
            <div className="flex items-center gap-2 pl-3 border-l border-slate-200">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-tide-400 to-tide-600 flex items-center justify-center text-white text-sm font-semibold">
                {profile?.name?.[0]?.toUpperCase() || 'U'}
              </div>
              <div className="text-sm">
                <div className="font-medium text-slate-800 leading-tight">{profile?.name}</div>
                <div className="text-xs text-slate-500 leading-tight">{profile?.email}</div>
              </div>
              <button onClick={handleLogout}
                className="ml-2 p-1.5 rounded-lg text-slate-500 hover:text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
          <button className="md:hidden p-2 rounded-lg text-slate-600" onClick={() => setOpen(!open)}>
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
        {open && (
          <div className="md:hidden pb-4 pt-2 border-t border-slate-100 space-y-1 animate-fade-in">
            {links.map(({ to, label, icon: Icon }) => (
              <NavLink key={to} to={to} onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors
                  ${isActive ? 'bg-tide-50 text-tide-700' : 'text-slate-600 hover:bg-slate-50'}`}>
                <Icon className="w-4 h-4" />
                {label}
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
              </NavLink>
            ))}
            {isAdmin && (
              <NavLink to="/admin" onClick={() => setOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-tide-700 bg-tide-50">
                <Shield className="w-4 h-4" />
                Admin Panel
                <ChevronRight className="w-3.5 h-3.5 ml-auto opacity-40" />
              </NavLink>
            )}
            <div className="pt-2 mt-2 border-t border-slate-100">
              <button onClick={handleLogout}
                className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-colors">
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
