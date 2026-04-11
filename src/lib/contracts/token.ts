import {
  Address,
  Contract,
  TransactionBuilder,
  nativeToScVal,
  rpc,
  scValToNative,
  xdr,
} from "@stellar/stellar-sdk";
import { signTransaction } from "@stellar/freighter-api";
import { STELLAR_TESTNET_NETWORK } from "@/lib/stellar/network";

const DEFAULT_RPC_URL = "https://soroban-testnet.stellar.org";
const DEFAULT_EXPLORER_TX_BASE_URL =
  "https://stellar.expert/explorer/testnet/tx";
const DEFAULT_TX_FEE = "100000";
const CONTRACT_LOG_PREFIX = "[StellarVaultOps]";

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

export interface StellarClientConfig {
  networkPassphrase: string;
  rpcUrl: string;
  explorerTxBaseUrl: string;
}

export type NetworkTransactionStatus =
  | "SUCCESS"
  | "FAILED"
  | "NOT_FOUND"
  | "PENDING";

export interface TokenContractConfig extends StellarClientConfig {
  contractId: string;
}

export interface ContractWriteResult {
  hash: string;
  explorerUrl: string;
}

export function getStellarClientConfig(): StellarClientConfig {
  const networkPassphrase =
    readEnvValue("VITE_STELLAR_NETWORK_PASSPHRASE", "NEXT_PUBLIC_NETWORK") ||
    STELLAR_TESTNET_NETWORK.networkPassphrase;
  const rpcUrl =
    readEnvValue("VITE_STELLAR_RPC_URL", "NEXT_PUBLIC_RPC_URL") ||
    DEFAULT_RPC_URL;
  const explorerTxBaseUrl =
    readEnvValue(
      "VITE_STELLAR_EXPLORER_TX_BASE_URL",
      "NEXT_PUBLIC_EXPLORER_TX_BASE_URL",
    ) || DEFAULT_EXPLORER_TX_BASE_URL;

  return {
    networkPassphrase,
    rpcUrl,
    explorerTxBaseUrl,
  };
}

export async function getTransactionStatus(
  hash: string,
  config?: StellarClientConfig,
): Promise<NetworkTransactionStatus> {
  const resolved = config || getStellarClientConfig();
  const server = new rpc.Server(resolved.rpcUrl);
  console.info(`${CONTRACT_LOG_PREFIX} tx.status.request`, { hash });
  const tx = await server.getTransaction(hash);
  const status = (tx as { status?: string }).status;
  console.info(`${CONTRACT_LOG_PREFIX} tx.status.response`, { hash, status });

  if (status === "SUCCESS" || status === "FAILED" || status === "NOT_FOUND") {
    return status;
  }

  return "PENDING";
}

export function getTokenContractConfig(): TokenContractConfig {
  const contractId = readEnvValue(
    "VITE_TOKEN_CONTRACT_ID",
    "NEXT_PUBLIC_TOKEN_CONTRACT_ID",
  );

  if (!contractId) {
    throw new Error(
      "Missing VITE_TOKEN_CONTRACT_ID. Set the deployed token contract ID in your frontend environment.",
    );
  }

  return {
    contractId,
    ...getStellarClientConfig(),
  };
}

export function hasTokenContractConfig() {
  return Boolean(
    readEnvValue("VITE_TOKEN_CONTRACT_ID", "NEXT_PUBLIC_TOKEN_CONTRACT_ID"),
  );
}

export function getExplorerTxUrl(hash: string, explorerTxBaseUrl: string) {
  return `${explorerTxBaseUrl}/${hash}`;
}

function toScAddress(address: string) {
  return new Address(address).toScVal();
}

function toI128ScVal(amount: bigint) {
  return nativeToScVal(amount, { type: "i128" });
}

function nativeToBigInt(value: unknown) {
  if (typeof value === "bigint") {
    return value;
  }

  if (typeof value === "number") {
    return BigInt(value);
  }

  if (typeof value === "string") {
    return BigInt(value);
  }

  throw new Error("Unexpected numeric value returned from contract.");
}

