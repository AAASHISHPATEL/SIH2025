import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Compass,
  BarChart2,
  MessageCircle,
  Share2,
  Database,
  Upload,
  LogOut,
  Menu,
  User,
} from "lucide-react";
import "./SidebarLayout.css";
import { useAuth } from "../../auth/AuthContext"; // ✅ use AuthContext

const SidebarLayout = () => {
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout } = useAuth(); // ✅ real user + logout from context

  // Close sidebar + profile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        sidebarOpen &&
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target)
      ) {
        setSidebarOpen(false);
      }
      if (
        menuOpen &&
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [sidebarOpen, menuOpen]);

  return (
    <div className={`sidebar-layout ${darkMode ? "sidebar-dark" : ""}`}>
      {/* Sidebar */}
      <aside
        ref={sidebarRef}
        className={`sidebar-container ${sidebarOpen ? "open" : ""}`}
      >
        <div className="sidebar-header">
          <button
            className="sidebar-menu-toggle inside"
            onClick={() => setSidebarOpen(false)}
          >
            <Menu />
          </button>
          <div className="nav-logo-container">
            {/* Logo with wave effect */}
            <svg
              viewBox="0 0 100 20"
              className="w-[140px] h-auto"
              xmlns="http://www.w3.org/2000/svg"
            >
              <defs>
                <pattern
                  id="wave"
                  x="0"
                  y="0"
                  width="120"
                  height="20"
                  patternUnits="userSpaceOnUse"
                >
                  <path
                    d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z"
                    fill="#123b57"
                  >
                    <animateTransform
                      attributeName="transform"
                      begin="0s"
                      dur="1.5s"
                      type="translate"
                      from="0,0"
                      to="40,0"
                      repeatCount="indefinite"
                    />
                  </path>
                </pattern>
                <linearGradient id="whiteGradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#ffffff" />
                  <stop offset="100%" stopColor="#ffffff" />
                </linearGradient>
              </defs>
              <text
                textAnchor="middle"
                x="50"
                y="15"
                fontSize="17"
                fontWeight="bold"
                fill="url(#wave)"
              >
                FLOATCHAT
              </text>
              <text
                textAnchor="middle"
                x="50"
                y="15"
                fontSize="17"
                fontWeight="bold"
                fill="url(#whiteGradient)"
                fillOpacity="0.9"
              >
                FLOATCHAT
              </text>
            </svg>
          </div>
        </div>

        {/* Sidebar Nav */}
        <nav className="sidebar-nav">
          <NavLink to="/NearestARGO" className="sidebar-link">
            <Compass /> Nearest ARGO Floats
          </NavLink>
          <NavLink to="/ExploreIndex" className="sidebar-link">
            <BarChart2 /> Explore Index
          </NavLink>
          <NavLink to="/Chat" className="sidebar-link">
            <MessageCircle /> Chat
          </NavLink>
          <NavLink to="/Trajectory&Comparison" className="sidebar-link">
            <Share2 /> Trajectories & Profile Comparison
          </NavLink>
          <NavLink to="/Ingest" className="sidebar-link">
            <Database /> Ingest
          </NavLink>
          <NavLink to="/Export" className="sidebar-link">
            <Upload /> Export
          </NavLink>

          <button
            className="sidebar-link sidebar-logout"
            onClick={logout} // ✅ use Auth logout
          >
            <LogOut /> Logout
          </button>
        </nav>

        {/* Footer */}
        <div className="sidebar-footer">
          <label className="sidebar-switch">
            <input
              type="checkbox"
              checked={darkMode}
              onChange={() => setDarkMode(!darkMode)}
            />
            <span className="sidebar-slider"></span>
            <span className="sidebar-mode-label">Dark mode</span>
          </label>
        </div>
      </aside>

      {/* Overlay */}
      {sidebarOpen && <div className="sidebar-overlay"></div>}

      {/* Main */}
      <div className="sidebar-main">
        <header className="sidebar-topbar">
          <div className="sidebar-topbar-left">
            <button
              className="sidebar-menu-toggle"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <Menu />
            </button>
            <div className="nav-logo-container">
              {/* Small logo */}
              <svg
                viewBox="0 0 100 20"
                className="w-[140px] h-auto"
                xmlns="http://www.w3.org/2000/svg"
              >
                <defs>
                  <pattern
                    id="waveTop"
                    x="0"
                    y="0"
                    width="120"
                    height="20"
                    patternUnits="userSpaceOnUse"
                  >
                    <path
                      d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z"
                      fill="#123b57"
                    >
                      <animateTransform
                        attributeName="transform"
                        begin="0s"
                        dur="1.5s"
                        type="translate"
                        from="0,0"
                        to="40,0"
                        repeatCount="indefinite"
                      />
                    </path>
                  </pattern>
                  <linearGradient
                    id="whiteGradientTop"
                    x1="0"
                    x2="0"
                    y1="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#ffffff" />
                    <stop offset="100%" stopColor="#ffffff" />
                  </linearGradient>
                </defs>
                <text
                  textAnchor="middle"
                  x="50"
                  y="15"
                  fontSize="17"
                  fontWeight="bold"
                  fill="url(#waveTop)"
                >
                  FLOATCHAT
                </text>
                <text
                  textAnchor="middle"
                  x="50"
                  y="15"
                  fontSize="17"
                  fontWeight="bold"
                  fill="url(#whiteGradientTop)"
                  fillOpacity="0.9"
                >
                  FLOATCHAT
                </text>
              </svg>
            </div>
          </div>

          {/* Profile dropdown */}
          <div className="sidebar-profile" ref={profileRef}>
            <button
              className="sidebar-profile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <User />
              <span>{user?.name || "Guest"}</span>
            </button>
            {menuOpen && (
              <div className="sidebar-profile-menu">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        {/* Page content */}
        <main className="sidebar-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
