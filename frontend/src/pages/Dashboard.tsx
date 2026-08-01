import { Link } from "react-router-dom";
import { Box, Cpu, HardDrive, Inbox, ListChecks } from "lucide-react";
import { Card } from "../components/ui/Card";
import { CardSkeleton, TableRowSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { SimpleBarChart } from "../components/ui/SimpleBarChart";
import { StatusPill } from "../components/StatusPill";
import { useExecutions, useModules, useRuntimeStatus } from "../hooks/useRuntimeQueries";
import type { ExecutionStatus } from "../types/execution";

const STATUS_ORDER: ExecutionStatus[] = ["queued", "running", "completed", "failed", "cancelled"];

export function Dashboard() {
  const { data: status, isLoading: statusLoading } = useRuntimeStatus();
  const { data: modules, isLoading: modulesLoading } = useModules();
  const { data: executions, isLoading: executionsLoading } = useExecutions();

  const recentExecutions = (executions ?? []).slice(0, 5);
  const statsLoading = statusLoading || modulesLoading;

  const statusCounts = STATUS_ORDER.map((s) => ({
    label: s,
    value: (executions ?? []).filter((e) => e.status === s).length,
  })).filter((s) => s.value > 0);

  return (
    <div className="page">
      <div className="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Overview of your WasmBox sandbox environment</p>
        </div>
      </div>

      <div className="dashboard-grid">
        {statsLoading ? (
          <>
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
            <CardSkeleton />
          </>
        ) : (
          <>
            <Card
              title="Runtime Status"
              value={status?.connected ? "Online" : "Offline"}
              icon={<Cpu size={14} />}
            />
            <Card title="Active Executions" value={status?.activeExecutions ?? 0} icon={<ListChecks size={14} />} />
            <Card title="Modules Uploaded" value={modules?.length ?? 0} icon={<Box size={14} />} />
            <Card title="Memory Usage" value={`${status?.memoryMb ?? 0} MB`} icon={<HardDrive size={14} />} />
          </>
        )}
      </div>

      {statusCounts.length > 0 && (
        <div className="dashboard-section">
          <div className="panel">
            <div className="panel-header">
              <h2>Executions by Status</h2>
            </div>
            <div style={{ padding: 20 }}>
              <SimpleBarChart data={statusCounts} />
            </div>
          </div>
        </div>
      )}

      <div className="dashboard-section">
        <div className="panel">
          <div className="panel-header">
            <h2>Recent Executions</h2>
            <Link to="/executions">View all</Link>
          </div>

          {executionsLoading ? (
            <div className="table">
              <TableRowSkeleton columns={3} />
              <TableRowSkeleton columns={3} />
              <TableRowSkeleton columns={3} />
            </div>
          ) : recentExecutions.length === 0 ? (
            <EmptyState icon={<Inbox size={40} />} message="No executions yet. Upload a module to get started." />
          ) : (
            <div className="table">
              {recentExecutions.map((execution) => (
                <div className="table-row" key={execution.id}>
                  <span>{execution.moduleName}</span>
                  <span>{execution.command}</span>
                  <StatusPill status={execution.status} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
