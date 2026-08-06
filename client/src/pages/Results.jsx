import { useState, useEffect } from "react";
import { useLocation, Link, useNavigate } from "react-router-dom";
import { Search, CheckCircle, AlertTriangle, AlertCircle, Bot, Heart, FileText, Home, Shield, HandHelping } from "lucide-react";
import { getDistricts, escalateReport } from "../services/api";
import PatternDivider from "../components/PatternDivider";

const severityConfig = {
  low: {
    bg: "bg-green-50",
    border: "border-green",
    text: "text-green",
    label: "Low Risk",
    icon: CheckCircle,
    message: "This message appears to be safe. You are doing great!",
  },
  medium: {
    bg: "bg-gold-50",
    border: "border-gold",
    text: "text-gold",
    label: "Medium Risk",
    icon: AlertTriangle,
    message: "This message may need attention. Let's protect you together.",
  },
  high: {
    bg: "bg-red-soft",
    border: "border-red",
    text: "text-red",
    label: "High Risk",
    icon: AlertCircle,
    message: "This message may be unsafe. Let's protect you together.",
  },
  pending: {
    bg: "bg-slate-50",
    border: "border-soft",
    text: "text-slate-gray",
    label: "Analyzing...",
    icon: Search,
    message: "Our AI is reviewing your report.",
  },
};

export default function Results() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const report = state?.report;
  const [showEscalation, setShowEscalation] = useState(false);

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-green-50 flex items-center justify-center">
            <Search size={32} className="text-blue" />
          </div>
          <p className="text-navy font-semibold mb-2">No report data found</p>
          <p className="text-slate-gray text-sm mb-4">
            Upload a screenshot to get started.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-blue text-white font-semibold px-6 py-3 rounded-2xl hover:bg-blue-dark transition-all duration-200"
          >
            <Shield size={18} />
            Report Abuse
          </Link>
        </div>
      </div>
    );
  }

  const sev = severityConfig[report.severity] || severityConfig.pending;
  const SeverityIcon = sev.icon;

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Header */}
      <section className="bg-navy py-10 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Analysis Results</h1>
          <p className="text-blue-200">
            Our AI has reviewed the screenshot. Here is what we found.
          </p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-2xl mx-auto py-10 px-4">
        {/* Severity Banner */}
        <div
          className={`${sev.bg} border ${sev.border} rounded-2xl p-6 mb-6 animate-fade-in-up`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-white/80 flex items-center justify-center">
              <SeverityIcon size={24} className={sev.text} />
            </div>
            <div>
              <p className={`text-sm font-medium ${sev.text} uppercase tracking-wide`}>
                Risk Level
              </p>
              <p className="text-2xl font-bold text-navy">{sev.label}</p>
              <p className="text-sm text-slate-gray mt-1">{sev.message}</p>
            </div>
          </div>
        </div>

        {/* AI Message Card */}
        <div className="ai-card mb-6 animate-fade-in-up" style={{ animationDelay: "0.1s" }}>
          <div className="flex items-start gap-3 mb-4">
            <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
              <Bot size={16} className="text-blue" />
            </div>
            <div>
              <p className="font-semibold text-navy">Mlinzi AI Analysis</p>
              <p className="text-sm text-slate-gray">What we found in the message</p>
            </div>
          </div>

          <div className="ml-8">
            <div className="mb-3">
              <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-1">
                Category
              </p>
              <p className="text-lg font-semibold text-navy">{report.category}</p>
            </div>
          </div>
        </div>

        {/* Guidance Card */}
        <div className="bg-white border border-soft rounded-2xl p-6 mb-6 shadow-sm animate-fade-in-up" style={{ animationDelay: "0.2s" }}>
          <div className="flex items-start gap-3 mb-3">
            <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
              <Heart size={16} className="text-blue" />
            </div>
            <div>
              <p className="font-semibold text-navy">
                What You Should Do
              </p>
              <p className="text-slate-gray leading-relaxed mt-2">
                {report.guidance}
              </p>
            </div>
          </div>
        </div>

        {/* Extracted Text */}
        {report.extracted_text && (
          <div className="bg-cloud rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "0.3s" }}>
            <div className="flex items-center gap-2 mb-2">
              <FileText size={14} className="text-slate-gray" />
              <p className="text-xs font-medium text-slate-gray uppercase tracking-wide">
                Extracted Text
              </p>
            </div>
            <p className="text-sm text-charcoal italic whitespace-pre-wrap bg-white p-4 rounded-xl border border-soft">
              "{report.extracted_text}"
            </p>
          </div>
        )}

        {/* Escalation Prompt */}
        {!showEscalation ? (
          <div className="bg-green-50 border border-green/10 rounded-2xl p-6 mb-6 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
            <div className="flex items-start gap-3 mb-4">
              <div className="w-8 h-8 rounded-lg bg-green/10 flex items-center justify-center flex-shrink-0">
                <HandHelping size={16} className="text-blue" />
              </div>
              <div>
                <p className="font-semibold text-navy">
                  Would you like help from a trained child protection counselor?
                </p>
                <p className="text-sm text-slate-gray mt-1">
                  You can stay anonymous or connect with someone who can help.
                </p>
              </div>
            </div>
            <div className="flex flex-col sm:flex-row gap-3 mt-4">
              <button
                onClick={() => {
                  localStorage.setItem(`report_${report.id}_anonymous`, "true");
                  navigate("/");
                }}
                className="flex-1 bg-white border border-soft text-navy font-medium py-3 rounded-2xl hover:bg-cloud transition-all duration-200"
              >
                Keep this anonymous
              </button>
              <button
                onClick={() => setShowEscalation(true)}
                className="flex-1 bg-blue text-white font-medium py-3 rounded-2xl hover:bg-blue-dark transition-all duration-200 shadow-md"
              >
                Connect me to a counselor
              </button>
            </div>
          </div>
        ) : (
          <ReferralForm reportId={report.id} />
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "0.5s" }}>
          <Link
            to="/report"
            className="flex-1 text-center bg-blue text-white font-semibold py-4 rounded-2xl hover:bg-blue-dark transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <Shield size={18} />
            Report Another
          </Link>
          <Link
            to="/"
            className="flex-1 text-center bg-white border border-navy text-navy font-semibold py-4 rounded-2xl hover:bg-cloud transition-all duration-200 flex items-center justify-center gap-2"
          >
            <Home size={18} />
            Back to Home
          </Link>
        </div>

        {/* Reassurance */}
        <div className="mt-8 text-center">
          <p className="text-sm text-slate-gray">
            Thank you for speaking up. Your report helps protect other children too.
          </p>
        </div>
      </div>
    </div>
  );
}

