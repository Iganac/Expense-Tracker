import { useState } from "react";
import Button from "./Button";
import Input from "./Input";
import Select from "./Select";

export default function ExpenseCard({expense, onSave, onDelete, categories, categoryName}) {
  const [edit, setEdit] = useState(false);
  const [local, setLocal] = useState({
    notes: expense.notes || "",
    amount: String(expense.amount ?? ""),
    categoryId: expense.categoryId || "",
    expenseDate: expense.expenseDate || "",
  });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState("");

  const onChange = (e) => {
    setLocal(l => ({ ...l, [e.target.name]: e.target.value }));
    if (err) setErr("");
  };

  async function handleSave() {
    setBusy(true); setErr("");
    try {
      await onSave({
        notes: local.notes.trim(),
        amount: Number(local.amount),
        categoryId: local.categoryId,
        expenseDate: local.expenseDate,
      });
      setEdit(false);
    } catch (e) {
      setErr(e?.data?.message || e?.message || "Save failed.");
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!window.confirm("Delete this expense?")) return;
    setBusy(true); setErr("");
    try { await onDelete(); }
    catch (e) { setErr(e?.data?.message || e?.message || "Delete failed."); }
    finally { setBusy(false); }
  }

  return (
    <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, padding: 12 }}>
      {err && <div style={{ color: "crimson", marginBottom: 8 }}>{err}</div>}

      {!edit ? (
        <>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline", justifyContent: "space-between" }}>
            <strong>${Number(expense.amount).toFixed(2)}</strong>
            <span>{expense.expenseDate}</span>
          </div>
          <div>{expense.notes || <em>No notes</em>}</div>
          <div style={{ opacity: .7, fontSize: 12 }}>
            Category: {categoryName || "—"}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button onClick={() => setEdit(true)} disabled={busy}>Edit</Button>
            <Button variant="danger" onClick={handleDelete} disabled={busy}>
              {busy ? "Deleting…" : "Delete"}
            </Button>
          </div>
        </>
      ) : (
        <>
          <div style={{ display: "grid", gap: 8 }}>
            <label>Amount
              <Input
                name="amount"
                type="number"
                step="0.01"
                min="0.01"
                value={local.amount}
                onChange={onChange}
                onKeyDown={(e) => {
                  if (["e", "E", "+", "-"].includes(e.key)) e.preventDefault();
                }}
              />
            </label>
            <label>Notes
              <Input name="notes" value={local.notes} onChange={onChange} />
            </label>
            <label>Category
              <Select name="categoryId" value={local.categoryId} onChange={onChange}>
                {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </Select>
            </label>
            <label>Date
              <Input name="expenseDate" type="date" value={local.expenseDate} onChange={onChange} />
            </label>
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
            <Button onClick={handleSave} disabled={busy}>
              {busy ? "Saving…" : "Save"}
            </Button>
            <Button
              variant="ghost"
              onClick={() => {
                setEdit(false);
                setLocal({
                  notes: expense.notes || "",
                  amount: String(expense.amount ?? ""),
                  categoryId: expense.categoryId || "",
                  expenseDate: expense.expenseDate || "",
                });
              }}
              disabled={busy}
            >
              Cancel
            </Button>
          </div>
        </>
      )}
    </div>
  );
}
