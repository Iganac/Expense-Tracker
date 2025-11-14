import { useEffect, useMemo, useState } from "react";
import { useExpenses } from "../state/ExpensesContext";
import { searchExpensesApi } from "../state/expensesApi";
import Card from "../components/Card";
import Loading from "../components/feedback/Loading";
import Empty from "../components/feedback/Empty";
import ErrorBanner from "../components/feedback/ErrorBanner";
import Input from "../components/Input";
import Select from "../components/Select";

// Recharts
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

function fmtMoney(n) {
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency: "USD",
  }).format(n || 0);
}

// Helper: get today's date in user's local timezone as YYYY-MM-DD
function todayLocalISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// Use ONLY local timezone for all date math
function startEndFor(dateStr, mode) {
  // Treat dateStr as a local date (00:00 in user's timezone)
  const d = new Date(dateStr + "T00:00:00");

  // Format yyyy-mm-dd from a Date in local time
  const fmt = (dt) => {
    const y = dt.getFullYear();
    const m = String(dt.getMonth() + 1).padStart(2, "0");
    const day = String(dt.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  if (mode === "day") {
    return {
      start: dateStr,
      end: dateStr,
      label: d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      }),
    };
  }

  if (mode === "month") {
    const y = d.getFullYear();
    const m = d.getMonth(); // 0..11 in local time

    const first = new Date(y, m, 1);
    const last = new Date(y, m + 1, 0);

    return {
      start: fmt(first),
      end: fmt(last),
      label: first.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
      }),
    };
  }

  // year
  const y = d.getFullYear();
  const first = new Date(y, 0, 1);
  const last = new Date(y, 11, 31);

  return {
    start: fmt(first),
    end: fmt(last),
    label: String(y),
  };
}

const COLORS = [
  "#4F46E5",
  "#059669",
  "#EF4444",
  "#F59E0B",
  "#06B6D4",
  "#8B5CF6",
  "#10B981",
  "#E11D48",
  "#84CC16",
  "#14B8A6",
  "#F97316",
  "#22C55E",
  "#A855F7",
  "#3B82F6",
  "#D946EF",
];

export default function ReportsPage() {
  // We still use categories to label slices, but we DO NOT use global expenses here
  const { categories, loadingCategories, errorCategories } = useExpenses();

  const [mode, setMode] = useState("month"); // "day" | "month" | "year"
  const [date, setDate] = useState(todayLocalISO());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [rows, setRows] = useState([]); // local fetched expenses for the selected range

  // fetch all slices for the selected range
  useEffect(() => {
    let aborted = false;

    async function run() {
      setLoading(true);
      setError("");
      try {
        const { start, end } = startEndFor(date, mode);
        let page = 0;
        const size = 200; // big page to minimize roundtrips
        const acc = [];

        /* eslint-disable no-constant-condition */
        while (true) {
          const res = await searchExpensesApi({ start, end, page, size });
          const chunk = Array.isArray(res.content) ? res.content : [];
          acc.push(...chunk);
          if (res.last || chunk.length < size) break;
          page += 1;
        }

        if (!aborted) setRows(acc);
      } catch (e) {
        if (!aborted)
          setError(e?.message || "Failed to load reports data");
      } finally {
        if (!aborted) setLoading(false);
      }
    }

    run();
    return () => {
      aborted = true;
    };
  }, [date, mode]);

  const nameById = useMemo(
    () => new Map(categories.map((c) => [c.id, c.name])),
    [categories]
  );

  // aggregate for the selected range
  const total = useMemo(
    () => rows.reduce((s, e) => s + Number(e.amount || 0), 0),
    [rows]
  );

  const byCategory = useMemo(() => {
    const map = new Map();
    for (const e of rows) {
      const k = e.categoryId || "—";
      map.set(k, (map.get(k) || 0) + Number(e.amount || 0));
    }
    // turn into array sorted desc
    return [...map.entries()]
      .map(([cid, v]) => ({
        cid,
        value: v,
        name: nameById.get(cid) || "—",
      }))
      .sort((a, b) => b.value - a.value);
  }, [rows, nameById]);

  const { label } = startEndFor(date, mode);

  return (
    <div className="max-w-4xl mx-auto px-4 py-6" style={{ padding: 16 }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 12,
          flexWrap: "wrap",
        }}
      >
        <h2 style={{ margin: 0 }}>Reports</h2>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ opacity: 0.8 }}>Date</span>
          <Input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
          />
        </label>

        <label style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <span style={{ opacity: 0.8 }}>Range</span>
          <Select
            value={mode}
            onChange={(e) => setMode(e.target.value)}
          >
            <option value="day">Day</option>
            <option value="month">Month</option>
            <option value="year">Year</option>
          </Select>
        </label>

        <span
          style={{
            marginLeft: "auto",
            border: "1px solid #e5e7eb",
            borderRadius: 999,
            padding: "4px 10px",
          }}
        >
          Total {fmtMoney(total)}
        </span>
      </div>

      {(loadingCategories || loading) && (
        <Loading text="Loading data..." />
      )}
      {!loadingCategories && errorCategories && (
        <ErrorBanner msg={errorCategories} />
      )}
      {!loading && !!error && <ErrorBanner msg={error} />}

      <Card style={{ marginTop: 12 }}>
        <h3 style={{ marginTop: 0 }}>{label} by category</h3>
        {byCategory.length === 0 ? (
          <Empty text="No data yet." />
        ) : (
          <>
            {/* Pie */}
            <div style={{ width: "100%", height: 320 }}>
              <ResponsiveContainer>
                <PieChart>
                  <Pie
                    data={byCategory}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={(d) =>
                      `${d.name}: ${(
                        (d.value / (total || 1)) *
                        100
                      ).toFixed(0)}%`
                    }
                  >
                    {byCategory.map((entry, idx) => (
                      <Cell
                        key={entry.cid}
                        fill={COLORS[idx % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(v, _n, p) => [
                      fmtMoney(v),
                      p?.payload?.name,
                    ]}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* By-category list (kept in sync with the same range) */}
            <ul
              style={{
                listStyle: "none",
                padding: 0,
                margin: "12px 0 0",
              }}
            >
              {byCategory.map((row) => (
                <li
                  key={row.cid}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    padding: "6px 0",
                    borderBottom: "1px solid #f3f4f6",
                  }}
                >
                  <span>{row.name}</span>
                  <strong>{fmtMoney(row.value)}</strong>
                </li>
              ))}
            </ul>
          </>
        )}
      </Card>
    </div>
  );
}
