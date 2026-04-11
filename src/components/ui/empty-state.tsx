import { type ReactNode } from "react";
import { Badge } from "./badge";
import { Button } from "./button";
import { Card, CardContent } from "./card";

interface EmptyStateProps {
  title: string;
  description: string;
  actionLabel?: string;
  icon: ReactNode;
}

export function EmptyState({
  title,
  description,
  actionLabel,
  icon,
}: EmptyStateProps) {
  return (
    <Card className="relative overflow-hidden">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(56,189,248,0.08),transparent_32%)]" />
      <CardContent className="relative space-y-5 p-6">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/6 text-cyan-200">
          {icon}
        </div>
        <div className="space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg font-semibold text-white">{title}</h3>
            <Badge tone="outline">Empty</Badge>
          </div>
          <p className="max-w-sm text-sm leading-6 text-slate-400">
            {description}
          </p>
        </div>
        {actionLabel ? (
          <Button variant="secondary" size="sm" className="mt-2">
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
