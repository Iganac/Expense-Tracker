import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import {
  searchExpensesApi,
  createExpenseApi,
  listCategoriesApi,
  updateExpenseApi,
  deleteExpenseApi,
} from "./expensesApi";
import { useAuth } from "./AuthContext";

const ExpensesContext = createContext(null);

const initialState = {
  categories: [],
  items: [],
  page: 0,
  size: 20,
  hasNext: false,
  selectedDate: new Date().toISOString().slice(0, 10),
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
    case "SET_DATE":
      return { ...state, selectedDate: action.payload, items: [], page: 0, hasNext: false, errorExpenses: null };
    case "APPEND_SLICE": {
      const { content, page, hasNext } = action.payload;
      return { ...state, items: page === 0 ? content : [...state.items, ...content], page, hasNext };
    }
    case "RESET_ITEMS":
      return { ...state, items: [], page: 0, hasNext: false };
    case "LOADING_CATEGORIES":
      return { ...state, loadingCategories: action.payload };
    case "LOADING_EXPENSES":
      return { ...state, loadingExpenses: action.payload };
    case "ERROR_CATEGORIES":
      return { ...state, errorCategories: action.payload };
    case "ERROR_EXPENSES":
      return { ...state, errorExpenses: action.payload };
    case "REMOVE_EXPENSE":
      return { ...state, items: state.items.filter(e => e.id !== action.payload) };
    case "ADD_EXPENSE_OPT":
      return { ...state, items: [action.payload, ...state.items] };
    case "REPLACE_EXPENSE": {
      const { tempId, item } = action.payload;
      return { ...state, items: state.items.map(e => (e.id === tempId ? { ...item, _optimistic: false } : e)) };
    }
    case "SET_ITEMS":
      return { ...state, items: action.payload };
    case "RESET_DATA":
      return {
        ...state,
        categories: [],
        items: [],
        page: 0,
        hasNext: false,
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

  useEffect(() => {
    if (!user) {
      dispatch({ type: "RESET_DATA" });
      return;
    }
    (async () => {
      dispatch({ type: "LOADING_CATEGORIES", payload: true });
      try {
        const cats = await listCategoriesApi();
        dispatch({ type: "SET_CATEGORIES", payload: cats });
        dispatch({ type: "ERROR_CATEGORIES", payload: null });
      } catch (e) {
        dispatch({ type: "ERROR_CATEGORIES", payload: e?.message || "Failed to load categories" });
      } finally {
        dispatch({ type: "LOADING_CATEGORIES", payload: false });
      }
    })();
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  useEffect(() => {
    if (!user) return;
    loadFirstPage();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.selectedDate, user]);

  async function loadFirstPage() {
    dispatch({ type: "LOADING_EXPENSES", payload: true });
    try {
      const d = state.selectedDate;
      const res = await searchExpensesApi({ start: d, end: d, page: 0, size: state.size });
      dispatch({ type: "APPEND_SLICE", payload: { content: res.content || [], page: 0, hasNext: !res.last } });
      dispatch({ type: "ERROR_EXPENSES", payload: null });
    } catch (e) {
      dispatch({ type: "ERROR_EXPENSES", payload: e?.message || "Failed to load expenses" });
      dispatch({ type: "RESET_ITEMS" });
    } finally {
      dispatch({ type: "LOADING_EXPENSES", payload: false });
    }
  }

  async function loadMore() {
    if (state.loadingExpenses || !state.hasNext) return;
    dispatch({ type: "LOADING_EXPENSES", payload: true });
    try {
      const next = state.page + 1;
      const d = state.selectedDate;
      const res = await searchExpensesApi({ start: d, end: d, page: next, size: state.size });
      dispatch({ type: "APPEND_SLICE", payload: { content: res.content || [], page: next, hasNext: !res.last } });
    } catch (e) {
      dispatch({ type: "ERROR_EXPENSES", payload: e?.message || "Failed to load more expenses" });
    } finally {
      dispatch({ type: "LOADING_EXPENSES", payload: false });
    }
  }

  function setSelectedDate(dateStr) {
    dispatch({ type: "SET_DATE", payload: dateStr });
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
    if (optimistic.expenseDate === state.selectedDate) {
      dispatch({ type: "ADD_EXPENSE_OPT", payload: optimistic });
    }
    try {
      const created = await createExpenseApi({
        notes: optimistic.notes,
        amount: Number(optimistic.amount.toFixed(2)),
        categoryId: optimistic.categoryId,
        expenseDate: optimistic.expenseDate,
      });
      if (optimistic.expenseDate === state.selectedDate) {
        dispatch({ type: "REPLACE_EXPENSE", payload: { tempId, item: created } });
      }
      await loadFirstPage();
    } catch (e) {
      if (optimistic.expenseDate === state.selectedDate) {
        dispatch({ type: "REMOVE_EXPENSE", payload: tempId });
      }
      throw e;
    }
  }

  async function saveExpense(id, updates) {
    if (!user) throw new Error("Not authenticated");
    const snapshot = state.items;
    const idx = snapshot.findIndex(e => e.id === id);
    if (idx !== -1) {
      const optimistic = { ...snapshot[idx], ...updates };
      const optimisticList = [...snapshot];
      optimisticList[idx] = optimistic;
      dispatch({ type: "SET_ITEMS", payload: sortByDateDesc(optimisticList) });
    }
    try {
      await updateExpenseApi(id, normalizeUpdates(updates));
      await loadFirstPage();
    } catch (e) {
      dispatch({ type: "SET_ITEMS", payload: snapshot });
      throw e;
    }
  }

  async function removeExpense(id) {
    if (!user) throw new Error("Not authenticated");
    const snapshot = state.items;
    dispatch({ type: "REMOVE_EXPENSE", payload: id });
    try {
      await deleteExpenseApi(id);
      await loadFirstPage();
    } catch (e) {
      dispatch({ type: "SET_ITEMS", payload: snapshot });
      throw e;
    }
  }

  const dayTotal = useMemo(
    () => state.items.reduce((s, e) => s + Number(e.amount || 0), 0),
    [state.items]
  );

  const value = useMemo(
    () => ({
      state,
      setSelectedDate,
      loadMore,
      createExpense,
      saveExpense,
      removeExpense,
      categories: state.categories,
      expenses: state.items,
      loadingCategories: state.loadingCategories,
      loadingExpenses: state.loadingExpenses,
      errorCategories: state.errorCategories,
      errorExpenses: state.errorExpenses,
      hasNext: state.hasNext,
      dayTotal,
    }),
    [state, dayTotal]
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used inside ExpensesProvider");
  return ctx;
}
