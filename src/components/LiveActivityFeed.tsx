import { ExternalLink, RefreshCw, Activity } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useLiveActivityFeed } from "@/hooks/useLiveActivityFeed";
import { StatusBadge } from "@/components/StatusBadge";

function formatTimestamp(timestamp: number) {
  return new Date(timestamp).toLocaleTimeString();
}

function shortHash(hash: string) {
  if (hash.length <= 14) {
    return hash;
  }

  return `${hash.slice(0, 10)}...${hash.slice(-4)}`;
}

export function LiveActivityFeed() {
  const feed = useLiveActivityFeed();

  return (
    <Card>
      <CardHeader className="pb-3 sm:pb-4">
        <div className="flex items-start justify-between gap-2 sm:gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg lg:text-xl">
              Live Activity Feed
            </CardTitle>
            <p className="mt-1 text-[10px] text-slate-400 sm:text-xs">
              {feed.isSyncing
                ? "Syncing on-chain transaction statuses..."
                : feed.lastSyncedAt
                  ? `Synced at ${new Date(feed.lastSyncedAt).toLocaleTimeString()}`
                  : "Awaiting first sync"}
            </p>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-lg shrink-0 sm:h-9 sm:w-9 sm:rounded-xl"
            onClick={() => void feed.sync()}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 sm:h-4 sm:w-4 ${feed.isSyncing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2 sm:space-y-3">
        {feed.syncError ? (
          <p className="rounded-lg border border-rose-400/20 bg-rose-400/10 p-2 text-xs text-rose-200 sm:rounded-xl sm:p-3 sm:text-sm">
            {feed.syncError}
          </p>
        ) : null}

        {!feed.items.length ? (
          <div className="rounded-lg border border-dashed border-white/10 bg-white/[0.02] p-3 text-xs text-slate-400 sm:rounded-2xl sm:p-4 sm:text-sm">
            No on-chain activity yet. Submit a vault transaction to populate
            this live feed.
          </div>
        ) : (
          feed.items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-white/8 bg-white/[0.03] p-2.5 sm:rounded-2xl sm:p-3.5"
            >
              <div className="mb-2 flex items-center justify-between gap-2 sm:gap-3">
                <div className="flex items-center gap-1.5 text-xs text-slate-100 sm:text-sm sm:gap-2">
                  <Activity className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-cyan-200" />
                  <span className="truncate">{item.action}</span>
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="space-y-1 text-[10px] text-slate-400 sm:text-xs">
                <p>{formatTimestamp(item.timestamp)}</p>
                {item.hash ? (
                  <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
                    <span className="font-mono text-slate-300 truncate">
                      {shortHash(item.hash)}
                    </span>
                    {item.explorerUrl ? (
                      <a
                        href={item.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-0.5 text-cyan-200 hover:underline shrink-0"
                      >
                        Explorer
                        <ExternalLink className="h-2.5 w-2.5 sm:h-3 sm:w-3" />
                      </a>
                    ) : null}
                  </div>
                ) : null}
                {item.errorMessage ? (
                  <p className="text-rose-300">{item.errorMessage}</p>
                ) : null}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
