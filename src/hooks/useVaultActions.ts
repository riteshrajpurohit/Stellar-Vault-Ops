import { useCallback, useEffect, useMemo, useState } from "react";
import {
  depositToVault,
  distributeFromVault,
  getVaultTokenBalance,
  getVaultTotals,
  hasVaultContractConfig,
  type VaultTotals,
} from "@/lib/contracts/vault.ts";
import type { ContractWriteResult } from "@/lib/contracts/token.ts";
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
      console.info("[VaultState] Fetching totals and balance...");
      const [nextTotals, nextVaultBalance] = await Promise.all([
        getVaultTotals(wallet.address),
        getVaultTokenBalance(wallet.address),
      ]);

      console.info("[VaultState] Vault state fetched:", {
        totalDeposited: nextTotals.totalDeposited.toString(),
        totalDistributed: nextTotals.totalDistributed.toString(),
        vaultBalance: nextVaultBalance.toString(),
      });

      setTotals(nextTotals);
      setVaultBalance(nextVaultBalance);
      writeCache(key, {
        totals: nextTotals,
        vaultBalance: nextVaultBalance,
      });
    } catch (error) {
      const errorMsg =
        error instanceof Error ? error.message : "Unable to read vault state.";
      console.error("[VaultState] Failed to fetch vault state:", {
        error: errorMsg,
      });
      setActionError(errorMsg);
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
        console.info("[VaultDeposit] Starting deposit...", { amount });
        const result = await depositToVault({
          from: wallet.address,
          amount,
        });

        console.info("[VaultDeposit] Transaction confirmed", {
          hash: result.hash,
        });

        // Invalidate all cache entries
        invalidateCache(cacheKeys.tokenBalance(wallet.address));
        invalidateCache(cacheKeys.vaultState(wallet.address));

        // Wait a bit for ledger to settle
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.info("[VaultDeposit] Refreshing vault state...");
        await refreshState();

        console.info("[VaultDeposit] Deposit completed successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Vault deposit failed.";
        console.error("[VaultDeposit] Deposit failed:", {
          error: message,
        });
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
        console.info("[VaultDistribute] Starting distribute...", {
          recipient,
          amount,
        });
        const result = await distributeFromVault({
          signerAddress: wallet.address,
          recipient,
          amount,
        });

        console.info("[VaultDistribute] Transaction confirmed", {
          hash: result.hash,
        });

        invalidateCache(cacheKeys.tokenBalance(wallet.address));
        invalidateCache(cacheKeys.vaultState(wallet.address));

        // Wait a bit for ledger to settle
        await new Promise((resolve) => setTimeout(resolve, 2000));

        console.info("[VaultDistribute] Refreshing vault state...");
        await refreshState();

        console.info("[VaultDistribute] Distribute completed successfully");
        return result;
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "Vault distribute failed.";
        console.error("[VaultDistribute] Distribute failed:", {
          error: message,
        });
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
