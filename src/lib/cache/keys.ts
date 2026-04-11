export const cacheKeys = {
  tokenBalance: (address: string) => `token-balance:${address}`,
  vaultState: (address: string) => `vault-state:${address}`,
  activityFeed: "activity-feed",
};
