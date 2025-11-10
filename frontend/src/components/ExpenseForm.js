// src/components/ExpenseForm.jsx
import { useState } from "react";
import { useExpenses } from "../state/ExpensesContext";
import Button from "./Button";
import Input from "./Input";
import Card from "./Card";

export default function ExpenseForm({ date, categoryId }) {
  const { state, createExpense } = useExpenses();
  const [notes, setNotes] = useState("");
  const [amount, setAmount] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const amt = Number(amount);
  const canSubmit =
    !busy &&
    state.categories.length > 0 &&
    !!date &&
    !!categoryId &&
    Number.isFinite(amt) &&
    amt > 0;

  async function onSubmit(e) {
    e.preventDefault();
    setError("");

    if (!state.categories.length) return setError("No categories available.");
    if (!categoryId) return setError("Pick a category.");
    if (!date) return setError("Pick a date.");
    if (!Number.isFinite(amt) || amt <= 0) return setError("Amount must be a positive number.");

    setBusy(true);
    try {
      await createExpense({
        notes: notes.trim(),
        amount: Number(amt.toFixed(2)),
        expenseDate: date,
        categoryId,
      });
      setNotes("");
      setAmount("");
    } catch (e) {
      setError(e?.message || "Failed to add expense. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Card>
      {error && <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>}
      <form onSubmit={onSubmit} style={{ display: "grid", gap: 10 }}>
        <label>
          Notes
          <Input
            name="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Optional"
          />
        </label>
        <label>
          Amount
          <Input
            name="amount"
            type="number"
            step="0.01"
            inputMode="decimal"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
          />
        </label>
        <Button variant="primary" type="submit" disabled={!canSubmit}>
          {busy ? "Adding…" : "Add Expense"}
        </Button>
      </form>
    </Card>
  );
}
