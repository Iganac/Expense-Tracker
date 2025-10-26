import { createContext, useContext, useEffect, useState } from "react";
import { loginApi, registerApi, meApi, logoutApi } from "./authApi";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);   // for initial /api/me

  useEffect(() => {
    (async () => {
      try {
        const me = await meApi();
        setUser(me);
      } catch {
        setUser(null);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  async function login({ email, password }) {
    await loginApi({ email, password });
    const me = await meApi();
    setUser(me);
  }

  async function register({ name, email, password }) {
    await registerApi({ name, email, password });
  }

  function logout() {
    logoutApi();
    setUser(null);
  }

  const api = { user, loading, login, register, logout };
  return <AuthContext.Provider value={api}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
