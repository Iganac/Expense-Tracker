import { useMemo, useState } from "react";
import { useExpenses } from "../state/ExpensesContext";
import ExpenseCard from "../components/ExpenseCard";
import ExpenseForm from "../components/ExpenseForm";
import Card from "../components/Card";
import Loading from "../components/feedback/Loading";
import Empty from "../components/feedback/Empty";
import ErrorBanner from "../components/feedback/ErrorBanner";
import Input from "../components/Input";
import Select from "../components/Select";
import Button from "../components/Button";

export default function ExpensesPage() {
  const {
    expenses, categories,
    loadingExpenses, loadingCategories,
    errorExpenses, errorCategories,
    saveExpense, removeExpense,
    state, setSelectedDate, loadMore, hasNext, dayTotal,
  } = useExpenses();

  const [categoryFilter, setCategoryFilter] = useState("All");

  const nameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  const filtered = useMemo(() => {
    let arr = expenses;
    if (categoryFilter !== "All") arr = arr.filter((e) => e.categoryId === categoryFilter);
    return arr;
  }, [expenses, categoryFilter]);

  // ids for labels
  const dateId = "filter-date";
  const catId = "filter-category";

  return (
    <div className="page container" style={{ padding: 16 }}>
      {/* Toolbar */}
      <div className="exp-toolbar" style={{ display: "flex", flexWrap: "wrap", gap: "16px", alignItems: "center", marginBottom: "12px" }}>
        <h2 style={{ margin: 0 }}>Expenses</h2>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>Date</span>
          <Input
            type="date"
            value={state.selectedDate}
            onChange={(e) => setSelectedDate(e.target.value)}
            style={{ minWidth: 140 }}
          />
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <span>Category</span>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            style={{ minWidth: 140 }}
          >
            <option value="All">All</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </Select>
        </div>

        <span style={{
          marginLeft: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: "999px",
          padding: "4px 10px",
        }}>
          Total {new Intl.NumberFormat(undefined, { style: "currency", currency: "USD" }).format(dayTotal)}
        </span>
      </div>

      {/* Categories load/error */}
      <Card>
        {loadingCategories && <Loading text="Loading categories..." />}
        <ErrorBanner msg={errorCategories} />
      </Card>

      {/* Quick add form */}
      <div style={{ marginTop: 12 }}>
        <ExpenseForm
          date={state.selectedDate}
          categoryId={categoryFilter !== "All" ? categoryFilter : undefined}
        />
      </div>

      {/* List */}
      <div className="exp-list" style={{ marginTop: 12 }}>
        {loadingExpenses && <Loading text="Loading expenses..." />}
        {!loadingExpenses && !!errorExpenses && <ErrorBanner msg={errorExpenses} />}
        {!loadingExpenses && !errorExpenses && filtered.length === 0 && (
          <Empty text="No expenses yet for this date." />
        )}
        {!loadingExpenses && !errorExpenses && filtered.map((e) => (
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

      {/* Pagination */}
      <div style={{ marginTop: 12, display: "flex", justifyContent: "center" }}>
        <Button onClick={loadMore} disabled={!hasNext || loadingExpenses}>
          {loadingExpenses ? "Loading…" : hasNext ? "Load More" : "No More"}
        </Button>
      </div>
    </div>
  );
}
