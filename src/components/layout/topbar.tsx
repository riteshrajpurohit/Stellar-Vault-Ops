import { Boxes } from "lucide-react";
import { motion } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { STELLAR_TESTNET_NETWORK } from "@/lib/stellar/network";
import { getConnectionTitle } from "@/lib/wallet/freighter";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

export function Topbar() {
  const wallet = useWalletConnection();

  return (
    <header className="sticky top-0 z-30 border-b border-white/8 bg-slate-950/72 backdrop-blur-xl">
      <div className="flex flex-col gap-3 py-3 sm:py-4">
        <div className="flex items-center justify-between gap-3">
          <a href="#overview" className="flex min-w-0 items-center gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100">
              <Boxes className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold text-white sm:text-base">
                Stellar Vault Ops
              </p>
              <p className="truncate text-[11px] tracking-wide text-slate-500 sm:text-xs">
                Professional Soroban operations workspace
              </p>
            </div>
          </a>

          <div className="flex items-center gap-2 sm:gap-3">
            <Badge
              tone={wallet.isConnected ? "default" : "muted"}
              className="hidden lg:inline-flex"
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
              <ConnectWalletButton className="h-10 px-4 text-xs sm:h-11 sm:px-5 sm:text-sm" />
            </div>
          </div>
        </div>

        <nav className="scrollbar-none -mx-1 flex items-center gap-2 overflow-x-auto px-1 md:justify-center md:overflow-visible">
          <motion.div
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <Boxes className="h-4 w-4" />
          </motion.div>
          {["Wallet", "Actions", "Activity"].map((item, idx) => {
            const hrefs = {
              Wallet: "#wallet",
              Actions: "#actions",
              Activity: "#activity",
            };
            return (
              <motion.a
                key={item}
                href={hrefs[item as keyof typeof hrefs]}
                className="nav-pill"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.4,
                  delay: 0.05 + idx * 0.08,
                  ease: [0.34, 1.56, 0.64, 1],
                }}
              >
                {item}
              </motion.a>
            );
          })}
        </nav>
      </div>
    </header>
  );
}
