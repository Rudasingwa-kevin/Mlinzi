import { useState, useEffect } from "react";
import { getReports, updateReportStatus } from "../services/api";

const severityColors = {
  low: "bg-green-100 text-green-800",
  medium: "bg-yellow-100 text-yellow-800",
  high: "bg-red-100 text-red-800",
};

const statusColors = {
  new: "bg-blue-100 text-blue-800",
  under_review: "bg-purple-100 text-purple-800",
  resolved: "bg-green-100 text-green-800",
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

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Counselor Dashboard</h1>
      <p className="text-slate-600 mb-6">Review and manage incoming abuse reports.</p>

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-6">
        <select
          value={filters.status}
          onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Statuses</option>
          <option value="new">New</option>
          <option value="under_review">Under Review</option>
          <option value="resolved">Resolved</option>
        </select>
        <select
          value={filters.severity}
          onChange={(e) => setFilters((f) => ({ ...f, severity: e.target.value }))}
          className="border border-slate-300 rounded-lg px-3 py-2 text-sm"
        >
          <option value="">All Severities</option>
          <option value="high">High</option>
          <option value="medium">Medium</option>
          <option value="low">Low</option>
        </select>
        <button
          onClick={loadReports}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700"
        >
          Refresh
        </button>
      </div>

      {/* Report table */}
      {loading ? (
        <p className="text-slate-500">Loading reports...</p>
      ) : reports.length === 0 ? (
        <p className="text-slate-500">No reports found.</p>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="text-left px-4 py-3 font-medium text-slate-600">ID</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Category</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Severity</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Status</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Date</th>
                <th className="text-left px-4 py-3 font-medium text-slate-600">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {reports.map((r) => (
                <tr key={r.id} className="hover:bg-slate-50">
                  <td className="px-4 py-3 font-mono text-slate-500">#{r.id}</td>
                  <td className="px-4 py-3 text-slate-800">{r.category}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[r.severity] || "bg-slate-100"}`}>
                      {r.severity}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[r.status] || "bg-slate-100"}`}>
                      {r.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-slate-500">
                    {new Date(r.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <button
                      onClick={() => setSelectedReport(r)}
                      className="text-blue-600 hover:underline font-medium"
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Report detail modal */}
      {selectedReport && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6">
            <div className="flex items-start justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-800">Report #{selectedReport.id}</h2>
              <button
                onClick={() => setSelectedReport(null)}
                className="text-slate-400 hover:text-slate-600 text-2xl leading-none"
              >
                &times;
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <span className="font-medium text-slate-500">Category: </span>
                <span className="text-slate-800">{selectedReport.category}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">Severity: </span>
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${severityColors[selectedReport.severity] || ""}`}>
                  {selectedReport.severity}
                </span>
              </div>
              <div>
                <span className="font-medium text-slate-500">Guidance: </span>
                <span className="text-slate-800">{selectedReport.guidance}</span>
              </div>
              <div>
                <span className="font-medium text-slate-500">Extracted Text: </span>
                <p className="text-slate-700 italic mt-1 bg-slate-50 p-3 rounded-lg">
                  "{selectedReport.extracted_text}"
                </p>
              </div>
              <div>
                <span className="font-medium text-slate-500">Screenshot: </span>
                <img
                  src={selectedReport.screenshot_path}
                  alt="Screenshot"
                  className="mt-2 rounded-lg max-h-48 border border-slate-200"
                />
              </div>
            </div>

            {/* Status update */}
            <div className="mt-6 flex gap-2">
              {["new", "under_review", "resolved"].map((s) => (
                <button
                  key={s}
                  onClick={() => handleStatusChange(selectedReport.id, s)}
                  disabled={selectedReport.status === s}
                  className={`px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                    selectedReport.status === s
                      ? "bg-slate-200 text-slate-500 cursor-not-allowed"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {s.replace("_", " ")}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
