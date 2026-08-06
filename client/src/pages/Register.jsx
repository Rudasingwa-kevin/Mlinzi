import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { registerUser } from "../services/api";

export default function Register() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "", full_name: "", role: "counselor" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const data = await registerUser(form);
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      if (data.user.role === "counselor") {
        navigate("/dashboard");
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

  return (
    <div className="min-h-[calc(100vh-56px)] flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl border border-soft shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-4xl mb-3">🛡️</div>
          <h1 className="text-2xl font-bold text-navy">Create Account</h1>
          <p className="text-sm text-slate-gray mt-1">Join Mlinzi to protect children</p>
        </div>

        {error && (
          <div className="bg-red-soft/50 border border-red/20 text-red px-4 py-3 rounded-xl mb-6 text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-navy mb-2">Full Name</label>
            <input
              type="text"
              required
              value={form.full_name}
              onChange={(e) => setForm({ ...form, full_name: e.target.value })}
              className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
              placeholder="John Doe"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">Email</label>
            <input
              type="email"
              required
              value={form.email}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
              placeholder="you@example.com"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={form.password}
              onChange={(e) => setForm({ ...form, password: e.target.value })}
              className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-navy mb-2">Role</label>
            <select
              value={form.role}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="w-full border border-soft rounded-2xl px-4 py-3 text-sm focus:border-blue focus:ring-2 focus:ring-blue/20 outline-none transition-all bg-white"
            >
              <option value="counselor">Counselor</option>
              <option value="national_society">National Society</option>
            </select>
            <p className="text-xs text-slate-gray mt-2">
              {form.role === "counselor"
                ? "Review and manage abuse reports"
                : "View analytics and national statistics"}
            </p>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-blue text-white py-3 rounded-2xl font-medium hover:bg-blue-dark transition-all duration-200 shadow-sm disabled:opacity-50"
          >
            {loading ? "Creating account..." : "Create Account"}
          </button>
        </form>

        <p className="text-center text-sm text-slate-gray mt-6">
          Already have an account?{" "}
          <Link to="/login" className="text-blue font-medium hover:text-blue-dark">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
