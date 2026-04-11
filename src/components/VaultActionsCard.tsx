import { useState } from "react";
import { motion } from "framer-motion";
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
import { useTransactionTracker } from "@/hooks/useTransactionTracker";
import { Skeleton } from "@/components/ui/skeleton";
import { TransactionStatusPanel } from "@/components/TransactionStatusPanel";

function formatBigInt(value: bigint | null) {
  if (value === null) {
    return "-";
  }

  return value.toString();
}

export function VaultActionsCard() {
  const token = useTokenBalance();
  const vault = useVaultActions();
  const tracker = useTransactionTracker();

  const [depositAmount, setDepositAmount] = useState("");
  const [distributeTo, setDistributeTo] = useState("");
  const [distributeAmount, setDistributeAmount] = useState("");
  const [lastSuccessAction, setLastSuccessAction] = useState<string | null>(
    null,
  );

  const submitDeposit = async () => {
    try {
      await tracker.track("vault.deposit", () => vault.deposit(depositAmount));
      setLastSuccessAction("deposit");
      setDepositAmount("");
      await Promise.all([token.refresh(), vault.refreshState()]);
      setTimeout(() => setLastSuccessAction(null), 2000);
    } catch (error) {
      console.error("Deposit failed:", error);
    }
  };

  const submitDistribute = async () => {
    try {
      await tracker.track("vault.distribute", () =>
        vault.distribute(distributeTo, distributeAmount),
      );
      setLastSuccessAction("distribute");
      setDistributeAmount("");
      await Promise.all([token.refresh(), vault.refreshState()]);
      setTimeout(() => setLastSuccessAction(null), 2000);
    } catch (error) {
      console.error("Distribute failed:", error);
    }
  };

  const disabled =
    !vault.canInteract ||
    token.isLoading ||
    vault.isRefreshingState ||
    tracker.state.phase === "submitting";

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg lg:text-xl">
              2. Vault actions
            </CardTitle>
            <CardDescription>
              Deposit tokens into the vault or distribute them back out with
              live contract writes.
            </CardDescription>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0 sm:h-9 sm:w-9 sm:rounded-xl"
            onClick={() =>
              void Promise.all([token.refresh(), vault.refreshState()])
            }
          >
            <RefreshCw className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4 sm:space-y-5">
        <motion.div
          className="grid gap-2 sm:gap-3 grid-cols-1 sm:grid-cols-2 xl:grid-cols-3"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.08,
              },
            },
          }}
        >
          <motion.div
            className="surface-group p-3 sm:p-3.5 surface-group-stagger"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
              Wallet token
            </p>
            {token.isLoading ? (
              <Skeleton className="mt-2 h-4 w-16 sm:h-5 sm:w-20" />
            ) : (
              <p className="mt-1 text-xs font-semibold text-slate-100 sm:text-sm">
                {formatBigInt(token.balance)}
              </p>
            )}
          </motion.div>
          <motion.div
            className="surface-group p-3 sm:p-3.5 surface-group-stagger stagger-2"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
              Vault token
            </p>
            {vault.isRefreshingState ? (
              <Skeleton className="mt-2 h-4 w-16 sm:h-5 sm:w-20" />
            ) : (
              <p className="mt-1 text-xs font-semibold text-slate-100 sm:text-sm">
                {formatBigInt(vault.vaultBalance)}
              </p>
            )}
          </motion.div>
          <motion.div
            className="surface-group p-3 sm:p-3.5 sm:col-span-2 xl:col-span-1 surface-group-stagger stagger-3"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <p className="text-[10px] uppercase tracking-[0.15em] text-slate-500 sm:text-xs sm:tracking-[0.2em]">
              Distributed
            </p>
            {vault.isRefreshingState ? (
              <Skeleton className="mt-2 h-4 w-16 sm:h-5 sm:w-24" />
            ) : (
              <p className="mt-1 text-xs font-semibold text-slate-100 sm:text-sm">
                {formatBigInt(vault.totals?.totalDistributed ?? null)}
              </p>
            )}
          </motion.div>
        </motion.div>

        <motion.div
          className="surface-group space-y-3"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.3,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-100 sm:text-sm">
            <Coins className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Deposit to vault
          </div>
          <input
            value={depositAmount}
            onChange={(event) => setDepositAmount(event.target.value)}
            placeholder="Amount (raw units)"
            className="field-input"
          />
          <Button
            className={`w-full transition-all duration-300 h-9 text-xs sm:h-10 sm:text-sm ${
              lastSuccessAction === "deposit" &&
              tracker.state.phase === "success"
                ? "btn-success shadow-glow-success"
                : tracker.state.phase === "error"
                  ? "btn-error shadow-glow-error"
                  : ""
            }`}
            disabled={disabled || !depositAmount || vault.isDepositing}
            onClick={() => void submitDeposit()}
          >
            <Building2 className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {vault.isDepositing ? "Depositing..." : "Deposit"}
          </Button>
        </motion.div>

        <motion.div
          className="surface-group space-y-3"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{
            duration: 0.6,
            delay: 0.4,
            ease: [0.34, 1.56, 0.64, 1],
          }}
        >
          <div className="flex items-center gap-2 text-xs font-medium text-slate-100 sm:text-sm">
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Distribute from vault
          </div>
          <input
            value={distributeTo}
            onChange={(event) => setDistributeTo(event.target.value)}
            placeholder="Recipient address (G...)"
            className="field-input"
          />
          <input
            value={distributeAmount}
            onChange={(event) => setDistributeAmount(event.target.value)}
            placeholder="Amount (raw units)"
            className="field-input"
          />
          <Button
            variant="secondary"
            className={`w-full transition-all duration-300 h-9 text-xs sm:h-10 sm:text-sm ${
              lastSuccessAction === "distribute" &&
              tracker.state.phase === "success"
                ? "btn-success shadow-glow-success"
                : tracker.state.phase === "error"
                  ? "btn-error shadow-glow-error"
                  : ""
            }`}
            disabled={
              disabled ||
              !distributeTo ||
              !distributeAmount ||
              vault.isDistributing
            }
            onClick={() => void submitDistribute()}
          >
            <Send className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            {vault.isDistributing ? "Distributing..." : "Distribute"}
          </Button>
        </motion.div>

        {!vault.canInteract ? (
          <Badge tone="outline" className="text-[10px] sm:text-xs">
            Connect Freighter and switch to Stellar Testnet to enable writes.
          </Badge>
        ) : null}

        {token.error ? (
          <p className="text-xs text-rose-300 sm:text-sm">{token.error}</p>
        ) : null}
        {vault.actionError ? (
          <p className="text-xs text-rose-300 sm:text-sm">
            {vault.actionError}
          </p>
        ) : null}

        <TransactionStatusPanel state={tracker.state} onClear={tracker.reset} />
      </CardContent>
    </Card>
  );
}
