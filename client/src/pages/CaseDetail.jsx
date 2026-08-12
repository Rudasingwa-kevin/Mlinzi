import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getCaseById, updateCaseStatus, addCaseNote } from "../services/api";
import PatternDivider from "../components/PatternDivider";
import { ArrowLeft, FileText, Heart, Clock, MapPin, MessageSquare, AlertTriangle, CheckCircle, AlertCircle, Info, Search } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";

const severityConfig = {
  low: { bg: "bg-green-50", text: "text-green", label: "Low Risk", icon: CheckCircle },
  medium: { bg: "bg-gold-50", text: "text-gold", label: "Medium Risk", icon: AlertTriangle },
  high: { bg: "bg-red-soft", text: "text-red", label: "High Risk", icon: AlertCircle },
  pending: { bg: "bg-slate-50", text: "text-slate-gray", label: "Analyzing...", icon: Clock },
};

const statusConfig = {
  new: { bg: "bg-blue-100", text: "text-blue-700", label: "New" },
  under_review: { bg: "bg-purple-100", text: "text-purple-700", label: "In Review" },
  resolved: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Resolved" },
};

const contactLabels = {
  phone: "Phone Call",
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "Email",
};

const channelLabels = {
  web: "Web",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

const recommendedActionLabels = {
  guidance_only: { label: "Guidance Only", color: "text-green", bg: "bg-green-50" },
  anonymous_report: { label: "Anonymous Report", color: "text-gold", bg: "bg-gold-50" },
  connect_counselor: { label: "Connect to Counselor", color: "text-blue", bg: "bg-blue-50" },
  emergency_referral: { label: "Emergency Referral", color: "text-red", bg: "bg-red-soft" },
};

export default function CaseDetail() {
  const { id } = useParams();
  const [caseData, setCaseData] = useState(null);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [newNote, setNewNote] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const { t } = useAccessibility();

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
      setCaseData((prev) => ({ ...prev, ...updated.case }));
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
          {t("loadingCase")}
        </div>
      </div>
    );
  }

  if (!caseData) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-blue-50 flex items-center justify-center">
            <Search size={32} className="text-blue" />
          </div>
          <p className="text-navy font-semibold mb-2">{t("caseNotFound")}</p>
          <Link to="/counselor" className="text-blue font-medium hover:text-blue-dark">
            {t("backToDashboard")}
          </Link>
        </div>
      </div>
    );
  }

  const sev = severityConfig[caseData.severity] || { bg: "bg-cloud", text: "text-slate-gray", label: caseData.severity, icon: Info };
  const SevIcon = sev.icon;
  const recAction = recommendedActionLabels[caseData.recommended_action] || recommendedActionLabels.guidance_only;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-4xl mx-auto">
          <Link to="/counselor" className="text-blue-200 hover:text-white text-sm mb-4 inline-flex items-center gap-1">
            <ArrowLeft size={14} />
            {t("backToDashboard")}
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">{t("caseNumber")}{caseData.id}</h1>
          <div className="flex flex-wrap items-center gap-3 text-blue-200 text-sm">
            <span className="flex items-center gap-1">
              <MapPin size={14} />
              {caseData.district}
            </span>
            <span>•</span>
            <span>{new Date(caseData.created_at).toLocaleDateString()}</span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <MessageSquare size={14} />
              {channelLabels[caseData.channel] || "Web"}
            </span>
          </div>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="grid md:grid-cols-3 gap-6">
          {/* Left column - Case info */}
          <div className="md:col-span-2 space-y-6">
            {/* Category, Severity & Confidence */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">{t("reportDetails")}</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("category")}</p>
                  <p className="text-navy font-semibold text-sm">{caseData.category}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("severity")}</p>
                  <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                    <SevIcon size={12} />
                    {sev.label}
                  </span>
                </div>
                {caseData.confidence != null && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("confidence")}</p>
                    <p className="text-navy font-semibold">{caseData.confidence}%</p>
                  </div>
                )}
                {caseData.recommended_action && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("recommended")}</p>
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-medium ${recAction.bg} ${recAction.color}`}>
                      {recAction.label}
                    </span>
                  </div>
                )}
              </div>
            </div>

            {/* AI Guidance */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center">
                  <Heart size={16} className="text-blue" />
                </div>
                <h2 className="font-semibold text-navy">{t("aiGuidance")}</h2>
              </div>
              <p className="text-slate-gray leading-relaxed">{caseData.guidance}</p>
            </div>

            {/* Extracted Text */}
            {caseData.extracted_text && (
              <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-4">
                  <FileText size={16} className="text-slate-gray" />
                  <h2 className="font-semibold text-navy">{t("extractedText")}</h2>
                </div>
                <p className="text-sm text-charcoal italic bg-cloud p-4 rounded-xl border border-soft whitespace-pre-wrap">
                  "{caseData.extracted_text}"
                </p>
              </div>
            )}

            {/* Screenshot */}
            {caseData.screenshot_path && (
              <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
                <h2 className="font-semibold text-navy mb-4">{t("screenshot")}</h2>
                <img
                  src={caseData.screenshot_path}
                  alt={t("screenshot")}
                  className="rounded-xl max-h-64 border border-soft"
                />
              </div>
            )}

            {/* Notes */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">{t("followUpNotes")}</h2>

              <form onSubmit={handleAddNote} className="mb-6">
                <textarea
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  placeholder={t("addNotePlaceholder")}
                  className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-blue/20 outline-none transition-all resize-none"
                  rows={3}
                  aria-label={t("addNotePlaceholder")}
                />
                <button
                  type="submit"
                  disabled={submitting || !newNote.trim()}
                  className="mt-2 bg-blue text-white px-5 py-2.5 rounded-2xl text-sm font-medium hover:bg-blue-dark transition-all duration-200 shadow-sm disabled:opacity-50"
                  aria-label={t("addNote")}
                >
                  {submitting ? t("adding") : t("addNote")}
                </button>
              </form>

              {notes.length === 0 ? (
                <p className="text-sm text-slate-gray text-center py-4">{t("noNotesYet")}</p>
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
              <h2 className="font-semibold text-navy mb-4">{t("underReview")}</h2>
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
                      aria-label={`Set status to ${config.label}`}
                      aria-pressed={caseData.status === s}
                    >
                      {config.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <h2 className="font-semibold text-navy mb-4">{t("contactInformation")}</h2>
              <div className="space-y-3">
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("district")}</p>
                  <p className="text-navy font-medium">{caseData.district}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("preferredContactLabel")}</p>
                  <p className="text-navy font-medium">{contactLabels[caseData.preferred_contact]}</p>
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("contactDetails")}</p>
                  <p className="text-navy font-medium">{caseData.contact_value}</p>
                </div>
                {caseData.best_time && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("bestTime")}</p>
                    <p className="text-navy font-medium">{caseData.best_time}</p>
                  </div>
                )}
                {caseData.is_safe && (
                  <div>
                    <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">{t("currentlySafe")}</p>
                    <p className="text-navy font-medium">{caseData.is_safe}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Timeline */}
            <div className="bg-white rounded-2xl border border-soft p-6 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Clock size={16} className="text-slate-gray" />
                <h2 className="font-semibold text-navy">{t("timeline")}</h2>
              </div>
              <div className="relative ml-3 border-l-2 border-soft pl-6 space-y-4">
                <TimelineItem
                  label={t("submitted")}
                  time={caseData.created_at}
                  color="bg-blue"
                  active
                />
                <TimelineItem
                  label={t("aiAnalyzed")}
                  time={caseData.created_at}
                  color="bg-green"
                  active
                />
                {caseData.assigned_counselor_id && (
                  <TimelineItem
                    label={t("counselorAssigned")}
                    time={caseData.created_at}
                    color="bg-purple"
                    active
                  />
                )}
                {caseData.first_response_at && (
                  <TimelineItem
                    label={t("firstResponse")}
                    time={caseData.first_response_at}
                    color="bg-gold"
                    active
                  />
                )}
                {caseData.status === "under_review" && (
                  <TimelineItem
                    label={t("underReview")}
                    time={new Date()}
                    color="bg-purple"
                    active
                  />
                )}
                {caseData.resolved_at && (
                  <TimelineItem
                    label={t("resolved")}
                    time={caseData.resolved_at}
                    color="bg-green"
                    active
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function TimelineItem({ label, time, color, active }) {
  return (
    <div className="relative">
      <div className={`absolute -left-[29px] top-1 w-3 h-3 rounded-full ${color} ${active ? "" : "opacity-40"}`} />
      <p className={`text-sm font-medium ${active ? "text-navy" : "text-slate-gray"}`}>{label}</p>
      <p className="text-xs text-slate-gray">{new Date(time).toLocaleString()}</p>
    </div>
  );
}
