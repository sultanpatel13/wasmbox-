import { useSyncExternalStore } from "react";
import type { Execution, ExecutionLog, PermissionSet, RuntimeStatus, WasmModule } from "../types/execution";
import * as executionService from "../services/execution";
import { connectLogStream } from "../services/websocket";
import { toast } from "sonner";

interface RuntimeState {
  status: RuntimeStatus | null;
  modules: WasmModule[];
  executions: Execution[];
  logs: ExecutionLog[];
  selectedModuleId: string;
  command: string;
  permissions: PermissionSet;
  loading: boolean;
  error: string | null;
}

const listeners = new Set<() => void>();
let disconnectLogs: (() => void) | null = null;

let state: RuntimeState = {
  status: null,
  modules: [],
  executions: [],
  logs: [],
  selectedModuleId: "",
  command: "run --entry main",
  permissions: {
    filesystem: true,
    network: false,
    environment: false,
  },
  loading: false,
  error: null,
};

function setState(patch: Partial<RuntimeState>) {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useRuntimeStore() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export const runtimeActions = {
  async initialize() {
    setState({ loading: true, error: null });
    try {
      const [status, modules, executions, logs] = await Promise.all([
        executionService.getRuntimeStatus(),
        executionService.listModules(),
        executionService.listExecutions(),
        executionService.listLogs(),
      ]);
      setState({
        status,
        modules,
        executions,
        logs,
        selectedModuleId: modules[0]?.id ?? "",
        loading: false,
      });
      toast.success("Runtime connected");
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to load runtime data";
      setState({ error: message, loading: false });
      toast.error(message);
    }
  },
  setCommand(command: string) {
    setState({ command });
  },
  setSelectedModule(moduleId: string) {
    setState({ selectedModuleId: moduleId });
  },
  setPermission(permission: keyof PermissionSet, value: boolean) {
    setState({ permissions: { ...state.permissions, [permission]: value } });
    toast.info(`Permission "${permission}" ${value ? "enabled" : "disabled"}`);
  },
  async upload(file: File) {
    setState({ loading: true, error: null });
    try {
      const module = await executionService.uploadModule(file);
      setState({
        modules: [module, ...state.modules],
        selectedModuleId: module.id,
        loading: false,
      });
      toast.success(`Module "${module.name}" uploaded`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Upload failed";
      setState({ error: message, loading: false });
      toast.error(message);
    }
  },
  async startExecution() {
    if (!state.selectedModuleId) {
      const message = "Upload or select a module first";
      setState({ error: message });
      toast.error(message);
      return;
    }

    setState({ loading: true, error: null });
    try {
      const execution = await executionService.startExecution(
        state.selectedModuleId,
        state.command,
        state.permissions,
      );
      setState({
        executions: [execution, ...state.executions],
        logs: [
          {
            id: crypto.randomUUID(),
            executionId: execution.id,
            level: "info",
            message: `Started ${execution.command}`,
            timestamp: new Date().toISOString(),
          },
          ...state.logs,
        ],
        loading: false,
      });
      toast.success(`Execution started: ${execution.id.slice(0, 8)}`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Execution failed";
      setState({ error: message, loading: false });
      toast.error(message);
    }
  },
  async cancelExecution(id: string) {
    try {
      await executionService.cancelExecution(id);
      setState({
        executions: state.executions.map((execution) =>
          execution.id === id ? { ...execution, status: "cancelled" } : execution,
        ),
      });
      toast.warning(`Execution ${id.slice(0, 8)} cancelled`);
    } catch (error) {
      const message = error instanceof Error ? error.message : "Failed to cancel execution";
      toast.error(message);
    }
  },
  connectLogs() {
    if (disconnectLogs) return;
    disconnectLogs = connectLogStream((log) => setState({ logs: [log, ...state.logs].slice(0, 200) }));
    toast.info("Live log stream connected");
  },
  disconnectLogs() {
    disconnectLogs?.();
    disconnectLogs = null;
  },
};