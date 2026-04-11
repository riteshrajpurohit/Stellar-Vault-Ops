import * as React from "react";
import { cn } from "@/lib/utils";

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
  tone?: "default" | "muted" | "outline";
}

export function Badge({ className, tone = "default", ...props }: BadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium tracking-[0.02em]",
        tone === "default" &&
          "border-cyan-300/25 bg-cyan-300/12 text-cyan-100 shadow-[0_0_0_1px_rgba(34,211,238,0.06)]",
        tone === "muted" && "border-white/10 bg-white/6 text-slate-300",
        tone === "outline" && "border-white/12 bg-transparent text-slate-300",
        className,
      )}
      {...props}
    />
  );
}
