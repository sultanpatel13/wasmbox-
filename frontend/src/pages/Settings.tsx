import { LogOut } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Button } from "../components/ui/Button";

export function Settings() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Settings</h1>
          <p>Your account and environment details</p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <h2>Account</h2>
        </div>
        <div style={{ padding: "0 20px" }}>
          <div className="settings-row">
            <span className="settings-label">Name</span>
            <span className="settings-value">{session?.user.name ?? "—"}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">Email</span>
            <span className="settings-value">{session?.user.email ?? "—"}</span>
          </div>
          <div className="settings-row">
            <span className="settings-label">User ID</span>
            <span className="settings-value">{session?.user.id ?? "—"}</span>
          </div>
        </div>
      </div>

      <div className="dashboard-section" style={{ marginTop: 20 }}>
        <Button variant="danger" icon={<LogOut size={16} />} onClick={handleLogout}>
          Log out
        </Button>
      </div>
    </div>
  );
}
