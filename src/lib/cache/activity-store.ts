import { cacheKeys } from "@/lib/cache/keys";
import { readCache, subscribeCache, writeCache } from "@/lib/cache/query-cache";

export type ActivityStatus =
  | "submitting"
  | "submitted"
  | "pending"
  | "success"
  | "failed";

export interface ActivityItem {
  id: string;
  action: string;
  hash: string | null;
  explorerUrl: string | null;
  status: ActivityStatus;
  timestamp: number;
  errorMessage: string | null;
}

function readAll() {
  const entry = readCache<ActivityItem[]>(cacheKeys.activityFeed);
  return entry?.value ?? [];
}

function writeAll(items: ActivityItem[]) {
  writeCache(cacheKeys.activityFeed, items.slice(0, 25));
}

export function listActivityItems() {
  return readAll();
}

export function addActivityItem(item: Omit<ActivityItem, "id" | "timestamp">) {
  const next: ActivityItem = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
    timestamp: Date.now(),
    ...item,
  };

  writeAll([next, ...readAll()]);
  return next;
}

export function upsertActivityByHash(
  hash: string,
  patch: Partial<ActivityItem>,
) {
  const items = readAll();
  const index = items.findIndex((item) => item.hash === hash);

  if (index === -1) {
    return;
  }

  items[index] = {
    ...items[index],
    ...patch,
  };
  writeAll(items);
}

export function subscribeActivity(listener: () => void) {
  return subscribeCache(cacheKeys.activityFeed, listener);
}
