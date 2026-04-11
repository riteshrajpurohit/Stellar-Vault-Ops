import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { ConnectWalletButton } from "./ConnectWalletButton";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { STELLAR_TESTNET_NETWORK } from "@/lib/stellar/network";
import {
  formatWalletAddress,
  formatWalletNetwork,
} from "@/lib/wallet/freighter";

export function WalletStatusCard() {
  const { isInstalled, isConnected, isLoading, address, network, error } =
    useWalletConnection();

  const connectionBadge = isLoading
    ? "Loading"
    : isConnected
      ? "Connected"
      : "Disconnected";

  return (
    <Card className="overflow-hidden">
      <CardHeader className="pb-4">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-cyan-200">
              <Wallet className="h-5 w-5" />
            </div>
            <div>
              <CardTitle className="text-lg">1. Connect your wallet</CardTitle>
              <CardDescription>
                Freighter is the first step. Connect it once, then the vault
                actions below become available.
              </CardDescription>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Badge tone={isConnected ? "default" : "muted"}>
              {connectionBadge}
            </Badge>
            <Badge tone={network?.isTestnet ? "default" : "outline"}>
              {STELLAR_TESTNET_NETWORK.label}
            </Badge>
            <Badge tone={isInstalled ? "muted" : "outline"}>
              {isInstalled ? "Freighter detected" : "Freighter not installed"}
            </Badge>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        <div className="grid gap-4 rounded-2xl border border-dashed border-white/10 bg-white/[0.03] p-4 sm:p-5 md:grid-cols-[1.2fr_0.8fr] md:items-center">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-200">
              {isConnected ? "Wallet ready" : "Start here"}
            </p>
            <p className="text-sm leading-6 text-slate-400">
              {isConnected
                ? `Connected as ${formatWalletAddress(address)} on ${formatWalletNetwork(network)}.`
                : isLoading
                  ? "Checking Freighter and waiting for permission."
                  : isInstalled
                    ? "Click Connect Wallet to open Freighter and approve access."
                    : "Install Freighter, then come back and connect your Stellar Testnet wallet."}
            </p>
          </div>

          <div className="flex flex-wrap gap-2 md:justify-end">
            {isConnected ? (
              <Badge tone="default">
                <CheckCircle2 className="mr-2 h-3.5 w-3.5" />
                Connected
              </Badge>
            ) : (
              <Badge tone="outline">
                <ShieldCheck className="mr-2 h-3.5 w-3.5" />
                Awaiting permission
              </Badge>
            )}
          </div>
        </div>

        <Separator />

        <div className="grid gap-3 md:grid-cols-2">
          <div className="surface-group">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Address
            </p>
            <p className="mt-2 text-sm font-medium text-slate-200">
              {formatWalletAddress(address)}
            </p>
          </div>
          <div className="surface-group">
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Network
            </p>
            <p className="mt-2 text-sm font-medium text-slate-200">
              {formatWalletNetwork(network)}
            </p>
          </div>
        </div>

        {error ? (
          <div className="flex gap-3 rounded-2xl border border-rose-400/20 bg-rose-400/8 p-4 text-sm text-rose-100">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-rose-200" />
            <div className="space-y-1">
              <p className="font-medium">{error.title}</p>
              <p className="leading-6 text-rose-100/80">{error.message}</p>
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center gap-3">
          <ConnectWalletButton className="w-full sm:w-auto" />
          {isConnected ? (
            <Badge tone="default" className="w-full sm:w-auto">
              <ArrowRight className="mr-2 h-3.5 w-3.5" />
              You can now use vault actions below
            </Badge>
          ) : null}
          <p className="text-xs leading-5 text-slate-500">
            Freighter permission flow only. No fake addresses or mock wallet
            state.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
