import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { getCounselorCases, getUnassignedCases, claimCase } from "../services/api";
import { useAccessibility } from "../context/AccessibilityContext";
import PatternDivider from "../components/PatternDivider";
import { Loader2, ClipboardList, RefreshCw, Users, AlertCircle, Clock, MapPin, Phone, Eye, Hand, MessageSquare } from "lucide-react";

const severityConfig = {
  low: { bg: "bg-emerald-100", text: "text-emerald-700", dot: "bg-emerald-500", label: "Low" },
  medium: { bg: "bg-amber-100", text: "text-amber-700", dot: "bg-amber-500", label: "Medium" },
  high: { bg: "bg-red-100", text: "text-red-700", dot: "bg-red-500", label: "High" },
};

const statusConfig = {
  new: { bg: "bg-blue-100", text: "text-blue-700", label: "New" },
  under_review: { bg: "bg-purple-100", text: "text-purple-700", label: "In Review" },
  resolved: { bg: "bg-emerald-100", text: "text-emerald-700", label: "Resolved" },
};

const contactLabels = {
  phone: "Phone",
  sms: "SMS",
  whatsapp: "WhatsApp",
  email: "Email",
};

const channelLabels = {
  web: "Web",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

const channelColors = {
  web: "bg-blue-100 text-blue-700",
  sms: "bg-emerald-100 text-emerald-700",
  whatsapp: "bg-purple-100 text-purple-700",
};

export default function CounselorDashboard() {
  const [myCases, setMyCases] = useState([]);
  const [unassignedCases, setUnassignedCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: "" });
  const [activeTab, setActiveTab] = useState("my-cases");
  const { t } = useAccessibility();

  async function loadCases() {
    setLoading(true);
    try {
      const [my, unassigned] = await Promise.all([
        getCounselorCases(filters),
        getUnassignedCases(filters),
      ]);
      setMyCases(my);
      setUnassignedCases(unassigned);
    } catch (err) {
      console.error("Failed to load cases:", err);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadCases();
  }, [filters]);

  async function handleClaimCase(caseId) {
    try {
      await claimCase(caseId);
      loadCases();
    } catch (err) {
      console.error("Failed to claim case:", err);
    }
  }

  const activeCases = activeTab === "my-cases" ? myCases : unassignedCases;
  const newCount = myCases.filter((c) => c.status === "new").length;
  const reviewCount = myCases.filter((c) => c.status === "under_review").length;

  return (
    <div className="min-h-[calc(100vh-56px)] bg-cloud">
      {/* Header */}
      <section className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#1B5E20] py-12 px-4">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-white/20 p-2 rounded-xl">
              <Users size={24} className="text-white" />
            </div>
            <h1 className="text-3xl font-bold text-white">{t("counselorDashboard")}</h1>
          </div>
          <p className="text-emerald-100 ml-12">
            Manage referrals and support children in need
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-6xl mx-auto py-8 px-4">
        {/* Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 -mt-6">
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-blue-100 p-2.5 rounded-xl">
                <ClipboardList size={20} className="text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{myCases.length}</p>
                <p className="text-xs text-slate-gray">{t("myCases")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-emerald-100 p-2.5 rounded-xl">
                <AlertCircle size={20} className="text-emerald-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{newCount}</p>
                <p className="text-xs text-slate-gray">{t("newCases")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-purple-100 p-2.5 rounded-xl">
                <Clock size={20} className="text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{reviewCount}</p>
                <p className="text-xs text-slate-gray">{t("inReview")}</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-2xl border border-soft p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-center gap-3">
              <div className="bg-amber-100 p-2.5 rounded-xl">
                <Hand size={20} className="text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-bold text-navy">{unassignedCases.length}</p>
                <p className="text-xs text-slate-gray">{t("unclaimed")}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("my-cases")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "my-cases"
                ? "bg-[#2E7D32] text-white shadow-md"
                : "bg-white text-slate-gray hover:bg-cloud border border-soft"
            }`}
          >
            {t("myCases")} ({myCases.length})
          </button>
          <button
            onClick={() => setActiveTab("unassigned")}
            className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all ${
              activeTab === "unassigned"
                ? "bg-[#2E7D32] text-white shadow-md"
                : "bg-white text-slate-gray hover:bg-cloud border border-soft"
            }`}
          >
            {t("unclaimed")} ({unassignedCases.length})
          </button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 mb-6">
          <select
            value={filters.status}
            onChange={(e) => setFilters((f) => ({ ...f, status: e.target.value }))}
            className="border border-soft rounded-xl px-4 py-2.5 text-sm bg-white focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-all"
          >
            <option value="">All Statuses</option>
            <option value="new">New</option>
            <option value="under_review">Under Review</option>
            <option value="resolved">Resolved</option>
          </select>
          <button
            onClick={loadCases}
            className="bg-white border border-soft text-navy px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-cloud transition-all duration-200 shadow-sm flex items-center gap-2"
          >
            <RefreshCw size={14} />
            Refresh
          </button>
        </div>

        {/* Cases */}
        {loading ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center gap-3 text-slate-gray">
              <Loader2 className="animate-spin h-6 w-6" />
              Loading cases...
            </div>
          </div>
        ) : activeCases.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-soft">
            <ClipboardList size={56} className="mx-auto text-soft mb-4" />
            <p className="text-navy font-semibold text-lg">No cases found</p>
            <p className="text-sm text-slate-gray mt-1">
              {activeTab === "my-cases"
                ? "You don't have any assigned cases yet."
                : "All cases have been claimed."}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {activeCases.map((c) => {
              const sev = severityConfig[c.severity] || { bg: "bg-gray-100", text: "text-gray-700", dot: "bg-gray-500", label: c.severity };
              const stat = statusConfig[c.status] || { bg: "bg-gray-100", text: "text-gray-700", label: c.status };
              return (
                <div key={c.id} className="bg-white rounded-2xl border border-soft p-5 hover:shadow-md transition-all">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3">
                        <span className="font-mono text-sm text-slate-gray bg-cloud px-2 py-1 rounded-lg">#{c.id}</span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${sev.bg} ${sev.text}`}>
                          <span className={`inline-block w-1.5 h-1.5 rounded-full ${sev.dot} mr-1.5`}></span>
                          {sev.label}
                        </span>
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${stat.bg} ${stat.text}`}>
                          {stat.label}
                        </span>
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-slate-gray">
                        <span className="flex items-center gap-1.5">
                          <MapPin size={14} className="text-[#2E7D32]" />
                          {c.district}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <AlertCircle size={14} className="text-[#2E7D32]" />
                          {c.category}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Phone size={14} className="text-[#2E7D32]" />
                          {contactLabels[c.preferred_contact]}
                        </span>
                        {c.channel && (
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${channelColors[c.channel] || "bg-gray-100 text-gray-700"}`}>
                            <MessageSquare size={10} className="inline mr-1" />
                            {channelLabels[c.channel] || c.channel}
                          </span>
                        )}
                      </div>
                    </div>
                    <div>
                      {activeTab === "unassigned" ? (
                        <button
                          onClick={() => handleClaimCase(c.id)}
                          className="bg-[#2E7D32] text-white px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-[#1B5E20] transition-all flex items-center gap-2"
                        >
                          <Hand size={16} />
                          Claim
                        </button>
                      ) : (
                        <Link
                          to={`/counselor/${c.id}`}
                          className="bg-cloud text-navy px-5 py-2.5 rounded-xl text-sm font-medium hover:bg-soft transition-all flex items-center gap-2 border border-soft"
                        >
                          <Eye size={16} />
                          View Details
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
