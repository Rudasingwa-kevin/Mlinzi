import { useState, useEffect } from "react";
import { getCounselors, approveCounselor, getRetentionStats, triggerRetentionPurge } from "../services/api";
import PatternDivider from "../components/PatternDivider";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  Loader2, Settings, CheckCircle2, Clock, UserCheck, Mail, Calendar,
  Trash2, Database, AlertTriangle, RefreshCw, Shield, FileText,
  MessageSquare, Bell, Key, Smartphone, CheckCircle
} from "lucide-react";

const TABLE_ICONS = {
  reports: FileText,
  referral_cases: Shield,
  counselor_notes: Database,
  sms_sessions: Smartphone,
  notifications: Bell,
  otp_codes: Key,
  password_reset_tokens: Key,
};

const TABLE_LABELS = {
  reports: "Reports",
  referral_cases: "Referral Cases",
  counselor_notes: "Counselor Notes",
  sms_sessions: "SMS Sessions",
  notifications: "Notifications",
  otp_codes: "OTP Codes",
  password_reset_tokens: "Reset Tokens",
};

export default function AdminPanel() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [retentionStats, setRetentionStats] = useState(null);
  const [retentionLoading, setRetentionLoading] = useState(true);
  const [purging, setPurging] = useState(false);
  const [purgeResult, setPurgeResult] = useState(null);
  const { t } = useAccessibility();

  async function loadCounselors() {
    setLoading(true);
    try {
      const data = await getCounselors();
      setCounselors(data);
    } catch (err) {
      console.error("Failed to load counselors:", err);
    } finally {
      setLoading(false);
    }
  }

  async function loadRetentionStats() {
    setRetentionLoading(true);
    try {
      const data = await getRetentionStats();
      setRetentionStats(data);
    } catch (err) {
      console.error("Failed to load retention stats:", err);
    } finally {
      setRetentionLoading(false);
    }
  }

  useEffect(() => {
    loadCounselors();
    loadRetentionStats();
  }, []);

  async function handleApprove(id) {
    try {
      await approveCounselor(id);
      loadCounselors();
    } catch (err) {
      console.error("Failed to approve counselor:", err);
    }
  }

  async function handlePurge() {
    if (!window.confirm("Delete all expired data? This cannot be undone.")) return;
    setPurging(true);
    setPurgeResult(null);
    try {
      const result = await triggerRetentionPurge();
      setPurgeResult(result.summary);
      await loadRetentionStats();
    } catch (err) {
      console.error("Purge failed:", err);
    } finally {
      setPurging(false);
    }
  }

  const pending = counselors.filter((c) => !c.is_approved);
  const approved = counselors.filter((c) => c.is_approved);

  return (
    <div className="min-h-[calc(100vh-56px)] bg-cloud">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <Settings size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">Admin Panel</h1>
          </div>
          <p className="text-emerald-100 ml-12">
            Manage counselor accounts, approvals, and data retention
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Pending Approvals */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <Clock size={20} className="text-amber-600" />
            <h2 className="text-xl font-bold text-navy">Pending Approval ({pending.length})</h2>
          </div>
          {loading ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-soft">
              <Loader2 className="animate-spin h-6 w-6 mx-auto text-slate-gray" />
              <p className="text-slate-gray mt-3">Loading...</p>
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-soft p-12 text-center shadow-sm">
              <div className="bg-emerald-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <CheckCircle2 size={32} className="text-emerald-600" />
              </div>
              <p className="text-navy font-semibold text-lg">All caught up!</p>
              <p className="text-sm text-slate-gray mt-1">No pending counselor approvals.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {pending.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <div className="bg-amber-100 p-2 rounded-lg">
                          <Clock size={16} className="text-amber-600" />
                        </div>
                        <h3 className="font-semibold text-navy">{c.full_name}</h3>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-gray ml-11">
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-[#2E7D32]" />
                          {c.email}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Calendar size={14} className="text-[#2E7D32]" />
                          {new Date(c.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => handleApprove(c.id)}
                      className="bg-[#2E7D32] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B5E20] transition-all flex items-center gap-2"
                    >
                      <UserCheck size={16} />
                      Approve
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Approved Counselors */}
        <div className="mb-8">
          <div className="flex items-center gap-2 mb-4">
            <UserCheck size={20} className="text-emerald-600" />
            <h2 className="text-xl font-bold text-navy">Approved Counselors ({approved.length})</h2>
          </div>
          {approved.length === 0 ? (
            <div className="bg-white rounded-2xl border border-soft p-8 text-center shadow-sm">
              <p className="text-sm text-slate-gray">No approved counselors yet.</p>
            </div>
          ) : (
            <div className="grid gap-4">
              {approved.map((c) => (
                <div key={c.id} className="bg-white rounded-2xl border border-soft p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="bg-emerald-100 p-2 rounded-lg">
                      <CheckCircle2 size={16} className="text-emerald-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="font-semibold text-navy">{c.full_name}</h3>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-gray">
                        <span className="flex items-center gap-1.5">
                          <Mail size={14} className="text-[#2E7D32]" />
                          {c.email}
                        </span>
                      </div>
                    </div>
                    <span className="bg-emerald-100 text-emerald-700 px-3 py-1 rounded-full text-xs font-medium">
                      Approved
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ── Data Retention Panel ── */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Trash2 size={20} className="text-red-600" />
            <h2 className="text-xl font-bold text-navy">Data Retention</h2>
          </div>

          {retentionLoading ? (
            <div className="text-center py-12 bg-white rounded-2xl border border-soft">
              <Loader2 className="animate-spin h-6 w-6 mx-auto text-slate-gray" />
              <p className="text-slate-gray mt-3">Loading retention data...</p>
            </div>
          ) : !retentionStats ? (
            <div className="bg-white rounded-2xl border border-soft p-8 text-center shadow-sm">
              <AlertTriangle size={32} className="mx-auto text-amber-500 mb-3" />
              <p className="text-navy font-semibold">Could not load retention stats</p>
            </div>
          ) : (
            <>
              {/* Retention policy card */}
              <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200 p-5 mb-4 shadow-sm">
                <div className="flex items-start gap-3">
                  <div className="bg-amber-100 p-2 rounded-lg mt-0.5">
                    <AlertTriangle size={18} className="text-amber-600" />
                  </div>
                  <div>
                    <p className="font-semibold text-navy mb-1">Retention Policy</p>
                    <p className="text-sm text-slate-gray">
                      Child data is auto-deleted after <strong>{retentionStats.retentionDays} days</strong>.
                      OTP codes expire after 1 day, password reset tokens after 7 days.
                    </p>
                  </div>
                </div>
              </div>

              {/* Stats grid */}
              <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
                {Object.entries(retentionStats.tables).map(([key, val]) => {
                  const Icon = TABLE_ICONS[key] || Database;
                  const hasExpired = val.expired > 0;
                  return (
                    <div
                      key={key}
                      className={`bg-white rounded-2xl border p-4 shadow-sm ${hasExpired ? "border-amber-200" : "border-soft"}`}
                    >
                      <div className="flex items-center gap-2.5 mb-2">
                        <div className={`p-1.5 rounded-lg ${hasExpired ? "bg-amber-100" : "bg-gray-100"}`}>
                          <Icon size={16} className={hasExpired ? "text-amber-600" : "text-gray-400"} />
                        </div>
                        <p className="text-xs font-medium text-slate-gray truncate">{TABLE_LABELS[key]}</p>
                      </div>
                      <div className="flex items-baseline gap-2">
                        <span className="text-2xl font-bold text-navy">{val.total}</span>
                        {val.expired > 0 && (
                          <span className="text-xs font-medium text-amber-600 bg-amber-100 px-2 py-0.5 rounded-full">
                            {val.expired} expired
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Purge button + result */}
              <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <p className="font-semibold text-navy mb-1">Manual Purge</p>
                    <p className="text-sm text-slate-gray">
                      Immediately delete all data older than the retention period.
                    </p>
                  </div>
                  <button
                    onClick={handlePurge}
                    disabled={purging}
                    className="bg-red-500 text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-red-600 transition-all flex items-center gap-2 disabled:opacity-50"
                  >
                    {purging ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Trash2 size={16} />
                    )}
                    {purging ? "Purging..." : "Purge Now"}
                  </button>
                </div>

                {purgeResult && (
                  <div className="mt-4 bg-emerald-50 rounded-xl border border-emerald-200 p-4">
                    <div className="flex items-center gap-2 mb-2">
                      <CheckCircle size={16} className="text-emerald-600" />
                      <p className="font-semibold text-emerald-800 text-sm">Purge Complete</p>
                    </div>
                    <p className="text-sm text-emerald-700 mb-2">
                      {purgeResult.totalDeleted} total records deleted across{" "}
                      {purgeResult.results.filter((r) => r.deleted > 0).length} tables.
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {purgeResult.results
                        .filter((r) => r.deleted > 0)
                        .map((r) => (
                          <span
                            key={r.table}
                            className="bg-emerald-100 text-emerald-700 text-xs font-medium px-2.5 py-1 rounded-full"
                          >
                            {TABLE_LABELS[r.table] || r.table}: {r.deleted}
                            {r.filesDeleted ? ` + ${r.filesDeleted} files` : ""}
                          </span>
                        ))}
                    </div>
                    <button
                      onClick={loadRetentionStats}
                      className="mt-3 text-xs text-emerald-600 hover:text-emerald-800 font-medium flex items-center gap-1"
                    >
                      <RefreshCw size={12} />
                      Refresh stats
                    </button>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
