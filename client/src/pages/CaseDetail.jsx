import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCaseById, updateCaseStatus, addCaseNote } from "../services/api";
import PatternDivider from "../components/PatternDivider";

const severityConfig = {
  low: { bg: "bg-green-50", text: "text-green", label: "Low Risk" },
  medium: { bg: "bg-yellow-50", text: "text-gold", label: "Medium Risk" },
  high: { bg: "bg-red-soft", text: "text-red", label: "High Risk" },
};

const contactLabels = {
  phone: "Phone Call",
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "Email",
};

export default function CaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    async function loadCase() {
      try {
        const data = await getCaseById(id);
        setCaseData(data.case);
        setNotes(data.notes);
      } catch (err) {
        console.error("Failed to load case:", err);
      } finally {
        setLoading(false);
      }
    }
    loadCase();
  }, [id]);

  async function handleStatusChange(newStatus) {
    try {
      const updated = await updateCaseStatus(id, newStatus);
      setCaseData(updated);
    } catch (err) {
      console.error("Failed to update status:", err);
    }
  }

  async function handleAddNote(e) {
    e.preventDefault();
    if (!newNote.trim()) return;

    setSubmitting(true);
    try {
      const note = await addCaseNote(id, newNote);
      setNotes((prev) => [note, ...prev]);
      setNewNote("");
    } catch (err) {
      console.error("Failed to add note:", err);
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="inline-flex items-center gap-3 text-slate-gray">
          <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
          Loading case...
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-navy font-semibold mb-2">Case not found</p>
          <Link to="/counselor" className="text-blue font-medium hover:text-blue-dark">
            Back to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  const sev = severityConfig[caseData.severity] || { bg: "bg-cloud", text: "text-slate-gray", label: caseData.severity };

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/counselor" className="text-blue-200 hover:text-white text-sm mb-4 inline-block">
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">Case #{caseData.id}</h1>
          <p className="text-blue-200">
            {caseData.district} • {new Date(caseData.created_at).toLocaleDateString()}
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column - Case info */}
          <div className="md:col-span-2 space-y-6">
            {/* Category & Severity */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Report Details</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Category</p>
                  <p className="text-navy font-semibold">{caseData.category}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Severity</p>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                    {sev.label}
                  </span>
                </div>
              </div>
            </div>

            {/* AI Guidance */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">AI Guidance</h2>
              <p className="text-slate-gray leading-relaxed">{caseData.guidance}</p>
            </div>

            {/* Extracted Text */}
            {caseData.extracted_text && (
              <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
                <h2 className="font-semibold text-navy mb-4">Extracted Text</h2>
                <p className="text-sm text-charcoal italic bg-cloud p-4 rounded-xl border border-soft whitespace-pre-wrap">
                  "{caseData.extracted_text}"
                </p>
              </div>
            )}

            {/* Screenshot */}
            {caseData.screenshot_path && (
              <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
                <h2 className="font-semibold text-navy mb-4">Screenshot</h2>
                <img
                  src={caseData.screenshot_path}
                  alt="Screenshot"
                  className="rounded-xl max-h-64 border border-soft"
                />
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Follow-up Notes</h2>

              {/* Add note form */}
              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder="Add a note about this case..."
                  className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all resize-none"
                  rows={3}
                />
                <button
                  type="submit"
                  disabled={submitting || !newNote.trim()}
                  className="mt-2 bg-blue text-white px-5 py-2.5 rounded-2xl text-sm font-medium hover:bg-blue-dark transition-all duration-200 shadow-sm disabled:opacity-50"
                >
                  {submitting ? "Adding..." : "Add Note"}
                </button>
              </form>

              {/* Notes list */}
              {notes.length === 0 ? (
                <p className="text-sm text-slate-gray text-center py-4">No notes yet</p>
              ) : (
                <div className="space-y-4">
                  {notes.map((note) => (
                    <div key={note.id} className="bg-cloud rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-navy">{note.counselor_name}</span>
                        <span className="text-xs text-slate-gray">
                          {new Date(note.created_at).toLocaleString()}
                        </span>
                      </div>
                      <p className="text-sm text-charcoal">{note.note}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right column - Status & Contact */}
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Status</h2>
              <div className="space-y-2">
                {["new", "under_review", "resolved"].map((s) => {
                  const config = statusConfig[s];
                  return (
                    <button
                      key={s}
                      onClick={() => handleStatusChange(s)}
                      disabled={caseData.status === s}
                      className={`w-full px-4 py-3 rounded-2xl text-sm font-medium transition-all ${
                        caseData.status === s
                          ? `${config.bg} ${config.text} cursor-not-allowed opacity-60`
                          : "bg-cloud text-slate-gray hover:bg-soft"
                      }`}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">District</p>
                  <p className="text-navy font-medium">{caseData.district}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Preferred Contact</p>
                  <p className="text-navy font-medium">{contactLabels[caseData.preferred_contact]}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Contact Details</p>
                  <p className="text-navy font-medium">{caseData.contact_value}</p>
                </div>
                {caseData.best_time && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Best Time</p>
                    <p className="text-navy font-medium">{caseData.best_time}</p>
                  </div>
                )}
                {caseData.is_safe && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Currently Safe?</p>
                    <p className="text-navy font-medium">{caseData.is_safe}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">Timeline</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Created</p>
                  <p className="text-navy text-sm">{new Date(caseData.created_at).toLocaleString()}</p>
                </div>
                {caseData.first_response_at && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">First Response</p>
                    <p className="text-navy text-sm">{new Date(caseData.first_response_at).toLocaleString()}</p>
                  </div>
                )}
                {caseData.resolved_at && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">Resolved</p>
                    <p className="text-navy text-sm">{new Date(caseData.resolved_at).toLocaleString()}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
