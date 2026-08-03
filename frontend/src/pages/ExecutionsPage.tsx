import { Ban } from "lucide-react";
import { StatusPill } from "../components/StatusPill";
import { useRuntimeData } from "../hooks/useRuntimeData";
import { runtimeActions } from "../store/runtimeStore";
import { formatDate, formatDuration } from "../utils/format";

export function ExecutionsPage() {
  const { executions } = useRuntimeData();

  return (
    <main className="page">
      <header className="page-header">
        <h1>Executions</h1>
        <p>Track running, completed, and failed sandbox jobs.</p>
      </header>

      <section className="panel">
        <div className="table execution-table">
          <div className="table-row table-head">
            <span>Module</span>
            <span>Status</span>
            <span>Command</span>
            <span>Started</span>
            <span>Duration</span>
            <span></span>
          </div>
          {executions.length === 0 ? (
            <div className="empty-state">
              <Ban size={48} />
              <p>No executions yet</p>
            </div>
          ) : (
            executions.map((execution) => (
              <div className="table-row" key={execution.id}>
                <span>{execution.moduleName}</span>
                <StatusPill status={execution.status} />
                <span>{execution.command}</span>
                <span>{formatDate(execution.startedAt)}</span>
                <span>{formatDuration(execution.durationMs)}</span>
                <button
                  className="icon-only"
                  title="Cancel execution"
                  disabled={execution.status !== "running"}
                  onClick={() => void runtimeActions.cancelExecution(execution.id)}
                >
                  <Ban size={16} />
                </button>
              </div>
            ))
          )}
        </div>
      </section>
    </main>
  );
}