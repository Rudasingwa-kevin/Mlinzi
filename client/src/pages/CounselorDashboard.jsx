import { useState, useEffect } from "react";
import { getReports, updateReportStatus } from "../services/api";
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

export default function CounselorDashboard() {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "", category: "", severity: "" });
  const [selectedReport, setSelectedReport] = useState(null);

  async function loadReports() {
    setLoading(true);
    try {
      const data = await getReports(filters);
      setReports(data);
    } catch (err) {
      console.error("Failed to load reports:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadReports();
  }, [filters]);

  async function handleStatusChange(id, newStatus) {
    try {
      await updateReportStatus(id, newStatus);
      setReports((prev) =>
        prev.map((r) => (r.id === id ? { ...r, status: newStatus } : r))
      );
      if (selectedReport?.id === id) {
        setSelectedReport((prev) => ({ ...prev, status: newStatus }));
      }
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  const newCount = reports.filter((r) => r.status === "new").length;
  const highCount = reports.filter((r) => r.severity === "high").length;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Counselor Dashboard</h1>
          <p className="text-blue-200">
            Review and manage incoming abuse reports. Stay calm, stay supportive.
          </p>

          {/* Quick stats */}
          <div className="flex gap-4 mt-6">
            <div className="bg-white/10 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <p className="text-2xl font-bold text-white">{reports.length}</p>
              <p className="text-xs text-blue-200">Total Reports</p>
            </div>
            <div className="bg-blue/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <p className="text-2xl font-bold text-white">{newCount}</p>
              <p className="text-xs text-blue-200">New Reports</p>
            </div>
            <div className="bg-red/20 backdrop-blur-sm px-4 py-2 rounded-2xl">
              <p className="text-2xl font-bold text-white">{highCount}</p>
              <p className="text-xs text-blue-200">High Risk</p>
            </div>
          </div>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-6xl mx-auto py-8 px-4">
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
          <select
            value={filters.severity}
            onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
            className="border border-soft rounded-2xl px-4 py-2.5 text-sm bg-white focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
          >
            <option value="">All Severities</option>
            <option value="high">High Risk</option>
            <option value="medium">Medium Risk</option>
            <option value="low">Low Risk</option>
          </select>
          <button
            onClick={loadReports}
            className="bg-blue text-white px-5 py-2.5 rounded-2xl text-sm font-medium hover:bg-blue-dark transition-all duration-200 shadow-sm"
          >
            Refresh
          </button>
        </div>

        {/* Reports table */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center gap-3 text-slate-gray">
              <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Loading reports...
            </div>
          </div>
        ) : reports.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">📋</div>
            <p className="text-navy font-semibold">No reports found</p>
            <p className="text-sm text-slate-gray">Reports will appear here as children submit them.</p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-soft overflow-hidden shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-cloud border-b border-soft">
                <tr>
                  <th className="text-left px-5 py-4 font-semibold text-navy">ID</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Category</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Severity</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Status</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Date</th>
                  <th className="text-left px-5 py-4 font-semibold text-navy">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-soft">
                {reports.map((r) => {
                  const sev = severityConfig[r.severity] || { bg: "bg-cloud", text: "text-slate-gray", label: r.severity };
                  const stat = statusConfig[r.status] || { bg: "bg-cloud", text: "text-slate-gray", label: r.status };
                  return (
                    <tr key={r.id} className="hover:bg-cloud transition-colors">
                      <td className="px-5 py-4 font-mono text-slate-gray">#{r.id}</td>
                      <td className="px-5 py-4 text-navy font-medium">{r.category}</td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                          {sev.label}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.text}`}>
                          {stat.label}
                        </span>
                      </td>
                      <td className="px-5 py-4 text-slate-gray">
                        {new Date(r.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => setSelectedReport(r)}
                          className="text-blue font-medium hover:text-blue-dark transition-colors"
                        >
                          View Details
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Report detail modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-navy/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-xl animate-fade-in-up">
            <div className="flex items-start justify-between mb-4">
              <div>
                <h2 className="text-xl font-bold text-navy">Report #{selectedReport.id}</h2>
                <p className="text-sm text-slate-gray">
                  {new Date(selectedReport.created_at).toLocaleString()}
                </p>
              </div>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-gray hover:text-navy text-2xl leading-none p-1"
              >
                &times;
              </button>
            </div>

            <div className="space-y-4 text-sm">
              <div>
                <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Category</p>
                <p className="text-navy font-semibold">{selectedReport.category}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Severity</p>
                {(() => {
                  const sev = severityConfig[selectedReport.severity] || { bg: "bg-cloud", text: "text-slate-gray", label: selectedReport.severity };
                  return (
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                      {sev.label}
                    </span>
                  );
                })()}
              </div>

              <div>
                <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Guidance</p>
                <p className="text-charcoal leading-relaxed">{selectedReport.guidance}</p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Extracted Text</p>
                <p className="text-charcoal italic bg-cloud p-3 rounded-xl border border-soft whitespace-pre-wrap">
                  "{selectedReport.extracted_text}"
                </p>
              </div>

              <div>
                <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Screenshot</p>
                <img
                  src={selectedReport.screenshot_path}
                  alt="Screenshot"
                  className="mt-2 rounded-xl max-h-48 border border-soft"
                />
              </div>
            </div>

            {/* Status update */}
            <div className="mt-6 pt-4 border-t border-soft">
              <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-3">Update Status</p>
              <div className="flex gap-2">
                {["new", "under_review", "resolved"].map((s) => {
                  const stat = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(selectedReport.id, s)}
                      disabled={selectedReport.status === s}
                      className={`px-4 py-2 rounded-2xl text-xs font-medium transition-all ${
                        selectedReport.status === s
                          ? `${stat.bg} ${stat.text} cursor-not-allowed opacity-60`
                          : "bg-cloud text-slate-gray hover:bg-soft"
                      }`}
                    >
                      {stat.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
