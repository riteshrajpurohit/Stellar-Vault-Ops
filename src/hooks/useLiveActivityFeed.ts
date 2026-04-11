import { useCallback, useEffect, useMemo, useState } from "react";
import {
  listActivityItems,
  subscribeActivity,
  upsertActivityByHash,
  type ActivityItem,
} from "@/lib/cache/activity-store";
import {
  getTransactionStatus,
  getStellarClientConfig,
} from "@/lib/contracts/token";

const POLL_INTERVAL_MS = 7000;

export function useLiveActivityFeed() {
  const [items, setItems] = useState<ActivityItem[]>(() => listActivityItems());
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  useEffect(() => {
    return subscribeActivity(() => {
      setItems(listActivityItems());
    });
  }, []);

  const sync = useCallback(async () => {
    const current = listActivityItems();
    const hashes = current
      .filter(
        (item) =>
          item.hash && item.status !== "success" && item.status !== "failed",
      )
      .map((item) => item.hash as string);

    if (!hashes.length) {
      setLastSyncedAt(Date.now());
      setSyncError(null);
      return;
    }

    setIsSyncing(true);
    setSyncError(null);

    try {
      const config = getStellarClientConfig();
      await Promise.all(
        hashes.map(async (hash) => {
          const status = await getTransactionStatus(hash, config);
          if (status === "SUCCESS") {
            upsertActivityByHash(hash, { status: "success" });
            return;
          }

          if (status === "FAILED") {
            upsertActivityByHash(hash, {
              status: "failed",
              errorMessage: "Transaction failed on-chain.",
            });
            return;
          }

          upsertActivityByHash(hash, { status: "submitted" });
        }),
      );

      setLastSyncedAt(Date.now());
    } catch (error) {
      setSyncError(
        error instanceof Error
          ? error.message
          : "Unable to sync activity feed.",
      );
    } finally {
      setIsSyncing(false);
      setItems(listActivityItems());
    }
  }, []);

  useEffect(() => {
    void sync();

    const timer = window.setInterval(() => {
      void sync();
    }, POLL_INTERVAL_MS);

    return () => {
      window.clearInterval(timer);
    };
  }, [sync]);

  return useMemo(
    () => ({
      items,
      isSyncing,
      lastSyncedAt,
      syncError,
      sync,
    }),
    [isSyncing, items, lastSyncedAt, sync, syncError],
  );
}
