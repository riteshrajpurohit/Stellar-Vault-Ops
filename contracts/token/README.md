# Stellar Vault Token

This directory contains a simple Soroban token contract for Stellar Testnet.

## Contract surface

- `initialize(admin, name, symbol, decimals)`
- `mint(to, amount)`
- `transfer(from, to, amount)`
- `balance(owner)`
- `metadata()`

## Build and test

```bash
cargo test -p stellar-vault-token
cargo build -p stellar-vault-token --target wasm32-unknown-unknown --release
```

## Deploy to Stellar Testnet

1. Install the Stellar CLI and set a funded testnet account as your source account.
2. Build the contract WASM:

```bash
cargo build -p stellar-vault-token --target wasm32-unknown-unknown --release
```

3. Deploy the contract to testnet with your CLI of choice, using the testnet network passphrase:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_vault_token.wasm \
  --source "$STELLAR_SOURCE_ACCOUNT" \
  --network testnet
```

4. Save the deployed contract ID into your frontend environment:

```bash
VITE_TOKEN_CONTRACT_ID=CC...YOUR_CONTRACT_ID...
```

## Frontend env variables

- `VITE_TOKEN_CONTRACT_ID`: deployed contract ID for the token contract.
- `VITE_STELLAR_NETWORK_PASSPHRASE`: should be `Test SDF Network ; September 2015` on testnet.
