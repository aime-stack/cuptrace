# 🏆 CupTrace – Coffee & Tea Traceability on Cardano

CupTrace is a **blockchain-powered traceability system** for Rwanda’s coffee and tea value chains.  
It enables farmers, cooperatives, washing stations, factories, exporters, and buyers to **track products from farm to export**, ensuring transparency, authenticity, and fair payments.

This project is developed for the **Cardano Hackathon 2025**.

---

## 🚨 Problem

Rwanda’s coffee and tea sectors face serious challenges:

- Lack of transparency along the supply chain  
- Farmers unaware of delivered quantity, quality, or payments  
- Cooperatives and washing stations unable to track lots efficiently  
- Exporters and buyers cannot independently verify authenticity  
- NAEB receives delayed or incomplete reports  

Existing centralized systems are vulnerable to tampering, misreporting, and inefficiency.

---

## 🎯 Solution — CupTrace

CupTrace leverages **Cardano blockchain** to provide:

- Immutable records of every coffee/tea lot  
- Unique Lot IDs linked with metadata: farmer, cooperative, quality, and location  
- Transparent processing steps: harvest, washing/processing, milling, grading, export  
- QR codes for consumers and buyers to verify authenticity  
- Dashboards for farmers, cooperatives, washing stations, factories, and NAEB  

**Key Benefits:**

- Farmers know exact delivery, quality, and payment  
- Cooperatives can audit and report efficiently  
- Exporters and buyers verify provenance  
- NAEB tracks sector data in real time  

---

## 🧱 System Architecture

cuptrace/
│── frontend/ (Farmer, Cooperative, Factory, NAEB dashboards)
│── backend/ (Node.js API + PostgreSQL)
│── smart-contracts/ (Aiken or Plutus)
│── docs/
│── tests/

markdown
Copy code

### **Coffee Workflow**

1. Farmer harvest →  
2. Delivery to washing station →  
3. Lot creation (wet processing) →  
4. Drying →  
5. Milling →  
6. Grading →  
7. Export →  
8. Buyer verification

### **Tea Workflow**

1. Plucking →  
2. Weighing →  
3. Factory intake →  
4. Processing (CTC/Orthodox) →  
5. Packaging →  
6. Distribution →  
7. Export →  
8. Buyer verification

Each step is **recorded on-chain**, creating a tamper-proof traceability trail.

---

## 🔗 Cardano Smart Contracts

**Contracts include:**

1. **RegisterFarmer** – Farmer ID, cooperative, location  
2. **RecordHarvest** – Lot ID, weight, quality, moisture  
3. **ProcessLot** – Washing, drying, milling, grading  
4. **ExportRecord** – Exporter, buyer, shipping, certificates  
5. **VerifyProduct** – On-demand QR verification for consumers and buyers  

---

## 🛠 Tech Stack

| Layer | Technology |
|------|------------|
| Smart Contracts | Aiken / Plutus |
| Backend API | Node.js + Express |
| Database | PostgreSQL / Supabase |
| Frontend | Next.js / React |
| Blockchain Connection | Blockfrost / Cardano Serialization Lib |
| Auth | JWT |
| QR Codes | qrcode.js |

---

## 🚀 How to Run CupTrace Locally

### **1. Clone the repo**
```sh
git clone https://github.com/YOUR_USERNAME/cuptrace
cd cuptrace
2. Backend Setup
sh
Copy code
cd backend
npm install
npm run dev
Environment variables required:

ini
Copy code
BLOCKFROST_KEY=
DATABASE_URL=
NETWORK=preprod
3. Frontend Setup
sh
Copy code
cd frontend
npm install
npm run dev
4. Smart Contract Compilation
For Aiken:

sh
Copy code
cd smart-contracts
aiken build
For Plutus:

sh
Copy code
cabal build
🧪 Testing
Smart contracts: Aiken test framework / Plutus testing

Backend: Jest

Frontend: Cypress

🌍 Stakeholders
Farmers

Cooperatives

Washing Stations

Tea Factories

Exporters & Buyers

NAEB

CupTrace is the single source of truth for coffee and tea traceability in Rwanda.

🌿 Roadmap
Mobile App for farmers

NFC/RFID tags for lot tracking

Machine learning for fraud detection

Integration with NAEB APIs

Multi-language support (Kinyarwanda, English, French)

👥 Team – CupTrace (Rwanda)
Supervisor
Ireme Promesse

Team Members
Aime P. Mwizerwa

Etienne T.

Iragena D.

Uwizeye M.

Didier I.

📄 License
MIT License © 2025 CupTrace Team
