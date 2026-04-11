/// <reference types="vite/client" />

declare global {
  interface Window {
    freighter?: boolean;
    freighterApi?: Record<string, unknown>;
  }

  interface ImportMetaEnv {
    readonly VITE_TOKEN_CONTRACT_ID?: string;
    readonly VITE_VAULT_CONTRACT_ID?: string;
    readonly VITE_STELLAR_NETWORK_PASSPHRASE?: string;
    readonly VITE_STELLAR_RPC_URL?: string;
    readonly VITE_STELLAR_EXPLORER_TX_BASE_URL?: string;
  }

  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

export {};
