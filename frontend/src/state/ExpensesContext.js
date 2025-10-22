import { createContext, useContext, useMemo, useReducer } from "react";

const ExpensesContext = createContext(null);
const initialCategories = [
  { id: "cat_food", name: "Food" },
  { id: "cat_transport", name: "Transport" },
  { id: "cat_rent", name: "Rent" },
  { id: "cat_util", name: "Utilities" },
  { id: "cat_other", name: "Other" }
];
const initialExpenses = [
  { id: "e1", notes: "Groceries", amount: 42.5, categoryId: "cat_food", expenseDate: "2025-10-10" },
  { id: "e2", notes: "Bus pass", amount: 25, categoryId: "cat_transport", expenseDate: "2025-10-11" }
];
const initialState = { categories: initialCategories, expenses: initialExpenses };

function reducer(state, action){
  switch(action.type){
    case "ADD": {
      const e = action.payload;
      const id = (globalThis.crypto?.randomUUID?.()) || String(Date.now());
      return { ...state, expenses: [{...e, id}, ...state.expenses] };
    }
    case "UPDATE": {
      const { id, updates } = action.payload;
      return { ...state, expenses: state.expenses.map(e => e.id === id ? { ...e, ...updates } : e) };
    }
    case "DELETE": {
      const id = action.payload;
      return { ...state, expenses: state.expenses.filter(e => e.id !== id) };
    }
    default: return state;
  }
}

export function ExpensesProvider({ children }){
  const [state, dispatch] = useReducer(reducer, initialState);
  const api = useMemo(() => ({
    state,
    addExpense: (expense) => dispatch({ type:"ADD", payload: expense }),
    updateExpense: (id, updates) => dispatch({ type:"UPDATE", payload: { id, updates } }),
    deleteExpense: (id) => dispatch({ type:"DELETE", payload: id })
  }), [state]);
  return <ExpensesContext.Provider value={api}>{children}</ExpensesContext.Provider>;
}
export function useExpenses(){ const ctx = useContext(ExpensesContext); if(!ctx) throw new Error("useExpenses inside ExpensesProvider"); return ctx; }
