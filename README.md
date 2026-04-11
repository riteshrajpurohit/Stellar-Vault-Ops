# Stellar Vault Ops

Stellar Vault Ops is a production-style Stellar Testnet dashboard built with Vite, React, and TypeScript.

It includes:

- real Freighter wallet connection and signing
- real Soroban token and vault contract integration
- real transaction submission and status tracking
- live activity feed and lightweight cache invalidation
- premium responsive SaaS UI

## CI/CD

GitHub Actions workflow is defined in `.github/workflows/ci.yml` and runs on every push and pull request.

Pipeline steps:

1. install dependencies (`npm ci`)
2. lint (`npm run lint`)
3. test (`npm run test`)
4. build (`npm run build`)

### CI badge section

Add this badge after your repository is published:

```md
![CI](https://github.com/<OWNER>/<REPO>/actions/workflows/ci.yml/badge.svg)
```

## Live Demo

- Add your deployed URL here once published (for example Vercel or Netlify).

## Architecture

Frontend:

- Vite + React + TypeScript
- Tailwind CSS + reusable UI primitives
- Framer Motion for subtle animation
- Freighter wallet API (`@stellar/freighter-api`)
- Stellar SDK (`@stellar/stellar-sdk`) for Soroban RPC and transaction lifecycle

Contracts:

- `contracts/token`: custom Soroban token contract
- `contracts/vault`: vault contract with real inter-contract token transfers

Data flow:

1. wallet connects through Freighter
2. frontend reads/writes token and vault contract methods via Soroban RPC
3. write operations return tx hash and are tracked until final status
4. feed and cache are updated deterministically after status transitions

## Project Structure

```text
.
|- src/
|  |- components/
|  |- hooks/
|  |- lib/
|- contracts/
|  |- token/
|  |- vault/
|- tests/
|- .github/workflows/ci.yml
```

## Local Setup

### 1. Prerequisites

- Node.js 20+
- npm 10+
- Freighter browser extension
- funded Stellar Testnet account

### 2. Install dependencies

```bash
npm ci
```

### 3. Configure environment

Copy `.env.example` into `.env` and fill contract IDs:

```bash
cp .env.example .env
```

Required variables:

- `VITE_TOKEN_CONTRACT_ID`
- `VITE_VAULT_CONTRACT_ID`
- `VITE_STELLAR_NETWORK_PASSPHRASE` (default testnet)
- `VITE_STELLAR_RPC_URL` (default testnet RPC)
- `VITE_STELLAR_EXPLORER_TX_BASE_URL` (default stellar.expert testnet tx base)

### 4. Run the app

```bash
npm run dev
```

### 5. Production build

```bash
npm run build
npm run preview
```

## Wallet Setup (Freighter)

1. Install Freighter.
2. Switch Freighter to Stellar Testnet.
3. Import or create a funded testnet account.
4. Open app and click connect.
5. Approve permission/signing prompts.

## Contracts

### Token contract

Contract path: `contracts/token`.

Build and test:

```bash
cargo test -p stellar-vault-token
cargo build -p stellar-vault-token --target wasm32-unknown-unknown --release
```

Deploy (testnet):

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_vault_token.wasm \
  --source "$STELLAR_SOURCE_ACCOUNT" \
  --network testnet
```

Set `VITE_TOKEN_CONTRACT_ID` with the deployed ID.

### Vault contract

Contract path: `contracts/vault`.

Build:

```bash
cargo build -p stellar-vault-contract --target wasm32-unknown-unknown --release
```

Deploy (testnet):

```bash
stellar contract deploy \
  --wasm target/wasm32-unknown-unknown/release/stellar_vault_contract.wasm \
  --source "$STELLAR_SOURCE_ACCOUNT" \
  --network testnet
```

Initialize with token contract ID:

```bash
stellar contract invoke \
  --id "$VAULT_CONTRACT_ID" \
  --source "$STELLAR_SOURCE_ACCOUNT" \
  --network testnet \
  -- initialize \
  --admin "$VAULT_ADMIN_ADDRESS" \
  --token_contract "$VAULT_TOKEN_CONTRACT_ID"
```

Set `VITE_VAULT_CONTRACT_ID` with the deployed ID.

## Contract Addresses

Keep contract addresses in `.env` only.

- `VITE_TOKEN_CONTRACT_ID`: token contract on selected network
- `VITE_VAULT_CONTRACT_ID`: vault contract on selected network

For multiple environments, maintain separate env files such as `.env.testnet` and `.env.production`.

## Transaction Hash and Explorer Handling

Write calls produce transaction hashes that are:

1. shown in the transaction panel
2. linked to explorer using `VITE_STELLAR_EXPLORER_TX_BASE_URL`
3. tracked through pending/success/error phases in local state

This keeps operational status observable in real time.

## Testing

Run all tests:

```bash
npm run test
```

Watch mode:

```bash
npm run test:watch
```

Current deterministic test coverage includes:

1. validation helper tests for amount parsing and guards (`toTokenAmount`)
2. wallet/transaction utility lifecycle tests (`useTransactionTracker`)
3. UI component rendering tests (`StatusBadge`)

## Linting

```bash
npm run lint
```

## Screenshots

Add product screenshots under a folder such as `docs/screenshots` and reference them here.

Suggested captures:

1. connected wallet dashboard
2. vault deposit/distribute panel
3. transaction status panel with explorer link
4. mobile responsive layout

## Mobile Responsiveness

The dashboard layout, cards, and action controls are optimized for desktop and mobile breakpoints. Primary action buttons expand full width on small screens for easier touch interaction.

## Notes

- Contract interaction requires valid deployed Soroban contracts.
- Rust contract compilation requires local Rust toolchain and target `wasm32-unknown-unknown`.
