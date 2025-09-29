import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

// --- Configure axios ---
axios.defaults.withCredentials = true; // send cookies
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL; // ✅ your backend URL

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  // Restore session if cookie/token exists
  
  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get("/users/profile"); // ✅ change here
        if (mounted) setUser(data.user);
      } catch {
        if (mounted) setUser(null);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // Sign in
  const login = async (credentials) => {
    const { data } = await axios.post("/users/login", credentials); // ✅ match backend
    setUser(data.user);
    return data.user;
  };

  // Sign up
  const register = async (payload) => {
    const { data } = await axios.post("/users/register", payload); // ✅ match backend
    setUser(data.user);
    return data.user;
  };

  // Logout
  const logout = async () => {
    try {
      await axios.get("/users/logout"); // ✅ your backend defines it as GET
    } catch {}
    setUser(null);
    navigate("/", { replace: true });
  };


  return (
    <AuthContext.Provider
      value={{ user, setUser, login, register, logout, loading }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
