# CupTrace Backend API

Backend API for CupTrace - A blockchain-powered traceability platform for Coffee & Tea supply chains in Rwanda.

## 🚀 Tech Stack

- **Node.js** (v18+)
- **Express.js** - Web framework
- **TypeScript** - Type safety
- **Prisma ORM** - Database ORM (PostgreSQL)
- **Zod** - Schema validation
- **JWT** - Authentication
- **bcrypt** - Password hashing
- **Lucid** - Cardano blockchain integration
- **dotenv** - Environment variables

## 📋 Prerequisites

- Node.js v18 or higher
- PostgreSQL database
- npm or yarn package manager
- Cardano blockchain access (Blockfrost API key or Cardano node)

## 🛠️ Setup Instructions

### 1. Install Dependencies

```bash
cd backend
npm install
```

### 2. Environment Configuration

Copy the `.env.example` file to `.env` and fill in your configuration:

```bash
cp .env.example .env
```

Edit `.env` with your values:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database
DATABASE_URL="postgresql://user:password@localhost:5432/cuptrace?schema=public"

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=7d

# Cardano Blockchain Configuration
CARDANO_NETWORK=preprod
BLOCKFROST_API_KEY=your-blockfrost-api-key
CARDANO_NODE_URL=

# Blockchain Contract Addresses (Aiken compiled contracts)
BATCH_CONTRACT_ADDRESS=
STAGE_CONTRACT_ADDRESS=
```

### 3. Database Setup

Generate Prisma client and run migrations:

```bash
# Generate Prisma client
npm run prisma:generate

# Run database migrations
npm run prisma:migrate

# (Optional) Open Prisma Studio to view data
npm run prisma:studio
```

### 4. Start Development Server

```bash
npm run dev
```

The server will start on `http://localhost:3000` (or your configured PORT).

## 📚 API Documentation

### Base URL

```
http://localhost:3000
```

### Authentication

Most endpoints require JWT authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

### API Endpoints

#### Authentication

##### Register User
```http
POST /auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "farmer"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "id": "clx...",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "farmer"
    },
    "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
  }
}
```

**Roles:** `farmer`, `ws`, `factory`, `exporter`, `importer`, `retailer`, `admin`

##### Login
```http
POST /auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:** Same as register

---

#### Coffee Management

##### Create Coffee Batch
```http
POST /coffee
Authorization: Bearer <token>
Content-Type: application/json

{
  "type": "coffee",
  "originLocation": "Rwanda, Northern Province",
  "farmerId": "clx..." // optional
}
```

##### Get Coffee Batch
```http
GET /coffee/:id
Authorization: Bearer <token>
```

##### List Coffee Batches
```http
GET /coffee?stage=farmer&page=1&limit=10
Authorization: Bearer <token>
```

**Query Parameters:**
- `stage` (optional): Filter by supply chain stage
- `page` (optional): Page number (default: 1)
- `limit` (optional): Items per page (default: 10)

##### Update Coffee Batch
```http
PUT /coffee/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "originLocation": "Updated location",
  "washingStationId": "clx...",
  "factoryId": "clx..."
}
```

##### Delete Coffee Batch (Soft Delete)
```http
DELETE /coffee/:id
Authorization: Bearer <token>
```

---

#### Tea Management

All tea endpoints follow the same pattern as coffee:

- `POST /tea` - Create tea batch
- `GET /tea/:id` - Get tea batch
- `GET /tea` - List tea batches
- `PUT /tea/:id` - Update tea batch
- `DELETE /tea/:id` - Delete tea batch

---

#### Supply Chain Stage Management

##### Update Coffee Batch Stage
```http
PUT /stage/coffee/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "stage": "washing_station",
  "blockchainTxHash": "abc123..." // optional
}
```

**Valid Stages:**
- `farmer`
- `washing_station`
- `factory`
- `exporter`
- `importer`
- `retailer`

##### Update Tea Batch Stage
```http
PUT /stage/tea/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "stage": "factory",
  "blockchainTxHash": "abc123..."
}
```

##### Get Batch History
```http
GET /stage/:id/history
Authorization: Bearer <token>
```

Returns complete audit trail of stage changes for a batch.

---

### Response Format

All API responses follow this format:

**Success:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### Error Codes

- `400` - Bad Request (Validation errors)
- `401` - Unauthorized (Authentication failed)
- `403` - Forbidden (Authorization failed)
- `404` - Not Found (Resource not found)
- `500` - Internal Server Error

---

## 🔗 Blockchain Integration

The backend integrates with Cardano blockchain using Lucid. The blockchain service (`src/services/blockchain.service.ts`) provides:

- `createBatchOnChain()` - Initialize batch on Cardano
- `updateBatchStageOnChain()` - Record stage transitions
- `verifyBatchOnChain()` - Verify batch authenticity

### Aiken Smart Contracts

The service is prepared to interact with Aiken-compiled Plutus contracts. To complete the integration:

1. Compile your Aiken contracts to `.plutus` format
2. Deploy contracts to Cardano network
3. Update `BATCH_CONTRACT_ADDRESS` and `STAGE_CONTRACT_ADDRESS` in `.env`
4. Implement `loadContract()` function in `blockchain.service.ts` based on your contract structure

### Example Usage

```typescript
import { createBatchOnChain, updateBatchStageOnChain } from './services/blockchain.service';

