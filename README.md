# 🏆 CupTrace – Coffee & Tea Supply Chain on Cardano

**CupTrace** is a blockchain-powered traceability platform designed for Rwanda’s coffee and tea sectors. It revolutionizes the supply chain by providing end-to-end transparency, ensuring fair payments for farmers, and enabling premium market access through verifiable product history.

![CupTrace Dashboard Preview](https://via.placeholder.com/800x400?text=CupTrace+Dashboard+Preview)

## 🚨 Problem vs. Solution

| The Problem | The CupTrace Solution |
|-------------|----------------------|
| **Opaque Supply Chain**: Buyers cannot verify origin or quality. | **Immutable Traceability**: Every step from harvest to export is recorded on Cardano. |
| **Unfair Payments**: Farmers are often underpaid and delayed. | **Transparent Payments**: Smart contract-based records ensure fair and timely compensation. |
| **Data Silos**: Cooperatives, factories, and NAEB use disconnected systems. | **Unified Platform**: A single source of truth for all stakeholders. |
| **Counterfeiting**: Premium Rwandan coffee is often mixed with lower quality beans. | **Digital Identity**: Unique Lot IDs and QR codes prove authenticity. |

---

## 🏗️ System Architecture

CupTrace is built on a modern, scalable stack:

### **Frontend** (Consumer & Dashboard)
- **Framework**: [Next.js 14](https://nextjs.org/) (App Router)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) + [Shadcn UI](https://ui.shadcn.com/)
- **State Management**: React Query (TanStack Query)
- **Features**: 
    - ⚡ **Instant Loading**: Optimized with intelligent caching.
    - 🌙 **Dark Mode**: Fully accessible UI.
    - 📊 **Real-time Analytics**: Performance-optimized charts for farmers and agents.

### **Backend** (API & Logic)
- **Runtime**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) (via [Supabase](https://supabase.com/))
- **ORM**: [Prisma](https://www.prisma.io/) (with connection pooling)
- **Security**: JWT Authentication, Role-Based Access Control (RBAC)

### **Blockchain** (The Trust Layer)
- **Network**: Cardano (Preprod Testnet)
- **Smart Contracts**: [Aiken](https://aiken-lang.org/)
- **Integration**: [Lucid](https://lucid.spacebudz.io/) + [Blockfrost](https://blockfrost.io/)
- **Storage**: IPFS (Pinata) for immutable document storage.

## 🔗 Smart Contract Access

The core logic for CupTrace resides in the `contracts/` directory, written in **Aiken**. These contracts enforce:
1.  **NFT Policy** (`policies/batch_nft.aiken`): Ensures each batch has a unique, non-fungible digital twin.
2.  **Traceability Validator** (`validators/batch_traceability.aiken`): Validates that a batch exists and holds correct metadata.
3.  **Stage Transition Validator** (`validators/stage_transition.aiken`): Enforces the supply chain rules (e.g., *Farmer* -> *Washing Station* -> *Factory*).

### Interacting with Contracts
We use **Lucid** (an off-chain transaction builder) to interact with these contracts from the Backend API.
- **Source Code**: [`/contracts`](contracts/README.md)
- **Interaction Logic**: [`backend/src/services/blockchain.service.ts`](backend/src/services/blockchain.service.ts)
- **Testnet Deployment**: Addresses are configured in `backend/.env` under `BATCH_CONTRACT_ADDRESS` and `STAGE_CONTRACT_ADDRESS`.

---

## ⚡ Key Features

### 1. **Multi-Role Dashboards**
Tailored interfaces for every participant in the value chain:
- 👨‍🌾 **Farmers**: View deliveries, payments, and batch status.
- 📝 **Station Agents**: Register harvests, manage daily processing.
- 🏭 **Factory Managers**: Oversee processing, milling, and grading.
- 🔬 **Quality Control (QC)**: Record lab results and cupping scores.
- 📦 **Exporters**: Manage shipping, certificates, and buyers.
- 🏛️ **NAEB (Regulator)**: System-wide oversight and reporting.

### 2. **Advanced Traceability**
- **Batch Tracking**: Follow coffee/tea from "Cherry" to "Export Ready".
- **QR Verification**: Consumers scan codes to see the full journey, farmer stories, and quality metrics.
- **Geo-Tagging**: GPS coordinates for every washing station and farm.

### 3. **Performance Optimized**
- **Smart Caching**: Sub-second page loads for frequent data.
- **Aggregated Stats**: database-optimized widgets for instant dashboard reporting.

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- A Supabase project (PostgreSQL)
- Blockfrost API Key (Cardano Preprod)

### 1. Clone the Repository
```bash
git clone https://github.com/aime-stack/cuptrace.git
cd cuptrace
```

### 2. Backend Setup
```bash
cd backend
npm install

# Copy environment variables
cp .env.example .env

# Generate Prisma Client
npx prisma generate

# Run Development Server
npm run dev
```

### 3. Frontend Setup
```bash
cd frontend
npm install

# Run Development Server
npm run dev
```

The app will be available at `http://localhost:3000`.

---

## 🌿 Supply Chain Workflow

### **Coffee Journey**
1.  **Harvest**: Farmer picks cherries.
2.  **Collection**: Agent weighs and registers batch at Washing Station.
3.  **Processing**: Cherries are pulped, fermented, and washed.
4.  **Drying**: Beans are dried on raised beds.
5.  **Milling**: Dry parchment is hulled and graded.
6.  **Export**: Green coffee is bagged and shipped.

### **Tea Journey**
1.  **Plucking**: Two leaves and a bud.
2.  **Factory Intake**: Weighing and quality check.
3.  **Processing**: Withering > Rolling > Oxidation > Drying.
4.  **Grading**: Sorting into grades (BP1, PF1, etc.).
5.  **Auction/Export**: Direct sale or Mombasa auction.

---

## 👥 Team (Rwanda)

**Supervisor**:  
- Ireme Promesse

**Development Team**:  
- **Aime P. Mwizerwa** - Lead Developer
- **Etienne TUYIHAMYE** - Blockchain Engineer
- **Iragena D.** - Backend Developer
- **Uwizeye Magnifique** - communit member
- **Didier I.** - UI/UX Designer

---

## 📄 License

This project is licensed under the **MIT License**.
