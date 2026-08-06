import { Link } from "react-router-dom";
import { Shield, Brain, Heart, Lock, Ear, Hand, Zap, ArrowRight, Globe } from "lucide-react";
import PatternDivider from "../components/PatternDivider";

const features = [
  {
    icon: Shield,
    title: "Upload a Screenshot",
    desc: "Take a screenshot of any harmful message and upload it here. You are safe.",
    color: "bg-green-50",
  },
  {
    icon: Brain,
    title: "AI Reads & Classifies",
    desc: "Our AI instantly analyzes the message to understand the risk and keep you informed.",
    color: "bg-green-50",
  },
  {
    icon: Heart,
    title: "Get Protection",
    desc: "Receive clear, simple guidance on what to do next. You are never alone.",
    color: "bg-gold-50",
  },
  {
    icon: Lock,
    title: "100% Anonymous",
    desc: "No personal data needed. Your identity is always protected and private.",
    color: "bg-slate-50",
  },
];

const values = [
  { icon: Shield, label: "Protect", desc: "We safeguard children from digital harm." },
  { icon: Ear, label: "Listen", desc: "Every child deserves to be heard." },
  { icon: Hand, label: "Support", desc: "Guidance, counseling, and connection." },
  { icon: Zap, label: "Empower", desc: "Confidence and digital safety knowledge." },
];

export default function Home() {
  return (
    <div className="min-h-[calc(100vh-56px)]">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] text-white py-20 px-4 relative overflow-hidden">
        {/* African Imigongo-inspired pattern */}
        <div className="absolute inset-0">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg" className="opacity-10">
            <defs>
              <pattern id="imigongo" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
                {/* Diamond shapes */}
                <path d="M40 0 L80 40 L40 80 L0 40 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M40 10 L70 40 L40 70 L10 40 Z" fill="none" stroke="white" strokeWidth="1"/>
                <path d="M40 20 L60 40 L40 60 L20 40 Z" fill="none" stroke="white" strokeWidth="1"/>
                {/* Corner triangles */}
                <path d="M0 0 L20 0 L0 20 Z" fill="white" opacity="0.3"/>
                <path d="M80 0 L80 20 L60 0 Z" fill="white" opacity="0.3"/>
                <path d="M0 80 L0 60 L20 80 Z" fill="white" opacity="0.3"/>
                <path d="M80 80 L60 80 L80 60 Z" fill="white" opacity="0.3"/>
                {/* Center dot */}
                <circle cx="40" cy="40" r="3" fill="white" opacity="0.5"/>
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#imigongo)"/>
          </svg>
        </div>
        
        {/* Decorative floating elements */}
        <div className="absolute top-20 right-20 w-40 h-40 bg-white/5 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 left-20 w-32 h-32 bg-white/5 rounded-full blur-2xl animate-pulse" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 right-1/4 w-24 h-24 bg-white/5 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }}></div>

        <div className="max-w-3xl mx-auto text-center relative z-10">
          <img src="/mlinzi-full-logo.png" alt="Mlinzi" className="h-20 mx-auto mb-6 object-contain drop-shadow-lg" />

          <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
            <Globe size={14} className="text-white" />
            <span className="text-sm font-medium text-white">UNICEF Innovation Project</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold mb-4 leading-tight">
            A trusted guardian in the{" "}
            <span className="text-[#FFD54F]">digital world</span>
          </h1>

          <p className="text-lg text-white/90 mb-8 max-w-xl mx-auto leading-relaxed">
            You are not alone. Mlinzi helps children stay safe online by analyzing
            harmful messages and giving you the protection you deserve.
          </p>

          <Link
            to="/report"
            className="inline-flex items-center gap-2 bg-white text-[#1B5E20] font-semibold px-8 py-4 rounded-2xl hover:bg-white/90 transition-all duration-200 shadow-lg hover:shadow-xl hover:-translate-y-0.5 text-lg"
          >
            <Shield size={20} />
            Report Online Abuse
            <ArrowRight size={18} />
          </Link>

          <p className="mt-4 text-sm text-white/70">
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
          {features.map((f, i) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
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

      {/* Video Section */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold text-navy mb-3">
              The Problem We're Solving
            </h2>
            <p className="text-slate-gray max-w-lg mx-auto">
              Children across Africa face growing threats online — from cyberbullying to sextortion. Most suffer in silence.
            </p>
          </div>

          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-soft">
            <video
              controls
              className="w-full aspect-video"
              poster="/mlinzi-full-logo.png"
            >
              <source src="/video.mp4" type="video/mp4" />
              Your browser does not support the video tag.
            </video>
          </div>

          <div className="mt-8 grid sm:grid-cols-3 gap-6">
            {[
              { stat: "1 in 3", label: "children experience online bullying" },
              { stat: "80%", label: "of cases go unreported" },
              { stat: "0", label: "child should feel alone" },
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
      <section className="bg-[#1B5E20] py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <h2 className="text-3xl font-bold text-white text-center mb-12">
            Our Promise to You
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
      <section className="py-16 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <div className="bg-green-50 rounded-2xl p-8 border border-green/10">
            <div className="w-12 h-12 mx-auto mb-4 rounded-xl bg-green/10 flex items-center justify-center">
              <Heart size={24} className="text-blue" />
            </div>
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
              <Shield size={18} />
              Get Help Now
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1B5E20] py-8 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <div className="flex items-center justify-center mb-3">
            <img src="/mlinzi-full-logo.png" alt="Mlinzi" className="h-10 object-contain" />
          </div>
          <p className="text-sm text-[#A5D6A7] mb-2">
            AI-powered child digital protection platform
          </p>
          <p className="text-xs text-[#81C784]">
            A UNICEF Innovation Project • Protect. Listen. Connect.
          </p>
        </div>
      </footer>
    </div>
  );
}
