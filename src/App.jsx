import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import LoginPage          from './pages/LoginPage';
import RegisterPage       from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import MemberLayout       from './pages/member/MemberLayout';
import Dashboard          from './pages/member/Dashboard';
import PayPage            from './pages/member/PayPage';
import ReceiptsPage       from './pages/member/ReceiptsPage';
import ProfilePage        from './pages/member/ProfilePage';
import DirectoryPage      from './pages/member/DirectoryPage';
import AdminLayout        from './pages/admin/AdminLayout';
import AdminDash          from './pages/admin/AdminDash';
import AdminPayments      from './pages/admin/AdminPayments';
import AdminMembers       from './pages/admin/AdminMembers';
import AdminCommittee     from './pages/admin/AdminCommittee';
import AdminNumbers       from './pages/admin/AdminNumbers';
import AdminPhotos        from './pages/admin/AdminPhotos';
import AdminActivity      from './pages/admin/AdminActivity';

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
      <Route path="/"                element={<Navigate to="/dashboard" replace />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      <Route path="/" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route path="dashboard"  element={<Dashboard />} />
        <Route path="pay"        element={<PayPage />} />
        <Route path="receipts"   element={<ReceiptsPage />} />
        <Route path="directory"  element={<DirectoryPage />} />
        <Route path="profile"    element={<ProfilePage />} />
      </Route>

      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index             element={<AdminDash />} />
        <Route path="payments"   element={<AdminPayments />} />
        <Route path="members"    element={<AdminMembers />} />
        <Route path="committee"  element={<AdminCommittee />} />
        <Route path="numbers"    element={<AdminNumbers />} />
        <Route path="photos"     element={<AdminPhotos />} />
        <Route path="activity"   element={<AdminActivity />} />
      </Route>
    </Routes>
  );
}
