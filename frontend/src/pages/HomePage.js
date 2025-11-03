import { useAuth } from "../state/AuthContext";
import Card from "../components/Card";
import Button from "../components/Button";
import { Link } from "react-router-dom";

export default function HomePage() {
  const { user } = useAuth();
  return (
    <div style={{ padding: 16, maxWidth: 720, margin: "20px auto" }}>
      <Card>
        <h2 style={{ marginTop: 0 }}>
          {user ? `Welcome ${user.email}` : "Welcome to Expense Tracker"}
        </h2>
        <p>Track your spending and see basic reports.</p>
        <div style={{ display: "flex", gap: 8 }}>
          <Link to="/expenses"><Button variant="primary">Go to Expenses</Button></Link>
          <Link to="/reports"><Button>View Reports</Button></Link>
        </div>
      </Card>
    </div>
  );
}
