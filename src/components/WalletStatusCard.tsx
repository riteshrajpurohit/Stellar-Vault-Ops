import {
  AlertTriangle,
  CheckCircle2,
  ShieldCheck,
  Wallet,
  ArrowRight,
} from "lucide-react";
import { motion } from "framer-motion";
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
              <CardTitle className="text-lg sm:text-xl">
                1. Connect your wallet
              </CardTitle>
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
        <motion.div
          className="grid gap-4 rounded-2xl border border-dashed border-cyan-400/15 bg-gradient-to-br from-cyan-400/[0.06] to-blue-400/[0.04] p-4 sm:p-5 md:grid-cols-[1.2fr_0.8fr] md:items-center"
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.34, 1.56, 0.64, 1] }}
        >
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
        </motion.div>

        <Separator />

        <motion.div
          className="grid gap-3 md:grid-cols-2"
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true }}
          variants={{
            hidden: { opacity: 0 },
            visible: {
              opacity: 1,
              transition: {
                staggerChildren: 0.1,
              },
            },
          }}
        >
          <motion.div
            className="surface-group surface-group-stagger"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Address
            </p>
            <p className="mt-2 text-sm font-medium text-slate-100">
              {formatWalletAddress(address)}
            </p>
          </motion.div>
          <motion.div
            className="surface-group surface-group-stagger stagger-2"
            variants={{
              hidden: { opacity: 0, y: 12 },
              visible: { opacity: 1, y: 0, transition: { duration: 0.5 } },
            }}
          >
            <p className="text-xs uppercase tracking-[0.24em] text-slate-500">
              Network
            </p>
            <p className="mt-2 text-sm font-medium text-slate-100">
              {formatWalletNetwork(network)}
            </p>
          </motion.div>
        </motion.div>

        {error ? (
          <motion.div
            className="flex gap-3 rounded-2xl border border-red-400/25 bg-gradient-to-r from-red-400/[0.12] to-rose-400/[0.08] p-4 text-sm text-rose-100"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.3 }}
          >
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-red-300" />
            <div className="space-y-1">
              <p className="font-medium">{error.title}</p>
              <p className="leading-6 text-rose-100/75">{error.message}</p>
            </div>
          </motion.div>
        ) : null}

        <motion.div
          className="flex flex-wrap items-center gap-3"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <ConnectWalletButton className="w-full sm:w-auto" />
          {isConnected ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4 }}
            >
              <Badge
                tone="default"
                className="w-full sm:w-auto bg-gradient-to-r from-emerald-400/80 to-green-400/80 shadow-glow-success"
              >
                <ArrowRight className="mr-2 h-3.5 w-3.5" />
                You can now use vault actions below
              </Badge>
            </motion.div>
          ) : null}
          <p className="text-xs leading-5 text-slate-500 sm:max-w-[22rem]">
            Freighter permission flow only. No fake addresses or mock wallet
            state.
          </p>
        </motion.div>
      </CardContent>
    </Card>
  );
}
