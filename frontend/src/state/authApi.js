import { fetchJson, setToken, clearToken } from "../api";

export async function loginApi(payload) {
  const data = await fetchJson("/api/auth/login", { method: "POST", body: payload });
  setToken(data.token);
}
export async function registerApi(payload) {
  const data = await fetchJson("/api/auth/register", { method: "POST", body: payload });
  setToken(data.token);
}
export async function meApi() {
  return fetchJson("/api/auth/me", { auth: true });
}
export function logoutApi() {
  clearToken();
}
