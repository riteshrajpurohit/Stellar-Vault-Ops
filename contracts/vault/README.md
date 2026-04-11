# Stellar Vault Contract

Soroban vault contract that performs real inter-contract calls to the token contract.

## Methods

- `initialize(admin, token_contract)`
- `deposit(from, amount)`
- `distribute(to, amount)`
- `totals()`
- `vault_token_balance()`
- `token_contract()`
- `admin()`

## Real inter-contract call flow

- `deposit` calls `token.transfer(from, vault_address, amount)`.
- `distribute` calls `token.transfer(vault_address, to, amount)`.

Both calls are executed against the configured token contract address.

## Build

```bash
cargo build -p stellar-vault-contract --target wasm32-unknown-unknown --release
```

## Testnet deployment

Set these environment variables before invocation/deployment:

```bash
export VAULT_ADMIN_ADDRESS=G...
export VAULT_TOKEN_CONTRACT_ID=CC...
```

Deploy:

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_vault_contract.wasm \
  --source "$STELLAR_SOURCE_ACCOUNT" \
  --network testnet
```

Initialize with real token contract ID:

```bash
stellar contract invoke \
  --id "$VAULT_CONTRACT_ID" \
  --source "$STELLAR_SOURCE_ACCOUNT" \
  --network testnet \
  -- initialize \
  --admin "$VAULT_ADMIN_ADDRESS" \
  --token_contract "$VAULT_TOKEN_CONTRACT_ID"
```
