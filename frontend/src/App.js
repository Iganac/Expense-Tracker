import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { Navigate } from "react-router-dom";
import { ExpensesProvider } from "./state/ExpensesContext";
import { AuthProvider, useAuth } from "./state/AuthContext";


function Layout() {
  const location = useLocation();
  const { user, loading } = useAuth();

  const isAuthPage = location.pathname === "/login" || location.pathname === "/register";
  const showNav = !isAuthPage && !loading && user;

  return (
    <>
      {showNav && <NavBar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<Navigate to="/expenses" replace />} />
        <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
        <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
      </Routes>
    </>
  );
}


export default function App() {
  return (
    <AuthProvider>
      <ExpensesProvider>
        <BrowserRouter>
          <Layout />
        </BrowserRouter>
      </ExpensesProvider>
    </AuthProvider>
  );
}
