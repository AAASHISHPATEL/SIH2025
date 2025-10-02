import { useState, useRef, useEffect } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  Compass,
  BarChart2,
  MessageCircle,
  Share2,
  Database,
  LogOut,
  Menu,
  User,
  Upload,
  Download,
} from "lucide-react";
import "./SidebarLayout.css";
import { useAuth } from "../../auth/AuthContext";
import LoadingOverlay from "../LoadingOverlay/LoadingOverlay";

const SidebarLayout = () => {
  const [darkMode, setDarkMode] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  const [expBusy, setExpBusy] = useState({ parquet: false, netcdf: false });
  const [downloadLinks, setDownloadLinks] = useState({
    parquet: null,
    netcdf: null,
  });

  const sidebarRef = useRef(null);
  const profileRef = useRef(null);
  const navigate = useNavigate();

  const { user, logout, authLoading, authSubmitting } = useAuth();

  useEffect(() => {
    return () => {
      if (downloadLinks.parquet) URL.revokeObjectURL(downloadLinks.parquet);
      if (downloadLinks.netcdf) URL.revokeObjectURL(downloadLinks.netcdf);
    };
  }, [downloadLinks]);

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

  const prepareParquet = async () => {
    // Clear any existing NetCDF download when preparing Parquet
    setDownloadLinks({ parquet: null, netcdf: null });
    setExpBusy((b) => ({ ...b, parquet: true }));
    await new Promise((r) => setTimeout(r, 1500));
    const dummy = {
      exportedAt: new Date().toISOString(),
      rows: [{ id: 1, temp: 22.4 }],
    };
    const blob = new Blob([JSON.stringify(dummy, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    setDownloadLinks({ parquet: url, netcdf: null });
    setExpBusy((b) => ({ ...b, parquet: false }));
  };

  const prepareNetCDF = async () => {
    // Clear any existing Parquet download when preparing NetCDF
    setDownloadLinks({ parquet: null, netcdf: null });
    setExpBusy((b) => ({ ...b, netcdf: true }));
    await new Promise((r) => setTimeout(r, 1500));
    const text = `netcdf dummy {
dimensions: sample=1;
variables: float temp(sample);
data: temp=22.4;
}`;
    const blob = new Blob([text], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    setDownloadLinks({ parquet: null, netcdf: url });
    setExpBusy((b) => ({ ...b, netcdf: false }));
  };


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
            {/* ✅ Restored original wave logo */}
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

          {/* ✅ Exports Section */}
          <div className="sidebar-section">
            <div className="sidebar-section-title">
              <Upload size={16} /> Exports
            </div>

            {/* Parquet */}
            <button
              className="export-btn"
              onClick={prepareParquet}
              disabled={expBusy.parquet}
            >
              {expBusy.parquet
                ? "Preparing Parquet..."
                : "Export ingested info to Parquet"}
            </button>
            {downloadLinks.parquet && (
              <a
                href={downloadLinks.parquet}
                download="floatchat_export.parquet"
                className="download-btn"
              >
                <Download size={14} /> Download Parquet
              </a>
            )}

            {/* NetCDF */}
            <button
              className="export-btn"
              onClick={prepareNetCDF}
              disabled={expBusy.netcdf}
            >
              {expBusy.netcdf
                ? "Preparing NetCDF..."
                : "Export ingested info to NetCDF (simple)"}
            </button>
            {downloadLinks.netcdf && (
              <a
                href={downloadLinks.netcdf}
                download="floatchat_export.nc"
                className="download-btn"
              >
                <Download size={14} /> Download NetCDF
              </a>
            )}
          </div>

          <button className="sidebar-link sidebar-logout" onClick={logout}>
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
              {/* ✅ Restored topbar small logo */}
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

          <div className="sidebar-profile" ref={profileRef}>
            <button
              className="sidebar-profile-toggle"
              onClick={() => setMenuOpen(!menuOpen)}
            >
              <User />
              {authLoading ? (
                <LoadingOverlay label="Restoring session..." />
              ) : authSubmitting ? (
                <LoadingOverlay label="Signing in..." />
              ) : user ? (
                <span>{user.name}</span>
              ) : (
                <span>Guest</span>
              )}
            </button>
            {menuOpen && (
              <div className="sidebar-profile-menu">
                <button onClick={() => navigate("/profile")}>Profile</button>
                <button onClick={logout}>Logout</button>
              </div>
            )}
          </div>
        </header>

        <main className="sidebar-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default SidebarLayout;
