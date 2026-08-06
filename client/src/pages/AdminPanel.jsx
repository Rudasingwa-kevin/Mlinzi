import { useState, useEffect } from "react";
import { getCounselors, approveCounselor } from "../services/api";
import PatternDivider from "../components/PatternDivider";
import { Loader2, Settings, CheckCircle2, Clock, UserCheck, Mail, Calendar } from "lucide-react";

export default function AdminPanel() {
  const [counselors, setCounselors] = useState([]);
  const [loading, setLoading] = useState(true);

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

  useEffect(() => {
    loadCounselors();
  }, []);

  async function handleApprove(id) {
    try {
      await approveCounselor(id);
      loadCounselors();
    } catch (err) {
      console.error("Failed to approve counselor:", err);
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
            Manage counselor accounts and approvals
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
        <div>
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
      </div>
    </div>
  );
}
