import { useCallback, useEffect, useMemo, useState } from "react";
import {
  depositToVault,
  distributeFromVault,
  getVaultTokenBalance,
  getVaultTotals,
  hasVaultContractConfig,
  type VaultTotals,
} from "@/lib/contracts/vault";
import type { ContractWriteResult } from "@/lib/contracts/token";
import { useWalletConnection } from "@/hooks/useWalletConnection";
import { cacheKeys } from "@/lib/cache/keys";
import {
  invalidateCache,
  isCacheFresh,
  readCache,
  subscribeCache,
  writeCache,
} from "@/lib/cache/query-cache";

const VAULT_STATE_CACHE_TTL_MS = 15_000;

interface VaultCachedState {
  totals: VaultTotals;
  vaultBalance: bigint;
}

export function useVaultActions() {
  const wallet = useWalletConnection();
  const [isDepositing, setIsDepositing] = useState(false);
  const [isDistributing, setIsDistributing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [totals, setTotals] = useState<VaultTotals | null>(null);
  const [vaultBalance, setVaultBalance] = useState<bigint | null>(null);
  const [isRefreshingState, setIsRefreshingState] = useState(false);

  const canInteract =
    wallet.isConnected &&
    Boolean(wallet.address) &&
    Boolean(wallet.network?.isTestnet) &&
    hasVaultContractConfig();

  const cacheKey = wallet.address ? cacheKeys.vaultState(wallet.address) : null;

  useEffect(() => {
    if (!cacheKey) {
      return;
    }

    return subscribeCache(cacheKey, () => {
      const entry = readCache<VaultCachedState>(cacheKey);
      if (!entry) {
        return;
      }

      setTotals(entry.value.totals);
      setVaultBalance(entry.value.vaultBalance);
    });
  }, [cacheKey]);

  const refreshState = useCallback(async () => {
    if (!canInteract || !wallet.address) {
      setTotals(null);
      setVaultBalance(null);
      return;
    }

    const key = cacheKeys.vaultState(wallet.address);
    const cached = readCache<VaultCachedState>(key);
    if (cached && isCacheFresh(cached.updatedAt, VAULT_STATE_CACHE_TTL_MS)) {
      setTotals(cached.value.totals);
      setVaultBalance(cached.value.vaultBalance);
      setActionError(null);
      setIsRefreshingState(false);
      return;
    }

    if (cached) {
      setTotals(cached.value.totals);
      setVaultBalance(cached.value.vaultBalance);
    }

    setIsRefreshingState(true);
    setActionError(null);

    try {
      const [nextTotals, nextVaultBalance] = await Promise.all([
        getVaultTotals(wallet.address),
        getVaultTokenBalance(wallet.address),
      ]);

      setTotals(nextTotals);
      setVaultBalance(nextVaultBalance);
      writeCache(key, {
        totals: nextTotals,
        vaultBalance: nextVaultBalance,
      });
    } catch (error) {
      setActionError(
        error instanceof Error ? error.message : "Unable to read vault state.",
      );
    } finally {
      setIsRefreshingState(false);
    }
  }, [canInteract, wallet.address]);

  useEffect(() => {
    void refreshState();
  }, [refreshState, wallet.lastSyncedAt]);

  const deposit = useCallback(
    async (amount: string): Promise<ContractWriteResult> => {
      if (!wallet.address) {
        throw new Error("Connect a wallet before depositing.");
      }

      setIsDepositing(true);
      setActionError(null);
      try {
        const result = await depositToVault({
          from: wallet.address,
          amount,
        });

        invalidateCache(cacheKeys.tokenBalance(wallet.address));
        invalidateCache(cacheKeys.vaultState(wallet.address));
        await refreshState();
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Vault deposit failed.";
        setActionError(message);
        throw error;
      } finally {
        setIsDepositing(false);
      }
    },
    [refreshState, wallet.address],
  );

  const distribute = useCallback(
    async (recipient: string, amount: string): Promise<ContractWriteResult> => {
      if (!wallet.address) {
        throw new Error("Connect a wallet before distributing.");
      }

      setIsDistributing(true);
      setActionError(null);
      try {
        const result = await distributeFromVault({
          signerAddress: wallet.address,
          recipient,
          amount,
        });

        invalidateCache(cacheKeys.tokenBalance(wallet.address));
        invalidateCache(cacheKeys.vaultState(wallet.address));
        await refreshState();
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Vault distribute failed.";
        setActionError(message);
        throw error;
      } finally {
        setIsDistributing(false);
      }
    },
    [refreshState, wallet.address],
  );

  return useMemo(
    () => ({
      canInteract,
      isDepositing,
      isDistributing,
      actionError,
      totals,
      vaultBalance,
      isRefreshingState,
      refreshState,
      deposit,
      distribute,
    }),
    [
      actionError,
      canInteract,
      deposit,
      distribute,
      isDepositing,
      isDistributing,
      isRefreshingState,
      refreshState,
      totals,
      vaultBalance,
    ],
  );
}
