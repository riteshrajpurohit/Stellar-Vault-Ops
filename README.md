# Stellar Vault Ops

Production-grade Stellar Web3 vault operations dashboard for real token movement, live transaction observability, and Soroban contract interaction.

## 1. Project Title + Tagline

**Stellar Vault Ops** is a modern Web3 SaaS-style operations console for managing token deposits, distributions, and on-chain activity on Stellar Testnet.

## 2. Demo Section

- 🔗 Live App: https://stellar-vault-ops.vercel.app/
- 🎥 Demo Video: https://drive.google.com/file/d/1FIvdIqFUE1G8afpmwJ6lSnVh_A_UgPHW/view?usp=sharing


## 3. Overview

Stellar Vault Ops is a full-stack Web3 application that combines a custom Soroban token contract, a vault contract, and a production-style React frontend. It solves a common operational problem in Web3 systems: executing token treasury actions safely while keeping transaction state visible and auditable in real time.

In the Stellar ecosystem, this is useful for teams that need a clean operator interface for contract writes (deposit/distribute), wallet approvals, and post-transaction status monitoring.

## 4. Features

- Multi-wallet connection architecture (Freighter integrated; wallet layer is extensible).
- Custom token contract (Soroban/Rust).
- Vault contract with inter-contract calls.
- Real-time activity feed with status updates.
- Transaction status tracking (submitting, submitted, success, failed).
- Mobile responsive UI optimized for touch interactions.
- CI/CD pipeline with lint, test, and build validation.
- Structured error handling system for wallet, simulation, and RPC failures.

## 5. Tech Stack

### Frontend

- Vite + React + TypeScript
- Tailwind CSS + shadcn/ui-style reusable UI primitives

### Blockchain

- Stellar Testnet
- Soroban smart contracts (Rust)

### Dev Tools

- Vitest
- GitHub Actions

## 6. Architecture Overview

- **Token Contract:** Manages token logic such as mint, transfer, and balance checks.
- **Vault Contract:** Manages treasury-like operations (deposit/distribute) and keeps aggregate totals.
- **Frontend:** Operator dashboard for wallet connection, form actions, activity monitoring, and transaction feedback.
- **Wallet Layer:** Freighter integration for account access and transaction signatures.
- **Event System:** Polling-based transaction/activity synchronization with local cache updates.

## 7. Smart Contracts

### Token Contract

Core responsibilities:

- **mint:** Create new token units (admin/contract controlled flow based on contract logic).
- **transfer:** Move tokens between addresses.
- **balance:** Query token balances for an account.

### Vault Contract

Core responsibilities:

- **deposit:** Move tokens from user wallet flow into vault-controlled accounting.
- **distribute:** Send tokens out from vault logic to recipient addresses.
- **inter-contract calls:** Uses token contract methods from inside vault methods.

**This contract performs inter-contract calls to the token contract.**

## 8. Deployed Contract Details

All contracts are deployed on **Stellar Testnet**.

- Token Contract Address: `CDH5G42NMW7LARIUBBCUUWLA6WJ2Q373QFPQ3YCGRB72JUAVRBIRDEJP`
- Vault Contract Address: `CB24WFEK4J2XFZL6VSNKTBTCZSQSBOGTCGJ7BFNA4QTG3RY3BHKPMBPL`
- Example Transaction Hash: `2834ad74a202aebaf3493f2b5a342db921ab9e902b3279fc4b278acad49c37db`

Current project defaults (testnet) used in this repository:

- Token Contract Address: `CDH5G42NMW7LARIUBBCUUWLA6WJ2Q373QFPQ3YCGRB72JUAVRBIRDEJP`
- Vault Contract Address: `CB24WFEK4J2XFZL6VSNKTBTCZSQSBOGTCGJ7BFNA4QTG3RY3BHKPMBPL`

## 9. Inter-Contract Call Explanation

The vault contract does not re-implement token logic. Instead, it calls the token contract directly when actions like `distribute` are executed. This means:

1. Vault enforces vault-specific business flow.
2. Token contract enforces token transfer semantics.
3. Contracts remain modular and reusable.

This is an important DeFi pattern because modular contracts are easier to upgrade, audit, and compose.

## 10. How to Run Locally

1. Clone the repository:

```bash
git clone <YOUR_REPO_URL>
cd Stellar-Vault-Ops
```

2. Install dependencies:

```bash
npm install
```

3. Setup environment variables:

```bash
cp .env.example .env
```

4. Start development server:

```bash
npm run dev
```

## 11. Env Variables

Use the following keys in `.env`:

```env
VITE_TOKEN_CONTRACT_ID=
VITE_VAULT_CONTRACT_ID=
VITE_RPC_URL=
VITE_STELLAR_RPC_URL=
VITE_STELLAR_NETWORK_PASSPHRASE=
VITE_STELLAR_EXPLORER_TX_BASE_URL=
```

