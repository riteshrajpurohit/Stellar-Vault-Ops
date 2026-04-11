import { useState } from "react";
import { Menu, X, Zap } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "@/components/ui/badge";
import { STELLAR_TESTNET_NETWORK } from "@/lib/stellar/network";
import { getConnectionTitle } from "@/lib/wallet/freighter";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";

const NAV_ITEMS = [
  { label: "Wallet", href: "#wallet" },
  { label: "Actions", href: "#actions" },
  { label: "Activity", href: "#activity" },
];

export function Topbar() {
  const wallet = useWalletConnection();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const closeMobileMenu = () => setMobileMenuOpen(false);

  return (
    <header className="sticky top-0 z-40 border-b border-white/8 bg-slate-950/95 backdrop-blur-2xl">
      {/* Main navbar container */}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Header section */}
        <div className="flex items-center justify-between gap-3 py-3 sm:py-4">
          {/* Logo and branding */}
          <motion.a
            href="#overview"
            className="flex min-w-0 items-center gap-3"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-cyan-400/30 bg-gradient-to-br from-cyan-400/20 to-cyan-600/10 text-cyan-100 shadow-lg shadow-cyan-500/10 transition-all duration-300 hover:border-cyan-400/50 hover:shadow-cyan-500/20">
              <Zap className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-bold text-white sm:text-base">
                Stellar Vault Ops
              </p>
              <p className="hidden truncate text-[11px] tracking-wide text-slate-400 sm:block sm:text-xs">
                Professional Soroban operations
              </p>
            </div>
          </motion.a>

          {/* Right section - Desktop navigation + Controls */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop navigation */}
            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map((item, idx) => (
                <motion.a
                  key={item.label}
                  href={item.href}
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-white/8 hover:text-cyan-100"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{
                    duration: 0.4,
                    delay: 0.08 + idx * 0.06,
                    ease: "easeOut",
                  }}
                  onClick={closeMobileMenu}
                >
                  {item.label}
                </motion.a>
              ))}
            </nav>

            {/* Status badges and wallet button */}
            <div className="flex items-center gap-2 sm:gap-3">
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                <Badge
                  tone={wallet.isConnected ? "default" : "muted"}
                  className="hidden text-[10px] sm:inline-flex sm:text-xs"
                >
                  {getConnectionTitle(wallet)}
                </Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.24 }}
              >
                <Badge
                  tone={wallet.network?.isTestnet ? "default" : "outline"}
                  className="text-[10px] sm:text-xs"
                >
                  {STELLAR_TESTNET_NETWORK.label}
                </Badge>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4, delay: 0.28 }}
              >
                <ConnectWalletButton className="h-9 px-3 text-xs sm:h-10 sm:px-4 sm:text-sm" />
              </motion.div>

              {/* Mobile menu button */}
              <motion.button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="rounded-lg p-2 text-slate-300 transition-colors duration-300 hover:bg-white/8 hover:text-cyan-100 md:hidden"
                whileTap={{ scale: 0.95 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.32 }}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5" />
                ) : (
                  <Menu className="h-5 w-5" />
                )}
              </motion.button>
            </div>
          </div>
        </div>

        {/* Mobile navigation menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.nav
              className="overflow-hidden border-t border-white/8 md:hidden"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              <div className="flex flex-col gap-1 py-3 px-2">
                {NAV_ITEMS.map((item, idx) => (
                  <motion.a
                    key={item.label}
                    href={item.href}
                    className="rounded-lg px-4 py-2.5 text-sm font-medium text-slate-300 transition-all duration-300 hover:bg-cyan-500/10 hover:text-cyan-100 active:bg-cyan-500/15"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: 0.3,
                      delay: idx * 0.08,
                      ease: "easeOut",
                    }}
                    onClick={closeMobileMenu}
                  >
                    {item.label}
                  </motion.a>
                ))}
              </div>
            </motion.nav>
          )}
        </AnimatePresence>
      </div>
    </header>
  );
}
