import  { useState, useEffect, useRef } from "react";
import { NavLink } from "react-router-dom";
import { Menu, X } from "lucide-react";
import "./Navbar.css";

const Navbar = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const sidebarRef = useRef(null);

  const toggleSidebar = () => setIsSidebarOpen(!isSidebarOpen);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target)) {
        setIsSidebarOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <nav className="saeNav">
      {/* <div className="nav-logo-container">
        <h1 className=" font-semibold text-2xl text-[#63b3ed]">FloatChat</h1>
      </div> */}

      <div className="nav-logo-container">
        <svg
          viewBox="0 0 100 20"
          className="w-[140px] h-auto"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="5%" stopColor="#326384" />
              <stop offset="95%" stopColor="#63b3ed" />
            </linearGradient>
            <pattern
              id="wave"
              x="0"
              y="0"
              width="120"
              height="20"
              patternUnits="userSpaceOnUse"
            >
              <path
                id="wavePath"
                d="M-40 9 Q-30 7 -20 9 T0 9 T20 9 T40 9 T60 9 T80 9 T100 9 T120 9 V20 H-40z"
                fill="url(#gradient)"
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
          </defs>
          <text
            textAnchor="middle"
            x="50"
            y="15"
            fontSize="17"
            fontWeight={"bold"}
            fill="url(#wave)"
            fillOpacity="0.9"
          >
            FLOATCHAT
          </text>
          <text
            textAnchor="middle"
            x="50"
            y="15"
            fontSize="17"
            fontWeight={"bold"}
            fill="url(#gradient)"
            fillOpacity="0.1"
          >
            FLOATCHAT
          </text>
        </svg>
      </div>

      <button
        className="open-sidebar-button"
        onClick={toggleSidebar}
        aria-label="Toggle menu"
      >
        <Menu className="h-6 w-6" />
      </button>

      <div
        ref={sidebarRef}
        className={`nav-links-container ${isSidebarOpen ? "open" : ""}`}
      >
        <button
          className="close-sidebar-button"
          onClick={toggleSidebar}
          aria-label="Close menu"
        >
          <X className="h-6 w-6" />
        </button>

        <NavLink
          to="/NearestARGO"
          className={({ isActive }) =>
            isActive ? "navlink active" : "navlink"
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          Nearest ARGO Floats
        </NavLink>
        <NavLink
          to="/ExploreIndex"
          className={({ isActive }) =>
            isActive ? "navlink active" : "navlink"
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          Explore Index
        </NavLink>
        <NavLink
          to="/Chat"
          className={({ isActive }) =>
            isActive ? "navlink active" : "navlink"
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          Chat
        </NavLink>
        <NavLink
          to="/Trajectory&Comparison"
          className={({ isActive }) =>
            isActive ? "navlink active" : "navlink"
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          Tragectories & Profile Comparison
        </NavLink>
        <NavLink
          to="/Ingest"
          className={({ isActive }) =>
            isActive ? "navlink active" : "navlink"
          }
          onClick={() => setIsSidebarOpen(false)}
        >
          Ingest
        </NavLink>
      </div>
    </nav>
  );
};

export default Navbar;
