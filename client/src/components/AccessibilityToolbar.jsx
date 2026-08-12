import { useState } from "react";
import { useAccessibility } from "../context/AccessibilityContext";
import { Accessibility, Eye, Type, Globe, X } from "lucide-react";

export default function AccessibilityToolbar() {
  const [open, setOpen] = useState(false);
  const { language, setLanguage, highContrast, setHighContrast, largeText, setLargeText, t, languages } = useAccessibility();

  return (
    <>
      {/* Toggle Button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 bg-blue text-white p-3 rounded-full shadow-lg hover:bg-blue-dark transition-all"
        aria-label={t("accessibility")}
        title={t("accessibility")}
      >
        <Accessibility size={24} />
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-20 right-6 z-50 bg-white rounded-2xl border border-soft shadow-xl p-5 w-72 animate-fade-in-up" role="dialog" aria-label={t("accessibility")}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-navy">{t("accessibility")}</h3>
            <button onClick={() => setOpen(false)} className="text-slate-gray hover:text-navy" aria-label={t("closePanel")}>
              <X size={18} />
            </button>
          </div>

          <div className="space-y-4">
            {/* Language Selector */}
            <div>
              <label className="flex items-center gap-2 text-sm font-medium text-navy mb-2">
                <Globe size={16} />
                {t("language")}
              </label>
              <div className="flex gap-2">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    onClick={() => setLanguage(lang.code)}
                    className={`flex-1 py-2 rounded-xl text-xs font-medium transition-all ${
                      language === lang.code
                        ? "bg-blue text-white"
                        : "bg-cloud text-slate-gray hover:bg-soft"
                    }`}
                    aria-label={`${t("language")}: ${lang.label}`}
                    aria-pressed={language === lang.code}
                  >
                    {lang.label}
                  </button>
                ))}
              </div>
            </div>

            {/* High Contrast */}
            <button
              onClick={() => setHighContrast(!highContrast)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                highContrast
                  ? "bg-navy text-white"
                  : "bg-cloud text-navy hover:bg-soft"
              }`}
              aria-label={t("highContrast")}
              aria-pressed={highContrast}
            >
              <Eye size={18} />
              <span className="text-sm font-medium">{t("highContrast")}</span>
              <span className={`ml-auto w-10 h-5 rounded-full transition-all relative ${highContrast ? "bg-green-light" : "bg-soft"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${highContrast ? "left-5.5" : "left-0.5"}`} />
              </span>
            </button>

            {/* Large Text */}
            <button
              onClick={() => setLargeText(!largeText)}
              className={`w-full flex items-center gap-3 p-3 rounded-xl transition-all ${
                largeText
                  ? "bg-navy text-white"
                  : "bg-cloud text-navy hover:bg-soft"
              }`}
              aria-label={t("largeText")}
              aria-pressed={largeText}
            >
              <Type size={18} />
              <span className="text-sm font-medium">{t("largeText")}</span>
              <span className={`ml-auto w-10 h-5 rounded-full transition-all relative ${largeText ? "bg-green-light" : "bg-soft"}`}>
                <span className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all ${largeText ? "left-5.5" : "left-0.5"}`} />
              </span>
            </button>
          </div>
        </div>
      )}
    </>
  );
}
