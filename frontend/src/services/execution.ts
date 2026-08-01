import { request, isApiConfigured } from "./api";
import * as mock from "./mockData";
import type { Execution, ExecutionLog, PermissionSet, RuntimeStatus, WasmModule } from "../types/execution";

const wait = (ms = 250) => new Promise((resolve) => window.setTimeout(resolve, ms));

export async function getRuntimeStatus(): Promise<RuntimeStatus> {
  if (isApiConfigured()) return request<RuntimeStatus>("/api/runtime/status");
  await wait();
  return mock.runtimeStatus;
}

export async function listModules(): Promise<WasmModule[]> {
  if (isApiConfigured()) return request<WasmModule[]>("/api/modules");
  await wait();
  return mock.modules;
}

export async function uploadModule(file: File): Promise<WasmModule> {
  if (isApiConfigured()) {
    const formData = new FormData();
    formData.append("module", file);
    return request<WasmModule>("/api/modules", {
      method: "POST",
      body: formData,
      headers: {},
    });
  }

  await wait(600);
  return {
    id: crypto.randomUUID(),
    name: file.name,
    size: file.size,
    uploadedAt: new Date().toISOString(),
  };
}

export async function listExecutions(): Promise<Execution[]> {
  if (isApiConfigured()) return request<Execution[]>("/api/executions");
  await wait();
  return mock.executions;
}

export async function startExecution(moduleId: string, command: string, permissions: PermissionSet): Promise<Execution> {
  if (isApiConfigured()) {
    return request<Execution>("/api/executions", {
      method: "POST",
      body: JSON.stringify({ moduleId, command, permissions }),
    });
  }

  await wait(500);
  const module = mock.modules.find((item) => item.id === moduleId);
  return {
    id: crypto.randomUUID(),
    moduleId,
    moduleName: module?.name ?? "uploaded-module.wasm",
    status: "queued",
    command,
    startedAt: new Date().toISOString(),
    memoryMb: 0,
    cpuPercent: 0,
    output: "Execution queued",
  };
}

export async function cancelExecution(id: string): Promise<void> {
  if (isApiConfigured()) return request<void>(`/api/executions/${id}/cancel`, { method: "POST" });
  await wait();
}

export async function listLogs(): Promise<ExecutionLog[]> {
  if (isApiConfigured()) return request<ExecutionLog[]>("/api/logs");
  await wait();
  return mock.logs;
}