// Create batch on blockchain
const txHash = await createBatchOnChain(batchId, {
  type: 'coffee',
  originLocation: 'Rwanda',
  timestamp: new Date().toISOString()
});

// Update stage on blockchain
const stageTxHash = await updateBatchStageOnChain(
  batchId,
  'washing_station',
  'farmer',
  userId
);
```

---

## 🗄️ Database Schema

### User
- `id` - Unique identifier
- `name` - User name
- `email` - Unique email
- `password` - Hashed password
- `role` - User role (farmer, ws, factory, exporter, importer, retailer, admin)
- `createdAt`, `updatedAt` - Timestamps

### ProductBatch
- `id` - Unique identifier
- `type` - Product type (coffee | tea)
- `originLocation` - Origin location
- `currentStage` - Current supply chain stage
- `blockchainTxHash` - Blockchain transaction hash
- `farmerId`, `washingStationId`, `factoryId`, `exporterId`, `importerId`, `retailerId` - Foreign keys
- `deletedAt` - Soft delete timestamp
- `createdAt`, `updatedAt` - Timestamps

### BatchHistory
- `id` - Unique identifier
- `batchId` - Foreign key to ProductBatch
- `stage` - Stage at time of change
- `blockchainTxHash` - Blockchain transaction hash
- `timestamp` - When change occurred
- `changedBy` - User ID who made the change

---

## 🧪 Development

### Scripts

- `npm run dev` - Start development server with hot reload
- `npm run build` - Build TypeScript to JavaScript
- `npm start` - Start production server
- `npm run prisma:generate` - Generate Prisma client
- `npm run prisma:migrate` - Run database migrations
- `npm run prisma:studio` - Open Prisma Studio

### Project Structure

```
backend/
├── src/
│   ├── routes/          # API routes
│   ├── controllers/     # Request handlers
│   ├── services/        # Business logic
│   ├── middleware/      # Express middleware
│   ├── validators/      # Zod validation schemas
│   ├── utils/           # Utility functions
│   ├── config/          # Configuration files
│   ├── app.ts           # Express app setup
│   └── server.ts        # Server entry point
├── prisma/
│   └── schema.prisma    # Database schema
├── .env.example         # Environment variables template
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔒 Security

- Passwords are hashed using bcrypt (10 rounds)
- JWT tokens for authentication
- Input validation with Zod schemas
- CORS enabled for cross-origin requests
- Environment variables for sensitive data

---

## 📝 Notes

- All product deletions are soft deletes (using `deletedAt` timestamp)
- Stage transitions are validated to ensure proper flow
- All stage changes are recorded in `BatchHistory` for audit trail
- Blockchain integration is ready but requires Aiken contract deployment

---

## 🤝 Contributing

1. Create a feature branch
2. Make your changes
3. Test thoroughly
4. Submit a pull request

---

## 📄 License

MIT License © 2025 CupTrace Team

