export type ExecutionStatus = "queued" | "running" | "completed" | "failed" | "cancelled";

export interface WasmModule {
  id: string;
  name: string;
  size: number;
  uploadedAt: string;
  checksum?: string;
}

export interface ExecutionLog {
  id: string;
  executionId: string;
  level: "info" | "warn" | "error" | "debug";
  message: string;
  timestamp: string;
}

export interface Execution {
  id: string;
  moduleId: string;
  moduleName: string;
  status: ExecutionStatus;
  command: string;
  startedAt: string;
  finishedAt?: string;
  durationMs?: number;
  memoryMb?: number;
  cpuPercent?: number;
  output: string;
}

export interface RuntimeStatus {
  connected: boolean;
  activeExecutions: number;
  memoryMb: number;
  cpuPercent: number;
  version: string;
}

export interface PermissionSet {
  filesystem: boolean;
  network: boolean;
  environment: boolean;
}
