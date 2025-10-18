import { useState } from "react";
import { useAuth } from "../state/AuthContext";
export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [err, setErr] = useState("");
  const submit = async e => { e.preventDefault(); try { await login(email, password); } catch { setErr("Invalid credentials"); } };
  return (
    <div style={{ padding: 16 }}>
      <h2>Login</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 340 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
        <button>Login</button>
      </form>
    </div>
  );
}
