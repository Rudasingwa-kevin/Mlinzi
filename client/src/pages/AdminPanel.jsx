import { useState, useEffect } from "react";
import { getCounselors, approveCounselor } from "../services/api";
import PatternDivider from "../components/PatternDivider";

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
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-white mb-2">Admin Panel</h1>
          <p className="text-blue-200">
            Manage counselor accounts and approvals.
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Pending Approvals */}
        <div className="mb-8">
          <h2 className="text-xl font-bold text-navy mb-4">
            Pending Approval ({pending.length})
          </h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="inline-flex items-center gap-3 text-slate-gray">
                <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Loading...
              </div>
            </div>
          ) : pending.length === 0 ? (
            <div className="bg-white rounded-2xl border border-soft p-8 text-center shadow-sm">
              <div className="text-4xl mb-4">✅</div>
              <p className="text-navy font-semibold">All caught up!</p>
              <p className="text-sm text-slate-gray">No pending counselor approvals.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-soft overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-cloud border-b border-soft">
                  <tr>
                    <th className="text-left px-5 py-4 font-semibold text-navy">Name</th>
                    <th className="text-left px-5 py-4 font-semibold text-navy">Email</th>
                    <th className="text-left px-5 py-4 font-semibold text-navy">Registered</th>
                    <th className="text-left px-5 py-4 font-semibold text-navy">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {pending.map((c) => (
                    <tr key={c.id} className="hover:bg-cloud transition-colors">
                      <td className="px-5 py-4 text-navy font-medium">{c.full_name}</td>
                      <td className="px-5 py-4 text-slate-gray">{c.email}</td>
                      <td className="px-5 py-4 text-slate-gray">
                        {new Date(c.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-5 py-4">
                        <button
                          onClick={() => handleApprove(c.id)}
                          className="bg-green text-white px-4 py-2 rounded-2xl text-xs font-medium hover:bg-green-dark transition-all"
                        >
                          Approve
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Approved Counselors */}
        <div>
          <h2 className="text-xl font-bold text-navy mb-4">
            Approved Counselors ({approved.length})
          </h2>
          {approved.length === 0 ? (
            <div className="bg-white rounded-2xl border border-soft p-8 text-center shadow-sm">
              <p className="text-sm text-slate-gray">No approved counselors yet.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-soft overflow-hidden shadow-sm">
              <table className="w-full text-sm">
                <thead className="bg-cloud border-b border-soft">
                  <tr>
                    <th className="text-left px-5 py-4 font-semibold text-navy">Name</th>
                    <th className="text-left px-5 py-4 font-semibold text-navy">Email</th>
                    <th className="text-left px-5 py-4 font-semibold text-navy">Approved</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-soft">
                  {approved.map((c) => (
                    <tr key={c.id} className="hover:bg-cloud transition-colors">
                      <td className="px-5 py-4 text-navy font-medium">{c.full_name}</td>
                      <td className="px-5 py-4 text-slate-gray">{c.email}</td>
                      <td className="px-5 py-4 text-green font-medium">✓ Approved</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
