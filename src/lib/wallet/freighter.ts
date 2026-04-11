import {
  getAddress,
  getNetworkDetails,
  isConnected,
  requestAccess,
  WatchWalletChanges,
} from "@stellar/freighter-api";
import {
  STELLAR_TESTNET_NETWORK,
  getNetworkLabel,
  isStellarTestnetNetwork,
} from "@/lib/stellar/network";
import { shortenAddress } from "./format";
import type { WalletError, WalletNetworkState, WalletSnapshot } from "./types";

const WALLET_LOG_PREFIX = "[StellarVaultOps]";

export interface FreighterApiErrorLike {
  code: number;
  message: string;
  ext?: string[];
}

export function isFreighterInstalled() {
  if (typeof window === "undefined") {
    return false;
  }

  return (
    typeof window.freighter !== "undefined" ||
    typeof window.freighterApi !== "undefined"
  );
}

function hasFreighterRuntime() {
  if (typeof window === "undefined") {
    return false;
  }

  return typeof window.freighterApi !== "undefined";
}

function createWalletError(
  kind: WalletError["kind"],
  title: string,
  message: string,
  code?: number,
): WalletError {
  return { kind, title, message, code };
}

function mapApiError(
  error: FreighterApiErrorLike | undefined,
  fallbackTitle: string,
): WalletError {
  if (!error) {
    return createWalletError(
      "wallet-error",
      fallbackTitle,
      "Freighter returned an unexpected response.",
    );
  }

  if (error.code === -4 || /reject/i.test(error.message)) {
    return createWalletError(
      "rejected",
      "Request rejected",
      "The request was rejected in Freighter.",
      error.code,
    );
  }

  return createWalletError(
    "wallet-error",
    fallbackTitle,
    error.message || "Freighter returned an unexpected error.",
    error.code,
  );
}

function mapUnknownError(error: unknown, fallbackTitle: string): WalletError {
  if (
    typeof error === "object" &&
    error !== null &&
    "kind" in error &&
    (error as { kind?: string }).kind === "timeout"
  ) {
    return createWalletError(
      "timeout",
      "Wallet timeout",
      (error as { message?: string }).message ||
        "The wallet request timed out.",
    );
  }

  if (error instanceof Error) {
    return createWalletError("wallet-error", fallbackTitle, error.message);
  }

  return createWalletError(
    "wallet-error",
    fallbackTitle,
    "An unknown wallet error occurred.",
  );
}

async function withTimeout<T>(
  promise: Promise<T>,
  timeoutLabel: string,
  timeoutMs = 12000,
): Promise<T> {
  let timeoutId: ReturnType<typeof setTimeout> | undefined;

  const timeoutPromise = new Promise<never>((_, reject) => {
    timeoutId = setTimeout(() => {
      reject({
        kind: "timeout" as const,
        message: `${timeoutLabel} timed out. Check that Freighter is open and responsive.`,
      });
    }, timeoutMs);
  });

  try {
    return (await Promise.race([promise, timeoutPromise])) as T;
  } finally {
    if (timeoutId) {
      clearTimeout(timeoutId);
    }
  }
}

function toNetworkState(
  networkName: string,
  networkPassphrase: string,
): WalletNetworkState {
  return {
    networkName,
    networkPassphrase,
    isTestnet: isStellarTestnetNetwork(networkPassphrase),
  };
}

function toSnapshot(params: {
  state: WalletSnapshot["state"];
  isInstalled: boolean;
  isConnected: boolean;
  address: string | null;
  network: WalletNetworkState | null;
  error: WalletError | null;
  isLoading?: boolean;
}): WalletSnapshot {
  return {
    ...params,
    isLoading: params.isLoading ?? false,
    lastSyncedAt: Date.now(),
  };
}

export function createDisconnectedSnapshot(
  isInstalled: boolean,
  error: WalletError | null = null,
  isLoading = false,
): WalletSnapshot {
  return toSnapshot({
    state: "disconnected",
    isInstalled,
    isConnected: false,
    address: null,
    network: null,
    error,
    isLoading,
  });
}

export function createNotInstalledSnapshot(): WalletSnapshot {
  return createDisconnectedSnapshot(
    false,
    createWalletError(
      "not-installed",
      "Freighter not installed",
      "Install the Freighter browser extension to connect a Stellar wallet.",
    ),
  );
}

export function formatWalletAddress(address: string | null | undefined) {
  return address ? shortenAddress(address) : "Not connected";
}

export function formatWalletNetwork(
  network: WalletNetworkState | null | undefined,
) {
  if (!network) {
    return STELLAR_TESTNET_NETWORK.label;
  }

  return getNetworkLabel(network.networkName, network.networkPassphrase);
}

