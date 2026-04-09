import { Outlet } from 'react-router-dom';
import Navbar from '../../components/shared/Navbar';
import { LayoutDashboard, CreditCard, FileText, User, Users, Home, BookOpen, Bell } from 'lucide-react';

const LINKS = [
  { to: '/',          label: 'Home',      icon: Home },
  { to: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { to: '/notices',   label: 'নোটিশ',    icon: Bell },
  { to: '/pay',       label: 'Pay',       icon: CreditCard },
  { to: '/receipts',  label: 'Receipts',  icon: FileText },
  { to: '/ledger',    label: 'হিসাব',    icon: BookOpen },
  { to: '/directory', label: 'Directory', icon: Users },
  { to: '/profile',   label: 'Profile',   icon: User },
];

export default function MemberLayout() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar links={LINKS} />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 page-enter">
        <Outlet />
      </main>
    </div>
  );
}
