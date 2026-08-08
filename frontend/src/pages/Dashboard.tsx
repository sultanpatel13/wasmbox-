import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, Cpu, HardDrive, Inbox, ListChecks } from "lucide-react";
import { Card } from "../components/ui/Card";
import { CardSkeleton, TableRowSkeleton } from "../components/ui/Skeleton";
import { EmptyState } from "../components/ui/EmptyState";
import { SimpleBarChart } from "../components/ui/SimpleBarChart";
import { Table, type TableColumn } from "../components/ui/Table";
import { Modal } from "../components/ui/Modal";
import { StatusPill } from "../components/StatusPill";
import { useExecutions, useModules, useRuntimeStatus } from "../hooks/useRuntimeQueries";
import type { Execution, ExecutionStatus } from "../types/execution";

const STATUS_ORDER: ExecutionStatus[] = ["queued", "running", "completed", "failed", "cancelled"];

export function Dashboard() {
  const { data: status, isLoading: statusLoading } = useRuntimeStatus();
  const { data: modules, isLoading: modulesLoading } = useModules();
  const { data: executions, isLoading: executionsLoading } = useExecutions();
  const [selectedExecution, setSelectedExecution] = useState<Execution | null>(null);

  const recentExecutions = (executions ?? []).slice(0, 5);
  const statsLoading = statusLoading || modulesLoading;

  const statusCounts = STATUS_ORDER.map((s) => ({
    label: s,
    value: (executions ?? []).filter((e) => e.status === s).length,
  })).filter((s) => s.value > 0);

  const columns: TableColumn<Execution>[] = [
    { key: "module", header: "Module", render: (e) => e.moduleName },
    { key: "command", header: "Command", render: (e) => e.command },
    { key: "status", header: "Status", render: (e) => <StatusPill status={e.status} /> },
  ];

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
            <Table
              columns={columns}
              data={recentExecutions}
              rowKey={(e) => e.id}
              emptyMessage="No executions yet."
              onRowClick={(execution) => setSelectedExecution(execution)}
            />
          )}
        </div>
      </div>

      <Modal
        open={selectedExecution !== null}
        onClose={() => setSelectedExecution(null)}
        title={selectedExecution?.moduleName ?? "Execution details"}
      >
        {selectedExecution && (
          <div className="execution-details">
            <div className="settings-row">
              <span className="settings-label">Status</span>
              <StatusPill status={selectedExecution.status} />
            </div>
            <div className="settings-row">
              <span className="settings-label">Command</span>
              <span className="settings-value">{selectedExecution.command}</span>
            </div>
            <div className="settings-row">
              <span className="settings-label">Started</span>
              <span className="settings-value">{new Date(selectedExecution.startedAt).toLocaleString()}</span>
            </div>
            {selectedExecution.durationMs !== undefined && (
              <div className="settings-row">
                <span className="settings-label">Duration</span>
                <span className="settings-value">{selectedExecution.durationMs}ms</span>
              </div>
            )}
            {selectedExecution.memoryMb !== undefined && (
              <div className="settings-row">
                <span className="settings-label">Memory</span>
                <span className="settings-value">{selectedExecution.memoryMb} MB</span>
              </div>
            )}
            {selectedExecution.output && (
              <div style={{ marginTop: 12 }}>
                <span className="settings-label">Output</span>
                <pre className="code-result-stdout">{selectedExecution.output}</pre>
              </div>
            )}
          </div>
        )}
      </Modal>
    </div>
  );
}
