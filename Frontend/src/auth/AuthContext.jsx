import { createContext, useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

axios.defaults.withCredentials = true;
axios.defaults.baseURL = import.meta.env.VITE_BACKEND_URL;

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true); // ✅ single loading state
  const [authSubmitting, setAuthSubmitting] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const { data } = await axios.get("/users/profile");
        console.log("Profile API response:", data);
        if (mounted) setUser(data.user);
      } catch (err) {
        console.error("Profile fetch error:", err);
        if (mounted) setUser(null);
      } finally {
        if (mounted) setAuthLoading(false); // ✅ use correct state
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  const login = async (credentials) => {
    setAuthSubmitting(true);
    try {
      const { data } = await axios.post("/users/login", credentials);
      setUser(data.user);
      return data.user;
    } finally {
      setAuthSubmitting(false);
    }
  };

  const register = async (payload) => {
    setAuthSubmitting(true);
    try {
      const { data } = await axios.post("/users/register", payload);
      setUser(data.user);
      return data.user;
    } finally {
      setAuthSubmitting(false);
    }
  };

  const logout = async () => {
    try {
      await axios.get("/users/logout");
    } catch {}
    setUser(null);
    navigate("/login", { replace: true });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        login,
        register,
        logout,
        authLoading,
        authSubmitting,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
