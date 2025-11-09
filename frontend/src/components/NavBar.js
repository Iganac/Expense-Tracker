import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../state/AuthContext";

const linkStyle = ({ isActive }) => ({
  padding: "8px 12px",
  textDecoration: "none",
  borderRadius: 8,
  background: isActive ? "#eef2ff" : "transparent",
});

export default function Navbar() {
  const navigate = useNavigate();
  const { logout } = useAuth();
  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav
      style={{
        display: "flex",
        gap: 8,
        padding: 12,
        borderBottom: "1px solid #eee",
        position: "sticky",
        top: 0,
        background: "#fff",
      }}
    >
      <NavLink to="/" style={linkStyle}>
        Home
      </NavLink>
      <NavLink to="/expenses" style={linkStyle}>
        Expenses
      </NavLink>
      <NavLink to="/reports" style={linkStyle}>
        Reports
      </NavLink>

      <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
        <button
          onClick={handleLogout}
          style={{
            padding: "8px 12px",
            borderRadius: 8,
            border: "none",
            cursor: "pointer",
            background: "#fef2f2",
            color: "#b91c1c",
          }}
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
