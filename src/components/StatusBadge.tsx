import { Badge } from "@/components/ui/badge";
import type { ActivityStatus } from "@/lib/cache/activity-store";

interface StatusBadgeProps {
  status: ActivityStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  if (status === "success") {
    return (
      <Badge tone="default" className="min-w-[82px] justify-center">
        Success
      </Badge>
    );
  }

  if (status === "failed") {
    return (
      <Badge
        tone="outline"
        className="min-w-[82px] justify-center border-rose-300/25 text-rose-200"
      >
        Failed
      </Badge>
    );
  }

  if (status === "pending") {
    return (
      <Badge tone="muted" className="min-w-[82px] justify-center">
        Pending
      </Badge>
    );
  }

  return (
    <Badge tone="muted" className="min-w-[82px] justify-center">
      Submitting
    </Badge>
  );
}
