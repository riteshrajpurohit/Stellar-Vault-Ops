export const STELLAR_TESTNET_NETWORK = {
  label: "Stellar Testnet",
  network: "testnet",
  networkPassphrase: "Test SDF Network ; September 2015",
};

export function isStellarTestnetNetwork(
  networkPassphrase: string | null | undefined,
) {
  return networkPassphrase === STELLAR_TESTNET_NETWORK.networkPassphrase;
}

export function getNetworkLabel(
  networkName: string | null | undefined,
  networkPassphrase: string | null | undefined,
) {
  if (isStellarTestnetNetwork(networkPassphrase)) {
    return STELLAR_TESTNET_NETWORK.label;
  }

  return networkName?.trim() || "Unknown network";
}
