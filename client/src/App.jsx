import { BrowserRouter, Routes, Route } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import ReportAbuse from "./pages/ReportAbuse";
import Results from "./pages/Results";
import CounselorDashboard from "./pages/CounselorDashboard";
import Analytics from "./pages/Analytics";

export default function App() {
  return (
    <BrowserRouter>
      <div className="min-h-screen bg-cloud">
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/report" element={<ReportAbuse />} />
            <Route path="/results" element={<Results />} />
            <Route path="/dashboard" element={<CounselorDashboard />} />
            <Route path="/analytics" element={<Analytics />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
