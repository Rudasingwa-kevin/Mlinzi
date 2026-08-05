import { useLocation, Link } from "react-router-dom";

const severityConfig = {
  low: { color: "bg-green-100 text-green-800 border-green-200", label: "Low Risk" },
  medium: { color: "bg-yellow-100 text-yellow-800 border-yellow-200", label: "Medium Risk" },
  high: { color: "bg-red-100 text-red-800 border-red-200", label: "High Risk" },
  pending: { color: "bg-slate-100 text-slate-600 border-slate-200", label: "Analyzing..." },
};

export default function Results() {
  const { state } = useLocation();
  const report = state?.report;

  if (!report) {
    return (
      <div className="max-w-2xl mx-auto py-20 px-4 text-center">
        <p className="text-slate-600 mb-4">No report data found.</p>
        <Link to="/report" className="text-blue-600 font-medium hover:underline">
          Upload a screenshot
        </Link>
      </div>
    );
  }

  const sev = severityConfig[report.severity] || severityConfig.pending;

  return (
    <div className="max-w-2xl mx-auto py-12 px-4">
      <h1 className="text-3xl font-bold text-slate-800 mb-2">Analysis Results</h1>
      <p className="text-slate-600 mb-8">
        Our AI has reviewed the screenshot. Here is what we found:
      </p>

      {/* Risk Level Banner */}
      <div className={`border rounded-xl p-6 mb-6 ${sev.color}`}>
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium uppercase tracking-wide">Risk Level</span>
          <span className="text-2xl font-bold">{sev.label}</span>
        </div>
      </div>

      {/* Category + Guidance */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 mb-6 shadow-sm">
        <div className="mb-4">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-1">
            Category
          </h2>
          <p className="text-lg font-semibold text-slate-800">{report.category}</p>
        </div>

        <div className="border-t border-slate-100 pt-4">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
            What You Should Do
          </h2>
          <p className="text-slate-700 leading-relaxed">{report.guidance}</p>
        </div>
      </div>

      {/* Extracted text */}
      {report.extracted_text && (
        <div className="bg-slate-50 rounded-xl p-6 mb-6">
          <h2 className="text-sm font-medium text-slate-500 uppercase tracking-wide mb-2">
            Extracted Text
          </h2>
          <p className="text-sm text-slate-700 italic whitespace-pre-wrap">
            "{report.extracted_text}"
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex flex-col sm:flex-row gap-3">
        <Link
          to="/report"
          className="flex-1 text-center bg-blue-600 text-white font-semibold py-3 rounded-xl hover:bg-blue-700 transition-colors"
        >
          Report Another
        </Link>
        <Link
          to="/"
          className="flex-1 text-center bg-slate-100 text-slate-700 font-semibold py-3 rounded-xl hover:bg-slate-200 transition-colors"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
