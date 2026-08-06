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
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B1220] via-[#1a2744] to-[#2E7D32] relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="grid" x="0" y="0" width="40" height="40" patternUnits="userSpaceOnUse">
                <rect x="0" y="0" width="20" height="20" fill="white" />
                <rect x="20" y="20" width="20" height="20" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#grid)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Welcome back to <span className="text-[#60A5FA]">Mlinzi</span>
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed">
              Continue protecting children across Rwanda and Africa. Your dedication makes a difference.
            </p>
          </div>

          <div className="space-y-4 mt-8">
            {[
              { icon: Shield, text: "Protect children from digital harm" },
              { icon: ArrowRight, text: "Respond to cases quickly" },
              { icon: Lock, text: "Secure and confidential platform" },
            ].map((item, i) => {
              const Icon = item.icon;
              return (
                <div key={i} className="flex items-center gap-3 text-blue-100">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Icon size={16} />
                  </div>
                  <span className="text-sm">{item.text}</span>
                </div>
              );
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-blue-200 text-sm">
              "Mlinzi has transformed how we handle child protection cases."
            </p>
            <p className="text-blue-300 text-xs mt-2">
              — UNICEF Rwanda Partner
            </p>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-[#60A5FA]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-32 right-10 w-24 h-24 bg-[#2E7D32]/30 rounded-full blur-2xl" />
      </div>

      {/* Right side - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center px-6 py-12 bg-[#f8fafc]">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden text-center mb-8">
            <img src="/mlinzi-icon.png" alt="Mlinzi" className="h-12 mx-auto mb-3" />
            <span className="text-xl font-bold text-[#0B1220]">Mlinzi</span>
          </div>

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

          <form onSubmit={handleSubmit} className="space-y-5">
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
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#64748B]"
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
                />
                <span className="text-sm text-[#64748B]">Remember me</span>
              </label>
              <button type="button" className="text-sm text-[#2E7D32] hover:text-[#1B5E20] font-medium">
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#2E7D32] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1B5E20] transition-all duration-200 shadow-lg shadow-[#2E7D32]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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

          <div className="mt-8 text-center">
            <p className="text-[#64748B] text-sm">
              Don't have an account?{" "}
              <Link to="/register" className="text-[#2E7D32] font-semibold hover:text-[#1B5E20]">
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
