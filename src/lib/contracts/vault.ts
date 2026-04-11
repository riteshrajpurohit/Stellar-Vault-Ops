import { scValToNative } from "@stellar/stellar-sdk";
import {
  addressToScVal,
  getTokenContractConfig,
  invokeContractRead,
  invokeContractWrite,
  tokenAmountToScVal,
  toTokenAmount,
  type ContractWriteResult,
  type StellarClientConfig,
} from "@/lib/contracts/token.ts";

const DEFAULT_VAULT_CONTRACT_ID =
  "CB24WFEK4J2XFZL6VSNKTBTCZSQSBOGTCGJ7BFNA4QTG3RY3BHKPMBPL";

function readEnvValue(...keys: string[]) {
  const env = import.meta.env as ImportMetaEnv &
    Record<string, string | undefined>;

  for (const key of keys) {
    const value = env[key];
    if (typeof value === "string" && value.trim()) {
      return value.trim();
    }
  }

  return undefined;
}

export interface VaultContractConfig extends StellarClientConfig {
  contractId: string;
}

export interface VaultTotals {
  totalDeposited: bigint;
  totalDistributed: bigint;
}

export function getVaultContractConfig(): VaultContractConfig {
  const tokenConfig = getTokenContractConfig();
  const contractId =
    readEnvValue("VITE_VAULT_CONTRACT_ID", "NEXT_PUBLIC_VAULT_CONTRACT_ID") ||
    DEFAULT_VAULT_CONTRACT_ID;

  return {
    contractId,
    networkPassphrase: tokenConfig.networkPassphrase,
    rpcUrl: tokenConfig.rpcUrl,
    explorerTxBaseUrl: tokenConfig.explorerTxBaseUrl,
  };
}

function toBigInt(value: unknown) {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return BigInt(value);
  }

  if (typeof value === "string") {
    return BigInt(value);
  }

  throw new Error("Unexpected numeric contract value.");
}

export async function getVaultTotals(
  walletAddress: string,
  config?: VaultContractConfig,
): Promise<VaultTotals> {
  const resolved = config || getVaultContractConfig();
  const native = await invokeContractRead(
    resolved.contractId,
    "totals",
    [],
    walletAddress,
    resolved,
  );

  const parsed = native as {
    total_deposited?: unknown;
    total_distributed?: unknown;
  };

  return {
    totalDeposited: toBigInt(parsed.total_deposited ?? 0),
    totalDistributed: toBigInt(parsed.total_distributed ?? 0),
  };
}

export async function getVaultTokenBalance(
  walletAddress: string,
  config?: VaultContractConfig,
) {
  const resolved = config || getVaultContractConfig();
  const native = await invokeContractRead(
    resolved.contractId,
    "vault_token_balance",
    [],
    walletAddress,
    resolved,
  );

  return toBigInt(native);
}

export async function depositToVault(params: {
  from: string;
  amount: string;
  config?: VaultContractConfig;
}): Promise<ContractWriteResult> {
  const resolved = params.config || getVaultContractConfig();
  const parsedAmount = toTokenAmount(params.amount);

  return invokeContractWrite(
    resolved.contractId,
    "deposit",
    [addressToScVal(params.from), tokenAmountToScVal(parsedAmount)],
    params.from,
    resolved,
  );
}

export async function distributeFromVault(params: {
  signerAddress: string;
  recipient: string;
  amount: string;
  config?: VaultContractConfig;
}): Promise<ContractWriteResult> {
  const resolved = params.config || getVaultContractConfig();
  const parsedAmount = toTokenAmount(params.amount);

  return invokeContractWrite(
    resolved.contractId,
    "distribute",
    [addressToScVal(params.recipient), tokenAmountToScVal(parsedAmount)],
    params.signerAddress,
    resolved,
  );
}

export function hasVaultContractConfig() {
  return Boolean(
    readEnvValue("VITE_VAULT_CONTRACT_ID", "NEXT_PUBLIC_VAULT_CONTRACT_ID") ||
    DEFAULT_VAULT_CONTRACT_ID,
  );
}
