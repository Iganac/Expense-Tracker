import { useEffect, useState } from "react";
import { getHealth } from "./api";

export default function App() {
  const [msg, setMsg] = useState("loading...");

  useEffect(() => {
    getHealth()
      .then(setMsg)
      .catch((e) => setMsg(`error: ${e.message}`));
  }, []);

  return (
    <div style={{ padding: 20, fontFamily: "sans-serif" }}>
      <h1>Expense Tracker (Dev)</h1>
      <p>Backend says: <b>{msg}</b></p>
    </div>
  );
}