import { useContext } from "react";
import { WalletConnectionContext } from "@/lib/wallet/wallet-context";

export function useWalletConnection() {
  const context = useContext(WalletConnectionContext);

  if (!context) {
    throw new Error(
      "useWalletConnection must be used within a WalletConnectionProvider.",
    );
  }

  return context;
}
