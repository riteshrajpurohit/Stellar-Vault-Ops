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
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <CardTitle className="text-base sm:text-lg">
            Transaction Status
          </CardTitle>
          <Badge tone={state.phase === "success" ? "default" : "muted"}>
            {state.phase === "submitting"
              ? "Submitting"
              : state.phase === "success"
                ? "Confirmed"
                : state.phase === "error"
                  ? "Failed"
                  : "Idle"}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {state.phase === "submitting" ? (
          <div className="flex items-center gap-2 rounded-xl border border-white/10 bg-white/[0.02] p-3 text-sm text-slate-300">
            <Clock3 className="h-4 w-4" />
            Waiting for wallet signature and on-chain confirmation...
          </div>
        ) : null}

        {state.phase === "success" ? (
          <div className="space-y-3 rounded-2xl border border-emerald-400/20 bg-emerald-400/8 p-4">
            <div className="flex items-center gap-2 text-sm font-medium text-emerald-100">
              <CheckCircle2 className="h-4 w-4" />
              Transaction confirmed on Stellar Testnet
            </div>
            {state.hash ? (
              <p className="break-all text-xs text-emerald-100/80">
                {state.hash}
              </p>
            ) : null}
            {state.explorerUrl ? (
              <a
                href={state.explorerUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 text-xs text-emerald-100 underline-offset-4 hover:underline"
              >
                View on explorer
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            ) : null}
          </div>
        ) : null}

        {state.phase === "error" ? (
          <div className="rounded-2xl border border-rose-400/20 bg-rose-400/8 p-4 text-sm text-rose-100">
            <div className="mb-1 flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
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
