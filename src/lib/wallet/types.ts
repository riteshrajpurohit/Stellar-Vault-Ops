export type WalletConnectionState = "loading" | "disconnected" | "connected";

export type WalletErrorKind =
  | "not-installed"
  | "rejected"
  | "timeout"
  | "network-mismatch"
  | "wallet-error";

export interface WalletError {
  kind: WalletErrorKind;
  title: string;
  message: string;
  code?: number;
}

export interface WalletNetworkState {
  networkName: string;
  networkPassphrase: string;
  isTestnet: boolean;
}

export interface WalletSnapshot {
  state: WalletConnectionState;
  isInstalled: boolean;
  isConnected: boolean;
  address: string | null;
  network: WalletNetworkState | null;
  error: WalletError | null;
  lastSyncedAt: number | null;
  isLoading: boolean;
}

export interface WalletConnectionContextValue extends WalletSnapshot {
  connect: () => Promise<void>;
  disconnect: () => void;
  refresh: () => Promise<void>;
}
