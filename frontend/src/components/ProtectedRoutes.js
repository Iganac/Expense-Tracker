import { Navigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";
import Loading from "../components/feedback/Loading";

export default function ProtectedRoute({ children }) {
  const { token, loading } = useAuth();
  if (loading) return <div style={{ padding: 16 }}><Loading text="Loading..." /></div>;
  if (!token) return <Navigate to="/login" replace />;
  return children;
}
