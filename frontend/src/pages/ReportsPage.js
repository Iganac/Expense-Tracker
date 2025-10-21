import { useMemo } from "react";
import { useExpenses } from "../state/ExpensesContext";
import Card from "../components/ui/Card";
import Loading from "../components/feedback/Loading";
import Empty from "../components/feedback/Empty";
import ErrorBanner from "../components/feedback/ErrorBanner";

export default function ReportsPage() {
  const {
    expenses, categories,
    loadingExpenses, loadingCategories,
    errorExpenses, errorCategories
  } = useExpenses();

  const total = useMemo(() => expenses.reduce((s, e) => s + Number(e.amount || 0), 0), [expenses]);
  const byCategory = useMemo(() => {
    const map = {};
    for (const e of expenses) map[e.categoryId] = (map[e.categoryId] || 0) + Number(e.amount || 0);
    return map;
  }, [expenses]);

  const nameById = useMemo(() => new Map(categories.map(c => [c.id, c.name])), [categories]);
  const entries = Object.entries(byCategory).sort((a, b) => b[1] - a[1]);

  return (
    <div style={{ padding: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <h2>Reports</h2>
        <span style={{ border: "1px solid #e5e7eb", borderRadius: 999, padding: "4px 10px" }}>Total ${total.toFixed(2)}</span>
      </div>

      {(loadingCategories || loadingExpenses) && <Loading text="Loading data..." />}
      {(!loadingCategories && errorCategories) && <ErrorBanner msg={errorCategories} />}
      {(!loadingExpenses && errorExpenses) && <ErrorBanner msg={errorExpenses} />}

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>By Category</h3>
        {entries.length === 0
          ? <Empty text="No data yet." />
          : (
            <ul style={{ listStyle: "none", padding: 0, margin: 0 }}>
              {entries.map(([cid, v]) => (
                <li key={cid} style={{ display: "flex", justifyContent: "space-between", padding: "6px 0", borderBottom: "1px solid #f3f4f6" }}>
                  <span>{nameById.get(cid) || cid}</span>
                  <strong>${v.toFixed(2)}</strong>
                </li>
              ))}
            </ul>
          )
        }
      </Card>
    </div>
  );
}
