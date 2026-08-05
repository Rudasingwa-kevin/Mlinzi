import { Link, useLocation } from "react-router-dom";

const links = [
  { to: "/", label: "Home" },
  { to: "/report", label: "Report Abuse" },
  { to: "/dashboard", label: "Counselor" },
  { to: "/analytics", label: "Analytics" },
];

export default function Navbar() {
  const { pathname } = useLocation();

  return (
    <nav className="bg-white shadow-sm border-b border-slate-200">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2">
          <span className="text-2xl font-bold text-blue-600">Mlinzi</span>
          <span className="text-xs text-slate-500 hidden sm:inline">Child Digital Protection</span>
        </Link>

        <div className="flex gap-1">
          {links.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                pathname === link.to
                  ? "bg-blue-50 text-blue-700"
                  : "text-slate-600 hover:bg-slate-100"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
