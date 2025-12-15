# 🏆 CupTrace – Coffee & Tea Supply Chain on Cardano

<div align="center">

![CupTrace Usage](https://via.placeholder.com/1200x600?text=CupTrace+Dashboard+Preview)

**Blockchain-powered traceability specific for Rwanda's premium coffee & tea sectors.**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Stack: Next.js](https://img.shields.io/badge/Stack-Next.js-black)](https://nextjs.org/)
[![Blockchain: Cardano](https://img.shields.io/badge/Blockchain-Cardano-blue)](https://cardano.org/)
[![Smart Contracts: Aiken](https://img.shields.io/badge/Contracts-Aiken-purple)](https://aiken-lang.org/)

</div>

---

## 📖 Overview

**CupTrace** solves the critical "trust gap" in African agricultural supply chains. By leveraging **Cardano's** eUTxO model and metadata capabilities, we provide an immutable history of every coffee batch—from the moment cherries are picked to the final export certificate.

### 🚨 The Problem
Rwanda produces some of the world's best coffee, but:
- **Farmers** often face delayed payments and lack credit history.
- **Buyers** cannot verify if the "Single Origin" label is authentic.
- **Data** is fragmented across paper receipts and siloed databases.

### ✅ The CupTrace Availability
A **Hybrid Traceability System** that combines the speed of Web2 with the trust of Web3:
1.  **Immutable History**: Harvests, processing, and QC results are recorded on-chain.
2.  **Fair Payments**: Smart contracts facilitate transparent payment records.
3.  **Digital Identity**: Each batch gets a unique **NFT (Non-Fungible Token)** acting as its digital passport.

---

## 🏗️ Architecture & Innovation

### Hybrid Traceability & "Lazy Minting"
One of CupTrace's key innovations is our **"Lazy Minting"** workflow, designed to minimize blockchain congestion and cost while maximizing UX:

1.  **Stage 1: Offline/Local**: Farmers and Station Agents collect data offline. It syncs to our PostgreSQL database immediately.
2.  **Stage 2: Virtual Batch**: As processing happens (Washing -> Drying -> Grading), "Virtual" transactions are recorded internally.
3.  **Stage 3: QC Approval**: When Quality Control approves a batch, a **"Shadow UTxO"** is created on-chain.
4.  **Stage 4: Final Minting**: Only upon **Final Export/Completion** is the comprehensive **Batch NFT** minted. This NFT contains the *entire* provenance history (IPFS hash of metadata + previous transaction hashes) in its metadata.

### Tech Stack

| Layer | Technology | Purpose |
|-------|------------|---------|
| **Frontend** | Next.js 14, Tailwind, Shadcn UI | Consumer App & Dashboards |
| **Backend** | Node.js, Express, Prisma | API, Business Logic, Caching |
| **Database** | PostgreSQL (Supabase) | Relational Data & User Mgmt |
| **Blockchain** | Cardano (Preprod) | Immutable Record Layer |
| **Contracts** | Aiken | Smart Contract Validators |
| **Storage** | IPFS (Pinata) | Decentralized Document Storage |

---

## 🔐 Smart Contracts (Aiken)

Our core logic resides in `contracts/`, utilizing the **Aiken** language for safety and expressiveness.

| Contract | Path | Function |
|----------|------|----------|
| **Batch NFT** | `policies/batch_nft.aiken` | Policies ensuring **only** authorized Factory wallets can mint a Batch NFT. Enforces uniqueness of Lot IDs. |
| **Traceability** | `validators/batch_traceability.aiken`| Holds the state of a batch on-chain. Ensures metadata updates (e.g., changing stage from *Drying* to *Milling*) preserve history. |
| **Stage Guard** | `validators/stage_transition.aiken` | Enforces the strict supply chain DAG (Farmers -> Station -> Factory -> Export). Prevents illegal jumps. |

---

## 🚀 Getting Started

Follow these steps to deploy CupTrace locally for testing or adjudication.

### Prerequisites
- Node.js 18+ & npm/yarn
- [Aiken](https://aiken-lang.org/installation-instructions) (for contract compilation)
- A Supabase Project (or local PostgreSQL)
- Blockfrost Project ID (Cardano Preprod)

### 1. Clone & Install
```bash
git clone https://github.com/aime-stack/cuptrace.git
cd cuptrace
```

### 2. Backend Setup
```bash
cd backend
npm install

# Environment Configuration
cp .env.example .env
```
**Required `.env` Variables:**
```env
PORT=4000
DATABASE_URL="postgresql://postgres:[PASSWORD]@db.supabase.co:5432/postgres"
JWT_SECRET="super-secret-key-change-me"

# Blockchain Configuration
CARDANO_NETWORK="preprod"
BLOCKFROST_API_KEY="preprod..."
WALLET_PRIVATE_KEY="ed25519_sk..." # Creating agent wallet key
```

**Run Database Migrations & Start:**
```bash
npx prisma generate
npx prisma migrate dev
npm run dev
```

### 3. Frontend Setup
```bash
cd ../frontend
npm install
npm run dev
```
Access the app at `http://localhost:3000`.

---

## 🧪 Hackathon Demo Workflow

To verify the simplified flow designed for the hackathon:

### Step 1: Agent & Harvest (Farmer Persona)
1.  Log in as **Station Agent** (email: `agent@cuptrace.com`, pw: `password123` - *if seeded*).
2.  Go to **"Register Harvest"**.
3.  Select a Farmer (e.g., "Jean Bosco") and enter harvest details (Weight: 50kg, Quality: Grade A).
4.  *Observation*: This saves to DB instantly. Status: `Pending Processing`.

### Step 2: Processing (Station Persona)
1.  Navigate a batch through the pipeline: `Washing` -> `Fermenting` -> `Drying`.
2.  Each step timestamps the batch.

### Step 3: Quality Control & "Virtual Mint"
1.  Log in as **QC Agent** (`qc@cuptrace.com`).
2.  Select a `Dried` batch and click **"Approve Quality"**.
3.  Enter Cupping Score (e.g., 86.5).
4.  *Action*: System generates an **IPFS Metadata** file and creates a **QC Approval UTxO** on Cardano Preprod.

### Step 4: Factory & Final Mint
1.  Log in as **Factory Manager**.
2.  Mark batch as `Export Ready`.
3.  **Check Output**: The system triggers `mintBatchNFT()`:
    -   Mints a CIP-68 compliant NFT.
    -   Mints a QR Code pointing to `cuptrace.com/verify/[batch-id]`.

### Step 5: Verification
-   Go to `http://localhost:3000/verify`.
-   Scan the generated QR code (or enter the Lot ID).
-   **Validation**: You will see a "Verified on Cardano" badge with a link to the Transaction Hash on [CardanoScan (Preprod)](https://preprod.cardanoscan.io/).

---

## 👥 Team (Rwanda)

Built with ❤️ by the CupTrace Team for the Cardano Community.

- **Aime P. Mwizerwa** - Lead Developer & Architect
- **Etienne TUYIHAMYE** - Smart Contract Engineer (Aiken)
- **Iragena D.** - Backend Specialist
- **Didier I.** - UI/UX Designer
- **Ireme Promesse** - Project Supervisor

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).
