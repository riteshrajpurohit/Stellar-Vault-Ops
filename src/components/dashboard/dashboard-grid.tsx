import { Coins, Wallet, ShieldCheck, Sparkles } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { WalletStatusCard } from "@/components/WalletStatusCard";
import { VaultActionsCard } from "@/components/VaultActionsCard";
import { ConnectWalletButton } from "@/components/ConnectWalletButton";
import { LiveActivityFeed } from "@/components/LiveActivityFeed";

function QuickStartCard() {
  const steps = [
    {
      title: "Connect Freighter",
      description:
        "Open the wallet prompt from the top bar or the card below and approve testnet access.",
      icon: Wallet,
    },
    {
      title: "Deposit to vault",
      description:
        "Enter a raw token amount and submit a real Soroban transaction.",
      icon: Coins,
    },
    {
      title: "Distribute from vault",
      description:
        "Paste a recipient address and send tokens from the vault contract.",
      icon: ShieldCheck,
    },
  ];

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex flex-col gap-4 p-4 sm:gap-6 sm:p-5 lg:flex-row lg:items-center lg:justify-between lg:gap-8 xl:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.1),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_45%)]" />
        <div className="relative max-w-2xl space-y-3 sm:space-y-4">
          <Badge tone="default" className="w-fit">
            <Sparkles className="mr-2 h-3 w-3 sm:h-3.5 sm:w-3.5" />
            Clean guided workflow
          </Badge>
          <div className="space-y-2 sm:space-y-3">
            <h1 className="max-w-2xl text-xl font-semibold tracking-tight text-white sm:text-2xl lg:text-4xl xl:text-5xl">
              Wallet first. Then vault actions. Then live tracking.
            </h1>
            <p className="max-w-2xl text-xs leading-5 text-slate-400 sm:text-sm sm:leading-6 lg:text-base lg:leading-7">
              Everything important is now arranged in execution order so users
              do not get lost: connect, execute, and verify.
            </p>
          </div>
        </div>

        <div className="relative grid gap-3 grid-cols-1 sm:grid-cols-3 lg:w-[35rem]">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="surface-group space-y-3 p-3 sm:p-4">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100 sm:h-10 sm:w-10">
                  <Icon className="h-4 w-4 sm:h-4.5 sm:w-4.5" />
                </div>
                <Badge tone="muted" className="text-[10px] sm:text-xs">
                  0{index + 1}
                </Badge>
              </div>
              <div className="space-y-1">
                <p className="text-xs font-semibold text-slate-100 sm:text-sm">
                  {title}
                </p>
                <p className="text-[11px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
                  {description}
                </p>
              </div>
            </div>
          ))}

          <div className="surface-group space-y-3 p-3 sm:p-4 sm:col-span-3">
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-xs font-semibold text-slate-100 sm:text-sm">
                  Ready to start?
                </p>
                <p className="text-[11px] leading-4 text-slate-400 sm:text-xs sm:leading-5">
                  Connect Freighter once and the rest of the page becomes live.
                </p>
              </div>
              <ConnectWalletButton className="w-full h-9 text-xs sm:h-10 sm:text-sm" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardGrid() {
  return (
    <section
      id="overview"
      className="space-y-4 sm:space-y-5 md:space-y-6 lg:space-y-8"
    >
      <div>
        <QuickStartCard />
      </div>

      <div className="grid gap-4 sm:gap-5 md:gap-6 lg:gap-8 xl:grid-cols-12">
        <div id="wallet" className="xl:col-span-5">
          <WalletStatusCard />
        </div>

        <div id="actions" className="xl:col-span-7">
          <VaultActionsCard />
        </div>
      </div>

      <div id="activity" className="pb-2">
        <LiveActivityFeed />
      </div>
    </section>
  );
}
