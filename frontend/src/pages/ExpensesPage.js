import { useMemo, useState } from "react";
import { useExpenses } from "../state/ExpensesContext";
import ExpenseCard from "../components/ExpenseCard";
import ExpenseForm from "../components/ExpenseForm";
import FilterBar from "../components/FilterBar";

export default function ExpensesPage() {
  const { state, deleteExpense, updateExpense } = useExpenses();
  const [categoryId, setCategoryId] = useState("All");
  const [sortBy, setSortBy] = useState("dateDesc"); // dateDesc | amountDesc | amountAsc

  const list = useMemo(() => {
    let arr = [...state.expenses];
    if (categoryId !== "All") arr = arr.filter(e => e.categoryId === categoryId);
    switch (sortBy) {
      case "amountDesc": arr.sort((a, b) => b.amount - a.amount); break;
      case "amountAsc": arr.sort((a, b) => a.amount - b.amount); break;
      default: arr.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
    }
    return arr;
  }, [state.expenses, categoryId, sortBy]);

  return (
    <div style={{ padding: 16 }}>
      <h2>Expenses</h2>

      <FilterBar
        categoryId={categoryId}
        onCategoryChange={setCategoryId}
        sortBy={sortBy}
        onSortChange={setSortBy}
        categories={state.categories}
      />

      <ExpenseForm />

      <div style={{ display: "grid", gap: 12, marginTop: 16 }}>
        {list.map(e => (
          <ExpenseCard
            key={e.id}
            expense={e}
            onDelete={() => deleteExpense(e.id)}
            onSave={(updates) => updateExpense(e.id, updates)}
          />
        ))}
      </div>
    </div>
  );
}
