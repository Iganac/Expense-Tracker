import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  listExpensesApi,
  createExpenseApi,
  listCategoriesApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "./expensesApi";

const ExpensesContext = createContext(null);

const initialState = {
  categories: [],
  expenses: [],
  loadingCategories: true,
  loadingExpenses: true,
  errorCategories: null,
  errorExpenses: null,
};

function reducer(state, action) {
  switch (action.type) {
    case "SET_CATEGORIES": return { ...state, categories: action.payload };
    case "SET_EXPENSES": return { ...state, expenses: action.payload };
    case "ADD_EXPENSE": return { ...state, expenses: [action.payload, ...state.expenses] };
    case "REMOVE_EXPENSE": return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case "LOADING_CATEGORIES": return { ...state, loadingCategories: action.payload };
    case "LOADING_EXPENSES": return { ...state, loadingExpenses: action.payload };
    case "ERROR_CATEGORIES": return { ...state, errorCategories: action.payload };
    case "ERROR_EXPENSES": return { ...state, errorExpenses: action.payload };
    default: return state;
  }
}

export function ExpensesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  useEffect(() => {
    (async () => {
      dispatch({ type: "LOADING_CATEGORIES", payload: true });
      try {
        const cats = await listCategoriesApi(); // [{ id, name }, ...]
        dispatch({ type: "SET_CATEGORIES", payload: cats });
        dispatch({ type: "ERROR_CATEGORIES", payload: null });
      } catch (e) {
        dispatch({ type: "ERROR_CATEGORIES", payload: e?.message || "Failed to load categories" });
      } finally {
        dispatch({ type: "LOADING_CATEGORIES", payload: false });
      }
    })();
  }, []);

  async function refreshExpenses() {
    dispatch({ type: "LOADING_EXPENSES", payload: true });
    try {
      const exps = await listExpensesApi(); // [{ id, amount, notes, expenseDate, categoryId }, ...]
      dispatch({ type: "SET_EXPENSES", payload: exps });
      dispatch({ type: "ERROR_EXPENSES", payload: null });
    } catch (e) {
      dispatch({ type: "ERROR_EXPENSES", payload: e?.message || "Failed to load expenses" });
    } finally {
      dispatch({ type: "LOADING_EXPENSES", payload: false });
    }
  }

  useEffect(() => {
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
  }, []);

  async function createExpense(expense) {
    const created = await createExpenseApi(expense);
    dispatch({ type: "ADD_EXPENSE", payload: created });
  }

  async function saveExpense(id, updates) {
    const prev = state.expenses;
    const idx = prev.findIndex(e => e.id === id);
    if (idx === -1) return;

    const optimistic = { ...prev[idx], ...updates };
    const optimisticList = [...prev];
    optimisticList[idx] = optimistic;
    dispatch({ type: "SET_EXPENSES", payload: sortByDateDesc(optimisticList) });

    try {
      const updated = await updateExpenseApi(id, normalizeUpdates(updates));
      const reconciled = (list => list.map(e => (e.id === updated.id ? updated : e)))(state.expenses);
      dispatch({ type: "SET_EXPENSES", payload: sortByDateDesc(reconciled) });
    } catch (e) {
      dispatch({ type: "SET_EXPENSES", payload: prev });
      throw e;
    }
  }

  async function removeExpense(id) {
    const prev = state.expenses;
    dispatch({ type: "REMOVE_EXPENSE", payload: id });
    try {
      await deleteExpenseApi(id);
    } catch (e) {
      dispatch({ type: "SET_EXPENSES", payload: prev });
      throw e;
    }
  }

  const value = useMemo(() => ({
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
  }), [state]);

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpensesProvider");
  return ctx;
}
