import { fetchJson } from "../api";


export function listExpensesApi() {
  return fetchJson("/api/expenses", { auth: true });
}

export function createExpenseApi(expense) {
  return fetchJson("/api/expenses", {
    method: "POST",
    body: expense,
    auth: true,
  });
}

export function listCategoriesApi() {
  return fetchJson("/api/categories", { auth: true });
}

export function updateExpenseApi(id, updates) {
  return fetchJson(`/api/expenses/${id}`, {
    method: "PUT",
    body: updates,
    auth: true,
  });
}

export function deleteExpenseApi(id) {
  return fetchJson(`/api/expenses/${id}`, {
    method: "DELETE",
    auth: true,
  });
}

export function searchExpensesApi({ start, end, page = 0, size = 20 }) {
  const qs = new URLSearchParams();
  if (start) qs.set("start", start);
  if (end) qs.set("end", end);
  qs.set("page", String(page));
  qs.set("size", String(size));
  return fetchJson(`/api/expenses/search?${qs.toString()}`, { auth: true });
}