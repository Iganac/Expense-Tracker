import { useState } from "react";
import { useExpenses } from "../state/ExpensesContext";

export default function ExpenseCard({ expense, onDelete, onSave }){
  const { state } = useExpenses();
  const cat = state.categories.find(c => c.id === expense.categoryId);
  const categoryName = cat ? cat.name : expense.categoryId;

  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    notes: expense.notes || "",
    amount: String(expense.amount),
    categoryId: expense.categoryId,
    expenseDate: expense.expenseDate
  });
  const [error, setError] = useState("");

  const onChange = (e) => setForm(f => ({ ...f, [e.target.name]: e.target.value }));

  const save = () => {
    const amt = Number(form.amount);
    if (!form.expenseDate || !Number.isFinite(amt) || amt <= 0 || !form.categoryId) {
      setError("Please provide a valid amount (>0), a date, and a category.");
      return;
    }
    onSave({ notes: form.notes.trim(), amount: amt, categoryId: form.categoryId, expenseDate: form.expenseDate });
    setEditing(false); setError("");
  };

  if (editing) {
    return (
      <div style={{border:"1px solid #eee",borderRadius:12,padding:12,display:"grid",gap:8}}>
        {error && <div style={{color:"crimson",fontSize:12}}>{error}</div>}
        <input name="notes" value={form.notes} onChange={onChange} />
        <input name="amount" type="number" step="0.01" value={form.amount} onChange={onChange} />
        <select name="categoryId" value={form.categoryId} onChange={onChange}>
          {state.categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <input name="expenseDate" type="date" value={form.expenseDate} onChange={onChange} />
        <div style={{display:"flex",gap:8}}>
          <button onClick={save}>Save</button>
          <button onClick={()=>{ setEditing(false); setError(""); }}>Cancel</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{border:"1px solid #eee",borderRadius:12,padding:12,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
      <div>
        <div style={{fontWeight:600}}>{expense.notes || "(no notes)"}</div>
        <div style={{fontSize:12,color:"#666"}}>
          {categoryName} • {new Date(expense.expenseDate).toLocaleDateString()}
        </div>
      </div>
      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <div style={{fontWeight:700}}>${Number(expense.amount).toFixed(2)}</div>
        <button onClick={()=>setEditing(true)}>Edit</button>
        <button onClick={onDelete}>Delete</button>
      </div>
    </div>
  );
}
