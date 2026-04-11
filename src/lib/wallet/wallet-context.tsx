import {
  createContext,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  connectWalletSnapshot,
  createDisconnectedSnapshot,
  createWalletWatcher,
  isFreighterInstalled,
  probeWalletSnapshot,
  type FreighterApiErrorLike,
} from "./freighter";
import type {
  WalletConnectionContextValue,
  WalletError,
  WalletSnapshot,
} from "./types";

const WalletConnectionContext = createContext<
  WalletConnectionContextValue | undefined
>(undefined);

function mapWalletError(
  error: FreighterApiErrorLike | null | undefined,
): WalletError | null {
  if (!error) {
    return null;
  }

  if (error.code === -4 || /reject/i.test(error.message)) {
    return {
      kind: "rejected",
      title: "Request rejected",
      message: "The request was rejected in Freighter.",
      code: error.code,
    };
  }

  return {
    kind: "wallet-error",
    title: "Wallet error",
    message: error.message,
    code: error.code,
  };
}

export function WalletConnectionProvider({
  children,
}: {
  children: ReactNode;
}) {
  const watcherRef = useRef<ReturnType<typeof createWalletWatcher> | null>(
    null,
  );
  const mountedRef = useRef(true);
  const [snapshot, setSnapshot] = useState<WalletSnapshot>(() =>
    createDisconnectedSnapshot(false),
  );

  const stopWatcher = useCallback(() => {
    watcherRef.current?.stop();
    watcherRef.current = null;
  }, []);

  const applyLiveSnapshot = useCallback((nextSnapshot: WalletSnapshot) => {
    if (!mountedRef.current) {
      return;
    }

    setSnapshot(nextSnapshot);
  }, []);

  const startWatcher = useCallback(() => {
    if (!isFreighterInstalled()) {
      return;
    }

    stopWatcher();
    const watcher = createWalletWatcher(4000);
    watcherRef.current = watcher;

    watcher.watch(({ address, network, networkPassphrase, error }) => {
      if (!mountedRef.current) {
        return;
      }

      if (error) {
        setSnapshot((current) => ({
          ...current,
          isLoading: false,
          error: mapWalletError(error),
        }));
        return;
      }

      if (!address) {
        setSnapshot(createDisconnectedSnapshot(true));
        return;
      }

      setSnapshot((current) => ({
        ...current,
        isLoading: false,
        isConnected: true,
        address,
        network: {
          networkName: network,
          networkPassphrase,
          isTestnet: networkPassphrase === "Test SDF Network ; September 2015",
        },
        error: null,
        state: "connected",
        isInstalled: true,
        lastSyncedAt: Date.now(),
      }));
    });
  }, [stopWatcher]);

  const refresh = useCallback(async () => {
    setSnapshot((current) => ({ ...current, isLoading: true }));
    const nextSnapshot = await probeWalletSnapshot();
    applyLiveSnapshot(nextSnapshot);

    if (nextSnapshot.isConnected) {
      startWatcher();
      return;
    }

    stopWatcher();
  }, [applyLiveSnapshot, startWatcher, stopWatcher]);

  const connect = useCallback(async () => {
    setSnapshot((current) => ({ ...current, isLoading: true, error: null }));
    const nextSnapshot = await connectWalletSnapshot();
    applyLiveSnapshot(nextSnapshot);

    if (nextSnapshot.isConnected) {
      startWatcher();
      return;
    }

    stopWatcher();
  }, [applyLiveSnapshot, startWatcher, stopWatcher]);

  const disconnect = useCallback(() => {
    stopWatcher();
    setSnapshot((current) => ({
      ...current,
      state: "disconnected",
      isLoading: false,
      isConnected: false,
      address: null,
      network: null,
      error: null,
      lastSyncedAt: Date.now(),
    }));
  }, [stopWatcher]);

  useEffect(() => {
    mountedRef.current = true;

    void refresh();

    return () => {
      mountedRef.current = false;
      stopWatcher();
    };
  }, [refresh, stopWatcher]);

  const value = useMemo<WalletConnectionContextValue>(
    () => ({
      ...snapshot,
      connect,
      disconnect,
      refresh,
    }),
    [connect, disconnect, refresh, snapshot],
  );

  return (
    <WalletConnectionContext.Provider value={value}>
      {children}
    </WalletConnectionContext.Provider>
  );
}

export { WalletConnectionContext };
