import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, Eye, EyeOff, LogIn, Shield, ArrowRight, Loader2 } from "lucide-react";
import { loginUser } from "../services/api";

export default function Login() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await loginUser(form.email, form.password);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "counselor") {
        navigate("/counselor");
      } else {
        navigate("/analytics");
      }
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || "Login failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex">

      <style>{`
        @keyframes lp-float1 { 0%,100% { transform: translateY(0px) scale(1); } 50% { transform: translateY(-18px) scale(1.04); } }
        @keyframes lp-float2 { 0%,100% { transform: translateY(0px); } 50% { transform: translateY(14px); } }
        @keyframes lp-float3 { 0%,100% { transform: translateY(0px) rotate(0deg); } 50% { transform: translateY(-10px) rotate(3deg); } }
        @keyframes lp-shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
        @keyframes lp-pulse-ring { 0% { transform: scale(0.9); opacity: 0.6; } 70% { transform: scale(1.35); opacity: 0; } 100% { transform: scale(0.9); opacity: 0; } }
        .lp-orb1 { animation: lp-float1 6s ease-in-out infinite; }
        .lp-orb2 { animation: lp-float2 8s ease-in-out infinite; }
        .lp-orb3 { animation: lp-float3 5s ease-in-out infinite; }
        .lp-shimmer {
          background: linear-gradient(90deg, #A5D6A7 0%, #fff 40%, #A5D6A7 60%, #fff 100%);
          background-size: 200% auto;
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          animation: lp-shimmer 3s linear infinite;
        }
        .lp-pulse::before {
          content: '';
          position: absolute;
          inset: -6px;
          border-radius: 18px;
          border: 2px solid rgba(165,214,167,0.4);
          animation: lp-pulse-ring 2.5s ease-out infinite;
        }
        .lp-feature { transition: all 0.2s ease; border-radius: 12px; padding: 10px 12px; cursor: default; }
        .lp-feature:hover { background: rgba(255,255,255,0.09); transform: translateX(5px); }
      `}</style>

      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#1B5E20] via-[#2E7D32] to-[#388E3C] relative overflow-hidden flex-col justify-center">

        {/* Imigongo pattern */}
        <div className="absolute inset-0 opacity-10 pointer-events-none">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="imi-login" x="0" y="0" width="80" height="80" patternUnits="userSpaceOnUse">
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
            <rect width="100%" height="100%" fill="url(#imi-login)"/>
          </svg>
        </div>

        {/* Glowing orbs */}
        <div className="lp-orb1 absolute top-16 right-12 w-48 h-48 bg-white/10 rounded-full blur-3xl pointer-events-none" />
        <div className="lp-orb2 absolute bottom-20 left-8 w-56 h-56 bg-[#1B5E20]/50 rounded-full blur-3xl pointer-events-none" />
        <div className="lp-orb3 absolute top-1/2 right-1/4 w-28 h-28 bg-white/8 rounded-full blur-2xl pointer-events-none" />

        {/* Content */}
        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16 py-12">

          {/* Shield badge */}
          <div className="relative inline-block mb-8 lp-pulse" style={{ width: "fit-content" }}>
            <div className="w-16 h-16 rounded-2xl bg-white/15 backdrop-blur-md flex items-center justify-center border border-white/25 shadow-2xl">
              <Shield size={30} className="text-white drop-shadow" />
            </div>
          </div>

          <h1 className="text-4xl font-extrabold text-white mb-3 leading-tight">
            Welcome back to{" "}
            <span className="lp-shimmer">Mlinzi</span>
          </h1>
          <p className="text-white/70 text-base leading-relaxed max-w-xs mb-10">
            Continue protecting children across Rwanda and Africa. Your dedication makes a difference.
          </p>

          {/* Feature list */}
          <div className="space-y-1 mb-10">
            {[
              { icon: Shield, label: "Protect children from digital harm", sub: "AI-powered abuse detection" },
              { icon: ArrowRight, label: "Respond to cases quickly", sub: "Real-time case management" },
              { icon: Lock, label: "Secure & confidential platform", sub: "End-to-end encrypted data" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="lp-feature flex items-center gap-4">
                  <div className="w-9 h-9 rounded-xl bg-white/15 border border-white/20 flex items-center justify-center flex-shrink-0">
                    <Icon size={16} className="text-white" />
                  </div>
                  <div>
                    <p className="text-white text-sm font-semibold">{item.label}</p>
                    <p className="text-white/50 text-xs">{item.sub}</p>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#f8fafc]">
        <div className="w-full max-w-md">

          <div className="mb-8">
            <h2 className="text-3xl font-bold text-[#0B1220] mb-2">Sign in</h2>
            <p className="text-[#64748B]">
              Enter your credentials to access your account
            </p>
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5" aria-label="Sign in">
            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-2">
                Email address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail size={18} className="text-[#94a3b8]" />
                </div>
                <input
                  type="email"
                  required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className="w-full pl-11 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0B1220] placeholder-[#94a3b8] focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-all"
                  placeholder="you@example.com"
                  aria-label="Email address"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-[#0B1220] mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock size={18} className="text-[#94a3b8]" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className="w-full pl-11 pr-12 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0B1220] placeholder-[#94a3b8] focus:border-[#2E7D32] focus:ring-2 focus:ring-[#2E7D32]/20 outline-none transition-all"
                  placeholder="Enter your password"
                  aria-label="Password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#64748B]"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  className="w-4 h-4 rounded border-[#e2e8f0] text-[#2E7D32] focus:ring-[#2E7D32]/20"
                  aria-label="Remember me"
                />
                <span className="text-sm text-[#64748B]">Remember me</span>
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E7D32] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1B5E20] transition-all duration-200 shadow-lg shadow-[#2E7D32]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              aria-label="Sign in"
            >
              {loading ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  <LogIn size={18} />
                  Sign in
                </>
              )}
            </button>
          </form>

          <div className="mt-4 text-center">
            <Link to="/forgot-password" className="text-sm text-[#2E7D32] font-medium hover:text-[#1B5E20] hover:underline" aria-label="Forgot password">
              Forgot password?
            </Link>
          </div>

          <div className="mt-8 text-center">
            <p className="text-[#64748B] text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#2E7D32] font-semibold hover:text-[#1B5E20]" aria-label="Create account">
                Create account
              </Link>
            </p>
          </div>

          <div className="mt-8 pt-6 border-t border-[#e2e8f0]">
            <p className="text-xs text-[#94a3b8] text-center">
              Protected by Mlinzi Security • UNICEF Innovation Project
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
