import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute, GuestRoute } from './components/ProtectedRoute';

// Auth pages
import LandingPage from './pages/auth/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import RegisterPage from './pages/auth/RegisterPage';
import ForgotPasswordPage from './pages/auth/ForgotPasswordPage';
import ResetPasswordPage from './pages/auth/ResetPasswordPage';
import VerifyEmailPage from './pages/auth/VerifyEmailPage';

// User pages
import UserDashboard from './pages/user/UserDashboard';
import LogBiometrics from './pages/user/LogBiometrics';
import UploadBiometrics from './pages/user/UploadBiometrics';

// Admin pages
import AdminDashboard from './pages/admin/AdminDashboard';
import UserSearch from './pages/admin/UserSearch';
import UserPerformance from './pages/admin/UserPerformance';
import ManageUser from './pages/admin/ManageUser';
import CreateUser from './pages/admin/CreateUser';

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: '#111',
              color: '#fff',
              border: '1px solid #2a2a2a',
              fontFamily: 'Inter, sans-serif',
              fontSize: '14px',
            },
            success: { iconTheme: { primary: '#f97316', secondary: '#111' } },
          }}
        />
        <Routes>
          {/* Public */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/verify" element={<VerifyEmailPage />} />
          <Route path="/resetpassword" element={<ResetPasswordPage />} />

          {/* Guest-only (redirect if logged in) */}
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
          <Route path="/forgot-password" element={<GuestRoute><ForgotPasswordPage /></GuestRoute>} />

          {/* User (athlete) routes */}
          <Route path="/dashboard" element={<ProtectedRoute role="user"><UserDashboard /></ProtectedRoute>} />
          <Route path="/log-biometrics" element={<ProtectedRoute role="user"><LogBiometrics /></ProtectedRoute>} />
          <Route path="/upload-biometrics" element={<ProtectedRoute role="user"><UploadBiometrics /></ProtectedRoute>} />

          {/* Admin routes */}
          <Route path="/admin" element={<ProtectedRoute role="admin"><AdminDashboard /></ProtectedRoute>} />
          <Route path="/admin/search" element={<ProtectedRoute role="admin"><UserSearch /></ProtectedRoute>} />
          <Route path="/admin/performance" element={<ProtectedRoute role="admin"><UserPerformance /></ProtectedRoute>} />
          <Route path="/admin/manage" element={<ProtectedRoute role="admin"><ManageUser /></ProtectedRoute>} />
          <Route path="/admin/create-user" element={<ProtectedRoute role="admin"><CreateUser /></ProtectedRoute>} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
