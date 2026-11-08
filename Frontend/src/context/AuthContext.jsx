import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { loginRequest } from "../services/authService";

const AuthContext = createContext(null);
const STORAGE_KEY = "quizrank_user";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "null"); }
    catch { return null; }
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEY);
  }, [user]);

  const login = async (userId, password) => {
    setLoading(true);
    try {
      const data = await loginRequest(userId, password);
      const loggedInUser = data.user || data;
      if (!loggedInUser?.role) throw new Error(data.message || "Invalid login response.");
      setUser(loggedInUser);
      return loggedInUser;
    } finally { setLoading(false); }
  };

  const logout = () => setUser(null);
  const value = useMemo(() => ({ user, loading, login, logout, setUser }), [user, loading]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const value = useContext(AuthContext);
  if (!value) throw new Error("useAuth must be used inside AuthProvider");
  return value;
};
