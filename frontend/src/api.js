export function getToken() {
  return localStorage.getItem("jwt") || "";
}

export function setToken(t) {
  localStorage.setItem("jwt", t);
}

export function clearToken() {
  localStorage.removeItem("jwt");
}

let onUnauthorized = null;
export function setOnUnauthorized(cb) {
  onUnauthorized = typeof cb === "function" ? cb : null;
}

export async function fetchJson(path, opts = {}) {
  const base = process.env.REACT_APP_API_BASE;
  const headers = { Accept: "application/json", ...(opts.headers || {}) };
  if (opts.body) headers["Content-Type"] = "application/json";
  if (opts.auth) {
    const tk = getToken();
    if (tk) headers["Authorization"] = `Bearer ${tk}`;
  }

  const res = await fetch(base + path, {
    ...opts,
    headers,
    body: opts.body ? JSON.stringify(opts.body) : undefined,
    signal: opts.signal, // allow passing AbortSignal
  });

  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }

  if (!res.ok) {
    // Trigger auto-logout
    if (res.status === 401 && typeof onUnauthorized === "function") {
      try { onUnauthorized(); } catch { }
    }
    const msg = (data && (data.message || data.error)) || res.statusText;
    const err = new Error(msg);
    err.status = res.status;
    err.data = data;
    throw err;
  }

  return data;
}