function extractSimulationError(simulation: unknown) {
  const maybe = simulation as {
    error?: string;
    result?: unknown;
    events?: unknown[];
  };

  if (maybe.error) {
    return maybe.error;
  }

  if (!maybe.result) {
    return "Simulation produced no result. Your wallet may have insufficient balance or permissions.";
  }

  return null;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function getTransactionStatusSafe(
  server: rpc.Server,
  hash: string,
): Promise<string | null> {
  try {
    const tx = await server.getTransaction(hash);
    return (tx as { status?: string }).status || null;
  } catch (error) {
    // If we get a parsing error, the tx is still pending
    const isParsingError =
      error instanceof Error &&
      (error.message.includes("Bad union switch") ||
        error.message.includes("XDR") ||
        error.message.includes("parse"));

    if (isParsingError) {
      return null; // Return null to indicate pending
    }

    throw error;
  }
}

async function waitForSuccess(
  server: rpc.Server,
  hash: string,
  timeoutMs = 60_000,
): Promise<void> {
  const startedAt = Date.now();
  let lastLoggedTime = startedAt;
  const pollInterval = 2000;

  while (Date.now() - startedAt < timeoutMs) {
    const status = await getTransactionStatusSafe(server, hash);

    // Log progress every 10 seconds
    if (Date.now() - lastLoggedTime > 10000) {
      console.info(`${CONTRACT_LOG_PREFIX} transaction.still_waiting`, {
        hash,
        status,
        elapsed: Date.now() - startedAt,
      });
      lastLoggedTime = Date.now();
    }

    if (status === "SUCCESS") {
      console.info(`${CONTRACT_LOG_PREFIX} transaction.confirmed`, {
        hash,
        status,
        elapsed: Date.now() - startedAt,
      });
      return;
    }

    if (status === "FAILED") {
      console.error(`${CONTRACT_LOG_PREFIX} transaction.failed_on_chain`, {
        hash,
        status,
      });
      throw new Error(
        "Transaction was rejected on-chain. Check the explorer for details.",
      );
    }

    // Status is PENDING or NOT_FOUND, continue polling
    await sleep(pollInterval);
  }

  throw new Error(
    `Transaction confirmation timed out after ${(timeoutMs / 1000).toFixed(0)}s. The transaction may still succeed on-chain.`,
  );
}

export async function invokeContractRead(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  walletAddress: string,
  config: StellarClientConfig,
) {
  const server = new rpc.Server(config.rpcUrl);
  console.info(`${CONTRACT_LOG_PREFIX} contract.read.request`, {
    contractId,
    method,
    walletAddress,
  });
  const source = await server.getAccount(walletAddress);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(source, {
    fee: DEFAULT_TX_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);
  const simulationError = extractSimulationError(simulation);
  if (simulationError) {
    console.error(`${CONTRACT_LOG_PREFIX} contract.read.simulation_error`, {
      contractId,
      method,
      simulationError,
    });
    throw new Error(simulationError);
  }

  const result = (simulation as { result?: { retval: xdr.ScVal } }).result;
  if (!result) {
    console.error(`${CONTRACT_LOG_PREFIX} contract.read.missing_result`, {
      contractId,
      method,
    });
    throw new Error("Missing simulation return value.");
  }

  const native = scValToNative(result.retval);
  console.info(`${CONTRACT_LOG_PREFIX} contract.read.response`, {
    contractId,
    method,
    native,
  });
  return native;
}

export async function invokeContractWrite(
  contractId: string,
  method: string,
  args: xdr.ScVal[],
  walletAddress: string,
  config: StellarClientConfig,
): Promise<ContractWriteResult> {
  const server = new rpc.Server(config.rpcUrl);
  console.info(`${CONTRACT_LOG_PREFIX} contract.write.request`, {
    contractId,
    method,
    walletAddress,
  });
  const source = await server.getAccount(walletAddress);
  const contract = new Contract(contractId);

  const tx = new TransactionBuilder(source, {
    fee: DEFAULT_TX_FEE,
    networkPassphrase: config.networkPassphrase,
  })
    .addOperation(contract.call(method, ...args))
    .setTimeout(30)
    .build();

  const simulation = await server.simulateTransaction(tx);
  const simulationError = extractSimulationError(simulation);
  if (simulationError) {
    console.error(`${CONTRACT_LOG_PREFIX} contract.write.simulation_error`, {
      contractId,
      method,
      simulationError,
    });
    throw new Error(simulationError);
  }

  console.info(`${CONTRACT_LOG_PREFIX} contract.write.simulation_ok`, {
    contractId,
    method,
  });

  const prepared = rpc.assembleTransaction(tx, simulation).build();

  console.info(`${CONTRACT_LOG_PREFIX} wallet.sign.request`, {
    contractId,
    method,
    walletAddress,
  });
  const signed = await signTransaction(prepared.toXDR(), {
    networkPassphrase: config.networkPassphrase,
    address: walletAddress,
  });

  if (signed.error || !signed.signedTxXdr) {
    console.error(`${CONTRACT_LOG_PREFIX} wallet.sign.error`, {
      contractId,
      method,
      error: signed.error?.message || "Wallet declined transaction.",
    });
    throw new Error(signed.error?.message || "Wallet declined transaction.");
  }

  console.info(`${CONTRACT_LOG_PREFIX} wallet.sign.response`, {
    contractId,
    method,
  });

  const signedTx = TransactionBuilder.fromXDR(
    signed.signedTxXdr,
    config.networkPassphrase,
  );

  console.info(`${CONTRACT_LOG_PREFIX} tx.send.request`, {
    contractId,
    method,
    walletAddress,
  });
  const sent = await server.sendTransaction(signedTx);
  const hash = (sent as { hash?: string }).hash;
  if (!hash) {
    console.error(`${CONTRACT_LOG_PREFIX} tx.send.error`, {
      contractId,
      method,
      response: sent,
    });
    throw new Error("No transaction hash returned by RPC server.");
  }

  console.info(`${CONTRACT_LOG_PREFIX} tx.send.response`, {
    contractId,
    method,
    hash,
  });

  await waitForSuccess(server, hash);

  console.info(`${CONTRACT_LOG_PREFIX} tx.confirmed`, {
    contractId,
    method,
    hash,
  });

  return {
    hash,
    explorerUrl: getExplorerTxUrl(hash, config.explorerTxBaseUrl),
  };
}

export async function getTokenBalance(
  walletAddress: string,
  config?: TokenContractConfig,
) {
  const resolved = config || getTokenContractConfig();
  const native = await invokeContractRead(
    resolved.contractId,
    "balance",
    [toScAddress(walletAddress)],
    walletAddress,
    resolved,
  );

  return nativeToBigInt(native);
}

export function toTokenAmount(amount: string) {
  const normalized = amount.trim();
  if (!normalized) {
    throw new Error("Amount is required.");
  }

  if (!/^\d+$/.test(normalized)) {
    throw new Error("Amount must be a positive integer.");
  }

  const value = BigInt(normalized);
  if (value <= 0n) {
    throw new Error("Amount must be greater than zero.");
  }

  return value;
}

export function tokenAmountToScVal(amount: bigint) {
  return toI128ScVal(amount);
}

export function addressToScVal(address: string) {
  return toScAddress(address);
}
