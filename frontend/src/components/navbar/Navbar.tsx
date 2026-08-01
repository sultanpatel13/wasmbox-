import { Menu, Moon, Sun } from "lucide-react";
import { useLocation } from "react-router-dom";
import { useTheme } from "../../context/ThemeContext";
import { coreRoutes } from "../../routes";

interface NavbarProps {
  onMenuClick: () => void;
}

export function Navbar({ onMenuClick }: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const currentRoute = coreRoutes.find((r) => `/${r.path}` === location.pathname);
  const title = currentRoute?.label ?? "WasmBox";

  return (
    <header className="navbar">
      <button className="navbar-menu-btn" onClick={onMenuClick} aria-label="Toggle menu">
        <Menu size={20} />
      </button>
      <h1 className="navbar-title">{title}</h1>
      <button className="navbar-theme-btn" onClick={toggleTheme} aria-label="Toggle theme">
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </header>
  );
}
