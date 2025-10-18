import { NavLink } from "react-router-dom";
const linkStyle = ({ isActive }) => ({ padding:"8px 12px", textDecoration:"none", borderRadius:8, background: isActive ? "#eef2ff" : "transparent" });
export default function Navbar(){
  return (
    <nav style={{display:"flex",gap:8,padding:12,borderBottom:"1px solid #eee",position:"sticky",top:0,background:"#fff"}}>
      <NavLink to="/" style={linkStyle}>Home</NavLink>
      <NavLink to="/expenses" style={linkStyle}>Expenses</NavLink>
      <NavLink to="/reports" style={linkStyle}>Reports</NavLink>
      <div style={{marginLeft:"auto",display:"flex",gap:8}}>
        <NavLink to="/login" style={linkStyle}>Login</NavLink>
        <NavLink to="/register" style={linkStyle}>Register</NavLink>
      </div>
    </nav>
  );
}