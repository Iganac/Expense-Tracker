import { useEffect, useMemo, useState } from "react";
import { useExpenses } from "../state/ExpensesContext";
import Input from "./Input";
import Select from "./Select";
import Button from "./Button";
import Card from "./Card";

export default function ExpenseForm() {
  const { state, createExpense } = useExpenses();

  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);
  const [form, setForm] = useState({
    notes: "",
    amount: "",
    categoryId: "",   // UUID from backend
    expenseDate: today,
  });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);


  useEffect(() => {
    if (!form.categoryId && (state.categories || []).length > 0) {
      setForm(f => ({ ...f, categoryId: state.categories[0].id }));
    }
  }, [state.categories]);

  const onChange = (e) =>
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const amt = Number(form.amount);
  const valid =
    Number.isFinite(amt) && amt > 0 &&
    !!form.expenseDate &&
    !!form.categoryId &&
    (state.categories || []).length > 0;

  const onSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!valid) {
      if ((state.categories || []).length === 0) return setError("No categories available.");
      if (!form.categoryId) return setError("Please select a category.");
      if (!form.expenseDate) return setError("Please pick a date.");
      if (!Number.isFinite(amt) || amt <= 0) return setError("Amount must be a positive number.");
      return;
    }

    setBusy(true);
    try {
      const payload = {
        notes: form.notes.trim(),
        amount: Number(amt.toFixed(2)),
        expenseDate: form.expenseDate,
        categoryId: form.categoryId,
      };
      await createExpense(payload);
      setForm(f => ({ ...f, notes: "", amount: "" }));
    } catch (e) {
      setError(e?.message || "Failed to add expense. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  const noCategories = (state.categories || []).length === 0;

  return (
    <Card>
      {error && (
        <div style={{ color: "crimson", marginBottom: 8 }} aria-live="polite">
          {error}
        </div>
      )}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Notes
          <Input
            name="notes"
            value={form.notes}
            onChange={onChange}
            placeholder="Optional"
          />
        </label>

        <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
          <label style={{ flex: 1, minWidth: 180 }}>
            Amount
            <Input
              name="amount"
              type="number"
              step="0.01"
              inputMode="decimal"
              value={form.amount}
              onChange={onChange}
              placeholder="0.00"
            />
          </label>

          <label style={{ flex: 1, minWidth: 180 }}>
            Category
            <Select
              name="categoryId"
              value={form.categoryId}
              onChange={onChange}
              disabled={noCategories}
            >
              {noCategories ? (
                <option value="">No categories available</option>
              ) : (
                state.categories.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))
              )}
            </Select>
          </label>
        </div>

        <label>
          Date
          <Input
            name="expenseDate"
            type="date"
            value={form.expenseDate}
            onChange={onChange}
          />
        </label>

        <Button
          variant="primary"
          type="submit"
          disabled={busy || !valid}
        >
          {busy ? "Adding…" : "Add Expense"}
        </Button>
      </form>
    </Card>
  );
}
