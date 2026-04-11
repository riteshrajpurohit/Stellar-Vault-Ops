import { Boxes } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { STELLAR_TESTNET_NETWORK } from "@/lib/stellar/network";
import { getConnectionTitle } from "@/lib/wallet/freighter";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export function Topbar() {
  const wallet = useWalletConnection();

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/72 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
        <a href="#overview" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-white">
              Stellar Vault Ops
            </p>
            <p className="text-xs tracking-wide text-slate-500">
              Stellar vault website
            </p>
          </div>
        </a>

        <nav className="hidden items-center gap-1 md:flex">
          <a
            href="#wallet"
            className="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Wallet
          </a>
          <a
            href="#actions"
            className="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Actions
          </a>
          <a
            href="#activity"
            className="rounded-xl px-3 py-2 text-sm text-slate-300 hover:bg-white/5 hover:text-white"
          >
            Activity
          </a>
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <Badge
            tone={wallet.isConnected ? "default" : "muted"}
            className="hidden md:inline-flex"
          >
            {getConnectionTitle(wallet)}
          </Badge>
          <Badge
            tone={wallet.network?.isTestnet ? "default" : "outline"}
            className="text-[11px] sm:text-xs"
          >
            {STELLAR_TESTNET_NETWORK.label}
          </Badge>
          <div>
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
