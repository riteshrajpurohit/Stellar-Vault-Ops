import {
  CheckCircle2,
  Clock3,
  ExternalLink,
  AlertTriangle,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { TransactionTrackerState } from "@/hooks/useTransactionTracker";

interface TransactionStatusPanelProps {
  state: TransactionTrackerState;
  onClear?: () => void;
}

export function TransactionStatusPanel({
  state,
  onClear,
}: TransactionStatusPanelProps) {
  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-center justify-between gap-2 sm:gap-3">
          <CardTitle className="text-base sm:text-lg lg:text-xl">
            Transaction Status
          </CardTitle>
          <Badge
            tone={state.phase === "success" ? "default" : "muted"}
            className="text-[10px] sm:text-xs"
          >
            {state.phase === "submitting"
              ? "Submitting"
              : state.phase === "success"
                ? "Submitted"
                : state.phase === "error"
                  ? "Failed"
                  : "Idle"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 sm:space-y-4">
        {state.phase === "submitting" ? (
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/[0.02] p-2.5 text-xs text-slate-300 sm:rounded-xl sm:p-3 sm:text-sm">
            <Clock3 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
            Waiting for wallet signature and on-chain confirmation...
          </div>
        ) : null}

        {state.phase === "success" ? (
          <div className="space-y-2 rounded-lg border border-emerald-400/20 bg-emerald-400/8 p-2.5 sm:rounded-2xl sm:space-y-3 sm:p-4">
            <div className="flex items-center gap-2 text-xs font-medium text-emerald-100 sm:text-sm">
              <CheckCircle2 className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0" />
              Transaction submitted on Stellar Testnet
            </div>
            {state.hash ? (
              <p className="break-all text-[10px] text-emerald-100/80 sm:text-xs">
                {state.hash}
              </p>
            ) : null}
            {state.explorerUrl ? (
              <a
                href={state.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 text-[10px] text-emerald-100 underline-offset-4 hover:underline sm:text-xs"
              >
                View on explorer
                <ExternalLink className="h-3 w-3 sm:h-3.5 sm:w-3.5" />
              </a>
            ) : null}
          </div>
        ) : null}

        {state.phase === "error" ? (
          <div className="rounded-lg border border-rose-400/20 bg-rose-400/8 p-2.5 text-xs text-rose-100 sm:rounded-2xl sm:p-4 sm:text-sm">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <AlertTriangle className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
              Transaction failed
            </div>
            <p className="text-rose-100/80">
              {state.errorMessage || "Unknown transaction error."}
            </p>
          </div>
        ) : null}

        {onClear && state.phase !== "idle" ? (
          <Button
            variant="ghost"
            size="sm"
            className="w-full sm:w-auto"
            onClick={onClear}
          >
            Clear status
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
