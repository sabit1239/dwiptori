import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';

// Pages
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MemberLayout from './pages/member/MemberLayout';
import Dashboard    from './pages/member/Dashboard';
import PayPage      from './pages/member/PayPage';
import ReceiptsPage from './pages/member/ReceiptsPage';
import ProfilePage  from './pages/member/ProfilePage';
import AdminLayout  from './pages/admin/AdminLayout';
import AdminDash    from './pages/admin/AdminDash';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMembers from './pages/admin/AdminMembers';
import AdminNumbers from './pages/admin/AdminNumbers';

function PrivateRoute({ children }) {
  const { user } = useAuth();
  return user ? children : <Navigate to="/login" replace />;
}

function AdminRoute({ children }) {
  const { user, isAdmin } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      {/* Member routes */}
      <Route path="/" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pay"       element={<PayPage />} />
        <Route path="receipts"  element={<ReceiptsPage />} />
        <Route path="profile"   element={<ProfilePage />} />
      </Route>

      {/* Admin routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index          element={<AdminDash />} />
        <Route path="payments" element={<AdminPayments />} />
        <Route path="members"  element={<AdminMembers />} />
        <Route path="numbers"  element={<AdminNumbers />} />
      </Route>
    </Routes>
  );
}
