import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Lock, ArrowLeft, Shield, Loader2, CheckCircle, Eye, EyeOff } from "lucide-react";
import { resetPassword } from "../services/api";
import { useAccessibility } from "../context/AccessibilityContext";
import PatternDivider from "../components/PatternDivider";

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const { t } = useAccessibility();

  if (!token) {
    return (
      <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
        <div className="text-center bg-white border border-soft rounded-2xl p-8 shadow-sm max-w-md">
          <h2 className="text-xl font-bold text-navy mb-2">{t("invalidResetLink")}</h2>
          <p className="text-slate-gray text-sm mb-6">{t("invalidResetLinkDesc")}</p>
          <Link
            to="/forgot-password"
            className="inline-flex items-center gap-2 bg-[#2E7D32] text-white font-medium px-6 py-3 rounded-2xl hover:bg-[#1B5E20] transition-all"
          >
            {t("requestNewLink")}
          </Link>
        </div>
      </div>
    );
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError(t("passwordsNoMatch"));
      return;
    }

    if (password.length < 8) {
      setError(t("passwordTooShort"));
      return;
    }

    setLoading(true);

    try {
      await resetPassword(token, password);
      setSuccess(true);
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
          <h1 className="text-3xl font-bold text-white mb-2">{t("resetPasswordTitle")}</h1>
          <p className="text-blue-200">{t("resetPasswordDesc")}</p>
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

        {success ? (
          <div className="bg-white border border-soft rounded-2xl p-8 shadow-sm text-center animate-fade-in-up">
            <div className="w-16 h-16 mx-auto mb-5 rounded-2xl bg-green-50 flex items-center justify-center">
              <CheckCircle size={32} className="text-green" />
            </div>
            <h2 className="text-xl font-bold text-navy mb-2">{t("passwordResetSuccess")}</h2>
            <p className="text-slate-gray text-sm mb-6">{t("passwordResetSuccessDesc")}</p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 bg-[#2E7D32] text-white font-medium px-6 py-3 rounded-2xl hover:bg-[#1B5E20] transition-all shadow-md"
            >
              {t("goToLogin")}
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white border border-soft rounded-2xl p-8 shadow-sm" aria-label={t("setNewPassword")}>
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <Shield size={20} className="text-green" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-navy">{t("setNewPassword")}</h2>
                <p className="text-xs text-slate-gray">{t("mustBe8Chars")}</p>
              </div>
            </div>

            {error && (
              <div className="bg-red-soft/50 border border-red/20 text-red px-4 py-3 rounded-xl mb-4 text-sm">
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-navy mb-2">
                {t("newPassword")}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full border border-soft rounded-2xl pl-11 pr-12 py-3 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                  placeholder="••••••••"
                  aria-label={t("newPassword")}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-gray hover:text-navy transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-navy mb-2">
                {t("confirmPassword")}
              </label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-gray" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  minLength={8}
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full border border-soft rounded-2xl pl-11 pr-4 py-3 text-sm focus:border-green focus:ring-2 focus:ring-green/20 outline-none transition-all"
                  placeholder="••••••••"
                  aria-label={t("confirmPassword")}
                />
              </div>
              {confirmPassword && password !== confirmPassword && (
                <p className="text-xs text-red mt-1">{t("passwordsNoMatch")}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || !password || !confirmPassword}
              className="w-full bg-[#2E7D32] text-white font-semibold py-3 rounded-2xl hover:bg-[#1B5E20] disabled:bg-soft disabled:text-slate-gray disabled:cursor-not-allowed transition-all shadow-md flex items-center justify-center gap-2"
              aria-label={t("resetPassword")}
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  {t("resetting")}
                </>
              ) : (
                t("resetPassword")
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
