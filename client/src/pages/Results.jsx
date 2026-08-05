import { useLocation, Link } from "react-router-dom";
import PatternDivider from "../components/PatternDivider";

const severityConfig = {
  low: {
    bg: "bg-green-50",
    border: "border-green",
    text: "text-green",
    label: "Low Risk",
    icon: "✅",
    message: "This message appears to be safe. You are doing great!",
  },
  medium: {
    bg: "bg-gold-50",
    border: "border-gold",
    text: "text-gold",
    label: "Medium Risk",
    icon: "⚠️",
    message: "This message may need attention. Let's protect you together.",
  },
  high: {
    bg: "bg-red-soft",
    border: "border-red",
    text: "text-red",
    label: "High Risk",
    icon: "🚨",
    message: "This message may be unsafe. Let's protect you together.",
  },
  pending: {
    bg: "bg-slate-50",
    border: "border-soft",
    text: "text-slate-gray",
    label: "Analyzing...",
    icon: "🔍",
    message: "Our AI is reviewing your report.",
  },
};

export default function Results() {
  const { state } = useLocation();
  const report = state?.report;

  if (!report) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="text-center">
          <div className="text-4xl mb-4">🔍</div>
          <p className="text-navy font-semibold mb-2">No report data found</p>
          <p className="text-slate-gray text-sm mb-4">
            Upload a screenshot to get started.
          </p>
          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-blue text-white font-semibold px-6 py-3 rounded-2xl hover:bg-blue-dark transition-all duration-200"
          >
            <span>🛡️</span>
            Report Abuse
          </Link>
        </div>
      </div>
    );
  }

  const sev = severityConfig[report.severity] || severityConfig.pending;

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
            <span className="text-4xl">{sev.icon}</span>
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
            <span className="text-xl">🤖</span>
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
            <span className="text-xl">💙</span>
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
            <p className="text-xs font-medium text-slate-gray uppercase tracking-wide mb-2">
              Extracted Text
            </p>
            <p className="text-sm text-charcoal italic whitespace-pre-wrap bg-white p-4 rounded-xl border border-soft">
              "{report.extracted_text}"
            </p>
          </div>
        )}

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3 animate-fade-in-up" style={{ animationDelay: "0.4s" }}>
          <Link
            to="/report"
            className="flex-1 text-center bg-blue text-white font-semibold py-4 rounded-2xl hover:bg-blue-dark transition-all duration-200 shadow-md hover:shadow-lg flex items-center justify-center gap-2"
          >
            <span className="text-lg">🛡️</span>
            Report Another
          </Link>
          <Link
            to="/"
            className="flex-1 text-center bg-white border border-navy text-navy font-semibold py-4 rounded-2xl hover:bg-cloud transition-all duration-200 flex items-center justify-center gap-2"
          >
            <span className="text-lg">🏠</span>
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
