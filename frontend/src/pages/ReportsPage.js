import { useMemo } from "react";
import { useExpenses } from "../state/ExpensesContext";
import TotalsSummary from "../components/TotalsSummary";

export default function ReportsPage() {
  const { state } = useExpenses();

  const { total, byCategory } = useMemo(() => {
    const t = state.expenses.reduce((s, e) => s + Number(e.amount || 0), 0);
    const map = {};
    for (const e of state.expenses) map[e.categoryId] = (map[e.categoryId] || 0) + Number(e.amount || 0);
    return { total: t, byCategory: map };
  }, [state.expenses]);

  const nameById = new Map(state.categories.map(c => [c.id, c.name]));

  return (
    <div style={{ padding: 16 }}>
      <h2>Reports</h2>
      <TotalsSummary total={total} byCategory={byCategory} nameById={nameById} />
    </div>
  );
}
