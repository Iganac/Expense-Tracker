import { useState } from "react";
import { useAuth } from "../state/AuthContext";
import Card from "../components/ui/Card";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import ErrorBanner from "../components/feedback/ErrorBanner";

export default function RegisterPage() {
  const { register } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await register(email, password);
    } catch {
      setErr("Registration failed. Try a different email.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ padding: 16, maxWidth: 420, margin: "40px auto" }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>Create account</h2>
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
              value={password}
              onChange={e => setPassword(e.target.value)}
              type="password"
              placeholder="Password"
              required
              minLength={6}
            />
          </label>
          <Button variant="primary" disabled={busy}>
            {busy ? "Creating…" : "Register"}
          </Button>
        </form>
      </Card>
    </div>
  );
}
