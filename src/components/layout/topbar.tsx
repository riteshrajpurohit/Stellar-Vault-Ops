import { Menu, Boxes } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { STELLAR_TESTNET_NETWORK } from "@/lib/stellar/network";
import { getConnectionTitle } from "@/lib/wallet/freighter";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

interface TopbarProps {
  onMenuClick: () => void;
}

export function Topbar({ onMenuClick }: TopbarProps) {
  const wallet = useWalletConnection();

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/72 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-4 lg:px-8 xl:px-10">
        <div className="flex items-center gap-3 xl:hidden">
          <Button
            variant="secondary"
            size="icon"
            className="h-9 w-9 rounded-xl"
            onClick={onMenuClick}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <div className="flex h-9 w-9 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <Boxes className="h-4.5 w-4.5" />
          </div>
          <p className="font-display text-sm font-semibold text-slate-100 sm:hidden">
            Vault Ops
          </p>
        </div>

        <div className="hidden items-center gap-3 xl:flex">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-base font-semibold text-white">
              Stellar Vault Ops
            </p>
            <p className="text-xs tracking-wide text-slate-500">
              Intelligent treasury operations console
            </p>
          </div>
        </div>

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
          <div className="hidden sm:block">
            <ConnectWalletButton />
          </div>
        </div>
      </div>
    </header>
  );
}
