import { createContext, useContext, useEffect, useMemo, useReducer } from "react";
import { listExpensesApi, createExpenseApi, listCategoriesApi } from "./expensesApi";

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
    case "SET_CATEGORIES":     return { ...state, categories: action.payload };
    case "SET_EXPENSES":       return { ...state, expenses: action.payload };
    case "ADD_EXPENSE":        return { ...state, expenses: [action.payload, ...state.expenses] };
    case "REMOVE_EXPENSE":     return { ...state, expenses: state.expenses.filter(e => e.id !== action.payload) };
    case "LOADING_CATEGORIES": return { ...state, loadingCategories: action.payload };
    case "LOADING_EXPENSES":   return { ...state, loadingExpenses: action.payload };
    case "ERROR_CATEGORIES":   return { ...state, errorCategories: action.payload };
    case "ERROR_EXPENSES":     return { ...state, errorExpenses: action.payload };
    default: return state;
  }
}

export function ExpensesProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Initial load
  useEffect(() => {
    (async () => {
      // categories
      dispatch({ type: "LOADING_CATEGORIES", payload: true });
      try {
        const cats = await listCategoriesApi();      // [{ id:"uuid", name:"Food" }, ...]
        dispatch({ type: "SET_CATEGORIES", payload: cats });
        dispatch({ type: "ERROR_CATEGORIES", payload: null });
      } catch (e) {
        dispatch({ type: "ERROR_CATEGORIES", payload: e?.message || "Failed to load categories" });
      } finally {
        dispatch({ type: "LOADING_CATEGORIES", payload: false });
      }

      // expenses
      dispatch({ type: "LOADING_EXPENSES", payload: true });
      try {
        const exps = await listExpensesApi();        // [{ id, amount, notes, expenseDate, categoryId }, ...]
        dispatch({ type: "SET_EXPENSES", payload: exps });
        dispatch({ type: "ERROR_EXPENSES", payload: null });
      } catch (e) {
        dispatch({ type: "ERROR_EXPENSES", payload: e?.message || "Failed to load expenses" });
      } finally {
        dispatch({ type: "LOADING_EXPENSES", payload: false });
      }
    })();
  }, []);

  // CREATE (POST → add the server result)
  async function createExpense(expense) {
    const created = await createExpenseApi(expense);
    dispatch({ type: "ADD_EXPENSE", payload: created });
  }

  // Stubs for later days
  async function saveExpense() {}
  async function removeExpense() {}

  // Expose both shapes so current components compile
  const value = useMemo(() => ({
    state,
    createExpense,
    saveExpense,
    removeExpense,
    // flat selectors used elsewhere:
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
