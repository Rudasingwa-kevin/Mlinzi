import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const publicLinks = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/report", label: "Report Abuse", icon: "🛡️" },
];

const counselorLinks = [
  { to: "/counselor", label: "Cases", icon: "👨‍⚕️" },
];

const nationalLinks = [
  { to: "/analytics", label: "Analytics", icon: "📊" },
  { to: "/admin", label: "Admin", icon: "⚙️" },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const getLinks = () => {
    if (!user) return publicLinks;
    if (user.role === "counselor") return [...publicLinks, ...counselorLinks];
    if (user.role === "national_society") return [...publicLinks, ...nationalLinks];
    return publicLinks;
  };

  const links = getLinks();

  return (
    <nav className="bg-[#0B1220] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2.5 group">
          <img src="/mlinzi-icon.png" alt="Mlinzi" className="h-9 w-9 object-contain" />
          <span className="text-xl font-bold text-white tracking-tight">Mlinzi</span>
          <span className="text-[11px] text-[#60A5FA] hidden sm:inline font-medium uppercase tracking-wider">
            Child Digital Protection
          </span>
        </Link>

        <div className="flex gap-1 items-center">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                pathname === link.to
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-gray-300 hover:bg-[#1e2d4a] hover:text-white"
              }`}
            >
              <span className="text-xs">{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-400 hidden sm:inline">
                {user.full_name}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-2xl text-sm font-medium text-gray-300 hover:bg-[#1e2d4a] hover:text-white transition-all"
              >
                Logout
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ml-2 ${
                pathname === "/login"
                  ? "bg-[#2563EB] text-white shadow-md"
                  : "text-gray-300 hover:bg-[#1e2d4a] hover:text-white"
              }`}
            >
              <span className="text-xs">🔑</span>
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
