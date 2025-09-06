// import React from "react";
import { NavLink } from "react-router-dom";
import {
  
 
  ChevronUpIcon,
  
} from "lucide-react";
import "./Footer.css";

const Footer = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <footer className="bg-black text-gray-300 relative">
      <button
        onClick={scrollToTop}
        className="absolute -top-6 left-1/2 transform -translate-x-1/2 bg-custom-color p-3 rounded-full shadow-lg hover:bg-custom-color transition-all duration-300 focus:outline-none"
        aria-label="Scroll to top"
      >
        <ChevronUpIcon className="w-6 h-6 text-white" />
      </button>

      <div className="max-w-7xl mx-auto px-6 py-14">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
          {/* Logo Section */}
          <div>
            <a href="https://saenitd.in/">
              {" "}
              {/* <img
                src="https://i.ibb.co/fvZpdy8/SAE-Logo-White-3x.png"
                alt="SAE Logo"
                className="w-32 mb-4"
              /> */}
              <h1 className="font-semibold text-2xl mb-4 w-32 text-blue-400">
                FloatChat
              </h1>
            </a>
            <p className="text-gray-400 leading-relaxed">
              Driving innovation and excellence in automotive engineering
              education and research.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-xl font-bold mb-4 relative inline-block">
              Quick Links
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-custom-color"></span>
            </h3>
            <nav className="space-y-4 flex flex-col">
              <NavLink to="/" className="hover:text-[#63b3ed]">
                Nearest ARGO Floats
              </NavLink>

              <NavLink to="/ExploreIndex" className="hover:text-[#63b3ed]">
                Explore Index
              </NavLink>

              <NavLink to="/Chat" className="hover:text-[#63b3ed]">
                Chat
              </NavLink>

              <NavLink
                to="/Trajectory&Comparison"
                className="hover:text-[#63b3ed]"
              >
                Trajectory & Comparison
              </NavLink>
            </nav>
          </div>

          {/* Connect With Us */}
          <div>
            <h3 className="text-xl font-bold mb-4 relative inline-block">
              Connect With Us
              <span className="absolute bottom-0 left-0 w-1/2 h-0.5 bg-custom-color"></span>
            </h3>
            <p className="text-gray-400 mb-4">
              Follow us on social media to stay updated with the latest news,
              events, and innovations.
            </p>
            
          </div>

          {/* Google Map */}
          <div>
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d14630.312462134343!2d87.2931383!3d23.5476717!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x39f772081cede5e9%3A0x33fb9ccb243dfa5!2sNational%20Institute%20of%20Technology%20Durgapur!5e0!3m2!1sen!2sin!4v1704636928883!5m2!1sen!2sin"
              width="100%"
              height="200"
              style={{ border: 0 }}
              allowFullScreen=""
              loading="lazy"
              title="Google Maps Location"
            ></iframe>
          </div>
        </div>

        <div className="mt-10 pt-6 border-t border-gray-700 flex flex-col md:flex-row justify-between items-center text-center">
          <p className="text-gray-400 text-sm">
            &copy; {new Date().getFullYear()} All rights reserved.
          </p>
          <p className="text-gray-400 text-sm mt-4 md:mt-0">
            Made with ❤️ by Code Clashers Team {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
