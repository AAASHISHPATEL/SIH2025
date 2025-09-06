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
      <div className="nav-logo-container">
        <h1 className=" font-semibold text-2xl text-[#63b3ed]">FloatChat</h1>
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
          to="/"
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
      </div>
    </nav>
  );
};

export default Navbar;
