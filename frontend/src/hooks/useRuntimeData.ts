import { useEffect } from "react";
import { runtimeActions, useRuntimeStore } from "../store/runtimeStore";

export function useRuntimeData() {
  const state = useRuntimeStore();

  useEffect(() => {
    if (!state.status && !state.loading) {
      void runtimeActions.initialize();
    }
  }, [state.loading, state.status]);

  useEffect(() => {
    runtimeActions.connectLogs();
    return () => runtimeActions.disconnectLogs();
  }, []);

  return state;
}