function ReferralForm({ reportId }) {
  const navigate = useNavigate();
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({
    district: "",
    preferredContact: "phone",
    contactValue: "",
    bestTime: "",
    isSafe: "",
  });

  useEffect(() => {
    getDistricts()
      .then(setDistricts)
      .catch(() => setDistricts([]));
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.district || !form.contactValue) {
      setError("Please fill in all required fields");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      await escalateReport({ reportId, ...form });
      navigate("/refer/success");
    } catch (err) {
      setError(err.response?.data?.error || "Failed to submit referral");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white border border-green/20 rounded-2xl p-6 mb-6 animate-fade-in-up">
      <div className="flex items-start gap-3 mb-4">
        <span className="text-xl">📋</span>
        <div>
          <p className="font-semibold text-navy">Connect with a Counselor</p>
          <p className="text-sm text-slate-gray">
            We only collect the minimum information needed to help you.
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-soft/50 border border-red/20 text-red px-4 py-3 rounded-xl mb-4 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4 mt-4">
        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            District <span className="text-red">*</span>
          </label>
          <select
            required
            value={form.district}
            onChange={(e) => setForm({ ...form, district: e.target.value })}
            className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-blue/20 outline-none transition-all bg-white"
          >
            <option value="">Select your district</option>
            {districts.map((d) => (
              <option key={d} value={d}>{d}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Preferred contact method <span className="text-red">*</span>
          </label>
          <select
            value={form.preferredContact}
            onChange={(e) => setForm({ ...form, preferredContact: e.target.value })}
            className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-blue/20 outline-none transition-all bg-white"
          >
            <option value="phone">Phone call</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="email">Email</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            {form.preferredContact === "email" ? "Email" : "Phone/WhatsApp number"} <span className="text-red">*</span>
          </label>
          <input
            type={form.preferredContact === "email" ? "email" : "tel"}
            required
            value={form.contactValue}
            onChange={(e) => setForm({ ...form, contactValue: e.target.value })}
            className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-blue/20 outline-none transition-all"
            placeholder={form.preferredContact === "email" ? "you@example.com" : "+250 7XX XXX XXX"}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Best time to contact
          </label>
          <input
            type="text"
            value={form.bestTime}
            onChange={(e) => setForm({ ...form, bestTime: e.target.value })}
            className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-blue/20 outline-none transition-all"
            placeholder="e.g., Morning, After school, Anytime"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-navy mb-2">
            Are you currently safe?
          </label>
          <div className="flex gap-3">
            {["Yes", "No", "Not sure"].map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setForm({ ...form, isSafe: option })}
                className={`flex-1 py-2.5 rounded-2xl text-sm font-medium transition-all ${
                  form.isSafe === option
                    ? "bg-blue text-white"
                    : "bg-cloud text-slate-gray hover:bg-soft"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue text-white font-semibold py-3 rounded-2xl hover:bg-blue-dark transition-all duration-200 shadow-md disabled:opacity-50"
        >
          {loading ? "Submitting..." : "Submit Referral"}
        </button>

        <p className="text-xs text-slate-gray text-center">
          Your contact information is encrypted and only shared with your assigned counselor.
        </p>
      </form>
    </div>
  );
}
