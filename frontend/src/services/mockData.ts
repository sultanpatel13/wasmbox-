import type { Execution, ExecutionLog, RuntimeStatus, WasmModule } from "../types/execution";

export const modules: WasmModule[] = [
  {
    id: "mod-hello",
    name: "hello_world.wasm",
    size: 182_420,
    uploadedAt: new Date(Date.now() - 1000 * 60 * 60 * 8).toISOString(),
    checksum: "sha256:91a4c8",
  },
];

export const executions: Execution[] = [
  {
    id: "exec-1024",
    moduleId: "mod-hello",
    moduleName: "hello_world.wasm",
    status: "completed",
    command: "run --entry main",
    startedAt: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    finishedAt: new Date(Date.now() - 1000 * 60 * 11).toISOString(),
    durationMs: 2310,
    memoryMb: 42,
    cpuPercent: 18,
    output: "Wasm module initialized\nHello from sandbox\nExecution completed",
  },
  {
    id: "exec-1025",
    moduleId: "mod-hello",
    moduleName: "hello_world.wasm",
    status: "running",
    command: "run --trace",
    startedAt: new Date(Date.now() - 1000 * 58).toISOString(),
    memoryMb: 65,
    cpuPercent: 34,
    output: "Runtime booted\nMounting virtual filesystem\nRunning...",
  },
];

export const logs: ExecutionLog[] = [
  {
    id: "log-1",
    executionId: "exec-1025",
    level: "info",
    message: "Runtime booted with filesystem sandbox enabled",
    timestamp: new Date(Date.now() - 1000 * 52).toISOString(),
  },
  {
    id: "log-2",
    executionId: "exec-1025",
    level: "debug",
    message: "Loaded WASI imports and memory limits",
    timestamp: new Date(Date.now() - 1000 * 48).toISOString(),
  },
  {
    id: "log-3",
    executionId: "exec-1025",
    level: "warn",
    message: "Network permission is disabled for this sandbox",
    timestamp: new Date(Date.now() - 1000 * 42).toISOString(),
  },
];

export const runtimeStatus: RuntimeStatus = {
  connected: true,
  activeExecutions: 1,
  memoryMb: 65,
  cpuPercent: 34,
  version: "wasmbox-dev",
};
