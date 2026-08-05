import { Link } from "react-router-dom";
import PatternDivider from "../components/PatternDivider";

const features = [
  {
    icon: "📸",
    title: "Upload a Screenshot",
    desc: "Take a screenshot of any harmful message and upload it here. You are safe.",
    color: "bg-blue-bg",
  },
  {
    icon: "🤖",
    title: "AI Reads & Classifies",
    desc: "Our AI instantly analyzes the message to understand the risk and keep you informed.",
    color: "bg-green-50",
  },
  {
    icon: "🛡️",
    title: "Get Protection",
    desc: "Receive clear, simple guidance on what to do next. You are never alone.",
    color: "bg-gold-50",
  },
  {
    icon: "🔒",
    title: "100% Anonymous",
    desc: "No personal data needed. Your identity is always protected and private.",
    color: "bg-slate-50",
  },
];

const values = [
  { icon: "❤️", label: "Protect", desc: "We safeguard children from digital harm." },
  { icon: "👂", label: "Listen", desc: "Every child deserves to be heard." },
  { icon: "🤝", label: "Support", desc: "Guidance, counseling, and connection." },
  { icon: "💪", label: "Empower", desc: "Confidence and digital safety knowledge." },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20 px-4 relative overflow-hidden">
        {/* Subtle geometric background pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="african-pattern" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="20" height="20" fill="white" />
                <rect x="20" y="20" width="20" height="20" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#african-pattern)" />
          </svg>
        </div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <img src="/mlinzi-full-logo.png" alt="Mlinzi" className="h-20 mx-auto mb-6 object-contain" />

          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <span className="text-sm">🌍</span>
            <span className="text-sm font-medium text-blue-200">UNICEF Innovation Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            A trusted guardian in the{" "}
            <span className="text-gold">digital world</span>
          </h1>

          <p className="text-lg text-blue-100 mb-8 max-w-xl mx-auto leading-relaxed">
            You are not alone. Mlinzi helps children stay safe online by analyzing
            harmful messages and giving you the protection you deserve.
          </p>

          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-blue text-white font-semibold px-8 py-4 rounded-2xl hover:bg-blue-dark transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
          >
            <span className="text-xl">🛡️</span>
            Report Online Abuse
          </Link>

          <p className="mt-4 text-sm text-blue-200">
            AI-powered digital protection for every child
          </p>
        </div>
      </section>

      <PatternDivider />

      {/* How It Works */}
      <section className="max-w-5xl mx-auto py-16 px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-navy mb-3">
            How Mlinzi Protects You
          </h2>
          <p className="text-slate-gray max-w-lg mx-auto">
            Simple steps to get the help you need. No personal data required.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((f, i) => (
            <div
              key={f.title}
              className={`${f.color} rounded-2xl p-6 text-center animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.1}s` }}
            >
              <div className="text-4xl mb-3">{f.icon}</div>
              <h3 className="font-semibold text-navy mb-2">{f.title}</h3>
              <p className="text-sm text-slate-gray leading-relaxed">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Brand Values */}
      <section className="bg-navy py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Promise to You
          </h2>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((v) => (
              <div key={v.label} className="text-center">
                <div className="text-3xl mb-3">{v.icon}</div>
                <h3 className="font-semibold text-white mb-1">{v.label}</h3>
                <p className="text-sm text-blue-200">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <PatternDivider />

      {/* Safety Message */}
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-blue-bg rounded-2xl p-8 border border-blue/10">
            <div className="text-3xl mb-4">💙</div>
            <h3 className="text-xl font-bold text-navy mb-3">
              Every child. Everywhere. Protected.
            </h3>
            <p className="text-slate-gray mb-6 leading-relaxed">
              Mlinzi is built for children across Rwanda and Africa. If you are in
              immediate danger, please call local emergency services or talk to a
              trusted adult right away.
            </p>
            <Link
              to="/report"
              className="inline-flex items-center gap-2 bg-blue text-white font-semibold px-6 py-3 rounded-2xl hover:bg-blue-dark transition-all duration-200"
            >
              Get Help Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#0B1220] py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2.5 mb-3">
            <img src="/mlinzi-icon.png" alt="Mlinzi" className="h-8 w-8 object-contain" />
            <span className="text-lg font-bold text-white">Mlinzi</span>
          </div>
          <p className="text-sm text-[#93C5FD] mb-2">
            AI-powered child digital protection platform
          </p>
          <p className="text-xs text-[#64748B]">
            A UNICEF Innovation Project • Protect. Listen. Connect.
          </p>
        </div>
      </footer>
    </div>
  );
}
