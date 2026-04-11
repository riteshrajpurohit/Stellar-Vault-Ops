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
      <CardContent className="relative flex flex-col gap-6 p-5 sm:p-7 lg:flex-row lg:items-center lg:justify-between xl:p-8">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(45,212,191,0.1),transparent_28%),linear-gradient(135deg,rgba(255,255,255,0.02),transparent_45%)]" />
        <div className="relative max-w-2xl space-y-4">
          <Badge tone="default" className="w-fit">
            <Sparkles className="mr-2 h-3.5 w-3.5" />
            Clean guided workflow
          </Badge>
          <div className="space-y-3">
            <h1 className="max-w-2xl text-2xl font-semibold tracking-tight text-white sm:text-4xl lg:text-5xl">
              Wallet first. Then vault actions. Then live tracking.
            </h1>
            <p className="max-w-2xl text-sm leading-6 text-slate-400 sm:text-base lg:text-lg">
              Everything important is now arranged in execution order so users
              do not get lost: connect, execute, and verify.
            </p>
          </div>
        </div>

        <div className="relative grid gap-3 sm:grid-cols-3 lg:w-[35rem]">
          {steps.map(({ title, description, icon: Icon }, index) => (
            <div key={title} className="surface-group space-y-3 p-4 sm:p-4.5">
              <div className="flex items-center justify-between gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-cyan-300/15 bg-cyan-300/10 text-cyan-100">
                  <Icon className="h-4.5 w-4.5" />
                </div>
                <Badge tone="muted">0{index + 1}</Badge>
              </div>
              <div className="space-y-1">
                <p className="text-sm font-semibold text-slate-100">{title}</p>
                <p className="text-xs leading-5 text-slate-400">
                  {description}
                </p>
              </div>
            </div>
          ))}

          <div className="surface-group space-y-3 p-4 sm:col-span-3">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-semibold text-slate-100">
                  Ready to start?
                </p>
                <p className="text-xs leading-5 text-slate-400">
                  Connect Freighter once and the rest of the page becomes live.
                </p>
              </div>
              <ConnectWalletButton className="w-full sm:w-auto" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function DashboardGrid() {
  return (
    <section id="overview" className="space-y-6 sm:space-y-8">
      <div>
        <QuickStartCard />
      </div>

      <div className="grid gap-6 xl:grid-cols-12">
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
