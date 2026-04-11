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
  return {
    networkPassphrase:
      import.meta.env.VITE_STELLAR_NETWORK_PASSPHRASE?.trim() ||
      STELLAR_TESTNET_NETWORK.networkPassphrase,
    rpcUrl: import.meta.env.VITE_STELLAR_RPC_URL?.trim() || DEFAULT_RPC_URL,
    explorerTxBaseUrl:
      import.meta.env.VITE_STELLAR_EXPLORER_TX_BASE_URL?.trim() ||
      DEFAULT_EXPLORER_TX_BASE_URL,
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
  const contractId = import.meta.env.VITE_TOKEN_CONTRACT_ID?.trim();

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
  return Boolean(import.meta.env.VITE_TOKEN_CONTRACT_ID?.trim());
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
  };

  if (maybe.error) {
    return maybe.error;
  }

  if (!maybe.result) {
    return "Simulation produced no result.";
  }

  return null;
}

async function sleep(ms: number) {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

async function waitForSuccess(
  server: rpc.Server,
  hash: string,
  timeoutMs = 60_000,
): Promise<void> {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const tx = await server.getTransaction(hash);
    const status = (tx as { status?: string }).status;

    if (status === "SUCCESS") {
      return;
    }

    if (status === "FAILED") {
      throw new Error("Transaction failed on-chain.");
    }

    await sleep(1200);
  }

  throw new Error("Timed out waiting for transaction confirmation.");
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
