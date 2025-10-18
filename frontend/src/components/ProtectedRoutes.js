import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{padding:16}}>Loading…</div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
