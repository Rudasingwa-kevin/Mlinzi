import { Link } from "react-router-dom";
import { Shield, ArrowLeft, Trash2, Mail, Lock, Eye, Database, Clock, UserCheck } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";
import PatternDivider from "../components/PatternDivider";

const sections = [
  {
    icon: Database,
    titleKey: "privacyDataTitle",
    contentKey: "privacyDataContent",
  },
  {
    icon: Eye,
    titleKey: "privacyUseTitle",
    contentKey: "privacyUseContent",
  },
  {
    icon: Lock,
    titleKey: "privacyProtectTitle",
    contentKey: "privacyProtectContent",
  },
  {
    icon: Shield,
    titleKey: "privacyChildrenTitle",
    contentKey: "privacyChildrenContent",
  },
  {
    icon: Clock,
    titleKey: "privacyRetentionTitle",
    contentKey: "privacyRetentionContent",
  },
  {
    icon: Trash2,
    titleKey: "privacyDeleteTitle",
    contentKey: "privacyDeleteContent",
  },
  {
    icon: UserCheck,
    titleKey: "privacyRightsTitle",
    contentKey: "privacyRightsContent",
  },
  {
    icon: Mail,
    titleKey: "privacyContactTitle",
    contentKey: "privacyContactContent",
  },
];

export default function PrivacyPolicy() {
  const { t } = useAccessibility();

  return (
    <div className="min-h-[calc(100vh-56px)]">
      <section className="bg-navy py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <h1 className="text-3xl font-bold text-white mb-2">{t("privacyTitle")}</h1>
          <p className="text-blue-200">{t("privacySubtitle")}</p>
        </div>
      </section>

      <PatternDivider />

      <div className="max-w-3xl mx-auto py-10 px-4">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-sm text-slate-gray hover:text-navy transition-colors mb-8"
        >
          <ArrowLeft size={16} />
          {t("backToHome")}
        </Link>

        <div className="space-y-6">
          {sections.map((section, i) => {
            const Icon = section.icon;
            return (
              <div
                key={i}
                className="bg-white border border-soft rounded-2xl p-6 shadow-sm animate-fade-in-up"
                style={{ animationDelay: `${i * 0.05}s` }}
              >
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0">
                    <Icon size={18} className="text-green" />
                  </div>
                  <h2 className="text-lg font-semibold text-navy">{t(section.titleKey)}</h2>
                </div>
                <div className="ml-13 text-sm text-charcoal leading-relaxed whitespace-pre-line">
                  {t(section.contentKey)}
                </div>
              </div>
            );
          })}
        </div>

        <div className="mt-10 text-center">
          <p className="text-xs text-slate-gray">
            {t("privacyLastUpdated")}
          </p>
        </div>
      </div>
    </div>
  );
}
