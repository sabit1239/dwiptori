import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import HomePage     from './pages/HomePage';
import LoginPage    from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import MemberLayout  from './pages/member/MemberLayout';
import Dashboard     from './pages/member/Dashboard';
import PayPage       from './pages/member/PayPage';
import ReceiptsPage  from './pages/member/ReceiptsPage';
import ProfilePage   from './pages/member/ProfilePage';
import AdminLayout   from './pages/admin/AdminLayout';
import AdminDash     from './pages/admin/AdminDash';
import AdminPayments from './pages/admin/AdminPayments';
import AdminMembers  from './pages/admin/AdminMembers';
import AdminNumbers  from './pages/admin/AdminNumbers';
import AdminActivity from './pages/admin/AdminActivity';

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
      <Route path="/"         element={<HomePage />} />
      <Route path="/login"    element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />

      <Route path="/" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="pay"       element={<PayPage />} />
        <Route path="receipts"  element={<ReceiptsPage />} />
        <Route path="profile"   element={<ProfilePage />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index            element={<AdminDash />} />
        <Route path="payments"  element={<AdminPayments />} />
        <Route path="members"   element={<AdminMembers />} />
        <Route path="numbers"   element={<AdminNumbers />} />
        <Route path="activity"  element={<AdminActivity />} />
      </Route>
    </Routes>
  );
}
