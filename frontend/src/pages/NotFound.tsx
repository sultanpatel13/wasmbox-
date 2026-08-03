import { Link } from "react-router-dom";
import { Button } from "../components/ui/Button";

export function NotFound() {
  return (
    <div className="not-found">
      <h1>404</h1>
      <p>This page doesn't exist.</p>
      <Link to="/dashboard">
        <Button variant="primary">Back to Dashboard</Button>
      </Link>
    </div>
  );
}
