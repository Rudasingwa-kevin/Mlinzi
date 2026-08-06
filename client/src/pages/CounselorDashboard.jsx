import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCounselorCases, getUnassignedCases, claimCase } from "../services/api";
import PatternDivider from "../components/PatternDivider";

const severityConfig = {
  low: { bg: "bg-green-50", text: "text-green", label: "Low" },
  medium: { bg: "bg-yellow-50", text: "text-gold", label: "Medium" },
  high: { bg: "bg-red-soft", text: "text-red", label: "High" },
};

const statusConfig = {
  new: { bg: "bg-blue-bg", text: "text-blue", label: "New" },
  under_review: { bg: "bg-purple-50", text: "text-purple-600", label: "Under Review" },
  resolved: { bg: "bg-green-50", text: "text-green", label: "Resolved" },
};

const contactLabels = {
  phone: "Phone Call",
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "Email",
};

export default function CounselorDashboard() {
  const [myCases, setMyCases] = useState([]);
  const [unassignedCases, setUnassignedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "" });
  const [activeTab, setActiveTab] = useState("my-cases");

  async function loadCases() {
    setLoading(true);
    try {
      const [my, unassigned] = await Promise.all([
        getCounselorCases(filters),
        getUnassignedCases(filters),
      ]);
      setMyCases(my);
      setUnassignedCases(unassigned);
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, [filters]);

  async function handleClaimCase(caseId) {
    try {
      await claimCase(caseId);
      loadCases();
    } catch (err) {
      console.error("Failed to claim case:", err);
    }
  }

  const activeCases = activeTab === "my-cases" ? myCases : unassignedCases;
  const newCount = myCases.filter((c) => c.status === "new").length;
  const reviewCount = myCases.filter((c) => c.status === "under_review").length;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Counselor Dashboard</h1>
          <p className="text-blue-200">
            Manage referrals and support children in need.
          </p>

          {/* Quick stats */}
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <p className="text-2xl font-bold text-white">{myCases.length}</p>
              <p className="text-xs text-blue-200">My Cases</p>
            </div>
            <div className="bg-blue/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <p className="text-2xl font-bold text-white">{newCount}</p>
              <p className="text-xs text-blue-200">New</p>
            </div>
            <div className="bg-purple/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <p className="text-2xl font-bold text-white">{reviewCount}</p>
              <p className="text-xs text-blue-200">In Review</p>
            </div>
            <div className="bg-green/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <p className="text-2xl font-bold text-white">{unassignedCases.length}</p>
              <p className="text-xs text-blue-200">Unclaimed</p>
            </div>
          </div>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("my-cases")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === "my-cases"
                ? "bg-blue text-white shadow-md"
                : "bg-cloud text-slate-gray hover:bg-soft"
            }`}
          >
            My Cases ({myCases.length})
          </button>
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`px-5 py-2.5 rounded-2xl text-sm font-medium transition-all ${
              activeTab === "unassigned"
                ? "bg-blue text-white shadow-md"
                : "bg-cloud text-slate-gray hover:bg-soft"
            }`}
          >
            Unclaimed ({unassignedCases.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="border border-soft rounded-2xl px-4 py-2.5 text-sm bg-white focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={loadCases}
            className="bg-blue text-white px-5 py-2.5 rounded-2xl text-sm font-medium hover:bg-blue-dark transition-all duration-200 shadow-sm"
          >
            Refresh
          </button>
        </div>

        {/* Cases table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-slate-gray">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading cases...
            </div>
          </div>
        ) : activeCases.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-navy font-semibold">No cases found</p>
            <p className="text-sm text-slate-gray">
              {activeTab === "my-cases"
                ? "You don't have any assigned cases yet."
                : "All cases have been claimed."}
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-soft overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-cloud border-b border-soft">
                <tr>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Case ID</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">District</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Category</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Severity</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Contact</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Status</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft">
                {activeCases.map((c) => {
                  const sev = severityConfig[c.severity] || { bg: "bg-cloud", text: "text-slate-gray", label: c.severity };
                  const stat = statusConfig[c.status] || { bg: "bg-cloud", text: "text-slate-gray", label: c.status };
                  return (
                    <tr key={c.id} className="hover:bg-cloud transition-colors">
                      <td className="px-5 py-4 font-mono text-slate-gray">#{c.id}</td>
                      <td className="px-5 py-4 text-navy font-medium">{c.district}</td>
                      <td className="px-5 py-4 text-navy font-medium">{c.category}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                          {sev.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-gray">{contactLabels[c.preferred_contact]}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.text}`}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        {activeTab === "unassigned" ? (
                          <button
                            onClick={() => handleClaimCase(c.id)}
                            className="text-blue font-medium hover:text-blue-dark transition-colors"
                          >
                            Claim
                          </button>
                        ) : (
                          <Link
                            to={`/counselor/${c.id}`}
                            className="text-blue font-medium hover:text-blue-dark transition-colors"
                          >
                            View Details
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
