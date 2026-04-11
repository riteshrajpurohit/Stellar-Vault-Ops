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
      <CardHeader className="pb-4">
        <div className="flex items-center justify-between gap-3">
          <div>
            <CardTitle className="text-base sm:text-lg">
              Live Activity Feed
            </CardTitle>
            <p className="mt-1 text-xs text-slate-400">
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
            className="h-9 w-9 rounded-xl"
            onClick={() => void feed.sync()}
          >
            <RefreshCw
              className={`h-4 w-4 ${feed.isSyncing ? "animate-spin" : ""}`}
            />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {feed.syncError ? (
          <p className="rounded-xl border border-rose-400/20 bg-rose-400/10 p-3 text-sm text-rose-200">
            {feed.syncError}
          </p>
        ) : null}

        {!feed.items.length ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-white/[0.02] p-4 text-sm text-slate-400">
            No on-chain activity yet. Submit a vault transaction to populate
            this live feed.
          </div>
        ) : (
          feed.items.map((item) => (
            <div
              key={item.id}
              className="rounded-2xl border border-white/8 bg-white/[0.03] p-3 sm:p-3.5"
            >
              <div className="mb-2 flex items-center justify-between gap-3">
                <div className="flex items-center gap-2 text-sm text-slate-100">
                  <Activity className="h-4 w-4 text-cyan-200" />
                  {item.action}
                </div>
                <StatusBadge status={item.status} />
              </div>

              <div className="space-y-1 text-xs text-slate-400">
                <p>{formatTimestamp(item.timestamp)}</p>
                {item.hash ? (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-slate-300">
                      {shortHash(item.hash)}
                    </span>
                    {item.explorerUrl ? (
                      <a
                        href={item.explorerUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1 text-cyan-200 hover:underline"
                      >
                        Explorer
                        <ExternalLink className="h-3 w-3" />
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
