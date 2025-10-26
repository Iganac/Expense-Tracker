import { fetchJson } from "../api";

// GET all expenses for the logged-in user
export function listExpensesApi() {
  return fetchJson("/api/expenses", { auth: true });
}

// POST create an expense
export function createExpenseApi(expense) {
  // expense: { amount, notes, expenseDate, categoryId }
  return fetchJson("/api/expenses", {
    method: "POST",
    body: expense,
    auth: true,
  });
}

// GET categories (UUID ids)
export function listCategoriesApi() {
  return fetchJson("/api/categories", { auth: true });
}

// (PUT & DELETE TBD)
