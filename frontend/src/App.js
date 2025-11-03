// App.jsx
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import NavBar from "./components/NavBar";
import HomePage from "./pages/HomePage";
import ExpensesPage from "./pages/ExpensesPage";
import ReportsPage from "./pages/ReportsPage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import ProtectedRoute from "./components/ProtectedRoute";
import { ExpensesProvider } from "./state/ExpensesContext";
import { AuthProvider } from "./state/AuthContext";

function Layout() {
  const location = useLocation();
  const hideNav = location.pathname === "/login" || location.pathname === "/register";
  return (
    <>
      {!hideNav && <NavBar />}
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/" element={<ProtectedRoute><HomePage /></ProtectedRoute>} />
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
