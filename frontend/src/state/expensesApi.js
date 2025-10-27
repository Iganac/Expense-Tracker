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
