import { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { LogOut } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { coreRoutes } from "../routes";
import { Navbar } from "./navbar/Navbar";
import { Footer } from "./footer/Footer";

export function AppLayout() {
  const { session, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="app-layout">
      <aside className={`sidebar ${sidebarOpen ? "sidebar-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand">
            <span>WB</span>
            <strong>WasmBox</strong>
          </div>
        </div>
        <nav className="sidebar-nav">
          {coreRoutes.map((route) => {
            const Icon = route.icon;
            return (
              <NavLink
                key={route.path}
                to={`/${route.path}`}
                onClick={() => setSidebarOpen(false)}
                className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
              >
                <Icon size={16} />
                <span>{route.label}</span>
              </NavLink>
            );
          })}
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

      {sidebarOpen && <div className="sidebar-backdrop" onClick={() => setSidebarOpen(false)} />}

      <div className="app-shell-main">
        <Navbar onMenuClick={() => setSidebarOpen((prev) => !prev)} />
        <main className="main-content">
          <Outlet />
        </main>
        <Footer />
      </div>
    </div>
  );
}
