import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getTokenBalance,
  hasTokenContractConfig,
} from "@/lib/contracts/token.ts";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { cacheKeys } from "@/lib/cache/keys";
import {
  isCacheFresh,
  readCache,
  subscribeCache,
  writeCache,
} from "@/lib/cache/query-cache";

const TOKEN_BALANCE_CACHE_TTL_MS = 15_000;

export function useTokenBalance() {
  const wallet = useWalletConnection();
  const [balance, setBalance] = useState<bigint | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const canRead =
    wallet.isConnected &&
    Boolean(wallet.address) &&
    Boolean(wallet.network?.isTestnet) &&
    hasTokenContractConfig();

  const cacheKey = wallet.address
    ? cacheKeys.tokenBalance(wallet.address)
    : null;

  useEffect(() => {
    if (!cacheKey) {
      return;
    }

    return subscribeCache(cacheKey, () => {
      const entry = readCache<bigint>(cacheKey);
      if (!entry) {
        return;
      }

      setBalance(entry.value);
    });
  }, [cacheKey]);

  const refresh = useCallback(async () => {
    if (!canRead || !wallet.address) {
      setBalance(null);
      setError(null);
      return;
    }

    const key = cacheKeys.tokenBalance(wallet.address);
    const cached = readCache<bigint>(key);
    if (cached && isCacheFresh(cached.updatedAt, TOKEN_BALANCE_CACHE_TTL_MS)) {
      setBalance(cached.value);
      setError(null);
      setIsLoading(false);
      return;
    }

    if (cached) {
      setBalance(cached.value);
    }

    setIsLoading(true);
    setError(null);

    try {
      const nextBalance = await getTokenBalance(wallet.address);
      setBalance(nextBalance);
      writeCache(key, nextBalance);
    } catch (nextError) {
      setError(
        nextError instanceof Error
          ? nextError.message
          : "Unable to read token balance.",
      );
    } finally {
      setIsLoading(false);
    }
  }, [canRead, wallet.address]);

  useEffect(() => {
    void refresh();
  }, [refresh, wallet.lastSyncedAt]);

  return useMemo(
    () => ({
      balance,
      isLoading,
      error,
      refresh,
      canRead,
    }),
    [balance, canRead, error, isLoading, refresh],
  );
}
