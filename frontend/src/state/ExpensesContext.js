/* eslint-env browser, es2021 */
import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  listExpensesApi,
  createExpenseApi,
  listCategoriesApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "./expensesApi";
import { useAuth } from "./AuthContext";

const ExpensesContext = createContext(null);

const initialState = {
  categories: [],
  expenses: [],
  loadingCategories: true,
  loadingExpenses: true,
  errorCategories: null,
  errorExpenses: null,
};

function sortByDateDesc(list) {
  return [...list].sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
}

function normalizeUpdates(updates) {
  const out = { ...updates };
  if (out.amount != null) out.amount = Number(Number(out.amount).toFixed(2));
  return out;
}

function reducer(state, action) {
  switch (action.type) {
    case "SET_CATEGORIES":
      return { ...state, categories: action.payload };
    case "SET_EXPENSES":
      return { ...state, expenses: action.payload };
    case "REMOVE_EXPENSE":
      return { ...state, expenses: state.expenses.filter((e) => e.id !== action.payload) };
    case "ADD_EXPENSE_OPT":
      return { ...state, expenses: [action.payload, ...state.expenses] };
    case "REPLACE_EXPENSE": {
      const { tempId, item } = action.payload;
      return {
        ...state,
        expenses: state.expenses.map((e) =>
          e.id === tempId ? { ...item, _optimistic: false } : e
        ),
      };
    }
    case "LOADING_CATEGORIES":
      return { ...state, loadingCategories: action.payload };
    case "LOADING_EXPENSES":
      return { ...state, loadingExpenses: action.payload };
    case "ERROR_CATEGORIES":
      return { ...state, errorCategories: action.payload };
    case "ERROR_EXPENSES":
      return { ...state, errorExpenses: action.payload };
    case "RESET_DATA":
      return {
        ...state,
        categories: [],
        expenses: [],
        loadingCategories: false,
        loadingExpenses: false,
        errorCategories: null,
        errorExpenses: null,
      };
    default:
      return state;
  }
}

export function ExpensesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const { user } = useAuth();

  // When auth state changes:
  // - If logged out, clear data and stop loading spinners.
  // - If logged in, (re)load categories and expenses.
  useEffect(() => {
    if (!user) {
      dispatch({ type: "RESET_DATA" });
      return;
    }

    // Load categories
    (async () => {
      dispatch({ type: "LOADING_CATEGORIES", payload: true });
      try {
        const cats = await listCategoriesApi();
        dispatch({ type: "SET_CATEGORIES", payload: cats });
        dispatch({ type: "ERROR_CATEGORIES", payload: null });
      } catch (e) {
        dispatch({
          type: "ERROR_CATEGORIES",
          payload: e?.message || "Failed to load categories",
        });
      } finally {
        dispatch({ type: "LOADING_CATEGORIES", payload: false });
      }
    })();

    // Initial expenses load + lifecycle refreshes
    refreshExpenses();

    let lastFetch = 0;
    const MIN_MS = 3000;
    const maybeRefresh = () => {
      const now = Date.now();
      if (now - lastFetch >= MIN_MS) {
        lastFetch = now;
        refreshExpenses();
      }
    };

    const onFocus = () => maybeRefresh();
    const onVisibility = () => { if (!document.hidden) maybeRefresh(); };
    const onOnline = () => maybeRefresh();

    window.addEventListener("focus", onFocus);
    document.addEventListener("visibilitychange", onVisibility);
    window.addEventListener("online", onOnline);

    return () => {
      window.removeEventListener("focus", onFocus);
      document.removeEventListener("visibilitychange", onVisibility);
      window.removeEventListener("online", onOnline);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  async function refreshExpenses(opts = {}) {
    if (!user) return; // guard when logged out
    const soft = !!opts.soft;
    if (!soft) dispatch({ type: "LOADING_EXPENSES", payload: true });
    try {
      const exps = await listExpensesApi();
      dispatch({ type: "SET_EXPENSES", payload: exps });
      dispatch({ type: "ERROR_EXPENSES", payload: null });
    } catch (e) {
      dispatch({
        type: "ERROR_EXPENSES",
        payload: e?.message || "Failed to load expenses",
      });
    } finally {
      if (!soft) dispatch({ type: "LOADING_EXPENSES", payload: false });
    }
  }

  async function createExpense(expense) {
    if (!user) throw new Error("Not authenticated");
    const tempId = `temp-${globalThis.crypto?.randomUUID?.() || Date.now()}`;
    const optimistic = {
      id: tempId,
      notes: expense.notes || "",
      amount: Number(expense.amount ?? 0),
      categoryId: expense.categoryId,
      expenseDate: expense.expenseDate,
      _optimistic: true,
    };

    // optimistic add
    dispatch({ type: "ADD_EXPENSE_OPT", payload: optimistic });

    try {
      const created = await createExpenseApi({
        notes: optimistic.notes,
        amount: Number(optimistic.amount.toFixed(2)),
        categoryId: optimistic.categoryId,
        expenseDate: optimistic.expenseDate,
      });

      dispatch({ type: "REPLACE_EXPENSE", payload: { tempId, item: created } });
      refreshExpenses({ soft: true });
    } catch (e) {
      // rollback
      dispatch({ type: "REMOVE_EXPENSE", payload: tempId });
      throw e;
    }
  }

  async function saveExpense(id, updates) {
    if (!user) throw new Error("Not authenticated");
    const snapshot = state.expenses;
    const idx = snapshot.findIndex((e) => e.id === id);
    if (idx === -1) return;

    // optimistic replace
    const optimistic = { ...snapshot[idx], ...updates };
    const optimisticList = [...snapshot];
    optimisticList[idx] = optimistic;
    dispatch({ type: "SET_EXPENSES", payload: sortByDateDesc(optimisticList) });

    try {
      const updated = await updateExpenseApi(id, normalizeUpdates(updates));
      const merged = optimisticList.map((e) => (e.id === updated.id ? updated : e));
      dispatch({ type: "SET_EXPENSES", payload: sortByDateDesc(merged) });
      refreshExpenses({ soft: true });
    } catch (e) {
      // rollback
      dispatch({ type: "SET_EXPENSES", payload: snapshot });
      throw e;
    }
  }

  async function removeExpense(id) {
    if (!user) throw new Error("Not authenticated");
    const snapshot = state.expenses;

    // optimistic remove
    dispatch({ type: "REMOVE_EXPENSE", payload: id });

    try {
      await deleteExpenseApi(id);
      refreshExpenses({ soft: true });
    } catch (e) {
      // rollback
      dispatch({ type: "SET_EXPENSES", payload: snapshot });
      throw e;
    }
  }

  const value = useMemo(
    () => ({
      state,
      createExpense,
      saveExpense,
      removeExpense,
      refreshExpenses,
      categories: state.categories,
      expenses: state.expenses,
      loadingCategories: state.loadingCategories,
      loadingExpenses: state.loadingExpenses,
      errorCategories: state.errorCategories,
      errorExpenses: state.errorExpenses,
    }),
    [state]
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpensesProvider");
  return ctx;
}