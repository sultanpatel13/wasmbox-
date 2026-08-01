import { Search } from "lucide-react";
import { useMemo, useState } from "react";
import { useRuntimeData } from "../hooks/useRuntimeData";
import { formatDate } from "../utils/format";

export function LogsPage() {
  const { logs } = useRuntimeData();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState("all");

  const filteredLogs = useMemo(
    () =>
      logs.filter((log) => {
        const matchesLevel = level === "all" || log.level === level;
        const matchesQuery = log.message.toLowerCase().includes(query.toLowerCase());
        return matchesLevel && matchesQuery;
      }),
    [level, logs, query],
  );

  return (
    <main className="page">
      <header className="page-header">
        <h1>Live Logs</h1>
        <p>Search and filter WebSocket-backed runtime events.</p>
      </header>

      <section className="panel">
        <div className="filters">
          <label className="search-field">
            <Search size={16} />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search logs" />
          </label>
          <select value={level} onChange={(event) => setLevel(event.target.value)}>
            <option value="all">All levels</option>
            <option value="info">Info</option>
            <option value="debug">Debug</option>
            <option value="warn">Warn</option>
            <option value="error">Error</option>
          </select>
        </div>

        <div className="log-list">
          {filteredLogs.length === 0 ? (
            <div className="empty-state" style={{ padding: "40px" }}>
              <Search size={48} />
              <p>{query ? "No matching logs found" : "No logs yet"}</p>
            </div>
          ) : (
            filteredLogs.map((log) => (
              <div className={`log-row log-${log.level}`} key={log.id}>
                <span>{formatDate(log.timestamp)}</span>
                <strong>{log.level}</strong>
                <p>{log.message}</p>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}