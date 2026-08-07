import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Home, Shield, BarChart3, Settings, LogIn, LogOut } from "lucide-react";

const publicLinks = [
  { to: "/", label: "Home", icon: Home },
  { to: "/report", label: "Report Abuse", icon: Shield },
];

const counselorLinks = [
  { to: "/counselor", label: "Cases", icon: BarChart3 },
];

const nationalLinks = [
  { to: "/analytics", label: "Analytics", icon: BarChart3 },
  { to: "/admin", label: "Admin", icon: Settings },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();

  const getLinks = () => {
    if (!user) return publicLinks;
    if (user.role === "counselor") return counselorLinks;
    if (user.role === "national_society") return nationalLinks;
    return publicLinks;
  };

  const links = getLinks();

  return (
    <nav className="bg-[#1B5E20] shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
        <Link to="/" className="flex items-center group">
          <img src="/mlinzi-full-logo.png" alt="Mlinzi" className="h-36 object-contain" />
        </Link>

        <div className="flex gap-1 items-center">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <Link
                key={link.to}
                to={link.to}
                className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${pathname === link.to
                  ? "bg-[#2E7D32] text-white shadow-md"
                  : "text-gray-300 hover:bg-[#2E7D32] hover:text-white"
                  }`}
              >
                <Icon size={16} />
                <span className="hidden sm:inline">{link.label}</span>
              </Link>
            );
          })}

          {user ? (
            <div className="flex items-center gap-2 ml-2">
              <span className="text-xs text-gray-400 hidden sm:inline">
                {user.full_name}
              </span>
              <button
                onClick={logout}
                className="px-3 py-2 rounded-2xl text-sm font-medium text-gray-100 hover:bg-[#2E7D32] hover:text-white transition-all flex items-center gap-1.5"
              >
                <LogOut size={16} />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ml-2 ${pathname === "/login"
                ? "bg-[#2E7D32] text-white shadow-md"
                : "text-gray-100 hover:bg-[#2E7D32] hover:text-white"
                }`}
            >
              <LogIn size={16} />
              <span className="hidden sm:inline">Login</span>
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
