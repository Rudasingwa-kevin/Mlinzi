import { useState } from "react";
import { Link } from "react-router-dom";
import { Mail, ArrowLeft, Shield, Loader2, CheckCircle } from "lucide-react";
import { forgotPassword } from "../services/api";
import { useAccessibility } from "../context/AccessibilityContext";
import PatternDivider from "../components/PatternDivider";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useAccessibility();

  async function handleSubmit(e) {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    setError(null);

    try {
      await forgotPassword(email);
      setSent(true);
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <section className="bg-navy py-10 px-4">
        <div className="max-w-lg mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{t("forgotPasswordTitle")}</h1>
          <p className="text-blue-200">{t("forgotPasswordDesc")}</p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-lg mx-auto py-10 px-4">
        <Link
          to="/login"
          className="inline-flex items-center gap-2 text-sm text-slate-gray hover:text-navy transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {t("backToLogin")}
        </Link>

        {sent ? (
          <div className="bg-white border border-soft rounded-2xl p-8 shadow-sm text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={32} className="text-green" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">{t("checkEmailTitle")}</h2>
            <p className="text-slate-gray text-sm mb-6 leading-relaxed">
              {t("checkEmailDesc")} <span className="font-medium text-navy">{email}</span>
            </p>
            <p className="text-xs text-slate-gray mb-6">
              {t("noEmailCheck")}
            </p>
            <button
              onClick={() => { setSent(false); setEmail(""); }}
              className="text-sm text-green font-medium hover:underline"
            >
              {t("tryDifferentEmail")}
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-soft rounded-2xl p-8 shadow-sm">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Shield size={20} className="text-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">{t("resetYourPassword")}</h2>
                <p className="text-xs text-slate-gray">{t("enterEmailBelow")}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-soft/50 border border-red/20 text-red px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="mb-6">
              <label className="block text-sm font-medium text-navy mb-2">
                {t("emailAddress")}
              </label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full border border-soft rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                  placeholder="counselor@example.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !email.trim()}
              className="w-full bg-[#2E7D32] text-white font-semibold py-3 rounded-2xl hover:bg-[#1B5E20] disabled:bg-soft disabled:text-slate-gray disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("sending")}
                </>
              ) : (
                t("sendResetLink")
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
