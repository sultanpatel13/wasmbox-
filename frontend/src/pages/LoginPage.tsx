import { useState } from "react";
import { Mail, Lock, LogIn } from "lucide-react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, useLocation } from "react-router-dom";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = (location.state as { from?: Location })?.from?.pathname || "/sandbox";

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!email.trim()) {
      setError("Please enter your email");
      return;
    }
    if (password.length < 4) {
      setError("Password must be at least 4 characters");
      return;
    }
    setError("");
    login(email);
    navigate(from, { replace: true });
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-brand">
            <span>WB</span>
            <strong>WasmBox</strong>
          </div>
          <h1>Sign In</h1>
          <p>Enter your credentials to access the sandbox</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <div className="input-wrapper">
              <Mail size={18} />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="developer@company.com"
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label htmlFor="password">Password</label>
            <div className="input-wrapper">
              <Lock size={18} />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                autoComplete="current-password"
                required
                minLength={4}
              />
            </div>
          </div>

          <button type="submit" className="btn-primary full-width">
            <LogIn size={18} />
            <span>Sign In</span>
          </button>
        </form>

        <div className="login-footer">
          <p>Demo mode — any email/password works</p>
        </div>
      </div>
    </div>
  );
}