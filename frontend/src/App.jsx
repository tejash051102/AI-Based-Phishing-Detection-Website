import { Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import AuthPage from "./pages/AuthPage";
import AdminPage from "./pages/AdminPage";
import DashboardPage from "./pages/DashboardPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import HistoryPage from "./pages/HistoryPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ScanDetailPage from "./pages/ScanDetailPage";
import ScannerPage from "./pages/ScannerPage";
import PublicQuickScanPage from "./pages/PublicQuickScanPage";
import TipsPage from "./pages/TipsPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import { useAuth } from "./context/AuthContext";

function Protected({ children, adminOnly = false }) {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && user.role !== "admin") return <Navigate to="/dashboard" replace />;
  return children;
}

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<AuthPage mode="login" />} />
      <Route path="/register" element={<AuthPage mode="register" />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/quick-scan" element={<PublicQuickScanPage />} />
      <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
      <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
      <Route
        path="/"
        element={
          <Protected>
            <AppLayout />
          </Protected>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="scanner" element={<ScannerPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="history/:id" element={<ScanDetailPage />} />
        <Route path="tips" element={<TipsPage />} />
        <Route
          path="admin"
          element={
            <Protected adminOnly>
              <AdminPage />
            </Protected>
          }
        />
      </Route>
      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
