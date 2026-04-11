import { useCallback, useState } from "react";
import type { ContractWriteResult } from "@/lib/contracts/token";
import { addActivityItem } from "@/lib/cache/activity-store";

export type TransactionPhase = "idle" | "submitting" | "success" | "error";

export interface TransactionTrackerState {
  phase: TransactionPhase;
  hash: string | null;
  explorerUrl: string | null;
  errorMessage: string | null;
}

export function useTransactionTracker() {
  const [state, setState] = useState<TransactionTrackerState>({
    phase: "idle",
    hash: null,
    explorerUrl: null,
    errorMessage: null,
  });

  const track = useCallback(
    async (action: string, executor: () => Promise<ContractWriteResult>) => {
      setState({
        phase: "submitting",
        hash: null,
        explorerUrl: null,
        errorMessage: null,
      });

      addActivityItem({
        action,
        status: "submitting",
        hash: null,
        explorerUrl: null,
        errorMessage: null,
      });

      try {
        const result = await executor();
        setState({
          phase: "success",
          hash: result.hash,
          explorerUrl: result.explorerUrl,
          errorMessage: null,
        });

        addActivityItem({
          action,
          status: "submitted",
          hash: result.hash,
          explorerUrl: result.explorerUrl,
          errorMessage: null,
        });

        return result;
      } catch (error) {
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Transaction submission failed.";

        setState({
          phase: "error",
          hash: null,
          explorerUrl: null,
          errorMessage,
        });

        addActivityItem({
          action,
          status: "failed",
          hash: null,
          explorerUrl: null,
          errorMessage,
        });
        throw error;
      }
    },
    [],
  );

  const reset = useCallback(() => {
    setState({
      phase: "idle",
      hash: null,
      explorerUrl: null,
      errorMessage: null,
    });
  }, []);

  return {
    state,
    track,
    reset,
  };
}
