import { useState, useEffect } from "react";
import { getNationalAnalytics } from "../services/api";
import PatternDivider from "../components/PatternDivider";
import { Loader2, BarChart3, Folder, MapPin, ClipboardList, TrendingUp } from "lucide-react";

const severityConfig = {
  low: { color: "bg-green", label: "Low Risk" },
  medium: { color: "bg-gold", label: "Medium Risk" },
  high: { color: "bg-red", label: "High Risk" },
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const result = await getNationalAnalytics();
        setData(result);
      } catch (err) {
        console.error("Failed to load analytics:", err);
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
          <Loader2 className="animate-spin h-5 w-5" />
          Loading analytics...
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center">
          <BarChart3 size={48} className="mx-auto text-soft mb-4" />
          <p className="text-navy font-semibold">Unable to load analytics</p>
          <p className="text-sm text-slate-gray">Please try refreshing the page.</p>
        </div>
      </div>
    );
  }

  const { reportStats, referralStats } = data;

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
          <p className="text-6xl font-extrabold text-blue">{reportStats.total}</p>
          <p className="text-sm text-slate-gray mt-2">
            {reportStats.escalated} escalated to counselors
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid sm:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-soft p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-navy">{reportStats.total}</p>
            <p className="text-xs text-slate-gray">Total Reports</p>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-red">{reportStats.bySeverity.find(s => s.severity === "high")?.count || 0}</p>
            <p className="text-xs text-slate-gray">High Severity</p>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-blue">{referralStats.total}</p>
            <p className="text-xs text-slate-gray">Referrals</p>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-4 shadow-sm text-center">
            <p className="text-2xl font-bold text-green">{referralStats.avgResponseTime ? `${referralStats.avgResponseTime}h` : "N/A"}</p>
            <p className="text-xs text-slate-gray">Avg Response</p>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {/* By Severity */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <BarChart3 size={20} className="text-green" />
              <h2 className="font-semibold text-navy">By Severity</h2>
            </div>
            {reportStats.bySeverity.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-4">
                {reportStats.bySeverity.map((s) => {
                  const config = severityConfig[s.severity] || { color: "bg-soft", label: s.severity };
                  const pct = reportStats.total > 0 ? Math.round((s.count / reportStats.total) * 100) : 0;
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
              <Folder size={20} className="text-green" />
              <h2 className="font-semibold text-navy">By Category</h2>
            </div>
            {reportStats.byCategory.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {reportStats.byCategory.map((c) => (
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

          {/* By District */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <MapPin size={20} className="text-green" />
              <h2 className="font-semibold text-navy">By District</h2>
            </div>
            {reportStats.byDistrict.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {reportStats.byDistrict.slice(0, 10).map((d) => (
                  <div key={d.district} className="flex justify-between text-sm">
                    <span className="text-navy">{d.district}</span>
                    <span className="font-medium text-charcoal bg-cloud px-2 py-0.5 rounded-full text-xs">
                      {d.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid md:grid-cols-2 gap-6 mt-6">
          {/* Referral Status */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <ClipboardList size={20} className="text-green" />
              <h2 className="font-semibold text-navy">Referral Status</h2>
            </div>
            {referralStats.byStatus.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No referrals yet</p>
            ) : (
              <div className="space-y-2.5">
                {referralStats.byStatus.map((s) => {
                  const labels = {
                    new: "New",
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

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <TrendingUp size={20} className="text-green" />
              <h2 className="font-semibold text-navy">Monthly Trend</h2>
            </div>
            {reportStats.monthlyTrend.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-4">No data yet</p>
            ) : (
              <div className="space-y-2.5">
                {reportStats.monthlyTrend.slice(0, 6).map((m) => (
                  <div key={m.month} className="flex justify-between text-sm">
                    <span className="text-navy">
                      {new Date(m.month).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
                    </span>
                    <span className="font-medium text-charcoal bg-cloud px-2 py-0.5 rounded-full text-xs">
                      {m.count}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Summary note */}
        <div className="mt-8 ai-card">
          <div className="flex items-start gap-3">
            <ClipboardList size={20} className="text-green mt-0.5" />
            <div>
              <p className="font-semibold text-navy mb-1">Data Summary</p>
              <p className="text-sm text-slate-gray">
                This dashboard provides an overview of all reports submitted through Mlinzi.
                Data is updated in real-time as new reports are received. All data is anonymous
                and aggregated to protect children's privacy. Use these insights to inform
                policy decisions and allocate resources where they are needed most.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
