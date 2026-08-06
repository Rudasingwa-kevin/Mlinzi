import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Mail, Lock, User, Eye, EyeOff, UserPlus, Shield, Users, BarChart3, Loader2, Check } from "lucide-react";
import { registerUser } from "../services/api";

const roles = [
  {
    id: "counselor",
    title: "Counselor",
    description: "Review and support children with cases",
    icon: Users,
    color: "bg-[#2563EB]",
  },
  {
    id: "national_society",
    title: "National Society",
    description: "View analytics and national statistics",
    icon: BarChart3,
    color: "bg-[#059669]",
  },
];

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "counselor" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState(1);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "counselor") {
        navigate("/counselor");
      } else {
        navigate("/analytics");
      }
      window.location.reload();
    } catch (err) {
      setError(err.response?.data?.error || "Registration failed");
    } finally {
      setLoading(false);
    }
  }

  function handleNext() {
    if (step === 1 && form.full_name && form.email) {
      setStep(2);
    }
  }

  return (
    <div className="min-h-[calc(100vh-56px)] flex">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-[#0B1220] via-[#1a2744] to-[#2563EB] relative overflow-hidden">
        {/* Decorative pattern */}
        <div className="absolute inset-0 opacity-5">
          <svg width="100%" height="100%" xmlns="http://www.w3.org/2000/svg">
            <defs>
              <pattern id="dots" x="0" y="0" width="20" height="20" patternUnits="userSpaceOnUse">
                <circle cx="10" cy="10" r="2" fill="white" />
              </pattern>
            </defs>
            <rect width="100%" height="100%" fill="url(#dots)" />
          </svg>
        </div>

        <div className="relative z-10 flex flex-col justify-center px-12 lg:px-16">
          <div className="mb-8">
            <div className="w-16 h-16 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center mb-6">
              <Shield size={32} className="text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Join <span className="text-[#60A5FA]">Mlinzi</span> today
            </h1>
            <p className="text-blue-200 text-lg leading-relaxed">
              Be part of the team protecting children across Rwanda and Africa.
            </p>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            {[
              { value: "1,248+", label: "Reports Handled" },
              { value: "150+", label: "Counselors" },
              { value: "30", label: "Districts" },
              { value: "24/7", label: "Support" },
            ].map((stat, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
                <p className="text-2xl font-bold text-white">{stat.value}</p>
                <p className="text-xs text-blue-200 mt-1">{stat.label}</p>
              </div>
            ))}
          </div>

          <div className="mt-12 pt-8 border-t border-white/10">
            <p className="text-blue-200 text-sm">
              "Every child deserves to be protected in the digital world."
            </p>
            <p className="text-blue-300 text-xs mt-2">
              — Mlinzi Mission Statement
            </p>
          </div>
        </div>

        {/* Floating elements */}
        <div className="absolute top-32 right-16 w-40 h-40 bg-[#60A5FA]/20 rounded-full blur-3xl" />
        <div className="absolute bottom-24 left-10 w-32 h-32 bg-[#2563EB]/30 rounded-full blur-2xl" />
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
            <h2 className="text-3xl font-bold text-[#0B1220] mb-2">Create account</h2>
            <p className="text-[#64748B]">
              {step === 1 ? "Start by telling us about yourself" : "Secure your account"}
            </p>
          </div>

          {/* Progress steps */}
          <div className="flex items-center gap-3 mb-8">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold transition-all ${
                    step >= s
                      ? "bg-[#2563EB] text-white"
                      : "bg-[#e2e8f0] text-[#94a3b8]"
                  }`}
                >
                  {step > s ? <Check size={14} /> : s}
                </div>
                {s < 2 && (
                  <div
                    className={`w-12 h-1 rounded-full transition-all ${
                      step > s ? "bg-[#2563EB]" : "bg-[#e2e8f0]"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-xl mb-6 text-sm flex items-center gap-2">
              <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0">
                <span className="text-xs font-bold">!</span>
              </div>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {step === 1 ? (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div>
                  <label className="block text-sm font-medium text-[#0B1220] mb-2">
                    Full name
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                      <User size={18} className="text-[#94a3b8]" />
                    </div>
                    <input
                      type="text"
                      required
                      value={form.full_name}
                      onChange={(e) => setForm({ ...form, full_name: e.target.value })}
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0B1220] placeholder-[#94a3b8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                      placeholder="John Doe"
                    />
                  </div>
                </div>

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
                      className="w-full pl-11 pr-4 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0B1220] placeholder-[#94a3b8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                      placeholder="you@example.com"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-[#0B1220] mb-3">
                    Select your role
                  </label>
                  <div className="grid grid-cols-2 gap-3">
                    {roles.map((r) => {
                      const Icon = r.icon;
                      return (
                        <button
                          key={r.id}
                          type="button"
                          onClick={() => setForm({ ...form, role: r.id })}
                          className={`p-4 rounded-xl border-2 text-left transition-all ${
                            form.role === r.id
                              ? "border-[#2563EB] bg-[#2563EB]/5"
                              : "border-[#e2e8f0] hover:border-[#cbd5e1]"
                          }`}
                        >
                          <div className={`w-10 h-10 rounded-lg ${r.color} flex items-center justify-center mb-3`}>
                            <Icon size={20} className="text-white" />
                          </div>
                          <p className="font-semibold text-[#0B1220] text-sm">{r.title}</p>
                          <p className="text-xs text-[#64748B] mt-1">{r.description}</p>
                        </button>
                      );
                    })}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleNext}
                  disabled={!form.full_name || !form.email}
                  className="w-full bg-[#2563EB] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1d4ed8] transition-all duration-200 shadow-lg shadow-[#2563EB]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  Continue
                  <Check size={18} />
                </button>
              </div>
            ) : (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
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
                      minLength={6}
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="w-full pl-11 pr-12 py-3 bg-white border border-[#e2e8f0] rounded-xl text-[#0B1220] placeholder-[#94a3b8] focus:border-[#2563EB] focus:ring-2 focus:ring-[#2563EB]/20 outline-none transition-all"
                      placeholder="Create a strong password"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 pr-4 flex items-center text-[#94a3b8] hover:text-[#64748B]"
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
                  <p className="text-xs text-[#94a3b8] mt-2">Must be at least 6 characters</p>
                </div>

                {/* Summary */}
                <div className="bg-[#f1f5f9] rounded-xl p-4">
                  <p className="text-xs font-medium text-[#64748B] uppercase tracking-wide mb-3">
                    Account Summary
                  </p>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Name</span>
                      <span className="text-[#0B1220] font-medium">{form.full_name}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Email</span>
                      <span className="text-[#0B1220] font-medium">{form.email}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-[#64748B]">Role</span>
                      <span className="text-[#0B1220] font-medium capitalize">
                        {form.role.replace("_", " ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 bg-[#e2e8f0] text-[#0B1220] py-3.5 rounded-xl font-semibold hover:bg-[#cbd5e1] transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="flex-[2] bg-[#2563EB] text-white py-3.5 rounded-xl font-semibold hover:bg-[#1d4ed8] transition-all duration-200 shadow-lg shadow-[#2563EB]/25 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <Loader2 size={18} className="animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        <UserPlus size={18} />
                        Create account
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 text-center">
            <p className="text-[#64748B] text-sm">
              Already have an account?{" "}
              <Link to="/login" className="text-[#2563EB] font-semibold hover:text-[#1d4ed8]">
                Sign in
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
