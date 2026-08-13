import { useState, useEffect } from "react";
import { getNationalAnalytics } from "../services/api";
import { useAccessibility } from "../context/AccessibilityContext";
import PatternDivider from "../components/PatternDivider";
import { Loader2, BarChart3, Folder, MapPin, ClipboardList, TrendingUp, AlertTriangle, Users, Clock, FileText, Radio, Timer } from "lucide-react";

const severityConfig = {
  low: { color: "bg-emerald-500", bg: "bg-emerald-100", text: "text-emerald-700", label: "Low Risk" },
  medium: { color: "bg-amber-500", bg: "bg-amber-100", text: "text-amber-700", label: "Medium Risk" },
  high: { color: "bg-red-500", bg: "bg-red-100", text: "text-red-700", label: "High Risk" },
};

const channelColors = {
  web: "bg-blue-500",
  sms: "bg-emerald-500",
  whatsapp: "bg-purple-500",
};

const channelLabels = {
  web: "Web",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { t, formatDate } = useAccessibility();

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
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-cloud">
        <div className="inline-flex items-center gap-3 text-slate-gray">
          <Loader2 className="animate-spin h-6 w-6" />
          {t("loadingAnalytics")}
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center bg-cloud">
        <div className="text-center bg-white p-8 rounded-2xl border border-soft">
          <BarChart3 size={56} className="mx-auto text-soft mb-4" />
          <p className="text-navy font-semibold text-lg">{t("unableToLoad")}</p>
          <p className="text-sm text-slate-gray mt-1">{t("tryRefreshing")}</p>
        </div>
      </div>
    );
  }

  const { reportStats, referralStats, responseTimeByDistrict, channelBreakdown } = data;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-cloud">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <BarChart3 size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">{t("nationalDashboard")}</h1>
          </div>
          <p className="text-emerald-100 ml-12">
            {t("evidenceDesc")}
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-6xl mx-auto py-8 px-4" aria-label={t("nationalDashboard")}>
        {/* Hero Stats */}
        <div className="bg-gradient-to-r from-[#1B5E20] to-[#2E7D32] rounded-2xl p-8 mb-8 text-center text-white shadow-lg -mt-6">
          <p className="text-emerald-100 text-sm uppercase tracking-wide mb-2">
            {t("totalReports")}
          </p>
          <p className="text-6xl font-extrabold">{reportStats.total}</p>
          <p className="text-emerald-100 mt-2">
            {reportStats.escalated} {t("escalatedCounselors")}
          </p>
        </div>

        {/* Quick Stats Row */}
        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <FileText size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{reportStats.total}</p>
                <p className="text-xs text-slate-gray">{t("totalReports")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-red-100 p-2.5 rounded-xl">
                <AlertTriangle size={20} className="text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{reportStats.highSeverity || reportStats.bySeverity.find(s => s.severity === "high")?.count || 0}</p>
                <p className="text-xs text-slate-gray">{t("highSeverity")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-xl">
                <Users size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{referralStats.total}</p>
                <p className="text-xs text-slate-gray">{t("referrals")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl">
                <Clock size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{referralStats.avgResponseTime ? `${referralStats.avgResponseTime}h` : "N/A"}</p>
                <p className="text-xs text-slate-gray">{t("avgResponse")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Charts Row */}
        <div className="grid md:grid-cols-3 gap-6 mb-6">
          {/* By Severity */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-red-100 p-2 rounded-lg">
                <AlertTriangle size={18} className="text-red-600" />
              </div>
              <h2 className="font-semibold text-navy">{t("bySeverity")}</h2>
            </div>
            {reportStats.bySeverity.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-8">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-4">
                {reportStats.bySeverity.map((s) => {
                  const config = severityConfig[s.severity] || { color: "bg-gray-400", bg: "bg-gray-100", text: "text-gray-700", label: s.severity };
                  const pct = reportStats.total > 0 ? Math.round((s.count / reportStats.total) * 100) : 0;
                  return (
                    <div key={s.severity}>
                      <div className="flex justify-between text-sm mb-2">
                        <span className={`font-medium ${config.text}`}>{config.label}</span>
                        <span className="text-slate-gray">
                          {s.count} <span className="text-xs">({pct}%)</span>
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-3">
                        <div
                          className={`h-3 rounded-full ${config.color}`}
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
              <div className="bg-blue-100 p-2 rounded-lg">
                <Folder size={18} className="text-blue-600" />
              </div>
              <h2 className="font-semibold text-navy">{t("byCategory")}</h2>
            </div>
            {reportStats.byCategory.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-8">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-3">
                {reportStats.byCategory.map((c) => {
                  const pct = reportStats.total > 0 ? Math.round((c.count / reportStats.total) * 100) : 0;
                  return (
                    <div key={c.category}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-navy font-medium">{c.category}</span>
                        <span className="text-slate-gray text-xs">{c.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-blue-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* By District */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-emerald-100 p-2 rounded-lg">
                <MapPin size={18} className="text-emerald-600" />
              </div>
              <h2 className="font-semibold text-navy">{t("byDistrict")}</h2>
            </div>
            {reportStats.byDistrict.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-8">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-3">
                {reportStats.byDistrict.slice(0, 8).map((d) => {
                  const pct = reportStats.total > 0 ? Math.round((d.count / reportStats.total) * 100) : 0;
                  return (
                    <div key={d.district}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-navy font-medium">{d.district}</span>
                        <span className="text-slate-gray text-xs">{d.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-emerald-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Channel Breakdown & Response Time */}
        <div className="grid md:grid-cols-2 gap-6 mb-6">
          {/* By Channel */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-purple-100 p-2 rounded-lg">
                <Radio size={18} className="text-purple-600" />
              </div>
              <h2 className="font-semibold text-navy">{t("byChannel")}</h2>
            </div>
            {!channelBreakdown || channelBreakdown.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-8">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-3">
                {channelBreakdown.map((ch) => {
                  const pct = reportStats.total > 0 ? Math.round((ch.count / reportStats.total) * 100) : 0;
                  return (
                    <div key={ch.channel}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-navy font-medium">{channelLabels[ch.channel] || ch.channel}</span>
                        <span className="text-slate-gray text-xs">{ch.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${channelColors[ch.channel] || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Response Time by District */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-amber-100 p-2 rounded-lg">
                <Timer size={18} className="text-amber-600" />
              </div>
              <h2 className="font-semibold text-navy">{t("responseTimeByDistrict")}</h2>
            </div>
            {!responseTimeByDistrict || responseTimeByDistrict.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-8">{t("noResponseData")}</p>
            ) : (
              <div className="space-y-3">
                {responseTimeByDistrict.slice(0, 6).map((rt) => {
                  const hours = rt.avg_response_hours ? parseFloat(rt.avg_response_hours).toFixed(1) : "N/A";
                  return (
                    <div key={rt.district} className="flex items-center justify-between py-2 border-b border-soft last:border-0">
                      <div>
                        <p className="text-sm font-medium text-navy">{rt.district}</p>
                        <p className="text-xs text-slate-gray">{rt.total_cases} {t("casesLabel")}</p>
                      </div>
                      <span className="text-sm font-semibold text-navy">{hours}h</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Referral Stats */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* Referral Status */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-purple-100 p-2 rounded-lg">
                <ClipboardList size={18} className="text-purple-600" />
              </div>
              <h2 className="font-semibold text-navy">{t("referralStatus")}</h2>
            </div>
            {referralStats.byStatus.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-8">{t("noReferrals")}</p>
            ) : (
              <div className="space-y-3">
                {referralStats.byStatus.map((s) => {
                  const labels = { new: "New", under_review: "Under Review", resolved: "Resolved" };
                  const colors = { new: "bg-blue-500", under_review: "bg-purple-500", resolved: "bg-emerald-500" };
                  const pct = referralStats.total > 0 ? Math.round((s.count / referralStats.total) * 100) : 0;
                  return (
                    <div key={s.status}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-navy font-medium">{labels[s.status] || s.status}</span>
                        <span className="text-slate-gray text-xs">{s.count} ({pct}%)</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${colors[s.status] || "bg-gray-400"}`} style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Monthly Trend */}
          <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
            <div className="flex items-center gap-2 mb-5">
              <div className="bg-amber-100 p-2 rounded-lg">
                <TrendingUp size={18} className="text-amber-600" />
              </div>
              <h2 className="font-semibold text-navy">{t("monthlyTrend")}</h2>
            </div>
            {reportStats.monthlyTrend.length === 0 ? (
              <p className="text-sm text-slate-gray text-center py-8">{t("noDataYet")}</p>
            ) : (
              <div className="space-y-3">
                {reportStats.monthlyTrend.slice(0, 6).map((m) => {
                  const maxCount = Math.max(...reportStats.monthlyTrend.map(x => x.count));
                  const pct = maxCount > 0 ? (m.count / maxCount) * 100 : 0;
                  return (
                    <div key={m.month}>
                      <div className="flex justify-between text-sm mb-1.5">
                        <span className="text-navy font-medium">
                          {formatDate(m.month, { month: "short", year: "numeric" })}
                        </span>
                        <span className="text-slate-gray text-xs">{m.count}</span>
                      </div>
                      <div className="w-full bg-gray-100 rounded-full h-2">
                        <div className="h-2 rounded-full bg-amber-500" style={{ width: `${pct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Summary note */}
        <div className="mt-8 bg-white rounded-2xl border border-soft p-6 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="bg-emerald-100 p-2 rounded-lg">
              <ClipboardList size={18} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-semibold text-navy mb-1">{t("dataSummary")}</p>
              <p className="text-sm text-slate-gray">
                {t("dataSummaryText")}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
