import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccessibility } from "../context/AccessibilityContext";
import {
  Home,
  Shield,
  BarChart3,
  Settings,
  LogIn,
  LogOut,
  Menu,
  X,
  ChevronDown,
  User,
} from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();
  const { user, logout } = useAuth();
  const { t } = useAccessibility();

  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef(null);

  /* ── scroll detection ── */
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  /* ── close mobile menu on route change ── */
  useEffect(() => {
    setMobileOpen(false);
    setUserMenuOpen(false);
  }, [pathname]);

  /* ── close user dropdown when clicking outside ── */
  useEffect(() => {
    const handler = (e) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const publicLinks = [
    { to: "/", label: t("home"), icon: Home },
    { to: "/report", label: t("reportAbuse"), icon: Shield },
  ];

  const counselorLinks = [{ to: "/counselor", label: t("cases"), icon: BarChart3 }];

  const nationalLinks = [
    { to: "/analytics", label: t("analytics"), icon: BarChart3 },
    { to: "/admin", label: t("admin"), icon: Settings },
  ];

  const getLinks = () => {
    if (!user) return publicLinks;
    if (user.role === "counselor") return counselorLinks;
    if (user.role === "national_society") return nationalLinks;
    return publicLinks;
  };

  const links = getLinks();

  /* ── initials avatar ── */
  const getInitials = (name = "") =>
    name
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase())
      .join("");

  return (
    <>
      <style>{`
        /* ── nav transition ── */
        .mlinzi-nav {
          position: sticky;
          top: 0;
          z-index: 50;
          transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);
        }
        .mlinzi-nav.scrolled {
          background: rgba(21, 78, 26, 0.88);
          backdrop-filter: blur(20px) saturate(1.6);
          -webkit-backdrop-filter: blur(20px) saturate(1.6);
          box-shadow: 0 1px 0 rgba(255,255,255,0.06), 0 8px 32px rgba(0,0,0,0.28);
        }
        .mlinzi-nav.top {
          background: #1B5E20;
          box-shadow: 0 1px 0 rgba(255,255,255,0.05), 0 2px 12px rgba(0,0,0,0.2);
        }

        /* ── nav link ── */
        .nav-link {
          position: relative;
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 16px 10px;
          border-radius: 0;
          font-size: 0.875rem;
          font-weight: 500;
          letter-spacing: 0.01em;
          color: rgba(255,255,255,0.65);
          transition: color 0.2s ease;
          white-space: nowrap;
          text-decoration: none;
        }
        .nav-link:hover {
          color: rgba(255,255,255,0.95);
        }

        /* ── sliding underline ── */
        .nav-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 16px;
          right: 16px;
          height: 2px;
          border-radius: 99px;
          background: linear-gradient(90deg, #81C784, #A5D6A7);
          transform: scaleX(0);
          transform-origin: center;
          transition: transform 0.25s cubic-bezier(0.4, 0, 0.2, 1),
                      opacity 0.2s;
          opacity: 0;
        }
        .nav-link:hover::after {
          transform: scaleX(0.6);
          opacity: 0.7;
        }
        .nav-link.active {
          color: #fff;
          font-weight: 600;
        }
        .nav-link.active::after {
          transform: scaleX(1);
          opacity: 1;
          box-shadow: 0 0 8px rgba(165, 214, 167, 0.6);
        }

        /* ── login btn ── */
        .login-btn {
          display: inline-flex;
          align-items: center;
          gap: 7px;
          padding: 8px 20px;
          border-radius: 999px;
          font-size: 0.875rem;
          font-weight: 700;
          background: #fff;
          color: #1B5E20;
          border: none;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          transition: background 0.2s, transform 0.15s, box-shadow 0.2s;
          letter-spacing: 0.01em;
        }
        .login-btn:hover {
          background: #F1F8E9;
          transform: translateY(-2px);
          box-shadow: 0 6px 20px rgba(0,0,0,0.2);
        }
        .login-btn:active {
          transform: translateY(0);
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
        }

        /* ── avatar dropdown ── */
        .avatar-btn {
          display: inline-flex;
          align-items: center;
          gap: 8px;
          padding: 4px 12px 4px 4px;
          border-radius: 999px;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .avatar-btn:hover {
          background: rgba(255,255,255,0.22);
          transform: translateY(-1px);
        }
        .avatar-circle {
          width: 30px;
          height: 30px;
          border-radius: 50%;
          background: linear-gradient(135deg, #A5D6A7, #388E3C);
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.75rem;
          font-weight: 700;
          color: #1B5E20;
          flex-shrink: 0;
        }
        .chevron-icon {
          transition: transform 0.25s;
        }
        .chevron-icon.open {
          transform: rotate(180deg);
        }
        .user-dropdown {
          position: absolute;
          right: 0;
          top: calc(100% + 10px);
          background: #fff;
          border-radius: 14px;
          box-shadow: 0 12px 40px rgba(0,0,0,0.18);
          padding: 8px;
          min-width: 190px;
          animation: dropIn 0.2s cubic-bezier(0.34,1.56,0.64,1);
          transform-origin: top right;
        }
        @keyframes dropIn {
          from { opacity: 0; transform: scale(0.85) translateY(-8px); }
          to   { opacity: 1; transform: scale(1) translateY(0); }
        }
        .dropdown-item {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 10px 14px;
          border-radius: 10px;
          color: #1B5E20;
          font-size: 0.875rem;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.15s;
          border: none;
          background: none;
          width: 100%;
        }
        .dropdown-item:hover {
          background: #E8F5E9;
        }
        .dropdown-item.danger {
          color: #c62828;
        }
        .dropdown-item.danger:hover {
          background: #FFEBEE;
        }
        .dropdown-divider {
          height: 1px;
          background: #E8F5E9;
          margin: 6px 0;
        }

        /* ── hamburger ── */
        .hamburger {
          display: none;
          align-items: center;
          justify-content: center;
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255,255,255,0.12);
          border: 1px solid rgba(255,255,255,0.2);
          color: #fff;
          cursor: pointer;
          transition: background 0.2s, transform 0.15s;
        }
        .hamburger:hover {
          background: rgba(255,255,255,0.22);
          transform: rotate(10deg);
        }

        /* ── mobile menu ── */
        .mobile-menu {
          overflow: hidden;
          transition: max-height 0.35s cubic-bezier(0.4,0,0.2,1),
                      opacity 0.3s ease;
          max-height: 0;
          opacity: 0;
        }
        .mobile-menu.open {
          max-height: 400px;
          opacity: 1;
        }
        .mobile-link {
          display: flex;
          align-items: center;
          gap: 10px;
          padding: 11px 16px;
          border-radius: 12px;
          font-size: 0.9rem;
          font-weight: 500;
          color: rgba(255,255,255,0.8);
          transition: background 0.2s, color 0.2s;
        }
        .mobile-link:hover, .mobile-link.active {
          background: rgba(255,255,255,0.15);
          color: #fff;
        }

        @media (max-width: 640px) {
          .hamburger { display: flex; }
          .desktop-links { display: none; }
        }
      `}</style>

      <nav className={`mlinzi-nav ${scrolled ? "scrolled" : "top"}`}>
        <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center group">
            <img
              src="/full.png"
              alt="Mlinzi"
              className="object-contain transition-all duration-300"
              style={{ height: scrolled ? "80px" : "110px" }}
            />
          </Link>

          {/* Desktop links */}
          <div className="desktop-links flex gap-1 items-center">
            {links.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.to;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`nav-link ${isActive ? "active" : ""}`}
                >
                  <Icon size={15} />
                  <span>{link.label}</span>
                </Link>
              );
            })}

            {/* Auth area */}
            {user ? (
              <div className="relative ml-2" ref={userMenuRef}>
                <button
                  className="avatar-btn"
                  onClick={() => setUserMenuOpen((o) => !o)}
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <span className="avatar-circle">{getInitials(user.full_name)}</span>
                  <span className="hidden sm:inline max-w-[110px] truncate">
                    {user.full_name?.split(" ")[0]}
                  </span>
                  <ChevronDown size={14} className={`chevron-icon ${userMenuOpen ? "open" : ""}`} />
                </button>

                {userMenuOpen && (
                  <div className="user-dropdown">
                    <div style={{ padding: "8px 14px 6px" }}>
                      <p style={{ fontSize: "0.75rem", color: "#888", marginBottom: 2 }}>
                        Signed in as
                      </p>
                      <p style={{ fontSize: "0.875rem", fontWeight: 600, color: "#1B5E20", maxWidth: 160, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                        {user.full_name}
                      </p>
                    </div>
                    <div className="dropdown-divider" />
                    <button
                      className="dropdown-item danger"
                      onClick={() => { logout(); setUserMenuOpen(false); }}
                    >
                      <LogOut size={15} />
                      {t("logout")}
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <Link to="/login" className="login-btn ml-2">
                <LogIn size={15} />
                <span>{t("login")}</span>
              </Link>
            )}
          </div>

          {/* Hamburger (mobile) */}
          <button
            className="hamburger"
            onClick={() => setMobileOpen((o) => !o)}
            aria-label="Toggle menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>

        {/* Mobile menu */}
        <div className={`mobile-menu ${mobileOpen ? "open" : ""}`}>
          <div className="px-4 pb-4 flex flex-col gap-1">
            {links.map((link) => {
              const Icon = link.icon;
              return (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`mobile-link ${pathname === link.to ? "active" : ""}`}
                >
                  <Icon size={17} />
                  {link.label}
                </Link>
              );
            })}

            <div className="dropdown-divider" style={{ background: "rgba(255,255,255,0.15)", margin: "6px 0" }} />

            {user ? (
              <button
                className="mobile-link"
                onClick={logout}
                style={{ border: "none", background: "none", cursor: "pointer", color: "#ffcdd2" }}
              >
                <LogOut size={17} />
                {t("logout")}
              </button>
            ) : (
              <Link to="/login" className="mobile-link">
                <LogIn size={17} />
                {t("login")}
              </Link>
            )}
          </div>
        </div>
      </nav>
    </>
  );
}