export async function probeWalletSnapshot(): Promise<WalletSnapshot> {
  if (typeof window === "undefined") {
    return createNotInstalledSnapshot();
  }

  try {
    console.info(`${WALLET_LOG_PREFIX} wallet.probe.request`);
    const connection = await withTimeout(
      isConnected(),
      "Checking Freighter connection",
      5000,
    );
    console.info(`${WALLET_LOG_PREFIX} wallet.probe.connection_response`, {
      isConnected: (connection as { isConnected?: boolean }).isConnected,
      error: (connection as { error?: FreighterApiErrorLike }).error,
    });

    if ((connection as { error?: FreighterApiErrorLike }).error) {
      return createDisconnectedSnapshot(
        hasFreighterRuntime(),
        mapApiError(
          (connection as { error?: FreighterApiErrorLike }).error,
          "Unable to check Freighter connection.",
        ),
      );
    }

    if (!(connection as { isConnected: boolean }).isConnected) {
      return createDisconnectedSnapshot(hasFreighterRuntime());
    }

    const addressResult = await withTimeout(
      getAddress(),
      "Fetching public address",
    );
    console.info(`${WALLET_LOG_PREFIX} wallet.probe.address_response`, {
      address: addressResult.address,
      error: addressResult.error,
    });
    if (addressResult.error) {
      return toSnapshot({
        state: "connected",
        isInstalled: true,
        isConnected: true,
        address: null,
        network: null,
        error: mapApiError(
          addressResult.error,
          "Unable to fetch the Freighter public address.",
        ),
      });
    }

    const networkResult = await withTimeout(
      getNetworkDetails(),
      "Fetching Freighter network details",
    );
    console.info(`${WALLET_LOG_PREFIX} wallet.probe.network_response`, {
      network: networkResult.network,
      networkPassphrase: networkResult.networkPassphrase,
      error: networkResult.error,
    });
    if (networkResult.error) {
      return toSnapshot({
        state: "connected",
        isInstalled: true,
        isConnected: true,
        address: addressResult.address,
        network: null,
        error: mapApiError(
          networkResult.error,
          "Unable to fetch the Freighter network details.",
        ),
      });
    }

    const network = toNetworkState(
      networkResult.network,
      networkResult.networkPassphrase,
    );

    if (!network.isTestnet) {
      return toSnapshot({
        state: "connected",
        isInstalled: true,
        isConnected: true,
        address: addressResult.address,
        network,
        error: createWalletError(
          "network-mismatch",
          "Switch to Stellar Testnet",
          "Freighter is connected, but the active network is not Stellar Testnet.",
        ),
      });
    }

    return toSnapshot({
      state: "connected",
      isInstalled: true,
      isConnected: true,
      address: addressResult.address,
      network,
      error: null,
    });
  } catch (error) {
    console.error(`${WALLET_LOG_PREFIX} wallet.probe.error`, error);
    return createDisconnectedSnapshot(
      true,
      mapUnknownError(error, "Unable to synchronize Freighter."),
    );
  }
}

export async function connectWalletSnapshot(): Promise<WalletSnapshot> {
  try {
    console.info(`${WALLET_LOG_PREFIX} wallet.connect.request`);
    const access = await withTimeout(
      requestAccess(),
      "Requesting Freighter access",
      15000,
    );
    console.info(`${WALLET_LOG_PREFIX} wallet.connect.access_response`, {
      address: access.address,
      error: access.error,
    });

    if (access.error) {
      return createDisconnectedSnapshot(
        hasFreighterRuntime(),
        mapApiError(access.error, "Freighter access request failed."),
      );
    }

    let address = access.address;
    if (!address) {
      const addressResult = await withTimeout(
        getAddress(),
        "Fetching Freighter public address",
      );
      console.info(`${WALLET_LOG_PREFIX} wallet.connect.address_response`, {
        address: addressResult.address,
        error: addressResult.error,
      });
      if (addressResult.error) {
        return createDisconnectedSnapshot(
          true,
          mapApiError(
            addressResult.error,
            "Unable to fetch the Freighter public address.",
          ),
        );
      }

      address = addressResult.address;
    }

    const networkResult = await withTimeout(
      getNetworkDetails(),
      "Fetching Freighter network details",
    );
    console.info(`${WALLET_LOG_PREFIX} wallet.connect.network_response`, {
      network: networkResult.network,
      networkPassphrase: networkResult.networkPassphrase,
      error: networkResult.error,
    });
    if (networkResult.error) {
      return toSnapshot({
        state: "connected",
        isInstalled: true,
        isConnected: true,
        address,
        network: null,
        error: mapApiError(
          networkResult.error,
          "Unable to fetch the Freighter network details.",
        ),
      });
    }

    const network = toNetworkState(
      networkResult.network,
      networkResult.networkPassphrase,
    );

    if (!network.isTestnet) {
      return toSnapshot({
        state: "connected",
        isInstalled: true,
        isConnected: true,
        address,
        network,
        error: createWalletError(
          "network-mismatch",
          "Switch to Stellar Testnet",
          "Freighter is connected, but the active network is not Stellar Testnet.",
        ),
      });
    }

    return toSnapshot({
      state: "connected",
      isInstalled: true,
      isConnected: true,
      address,
      network,
      error: null,
    });
  } catch (error) {
    console.error(`${WALLET_LOG_PREFIX} wallet.connect.error`, error);
    return createDisconnectedSnapshot(
      true,
      mapUnknownError(error, "Unable to connect Freighter."),
    );
  }
}

export function createWalletWatcher(timeout = 3000) {
  return new WatchWalletChanges(timeout);
}

export function getConnectionTitle(snapshot: WalletSnapshot) {
  if (!snapshot.isInstalled) {
    return "Freighter not installed";
  }

  if (snapshot.isLoading) {
    return "Connecting...";
  }

  if (snapshot.isConnected) {
    return "Wallet connected";
  }

  if (snapshot.error?.kind === "timeout") {
    return "Wallet timeout";
  }

  return "Wallet disconnected";
}
