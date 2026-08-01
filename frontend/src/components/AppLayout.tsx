import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut, User, Settings } from "lucide-react";
import { useAuth } from "../context/AuthContext";

export function AppLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  const coreRoutes = [
    { path: "/sandbox", label: "Sandbox" },
    { path: "/upload", label: "Upload" },
    { path: "/executions", label: "Executions" },
    { path: "/logs", label: "Logs" },
  ];

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="brand">
            <span>WB</span>
            <strong>WasmBox</strong>
          </div>
        </div>
        <nav className="sidebar-nav">
          {coreRoutes.map((route) => (
            <NavLink
              key={route.path}
              to={route.path}
              className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            >
              <span>{route.label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">
              {session?.user.name?.charAt(0).toUpperCase() || "U"}
            </div>
            <div className="user-details">
              <span className="user-name">{session?.user.name || "Developer"}</span>
              <span className="user-email">{session?.user.email}</span>
            </div>
          </div>
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}