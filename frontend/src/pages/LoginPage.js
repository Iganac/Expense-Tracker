import { useState } from "react";
import { useAuth } from "../state/AuthContext";
import { useNavigate, useLocation, Link } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import ErrorBanner from "../components/feedback/ErrorBanner";

export default function LoginPage() {
  const { login } = useAuth();
  const nav = useNavigate();
  const loc = useLocation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login({ email, password });
      nav(loc.state?.from || "/", { replace: true });
    } catch (ex) {
      setErr("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  const screenCenter = {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "flex-start",
    paddingTop: "12vh",
    paddingLeft: 16,
    paddingRight: 16
  };

  const formCol = { display: "flex", flexDirection: "column", gap: 14 };
  const full = { width: "100%", boxSizing: "border-box" };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" style={screenCenter}>
      <Card style={{ width: "100%", maxWidth: 420 }}>
        <h2 style={{ margin: "0 0 12px" }}>Login</h2>
        <ErrorBanner msg={err} />

        <form onSubmit={submit} style={formCol}>
          <Input
            placeholder="Email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            type="email"
            required
            style={full}
          />

          <Input
            placeholder="Password"
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            minLength={6}
            style={full}
          />

          <Button variant="primary" disabled={busy} style={full}>
            {busy ? "Signing in…" : "Login"}
          </Button>
        </form>

        <div style={{ marginTop: 14, fontSize: 14 }}>
          Don't have an account? <Link to="/register">Register</Link>
        </div>
      </Card>
    </div>
  );
}
