import { useState } from "react";
import { useExpenses } from "../state/ExpensesContext";

export default function ExpenseForm(){
  const { state, addExpense } = useExpenses();
  const [form, setForm] = useState({
    notes: "",
    amount: "",
    categoryId: state.categories[0]?.id || "",
    expenseDate: new Date().toISOString().slice(0,10)
  });
  const [error, setError] = useState("");

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const onSubmit = (e) => {
    e.preventDefault();
    const amt = Number(form.amount);
    if (!form.expenseDate || !Number.isFinite(amt) || amt <= 0 || !form.categoryId) {
      setError("Please provide a valid amount (>0), a date, and a category.");
      return;
    }
    addExpense({
      notes: form.notes.trim(),
      amount: amt,
      expenseDate: form.expenseDate,
      categoryId: form.categoryId
    });
    setForm(f => ({ ...f, notes:"", amount:"" }));
    setError("");
  };

  return (
    <form onSubmit={onSubmit} style={{border:"1px solid #eee",borderRadius:12,padding:12,display:"grid",gap:8}}>
      {error && <div style={{color:"crimson",fontSize:12}}>{error}</div>}
      <input name="notes" placeholder="Notes" value={form.notes} onChange={onChange} />
      <input name="amount" type="number" step="0.01" placeholder="Amount" value={form.amount} onChange={onChange} />
      <select name="categoryId" value={form.categoryId} onChange={onChange}>
        {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
      </select>
      <input name="expenseDate" type="date" value={form.expenseDate} onChange={onChange} />
      <button type="submit">Add Expense</button>
    </form>
  );
}
