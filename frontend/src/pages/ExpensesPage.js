import { useMemo, useState } from "react";
import { useExpenses } from "../state/ExpensesContext";
import ExpenseCard from "../components/ExpenseCard";
import ExpenseForm from "../components/ExpenseForm";
import FilterBar from "../components/FilterBar";
import Card from "../components/Card";
import Loading from "../components/feedback/Loading";
import Empty from "../components/feedback/Empty";
import ErrorBanner from "../components/feedback/ErrorBanner";

export default function ExpensesPage() {
  const {
    expenses, categories,
    loadingExpenses, loadingCategories,
    errorExpenses, errorCategories,
    saveExpense, removeExpense, createExpense,
  } = useExpenses();

  const [categoryId, setCategoryId] = useState("All");
  const [sortBy, setSortBy] = useState("dateDesc");

  const list = useMemo(() => {
    let arr = [...expenses];
    if (categoryId !== "All") arr = arr.filter(e => e.categoryId === categoryId);
    switch (sortBy) {
      case "amountDesc": arr.sort((a, b) => Number(b.amount) - Number(a.amount)); break;
      case "amountAsc":  arr.sort((a, b) => Number(a.amount) - Number(b.amount)); break;
      default:           arr.sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate));
    }
    return arr;
  }, [expenses, categoryId, sortBy]);

  const total = useMemo(
    () => expenses.reduce((s, e) => s + Number(e.amount || 0), 0),
    [expenses]
  );
  const nameById = useMemo(
    () => new Map(categories.map(c => [c.id, c.name])),
    [categories]
  );

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
        <h2 style={{ margin: 0 }}>Expenses</h2>
        <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 10px" }}>
          Total ${total.toFixed(2)}
        </span>
      </div>

      <Card>
        {loadingCategories && <Loading text="Loading categories..." />}
        <ErrorBanner msg={errorCategories} />
        <FilterBar
          categoryId={categoryId}
          onCategoryChange={setCategoryId}
          sortBy={sortBy}
          onSortChange={setSortBy}
          categories={categories}
        />
      </Card>

      <div style={{ marginTop: 12 }}>
        {/* Ensure the form calls createExpense from context */}
        <ExpenseForm onSubmit={createExpense} />
      </div>

      <div style={{ display: "grid", gap: 12, marginTop: 12 }}>
        {loadingExpenses && <Loading text="Loading expenses..." />}
        {!loadingExpenses && !!errorExpenses && <ErrorBanner msg={errorExpenses} />}
        {!loadingExpenses && !errorExpenses && list.length === 0 && (
          <Empty text="No expenses yet. Add your first one above." />
        )}
        {!loadingExpenses && !errorExpenses && list.map(e => (
          <ExpenseCard
            key={e.id}
            expense={e}
            onDelete={() => removeExpense(e.id)}
            onSave={(updates) => saveExpense(e.id, updates)}
            categoryName={nameById.get(e.categoryId) || "—"}
            categories={categories}
          />
        ))}
      </div>
    </div>
  );
}
