import { useState } from "react";
import { useAuth } from "../state/AuthContext";
import { useNavigate, Link } from "react-router-dom";
import Card from "../components/Card";
import Input from "../components/Input";
import Button from "../components/Button";
import ErrorBanner from "../components/feedback/ErrorBanner";

export default function RegisterPage() {
  const { register } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const submit = async (e) => {
    e.preventDefault();
    setErr(""); setBusy(true);
    try {
      await register({ email, password });
      nav("/", { replace: true });
    } catch (ex) {
      if (ex?.status === 409) setErr("An account with this email already exists.");
      else setErr(ex?.message || "Registration failed. Try a different email.");
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

        {/* --- Add this small footer --- */}
        <div style={{ marginTop: 12, fontSize: 14 }}>
          Already have an account?{" "}
          <Link to="/login">Back to login</Link>
        </div>
      </Card>
    </div>
  );
}
