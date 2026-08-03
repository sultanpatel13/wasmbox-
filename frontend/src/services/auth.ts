export interface AuthSession {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
  };
}

const SESSION_KEY = "wasmbox.session";

export function getSession(): AuthSession | null {
  const raw = window.localStorage.getItem(SESSION_KEY);
  return raw ? (JSON.parse(raw) as AuthSession) : null;
}

export function createDemoSession(email: string): AuthSession {
  const session: AuthSession = {
    token: crypto.randomUUID(),
    user: {
      id: "local-user",
      name: email.split("@")[0] || "Developer",
      email,
    },
  };
  window.localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  return session;
}

export function clearSession() {
  window.localStorage.removeItem(SESSION_KEY);
}