Notes:

- `VITE_STELLAR_RPC_URL` is the active RPC variable used by the app.
- `VITE_RPC_URL` can be kept for compatibility/documentation if needed.

## 12. Wallet Setup

1. Install the Freighter browser extension.
2. Switch network to Stellar Testnet.
3. Create/import wallet and fund it via Stellar testnet friendbot.
4. Open app and click **Connect Wallet**.
5. Approve signature/access prompts for contract writes.

## 13. CI/CD Pipeline

GitHub Actions workflow runs on push and pull requests and validates:

- lint
- test
- build

### CI/CD Status
<img width="1470" height="834" alt="Screenshot 2026-04-12 at 4 28 41 AM" src="https://github.com/user-attachments/assets/7b54a7cb-0d4c-4fed-89f2-65a0002cf0bf" />


## 14. Testing

Run tests with:

```bash
npm run test
```

What is tested:

- Validation logic (amount parsing and guards).
- UI behavior (status badge rendering and state mapping).
- Transaction logic (tracker state transitions and activity writes).

## 15. Mobile Responsiveness

The UI follows a mobile-first responsive approach:

- compact card layout on small screens
- full-width action controls for touch usability
- adaptive typography and spacing across breakpoints

## 16. Screenshots

### Dashboard: 
<img width="1470" height="834" alt="Screenshot 2026-04-12 at 4 14 28 AM" src="https://github.com/user-attachments/assets/0208e560-4050-4856-aff5-eabb06fa686e" />

### Wallet Connected:
<img width="1470" height="834" alt="Screenshot 2026-04-12 at 4 14 55 AM" src="https://github.com/user-attachments/assets/2b42cc2e-a2ad-4250-acd3-b8dbbfecb775" />

### Mobile View:
<img width="314" height="677" alt="Screenshot 2026-04-12 at 4 38 25 AM" src="https://github.com/user-attachments/assets/c1d2cbc2-0989-4ca2-b034-5c27c1ee6fdf" />

<img width="307" height="671" alt="Screenshot 2026-04-12 at 4 38 53 AM" src="https://github.com/user-attachments/assets/e6555702-3757-43bc-b02a-65ea621cc4c4" />



### Transaction Success:
<img width="1470" height="834" alt="Screenshot 2026-04-12 at 4 19 20 AM" src="https://github.com/user-attachments/assets/c2785894-f0a3-4f05-a304-66fc9c164b10" />

<img width="1470" height="834" alt="Screenshot 2026-04-12 at 4 20 10 AM" src="https://github.com/user-attachments/assets/81cfc500-2228-4543-aa6d-7e294d826075" />

<img width="1470" height="834" alt="Screenshot 2026-04-12 at 4 20 18 AM" src="https://github.com/user-attachments/assets/dfda6fe4-a316-450f-8783-b628ef49ad60" />

### CI/CD Pipeline: 
<img width="1470" height="834" alt="Screenshot 2026-04-12 at 4 28 41 AM" src="https://github.com/user-attachments/assets/9abb268d-4766-4760-aa6b-809a2eb092f5" />

## 17. Project Structure

```text
.
├── src/
│   ├── components/      # UI components and layout
│   ├── hooks/           # stateful logic (wallet, vault, activity)
│   ├── lib/             # contracts, cache, wallet, network utilities
│   ├── pages/           # route-level views
│   └── styles/          # global styling
├── contracts/
│   ├── token/           # Soroban token contract (Rust)
│   └── vault/           # Soroban vault contract (Rust)
├── tests/               # Vitest test suite
└── .github/workflows/   # CI workflows
```

## 18. Commit History

This project was built using multiple focused, meaningful commits covering:

- smart contract updates
- frontend feature work
- transaction reliability improvements
- mobile responsiveness improvements
- CI/CD and deployment fixes

Repository history includes **8+ meaningful commits**, suitable for submission review.

## 19. Known Limitations

- Current deployment target is Stellar Testnet only.
- Activity updates use polling, not websocket streaming.
- Freighter is the only wallet currently integrated in production UI.
- Large bundle warning exists and can be optimized with additional code splitting.

## 20. Future Improvements

- Websocket/event-stream based activity updates.
- Multi-token vault support.
- Role-based admin/operator dashboards.
- Analytics and treasury KPI panels.
- Further bundle splitting and performance optimization.

## 21. Submission Checklist

- ✔ Custom token deployed
- ✔ Vault contract with inter-contract calls
- ✔ CI/CD pipeline working
- ✔ Mobile responsive UI
- ✔ Transaction hash available
- ✔ Contract addresses included
- ✔ 8+ meaningful commits
- ✔ Live demo link
- ✔ README complete

## 22. License

MIT License

See `LICENSE` for full text.
