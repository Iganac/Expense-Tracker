const API_BASE = process.env.REACT_APP_API_BASE || "http://localhost:8080";

export async function getHealth() {
  const res = await fetch(`${API_BASE}/api/health`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.text();
}