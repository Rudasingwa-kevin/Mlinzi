import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import CookieConsent from "./components/CookieConsent";
import ErrorBoundary from "./components/ErrorBoundary";
import Home from "./pages/Home";
import ReportAbuse from "./pages/ReportAbuse";
import Results from "./pages/Results";
import ReferralSuccess from "./pages/ReferralSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";
import CounselorDashboard from "./pages/CounselorDashboard";
import CaseDetail from "./pages/CaseDetail";
import Analytics from "./pages/Analytics";
import AdminPanel from "./pages/AdminPanel";
import PrivacyPolicy from "./pages/PrivacyPolicy";

function OfflineBanner() {
  const [online, setOnline] = useState(navigator.onLine);
  const [show, setShow] = useState(false);

  useEffect(() => {
    const handleOnline = () => { setOnline(true); setShow(true); setTimeout(() => setShow(false), 3000); };
    const handleOffline = () => { setOnline(false); setShow(true); };
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  if (!show && online) return null;

  return (
    <div className={`fixed top-0 left-0 right-0 z-[100] text-center text-sm font-medium py-2 px-4 transition-all ${
      online ? "bg-[#2E7D32] text-white" : "bg-amber-500 text-white"
    }`}>
      {online ? "Back online" : "You're offline — some features may be unavailable"}
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityProvider>
          <div className="min-h-screen bg-cloud">
            <OfflineBanner />
            <Navbar />
            <main role="main" aria-label="Main content">
              <ErrorBoundary>
                <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportAbuse />} />
                <Route path="/results" element={<Results />} />
                <Route path="/refer/success" element={<ReferralSuccess />} />
                <Route path="/privacy" element={<PrivacyPolicy />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
                <Route path="/reset-password" element={<ResetPassword />} />
                <Route
                  path="/counselor"
                  element={
                    <ProtectedRoute roles={["counselor"]}>
                      <CounselorDashboard />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/counselor/:id"
                  element={
                    <ProtectedRoute roles={["counselor"]}>
                      <CaseDetail />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/analytics"
                  element={
                    <ProtectedRoute roles={["national_society"]}>
                      <Analytics />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute roles={["national_society"]}>
                      <AdminPanel />
                    </ProtectedRoute>
                  }
                />
              </Routes>
              </ErrorBoundary>
            </main>
            <AccessibilityToolbar />
            <CookieConsent />
          </div>
        </AccessibilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
