import { useState, useEffect } from "react";
import { getStats } from "../services/api";
import PatternDivider from "../components/PatternDivider";

const severityConfig = {
  low: { color: "bg-green", label: "Low Risk" },
  medium: { color: "bg-gold", label: "Medium Risk" },
  high: { color: "bg-red", label: "High Risk" },
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
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-slate-gray">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">📊</div>
          <p className="text-navy font-semibold">Unable to load analytics</p>
          <p className="text-sm text-slate-gray">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">National Dashboard</h1>
          <p className="text-blue-200">
            Evidence-driven insights for policy and decision makers.
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-6xl mx-auto py-10 px-4">
        {/* Total Reports - Hero Card */}
        <div className="bg-white rounded-2xl border border-soft p-8 mb-8 text-center shadow-sm">
          <p className="text-sm text-slate-gray uppercase tracking-wide mb-2">
            Total Reports Submitted
          </p>
          <p className="text-6xl font-extrabold text-blue">{stats.total}</p>
          <p className="text-sm text-slate-gray mt-2">
            Across all categories and severity levels
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* By Severity */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📊</span>
              <h2 className="font-semibold text-navy">By Severity</h2>
            </div>
            {stats.bySeverity.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-4">
                {stats.bySeverity.map((s) => {
                  const config = severityConfig[s.severity] || { color: "bg-soft", label: s.severity };
                  const pct = stats.total > 0 ? Math.round((s.count / stats.total) * 100) : 0;
                  return (
                    <div key={s.severity}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-navy font-medium">{config.label}</span>
                        <span className="text-slate-gray">
                          {s.count} <span className="text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-cloud rounded-full h-2.5">
                        <div
                          className={`h-2.5 rounded-full ${config.color}`}
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By Category */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📁</span>
              <h2 className="font-semibold text-navy">By Category</h2>
            </div>
            {stats.byCategory.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {stats.byCategory.map((c) => (
                  <div key={c.category} className="flex justify-between text-sm">
                    <span className="text-navy">{c.category}</span>
                    <span className="font-medium text-charcoal bg-cloud px-2 py-0.5 rounded-full text-xs">
                      {c.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* By Status */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <span className="text-xl">📋</span>
              <h2 className="font-semibold text-navy">By Status</h2>
            </div>
            {stats.byStatus.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {stats.byStatus.map((s) => {
                  const labels = {
                    new: "New Reports",
                    under_review: "Under Review",
                    resolved: "Resolved",
                  };
                  return (
                    <div key={s.status} className="flex justify-between text-sm">
                      <span className="text-navy">{labels[s.status] || s.status}</span>
                      <span className="font-medium text-charcoal bg-cloud px-2 py-0.5 rounded-full text-xs">
                        {s.count}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary note */}
        <div className="mt-8 ai-card">
          <div className="flex items-start gap-3">
            <span className="text-xl">📋</span>
            <div>
              <p className="font-semibold text-navy mb-1">Data Summary</p>
              <p className="text-sm text-slate-gray">
                This dashboard provides an overview of all reports submitted through Mlinzi.
                Data is updated in real-time as new reports are received. Use these insights
                to inform policy decisions and allocate resources where they are needed most.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
