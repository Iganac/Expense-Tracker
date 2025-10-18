import React, { createContext, useContext, useEffect, useState, useCallback } from "react";

const TOKEN_KEY = "et_token";
const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY) || "");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  // Wrapper fetch with Bearer token
  const api = useCallback(async (url, options = {}) => {
    const headers = { ...(options.headers || {}) };
    if (token) headers.Authorization = `Bearer ${token}`;

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401) {
      // expired/invalid token → logout
      localStorage.removeItem(TOKEN_KEY);
      setToken(""); setUser(null);
      window.location.href = "/login";
      throw new Error("Unauthorized");
    }
    return res;
  }, [token]);

  // Load user info (/api/auth/me) when token exists
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!token) { setUser(null); setLoading(false); return; }
      try {
        setLoading(true);
        const res = await api("/api/auth/me");
        if (!res.ok) throw new Error("Failed to load user");
        const data = await res.json();
        if (!ignore) setUser(data);
      } catch {
        if (!ignore) { setUser(null); setToken(""); localStorage.removeItem(TOKEN_KEY); }
      } finally { if (!ignore) setLoading(false); }
    })();
    return () => { ignore = true; };
  }, [token, api]);

  // login
  const login = async (email, password) => {
    const res = await fetch("/api/auth/login", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Login failed");
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  };

  // register
  const register = async (email, password) => {
    const res = await fetch("/api/auth/register", {
      method: "POST", headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password })
    });
    if (!res.ok) throw new Error("Register failed");
    const data = await res.json();
    localStorage.setItem(TOKEN_KEY, data.token);
    setToken(data.token);
  };

  // logout
  const logout = () => { localStorage.removeItem(TOKEN_KEY); setToken(""); setUser(null); };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, register, logout, api }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}