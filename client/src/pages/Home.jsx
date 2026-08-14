import { Link } from "react-router-dom";
import { Shield, Brain, Heart, Lock, Hand, ArrowRight, Globe, MessageSquare, Smartphone } from "lucide-react";
import { useAccessibility } from "../context/AccessibilityContext";
import PatternDivider from "../components/PatternDivider";

export default function Home() {
  const { t } = useAccessibility();

  const features = [
    {
      icon: Shield,
      title: t("step1Title"),
      desc: t("step1Desc"),
      color: "bg-green-50",
    },
    {
      icon: Brain,
      title: t("step2Title"),
      desc: t("step2Desc"),
      color: "bg-green-50",
    },
    {
      icon: Heart,
      title: t("step3Title"),
      desc: t("step3Desc"),
      color: "bg-gold-50",
    },
    {
      icon: Lock,
      title: t("anonymousNoData"),
      desc: t("safetyMessage"),
      color: "bg-slate-50",
    },
  ];

  const values = [
    { icon: Shield, label: t("promise1"), desc: t("promise1Desc") },
    { icon: Brain, label: t("promise2"), desc: t("promise2Desc") },
    { icon: Hand, label: t("promise3"), desc: t("promise3Desc") },
    { icon: Globe, label: t("promise4"), desc: t("promise4Desc") },
  ];

  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] text-white py-20 px-4 relative overflow-hidden" aria-labelledby="hero-heading">
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
            <defs>
              <pattern id="imigongo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M40 10 L70 40 L40 70 L10 40 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M40 20 L60 40 L40 60 L20 40 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M0 0 L20 0 L0 20 Z" fill="white" opacity="0.3"/>
                <path d="M80 0 L80 20 L60 0 Z" fill="white" opacity="0.3"/>
                <path d="M0 80 L0 60 L20 80 Z" fill="white" opacity="0.3"/>
                <path d="M80 80 L60 80 L80 60 Z" fill="white" opacity="0.3"/>
                <circle cx="40" cy="40" r="3" fill="white" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#imigongo)"/>
          </svg>
        </div>
        
        <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Globe size={14} className="text-white" />
            <span className="text-sm font-medium text-white">{t("unicefInnovation")}</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight" id="hero-heading">
            {t("heroTitle")}
          </h1>

          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
            {t("heroSubtitle")}
          </p>

          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-white text-[#1B5E20] font-semibold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
            aria-label={t("reportNow")}
          >
            <Shield size={20} />
            {t("reportNow")}
            <ArrowRight size={18} />
          </Link>

          <p className="mt-4 text-sm text-white/70">
            {t("aiPoweredPlatform")}
          </p>
        </div>
      </section>

      <PatternDivider />

      {/* How It Works */}
      <section className="max-w-5xl mx-auto py-16 px-4" aria-labelledby="how-it-works-heading">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-3" id="how-it-works-heading">
            {t("howItWorks")}
          </h2>
          <p className="text-slate-gray max-w-lg mx-auto">
            Simple steps to get the help you need. No personal data required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={i}
                className={`${f.color} rounded-2xl p-6 text-center animate-fade-in-up`}
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/80 flex items-center justify-center">
                  <Icon size={24} className="text-navy" />
                </div>
                <h3 className="font-semibold text-navy mb-2">{f.title}</h3>
                <p className="text-sm text-slate-gray leading-relaxed">{f.desc}</p>
              </div>
            );
          })}
        </div>
      </section>

      <PatternDivider />

      {/* Multichannel Access */}
      <section className="py-16 px-4 bg-white" aria-labelledby="access-heading">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-navy mb-3" id="access-heading">
              {t("accessMlinzi")}
            </h2>
            <p className="text-slate-gray max-w-lg mx-auto">
              {t("noSmartphone")}
            </p>
          </div>

          <div className="grid sm:grid-cols-3 gap-6">
            <div className="bg-green-50 rounded-2xl p-6 text-center animate-fade-in-up">
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/80 flex items-center justify-center">
                <Globe size={24} className="text-navy" />
              </div>
              <h3 className="font-semibold text-navy mb-2">{t("webApp")}</h3>
              <p className="text-sm text-slate-gray leading-relaxed">{t("webAppDesc")}</p>
            </div>
            <div className="group relative bg-green-50 rounded-2xl p-6 text-center animate-fade-in-up cursor-not-allowed" style={{ animationDelay: "0.1s" }}>
              {/* Coming Soon overlay */}
              <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center z-10 pointer-events-none">
                <span className="bg-navy text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                  🚧 Coming Soon
                </span>
              </div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/80 flex items-center justify-center">
                <Smartphone size={24} className="text-navy" />
              </div>
              <h3 className="font-semibold text-navy mb-2">{t("sms")}</h3>
              <p className="text-sm text-slate-gray leading-relaxed">{t("smsDesc")}</p>
            </div>
            <div className="group relative bg-green-50 rounded-2xl p-6 text-center animate-fade-in-up cursor-not-allowed" style={{ animationDelay: "0.2s" }}>
              {/* Coming Soon overlay */}
              <div className="absolute inset-0 rounded-2xl bg-white/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center z-10 pointer-events-none">
                <span className="bg-navy text-white text-xs font-bold px-3 py-1.5 rounded-full shadow-lg tracking-wide uppercase">
                  🚧 Coming Soon
                </span>
              </div>
              <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/80 flex items-center justify-center">
                <MessageSquare size={24} className="text-navy" />
              </div>
              <h3 className="font-semibold text-navy mb-2">{t("whatsapp")}</h3>
              <p className="text-sm text-slate-gray leading-relaxed">{t("whatsappDesc")}</p>
            </div>
          </div>
        </div>
      </section>

      <PatternDivider />

      {/* Video Section */}
      <section className="py-16 px-4 bg-white" aria-labelledby="video-heading">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy mb-3" id="video-heading">
              {t("problemSolving")}
            </h2>
            <p className="text-slate-gray max-w-lg mx-auto">
              {t("problemDesc")}
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-soft">
            <video
              controls
              className="w-full aspect-video"
              poster="/full.png"
              aria-label={t("problemSolving")}
            >
              <source src="/video.mp4" type="video/mp4" />
              {t("videoNotSupported")}
            </video>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {[
              { stat: t("oneInThree"), label: `${t("statChildren")} ${t("statReport")}` },
              { stat: t("percent80"), label: `${t("statOnline")} ${t("statOnlineDesc")}` },
              { stat: t("statProtected"), label: t("statProtectedDesc") },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <p className="text-3xl font-bold text-[#2E7D32]">{item.stat}</p>
                <p className="text-sm text-slate-gray mt-1">{item.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PatternDivider />

      {/* Brand Values */}
      <section className="bg-[#1B5E20] py-16 px-4" aria-labelledby="promise-heading">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12" id="promise-heading">
            {t("ourPromise")}
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => {
              const Icon = v.icon;
              return (
                <div key={v.label} className="text-center">
                  <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-white/10 flex items-center justify-center">
                    <Icon size={24} className="text-white" />
                  </div>
                  <h3 className="font-semibold text-white mb-1">{v.label}</h3>
                  <p className="text-sm text-green-100">{v.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <PatternDivider />

      {/* Safety Message */}
      <section className="py-16 px-4" aria-labelledby="safety-heading">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 rounded-2xl p-8 border border-green/10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green/10 flex items-center justify-center">
              <Heart size={24} className="text-blue" />
            </div>
            <h3 className="text-xl font-bold text-navy mb-3" id="safety-heading">
              {t("everyChildProtected")}
            </h3>
            <p className="text-slate-gray mb-6 leading-relaxed">
              {t("builtForAfrica")}
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 bg-blue text-white font-semibold px-6 py-3 rounded-2xl hover:bg-blue-dark transition-all duration-200"
            >
              <Shield size={18} />
              {t("reportNow")}
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B5E20] py-8 px-4" role="contentinfo" aria-label={t("footer")}>
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center mb-3">
            <img src="/full.png" alt="Mlinzi" className="h-10 object-contain" />
          </div>
          <p className="text-sm text-[#A5D6A7] mb-2">
            {t("aiPoweredPlatform")}
          </p>
          <p className="text-xs text-[#81C784]">
            {t("unicefProject")}
          </p>
        </div>
      </footer>
    </div>
  );
}
