# Universal Academic Passport (Decentralized Credential Verification)

![Stellar Soroban](https://img.shields.io/badge/Stellar-Soroban%20Smart%20Contracts-00F2FE?style=for-the-badge&logo=stellar)
![Next.js](https://img.shields.io/badge/Next.js-15%20App%20Router-000000?style=for-the-badge&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?style=for-the-badge&logo=typescript)
![Rust](https://img.shields.io/badge/Rust-Soroban%20SDK%2022.0-000000?style=for-the-badge&logo=rust)
![Deployed](https://img.shields.io/badge/Contract-Live%20on%20Testnet-00C853?style=for-the-badge&logo=stellar)

A production-ready Web3 decentralized academic credential verification platform powered by **Stellar Soroban Smart Contracts (Rust)**, **Freighter Wallet**, and a startup-grade **Next.js** dark-mode interface. 

Academic institutions can issue non-transferable (soulbound) academic degrees directly onto the Stellar Testnet, empowering students with tamper-proof, globally verifiable digital passports.

---

## 🚀 Deployed Contract (Stellar Testnet)

| Field | Value |
|---|---|
| **Network** | Stellar Testnet (`Test SDF Network ; September 2015`) |
| **Contract ID** | `CDWPIQM53DMCFMC4E7CCX7TOXSKVVTWBXDCPKV3SLEPZP65TKAPXEYIE` |
| **Admin Address** | `GA4SSMJLD5DRYI46KGZWRIVVYRT4UX4S2HBVO5QOZG2UYHWMB42H4YG6` |
| **WASM Hash** | `b425e440567b3fe3c8f2cab06931ec77b94395482122b6d7510f052c38e56673` |
| **Deploy Tx** | [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/2bda28ca6c8be33fce04ab90feef808dd6b5375b0f9a4a7641cb5b85cbb7aa9f) |
| **Contract Explorer** | [View Contract](https://lab.stellar.org/r/testnet/contract/CDWPIQM53DMCFMC4E7CCX7TOXSKVVTWBXDCPKV3SLEPZP65TKAPXEYIE) |

---

## 🌟 Key Features

- 🎓 **Soulbound Non-Transferable Credentials**: Degrees are permanently tied to student Stellar G-addresses on-chain.
- ⚡ **Soroban Smart Contract**: Written in Rust using `soroban-sdk` for speed, deterministic storage, and low gas fees.
- 🔐 **Admin Access Control**: `initialize` and `issue_credential` enforce cryptographic signature authorization (`admin.require_auth()`).
- 💳 **Stellar Payments**: Built-in 0.1 XLM minimal fee structure per credential registration.
- 👛 **Freighter Wallet Integration**: Connect and sign transactions seamlessly via `@stellar/freighter-api`.
- 🔍 **Instant Public Verifier & QR Badges**: Any employer or institution can query student addresses or scan credential QR badges to verify authenticity in real time.

---

## 🛠️ Architecture & Tech Stack

```
+-----------------------------------------------------------------------+
|                           User / Browser                              |
|           (Freighter Wallet Extension & Next.js Frontend)              |
+-----------------------------------+-----------------------------------+
                                    |
                          Stellar SDK & RPC
                                    |
                                    v
+-----------------------------------------------------------------------+
|                    Stellar Soroban Testnet RPC                        |
|                                                                       |
|   +---------------------------------------------------------------+   |
|   |         AcademicPassportContract (Rust Wasm)                  |   |
|   |                                                               |   |
|   |  - initialize(admin)                                          |   |
|   |  - issue_credential(student, course_name, issue_date)         |   |
|   |  - verify_credential(student) -> Vec<String>                  |   |
|   +---------------------------------------------------------------+   |
+-----------------------------------------------------------------------+
```

### Technology Stack
- **Smart Contracts**: Rust, Soroban SDK v20.0, Wasm target (`wasm32-unknown-unknown`).
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS, Lucide React, Framer Motion.
- **Stellar Libraries**: `@stellar/stellar-sdk`, `@stellar/freighter-api`.
- **Network**: Stellar Soroban Testnet (`https://soroban-testnet.stellar.org`).

---

## 📂 Project Structure

```
universal-academic-passport/
├── contracts/                  # Rust Soroban Smart Contract Project
│   ├── Cargo.toml              # Dependencies & WASM optimization profile
│   └── src/
│       └── lib.rs              # Contract implementation & unit tests
│
├── frontend/                   # Next.js App Router Web Application
│   ├── package.json
│   ├── next.config.mjs
│   ├── tailwind.config.js
│   ├── tsconfig.json
│   └── src/
│       ├── app/
│       │   ├── globals.css     # Dark mode styling & glassmorphism system
│       │   ├── layout.tsx
│       │   └── page.tsx        # Main Web3 Dashboard (Passport, Admin & Verifier)
│       └── utils/
│           └── stellar.ts      # Freighter Wallet & Soroban RPC helpers
│
└── README.md                   # Comprehensive Documentation
```

---

## 🚀 Quickstart & Local Setup Guide

### Prerequisites
1. **Node.js**: `v18.x` or higher (`node -v`)
2. **Rust & Cargo**: (`rustc --version`)
3. **Soroban CLI**: `cargo install --locked soroban-cli`
4. **Wasm Target**: `rustup target add wasm32-unknown-unknown`
5. **Freighter Wallet Extension**: Installed in Chrome/Brave/Firefox (Get Freighter: https://www.freighter.app/)

---

### Step 1: Smart Contract Compilation & Testnet Deployment

1. Navigate to the contract directory:
   ```bash
   cd contracts
   ```

2. Run Rust unit tests:
   ```bash
   cargo test
   ```

3. Build the smart contract WASM binary:
   ```bash
   cargo build --target wasm32-unknown-unknown --release
   ```

4. Deploy to Stellar Soroban Testnet:
   ```bash
   # Generate an admin identity
   soroban config identity generate admin

   # Fund identity with Testnet XLM via Friendbot
   soroban config identity fund admin --network testnet

   # Deploy compiled Wasm contract
   stellar contract build
   ```

4. Deploy compiled Wasm contract:
   ```bash
   stellar contract deploy \
     --wasm target/wasm32v1-none/release/academic_passport_contract.wasm \
     --source admin \
     --network testnet
   ```
   *The project's live Contract ID is: `CDWPIQM53DMCFMC4E7CCX7TOXSKVVTWBXDCPKV3SLEPZP65TKAPXEYIE`*

5. Initialize contract with admin address:
   ```bash
   stellar contract invoke \
     --id CDWPIQM53DMCFMC4E7CCX7TOXSKVVTWBXDCPKV3SLEPZP65TKAPXEYIE \
     --source admin \
     --network testnet \
     -- \
     initialize \
     --admin GA4SSMJLD5DRYI46KGZWRIVVYRT4UX4S2HBVO5QOZG2UYHWMB42H4YG6
   ```

---

### Step 2: Frontend Setup & Running

1. Navigate to the frontend directory:
   ```bash
   cd ../frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variable (optional, default provided in `stellar.ts`):
   Create `.env.local`:
   ```env
   NEXT_PUBLIC_SOROBAN_CONTRACT_ID=CDWPIQM53DMCFMC4E7CCX7TOXSKVVTWBXDCPKV3SLEPZP65TKAPXEYIE
   NEXT_PUBLIC_STELLAR_NETWORK_PASSPHRASE="Test SDF Network ; September 2015"
   NEXT_PUBLIC_SOROBAN_RPC_URL="https://soroban-testnet.stellar.org"
   ```

4. Start the Next.js development server:
   ```bash
   npm run dev
   ```

5. Open http://localhost:3000 in your browser.

---

## 📑 Contract Function Reference

### `initialize(env: Env, admin: Address)`
- **Description**: Sets the university/admin address. Can only be called once.
- **Access**: Public initialization.

### `issue_credential(env: Env, student: Address, course_name: String, issue_date: String)`
- **Description**: Issues a non-transferable (soulbound) academic record to the specified student.
- **Access**: Admin only (`admin.require_auth()`).

### `verify_credential(env: Env, student: Address) -> Vec<String>`
- **Description**: Queries persistent storage and returns all credentials issued to the student.
- **Access**: Public view function.

---

## 📜 License

MIT License © 2026 Universal Academic Passport Team.