import {
  ShieldCheck,
  LayoutDashboard,
  Boxes,
  Activity,
  Wallet,
} from "lucide-react";
import { navigationItems } from "@/lib/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { cn } from "@/lib/utils";

const sidebarPills = [
  { label: "Dark mode only", icon: ShieldCheck },
  { label: "Glass surfaces", icon: LayoutDashboard },
  { label: "Responsive shell", icon: Boxes },
  { label: "Framer Motion", icon: Activity },
  { label: "Wallet layer pending", icon: Wallet },
];

export function Sidebar() {
  return (
    <aside className="hidden w-80 shrink-0 xl:flex xl:flex-col xl:gap-6 xl:border-r xl:border-white/8 xl:bg-white/[0.02] xl:px-6 xl:py-8">
      <div className="space-y-5">
        <div className="flex items-center gap-3">
          <div className="flex h-11 w-11 items-center justify-center rounded-2xl border border-cyan-300/20 bg-cyan-300/10 text-cyan-100 shadow-[0_0_0_1px_rgba(103,232,249,0.08)]">
            <Boxes className="h-5 w-5" />
          </div>
          <div>
            <p className="font-display text-lg font-semibold tracking-tight text-white">
              Stellar Vault Ops
            </p>
            <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
              Web3 SaaS dashboard
            </p>
          </div>
        </div>

        <p className="max-w-[18rem] text-sm leading-6 text-slate-400">
          A premium dashboard shell for vault, token, wallet, and event
          workflows. Built for the UI layer first.
        </p>

        <Badge tone="default">Foundation ready</Badge>
      </div>

      <Separator />

      <nav className="space-y-2">
        {navigationItems.map((item) => (
          <Button
            key={item.href}
            asChild
            variant="ghost"
            className={cn(
              "w-full justify-start rounded-2xl border border-transparent px-4 py-3 text-left text-sm text-slate-300 hover:border-white/8 hover:bg-white/[0.04]",
            )}
          >
            <a href={item.href}>{item.label}</a>
          </Button>
        ))}
      </nav>

      <div className="mt-auto space-y-4 rounded-[1.35rem] border border-white/8 bg-slate-900/70 p-5 shadow-soft">
        <p className="text-xs uppercase tracking-[0.32em] text-slate-500">
          Foundation notes
        </p>
        <ul className="space-y-3 text-sm text-slate-300">
          {sidebarPills.map(({ label, icon: Icon }) => (
            <li key={label} className="flex items-center gap-3">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/8 bg-white/5 text-cyan-200">
                <Icon className="h-4 w-4" />
              </span>
              <span>{label}</span>
            </li>
          ))}
        </ul>
      </div>
    </aside>
  );
}
