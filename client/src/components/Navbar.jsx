import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home", icon: "🏠" },
  { to: "/report", label: "Report Abuse", icon: "🛡️" },
  { to: "/dashboard", label: "Counselor", icon: "👨‍⚕️" },
  { to: "/analytics", label: "Analytics", icon: "📊" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="bg-navy shadow-lg">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <img src="/mlinzi-icon.png" alt="Mlinzi" className="h-8 w-8 object-contain" />
          <span className="text-xl font-bold text-white tracking-tight">Mlinzi</span>
          <span className="text-[10px] text-blue-300 hidden sm:inline font-medium uppercase tracking-wider">
            Child Digital Protection
          </span>
        </Link>

        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-2xl text-sm font-medium transition-all duration-200 flex items-center gap-1.5 ${
                pathname === link.to
                  ? "bg-blue text-white shadow-md"
                  : "text-slate-300 hover:bg-navy-light hover:text-white"
              }`}
            >
              <span className="text-xs">{link.icon}</span>
              <span className="hidden sm:inline">{link.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
