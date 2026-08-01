import type { ExecutionStatus } from "../types/execution";

const labels: Record<ExecutionStatus, string> = {
  queued: "Queued",
  running: "Running",
  completed: "Completed",
  failed: "Failed",
  cancelled: "Cancelled",
};

export function StatusPill({ status }: { status: ExecutionStatus }) {
  return <span className={`status status-${status}`}>{labels[status]}</span>;
}
