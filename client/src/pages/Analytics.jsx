import { useState, useEffect } from "react";
import { getStats } from "../services/api";

const severityColors = {
  low: "bg-green-500",
  medium: "bg-yellow-500",
  high: "bg-red-500",
};

export default function Analytics() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const data = await getStats();
        setStats(data);
      } catch (err) {
        console.error("Failed to load stats:", err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <p className="text-slate-500">Loading analytics...</p>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="max-w-6xl mx-auto py-20 px-4 text-center">
        <p className="text-slate-500">Failed to load analytics.</p>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">National Dashboard</h1>
      <p className="text-slate-600 mb-8">Overview of all abuse reports across the platform.</p>

      {/* Total */}
      <div className="bg-white rounded-xl border border-slate-200 p-8 mb-8 text-center shadow-sm">
        <p className="text-sm text-slate-500 uppercase tracking-wide mb-1">Total Reports</p>
        <p className="text-5xl font-bold text-blue-600">{stats.total}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {/* By Severity */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">By Severity</h2>
          {stats.bySeverity.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <div className="space-y-3">
              {stats.bySeverity.map((s) => (
                <div key={s.severity}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="capitalize text-slate-700">{s.severity}</span>
                    <span className="font-medium text-slate-800">{s.count}</span>
                  </div>
                  <div className="w-full bg-slate-100 rounded-full h-2">
                    <div
                      className={`h-2 rounded-full ${severityColors[s.severity] || "bg-slate-300"}`}
                      style={{ width: `${(s.count / stats.total) * 100}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Category */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">By Category</h2>
          {stats.byCategory.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.byCategory.map((c) => (
                <div key={c.category} className="flex justify-between text-sm">
                  <span className="text-slate-700">{c.category}</span>
                  <span className="font-medium text-slate-800">{c.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* By Status */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
          <h2 className="font-semibold text-slate-800 mb-4">By Status</h2>
          {stats.byStatus.length === 0 ? (
            <p className="text-sm text-slate-400">No data yet</p>
          ) : (
            <div className="space-y-2">
              {stats.byStatus.map((s) => (
                <div key={s.status} className="flex justify-between text-sm">
                  <span className="capitalize text-slate-700">{s.status.replace("_", " ")}</span>
                  <span className="font-medium text-slate-800">{s.count}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
