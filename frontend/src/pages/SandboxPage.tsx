import { Cpu, HardDrive, Network, Settings2 } from "lucide-react";
import { TerminalPanel } from "../components/TerminalPanel";
import { useRuntimeData } from "../hooks/useRuntimeData";
import { runtimeActions } from "../store/runtimeStore";

export function SandboxPage() {
  const { command, executions, loading, modules, permissions, selectedModuleId, status } = useRuntimeData();

  return (
    <main className="page">
      <header className="page-header">
        <h1>Sandbox</h1>
        <p>Run modules, tune permissions, and inspect runtime output.</p>
      </header>

      <section className="metrics">
        <div className="metric">
          <Cpu size={18} />
          <span>CPU</span>
          <strong>{status?.cpuPercent ?? 0}%</strong>
        </div>
        <div className="metric">
          <HardDrive size={18} />
          <span>Memory</span>
          <strong>{status?.memoryMb ?? 0} MB</strong>
        </div>
        <div className="metric">
          <Network size={18} />
          <span>Runtime</span>
          <strong>{status?.connected ? "Online" : "Offline"}</strong>
        </div>
      </section>

      <div className="split">
        <section className="panel">
          <div className="panel-header">
            <div>
              <h2>Execution Setup</h2>
              <p>These controls are Developer 2 owned and can later move into Developer 1's layout.</p>
            </div>
            <Settings2 size={18} />
          </div>

          <label className="field">
            <span>Module</span>
            <select value={selectedModuleId} onChange={(event) => runtimeActions.setSelectedModule(event.target.value)}>
              <option value="">Select module</option>
              {modules.map((module) => (
                <option value={module.id} key={module.id}>
                  {module.name}
                </option>
              ))}
            </select>
          </label>

          <div className="permission-grid">
            {Object.entries(permissions).map(([key, value]) => (
              <label className="toggle" key={key}>
                <input
                  type="checkbox"
                  checked={value}
                  onChange={(event) => runtimeActions.setPermission(key as keyof typeof permissions, event.target.checked)}
                />
                <span>{key}</span>
              </label>
            ))}
          </div>
        </section>

        <TerminalPanel command={command} executions={executions} loading={loading} />
      </div>
    </main>
  );
}