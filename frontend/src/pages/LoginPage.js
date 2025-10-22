import { useState } from "react";
import { useAuth } from "../state/AuthContext";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import ErrorBanner from "../components/feedback/ErrorBanner";

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await login(email, password);
    } catch {
      setErr("Invalid email or password.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "40px auto" }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Login</h2>
        <ErrorBanner msg={err} />
        <form onSubmit={submit} style={{ display: "grid", gap: 10 }}>
          <label>Email
            <Input
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="you@example.com"
              type="email"
              required
            />
          </label>
          <label>Password
            <Input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
            />
          </label>
          <Button variant="primary" disabled={busy}>
            {busy ? "Signing in…" : "Login"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
