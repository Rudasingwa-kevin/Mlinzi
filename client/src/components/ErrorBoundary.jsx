import { ErrorBoundary } from "react-error-boundary";
import { AlertTriangle, RefreshCw, Home } from "lucide-react";
import { Link } from "react-router-dom";

function ErrorFallback({ error, resetErrorBoundary }) {
  return (
    <div className="min-h-screen bg-cloud flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="bg-white rounded-2xl border border-soft shadow-lg p-8">
          <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-red-soft flex items-center justify-center" role="img" aria-label="Error">
            <AlertTriangle size={32} className="text-red" />
          </div>
          <h1 className="text-xl font-bold text-navy mb-2">Something went wrong</h1>
          <p className="text-slate-gray text-sm mb-6 leading-relaxed">
            Mlinzi hit an unexpected error. Your data is safe. Please try again or go back home.
          </p>
          <div className="bg-cloud rounded-xl p-4 mb-6 text-left">
            <p className="text-xs text-slate-gray font-mono break-all">
              {error?.message || "Unknown error"}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button
              onClick={resetErrorBoundary}
              className="flex-1 flex items-center justify-center gap-2 bg-[#2E7D32] text-white font-medium py-3 rounded-2xl hover:bg-[#1B5E20] transition-all"
              aria-label="Try Again"
            >
              <RefreshCw size={16} />
              Try Again
            </button>
            <Link
              to="/"
              className="flex-1 flex items-center justify-center gap-2 bg-white border border-soft text-navy font-medium py-3 rounded-2xl hover:bg-cloud transition-all"
              aria-label="Go Home"
            >
              <Home size={16} />
              Go Home
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AppErrorBoundary({ children }) {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => window.location.reload()}
    >
      {children}
    </ErrorBoundary>
  );
}
