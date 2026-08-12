import { useState, useEffect } from "react";
import { Cookie, X } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const { t } = useAccessibility();

  useEffect(() => {
    const consent = localStorage.getItem("mlinzi_cookie_consent");
    if (!consent) setVisible(true);
  }, []);

  function handleAccept() {
    localStorage.setItem("mlinzi_cookie_consent", "accepted");
    setVisible(false);
  }

  function handleReject() {
    localStorage.setItem("mlinzi_cookie_consent", "rejected");
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6" role="dialog" aria-label={t("cookieTitle")}>
      <div className="max-w-3xl mx-auto bg-white border border-soft rounded-2xl shadow-2xl p-6 animate-fade-in-up">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Cookie size={20} className="text-green" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-navy mb-1">{t("cookieTitle")}</h3>
            <p className="text-sm text-slate-gray leading-relaxed">
              {t("cookieMessage")}
            </p>
          </div>
          <button
            onClick={handleReject}
            className="text-slate-gray hover:text-navy transition-colors flex-shrink-0"
            aria-label={t("cookieReject")}
          >
            <X size={18} />
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 mt-5 ml-14">
          <button
            onClick={handleReject}
            className="px-5 py-2.5 rounded-xl text-sm font-medium border border-soft text-slate-gray hover:bg-cloud transition-all"
            aria-label={t("cookieReject")}
          >
            {t("cookieReject")}
          </button>
          <button
            onClick={handleAccept}
            className="px-5 py-2.5 rounded-xl text-sm font-medium bg-[#2E7D32] text-white hover:bg-[#1B5E20] transition-all shadow-md"
            aria-label={t("cookieAccept")}
          >
            {t("cookieAccept")}
          </button>
        </div>
      </div>
    </div>
  );
}
