import { useMemo, useState } from "react";
import { useExpenses } from "../state/ExpensesContext";
import Input from "./ui/Input";
import Select from "./ui/Select";
import Button from "./ui/Button";
import Card from "./ui/Card";

export default function ExpenseForm() {
  const { state, createExpense } = useExpenses();

  const today = useMemo(() => new Date().toISOString().slice(0,10), []);
  const firstCategoryId = state.categories?.[0]?.id || "";

  const [form, setForm] = useState({
    notes: "",
    amount: "",
    categoryId: firstCategoryId,
    expenseDate: today,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const amt = Number(form.amount);
    if ((state.categories || []).length === 0) return setError("Please create a category first.");
    if (!form.expenseDate) return setError("Please pick a date.");
    if (!Number.isFinite(amt) || amt <= 0) return setError("Amount must be a positive number.");
    if (!form.categoryId) return setError("Please select a category.");

    setBusy(true);
    try {
      await createExpense({
        notes: form.notes.trim(),
        amount: amt,
        expenseDate: form.expenseDate,
        categoryId: form.categoryId,
      });
      setForm(f => ({ ...f, notes: "", amount: "" }));
    } catch {
      setError("Failed to add expense. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Card>
      {error && <div style={{ color:"crimson", marginBottom:8 }} aria-live="polite">{error}</div>}
      <form onSubmit={onSubmit} style={{ display:"grid", gap:10 }}>
        <label>Notes<Input name="notes" value={form.notes} onChange={onChange} placeholder="Optional" /></label>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          <label style={{ flex:1, minWidth:180 }}>
            Amount
            <Input name="amount" type="number" step="0.01" inputMode="decimal"
                   value={form.amount} onChange={onChange} placeholder="0.00" />
          </label>
          <label style={{ flex:1, minWidth:180 }}>
            Category
            <Select name="categoryId" value={form.categoryId || firstCategoryId}
                    onChange={onChange} disabled={(state.categories || []).length === 0}>
              {(state.categories || []).length === 0
                ? <option value="">No categories available</option>
                : state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </Select>
          </label>
        </div>
        <label>Date<Input name="expenseDate" type="date" value={form.expenseDate} onChange={onChange} /></label>
        <Button variant="primary" type="submit" disabled={busy}>{busy ? "Adding…" : "Add Expense"}</Button>
      </form>
    </Card>
  );
}
{error && <ErrorBanner msg={error} />}