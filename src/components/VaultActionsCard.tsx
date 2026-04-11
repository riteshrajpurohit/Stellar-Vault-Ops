import { useState } from "react";
import { Building2, Coins, RefreshCw, Send } from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useTokenBalance } from "@/hooks/useTokenBalance";
import { useVaultActions } from "@/hooks/useVaultActions";
import { Skeleton } from "@/components/ui/skeleton";

function formatBigInt(value: bigint | null) {
  if (value === null) {
    return "-";
  }

  return value.toString();
}

export function VaultActionsCard() {
  const token = useTokenBalance();
  const vault = useVaultActions();

  const [depositAmount, setDepositAmount] = useState("");
  const [distributeTo, setDistributeTo] = useState("");
  const [distributeAmount, setDistributeAmount] = useState("");

  const submitDeposit = async () => {
    await vault.deposit(depositAmount);
    setDepositAmount("");
    await Promise.all([token.refresh(), vault.refreshState()]);
  };

  const submitDistribute = async () => {
    await vault.distribute(distributeTo, distributeAmount);
    setDistributeAmount("");
    await Promise.all([token.refresh(), vault.refreshState()]);
  };

  const disabled =
    !vault.canInteract || token.isLoading || vault.isRefreshingState;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <CardTitle className="text-lg">2. Vault actions</CardTitle>
              <CardDescription>
                Deposit tokens into the vault or distribute them back out with
                live contract writes.
              </CardDescription>
            </div>
            <Button
              variant="ghost"
              size="icon"
              className="h-9 w-9 rounded-xl"
              onClick={() =>
                void Promise.all([token.refresh(), vault.refreshState()])
              }
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
            <div className="surface-group p-3.5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Wallet token
              </p>
              {token.isLoading ? (
                <Skeleton className="mt-2 h-5 w-20" />
              ) : (
                <p className="mt-1 text-sm font-semibold text-slate-100">
                  {formatBigInt(token.balance)}
                </p>
              )}
            </div>
            <div className="surface-group p-3.5">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Vault token
              </p>
              {vault.isRefreshingState ? (
                <Skeleton className="mt-2 h-5 w-20" />
              ) : (
                <p className="mt-1 text-sm font-semibold text-slate-100">
                  {formatBigInt(vault.vaultBalance)}
                </p>
              )}
            </div>
            <div className="surface-group p-3.5 sm:col-span-2 xl:col-span-1">
              <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
                Distributed
              </p>
              {vault.isRefreshingState ? (
                <Skeleton className="mt-2 h-5 w-24" />
              ) : (
                <p className="mt-1 text-sm font-semibold text-slate-100">
                  {formatBigInt(vault.totals?.totalDistributed ?? null)}
                </p>
              )}
            </div>
          </div>

          <div className="surface-group space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
              <Coins className="h-4 w-4" />
              Deposit to vault
            </div>
            <input
              value={depositAmount}
              onChange={(event) => setDepositAmount(event.target.value)}
              placeholder="Amount (raw units)"
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
            />
            <Button
              className="w-full sm:w-auto"
              disabled={disabled || !depositAmount || vault.isDepositing}
              onClick={() => void submitDeposit()}
            >
              <Building2 className="h-4 w-4" />
              {vault.isDepositing ? "Depositing..." : "Deposit"}
            </Button>
          </div>

          <div className="surface-group space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-100">
              <Send className="h-4 w-4" />
              Distribute from vault
            </div>
            <input
              value={distributeTo}
              onChange={(event) => setDistributeTo(event.target.value)}
              placeholder="Recipient address (G...)"
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
            />
            <input
              value={distributeAmount}
              onChange={(event) => setDistributeAmount(event.target.value)}
              placeholder="Amount (raw units)"
              className="h-10 w-full rounded-xl border border-white/10 bg-slate-900/80 px-3 text-sm text-slate-100 outline-none focus:border-cyan-300/40"
            />
            <Button
              variant="secondary"
              className="w-full sm:w-auto"
              disabled={
                disabled ||
                !distributeTo ||
                !distributeAmount ||
                vault.isDistributing
              }
              onClick={() => void submitDistribute()}
            >
              <Send className="h-4 w-4" />
              {vault.isDistributing ? "Distributing..." : "Distribute"}
            </Button>
          </div>

          {!vault.canInteract ? (
            <Badge tone="outline">
              Connect a testnet wallet and set vault/token contract IDs in env.
            </Badge>
          ) : null}

          {token.error ? (
            <p className="text-sm text-rose-300">{token.error}</p>
          ) : null}
          {vault.actionError ? (
            <p className="text-sm text-rose-300">{vault.actionError}</p>
          ) : null}
        </CardContent>
      </Card>
    </div>
  );
}
