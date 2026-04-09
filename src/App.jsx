import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './hooks/useAuth';
import HomePage           from './pages/HomePage';
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
import AdminGallery       from './pages/admin/AdminGallery';
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
      {/* Public */}
      <Route path="/"                element={<HomePage />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/register"        element={<RegisterPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />

      {/* Member — আলাদা path /m/ এর নিচে নেই, সরাসরি */}
      <Route path="/dashboard" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route index element={<Dashboard />} />
      </Route>
      <Route path="/pay" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route index element={<PayPage />} />
      </Route>
      <Route path="/receipts" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route index element={<ReceiptsPage />} />
      </Route>
      <Route path="/directory" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route index element={<DirectoryPage />} />
      </Route>
      <Route path="/profile" element={<PrivateRoute><MemberLayout /></PrivateRoute>}>
        <Route index element={<ProfilePage />} />
      </Route>

      {/* Admin */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route index             element={<AdminDash />} />
        <Route path="payments"   element={<AdminPayments />} />
        <Route path="members"    element={<AdminMembers />} />
        <Route path="committee"  element={<AdminCommittee />} />
        <Route path="gallery"    element={<AdminGallery />} />
        <Route path="numbers"    element={<AdminNumbers />} />
        <Route path="photos"     element={<AdminPhotos />} />
        <Route path="activity"   element={<AdminActivity />} />
      </Route>
    </Routes>
  );
}
