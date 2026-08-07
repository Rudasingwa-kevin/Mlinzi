import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { AccessibilityProvider } from "./context/AccessibilityContext";
import Navbar from "./components/Navbar";
import ProtectedRoute from "./components/ProtectedRoute";
import AccessibilityToolbar from "./components/AccessibilityToolbar";
import Home from "./pages/Home";
import ReportAbuse from "./pages/ReportAbuse";
import Results from "./pages/Results";
import ReferralSuccess from "./pages/ReferralSuccess";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CounselorDashboard from "./pages/CounselorDashboard";
import CaseDetail from "./pages/CaseDetail";
import Analytics from "./pages/Analytics";
import AdminPanel from "./pages/AdminPanel";

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AccessibilityProvider>
          <div className="min-h-screen bg-cloud">
            <Navbar />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/report" element={<ReportAbuse />} />
                <Route path="/results" element={<Results />} />
                <Route path="/refer/success" element={<ReferralSuccess />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
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
            </main>
            <AccessibilityToolbar />
          </div>
        </AccessibilityProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}
