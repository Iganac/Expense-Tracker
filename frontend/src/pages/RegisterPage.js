import { useState } from "react";
import { useAuth } from "../state/AuthContext";
export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState(""); const [password, setPassword] = useState(""); const [err, setErr] = useState("");
  const submit = async e => { e.preventDefault(); try { await register(email, password); } catch { setErr("Register failed"); } };
  return (
    <div style={{ padding: 16 }}>
      <h2>Register</h2>
      {err && <div style={{ color: "crimson" }}>{err}</div>}
      <form onSubmit={submit} style={{ display: "grid", gap: 8, maxWidth: 340 }}>
        <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
        <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="Password" />
        <button>Create account</button>
      </form>
    </div>
  );
}
