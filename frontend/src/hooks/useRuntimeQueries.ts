import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import * as executionService from "../services/execution";
import type { Execution, ExecutionLog, PermissionSet, RuntimeStatus, WasmModule } from "../types/execution";
import { toast } from "sonner";

const queryKeys = {
  runtimeStatus: ["runtime", "status"] as const,
  modules: ["modules"] as const,
  executions: ["executions"] as const,
  logs: ["logs"] as const,
};

export function useRuntimeStatus() {
  return useQuery({
    queryKey: queryKeys.runtimeStatus,
    queryFn: executionService.getRuntimeStatus,
    refetchInterval: 30000,
  });
}

export function useModules() {
  return useQuery({
    queryKey: queryKeys.modules,
    queryFn: executionService.listModules,
  });
}

export function useExecutions() {
  return useQuery({
    queryKey: queryKeys.executions,
    queryFn: executionService.listExecutions,
    refetchInterval: 5000,
  });
}

export function useLogs() {
  return useQuery({
    queryKey: queryKeys.logs,
    queryFn: executionService.listLogs,
    refetchInterval: 3000,
  });
}

export function useUploadModule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executionService.uploadModule,
    onSuccess: (module) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.modules });
      toast.success(`Module "${module.name}" uploaded`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useStartExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ moduleId, command, permissions }: { moduleId: string; command: string; permissions: PermissionSet }) =>
      executionService.startExecution(moduleId, command, permissions),
    onSuccess: (execution) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executions });
      queryClient.invalidateQueries({ queryKey: queryKeys.logs });
      toast.success(`Execution started: ${execution.id.slice(0, 8)}`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useCancelExecution() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: executionService.cancelExecution,
    onSuccess: (_data, id) => {
      queryClient.invalidateQueries({ queryKey: queryKeys.executions });
      toast.warning(`Execution ${id.slice(0, 8)} cancelled`);
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export { queryKeys };