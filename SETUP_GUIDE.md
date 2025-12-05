# CupTrace Frontend - Setup & Deployment Guide

## 📋 Prerequisites

- **Node.js** 18+ installed
- **PostgreSQL** database running
- **Backend API** running on port 3001 (or configured port)

---

## 🚀 Quick Start

### 1. Install Dependencies

```bash
cd frontend
npm install
```

This will install all required packages including:
- Next.js 14
- React Query (TanStack Query)
- Axios
- shadcn/ui components
- Zod validation
- TailwindCSS
- And more...

### 2. Configure Environment Variables

The `.env.local` file has already been created with default values:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_APP_NAME=CupTrace
```

**Update if needed:**
- Change `NEXT_PUBLIC_API_URL` if your backend runs on a different port
- Modify `NEXT_PUBLIC_APP_NAME` if you want a different app name

### 3. Run Development Server

```bash
npm run dev
```

The frontend will start on **http://localhost:3000**

---

## 🗄️ Database Setup

### 1. Configure Backend Database

Navigate to the backend directory and set up the database:

```bash
cd ../backend
```

### 2. Create `.env` File

Create `backend/.env` with the following:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/cuptrace_dev"
JWT_SECRET="your-super-secret-jwt-key-change-in-production"
PORT=3001
NODE_ENV=development
```

**Important:** Replace `password` with your PostgreSQL password.

### 3. Run Prisma Migrations

```bash
npx prisma generate
npx prisma migrate dev --name init
```

### 4. Seed the Database

```bash
npx ts-node prisma/seed.ts
```

This will create:
- **2 Cooperatives** (Huye Coffee Cooperative, Musasa Tea Growers)
- **5 Test Users** (Admin, 2 Farmers, Washing Station, Exporter)
- **3 Sample Batches** (2 coffee, 1 tea)
- **Batch History** records

---

## 👤 Test Credentials

After seeding, you can login with these credentials:

### Admin Account
- **Email:** `admin@cuptrace.rw`
- **Password:** `admin123`
- **Access:** Full system access

### Farmer Account 1
- **Email:** `jean.farmer@cuptrace.rw`
- **Password:** `farmer123`
- **Cooperative:** Huye Coffee Cooperative

### Farmer Account 2
- **Email:** `marie.farmer@cuptrace.rw`
- **Password:** `farmer123`
- **Cooperative:** Musasa Tea Growers

### Washing Station
- **Email:** `huye.station@cuptrace.rw`
- **Password:** `station123`

### Exporter
- **Email:** `rwanda.exports@cuptrace.rw`
- **Password:** `exporter123`

---

## 🏃 Running Both Backend & Frontend

### Option 1: Separate Terminals

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

### Option 2: Using Concurrently (Recommended)

Create a `package.json` in the **root directory**:

```json
{
  "name": "cuptrace",
  "scripts": {
    "dev": "concurrently \"npm run dev:backend\" \"npm run dev:frontend\"",
    "dev:backend": "cd backend && npm run dev",
    "dev:frontend": "cd frontend && npm run dev"
  },
  "devDependencies": {
    "concurrently": "^8.2.2"
  }
}
```

Then run:

```bash
npm install
npm run dev
```

---

## 🧪 Testing the Application

### 1. Access the Landing Page

Navigate to **http://localhost:3000**

You should see:
- Hero section with "Track Your Coffee & Tea"
- Features section
- How it works section
- Login/Register buttons

### 2. Register a New User

1. Click **Register**
2. Fill in the form:
   - Name: Your Name
   - Email: your@email.com
   - Role: Select "Farmer"
   - Cooperative: Optional (select from dropdown)
   - Password: minimum 6 characters
3. Click **Create Account**

You'll be automatically logged in and redirected to the farmer dashboard.

### 3. Login with Test Account

1. Click **Login**
2. Enter credentials (e.g., `jean.farmer@cuptrace.rw` / `farmer123`)
3. Click **Sign In**

You'll be redirected to the appropriate dashboard based on your role.

### 4. Farmer Dashboard Features

- **View Stats:** Total batches, pending approvals, approved batches
- **Recent Batches:** List of your latest batches
- **Create Batch:** Click "New Batch" button
- **View Payments:** Navigate to Payments page

### 5. Admin Dashboard Features

- **System Overview:** Total batches, users, pending approvals
- **Manage Users:** View and manage all users
- **Review Batches:** Approve/reject pending batches
- **Analytics:** System analytics (coming soon)
- **Cooperatives:** Manage cooperatives
- **Reports:** Generate NAEB reports

---

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── (auth)/              # Authentication pages
│   │   │   ├── login/
│   │   │   ├── register/
│   │   │   └── forgot-password/
│   │   ├── (dashboard)/         # Protected dashboard pages
│   │   │   ├── farmer/
│   │   │   ├── admin/
│   │   │   ├── washing-station/
│   │   │   ├── exporter/
│   │   │   └── layout.tsx
│   │   ├── verify/              # Public verification
│   │   ├── layout.tsx           # Root layout
│   │   ├── page.tsx             # Landing page
│   │   └── providers.tsx        # React Query provider
│   ├── components/
│   │   ├── ui/                  # shadcn components
│   │   ├── auth/                # Auth components
│   │   ├── layout/              # Layout components
│   │   └── shared/              # Shared components
│   ├── hooks/                   # React Query hooks
│   ├── lib/                     # Utilities & config
│   │   ├── validations/         # Zod schemas
│   │   ├── axios.ts
│   │   ├── constants.ts
│   │   ├── react-query.ts
│   │   └── utils.ts
│   ├── services/                # API services
│   ├── styles/                  # Global CSS
│   └── types/                   # TypeScript types
├── .env.local                   # Environment variables
├── components.json              # shadcn config
├── package.json
├── tailwind.config.js
└── tsconfig.json
```

---

## 🎨 UI Components

The app uses **shadcn/ui** components built on **Radix UI** primitives:

- ✅ Button
- ✅ Input
- ✅ Label
- ✅ Card
- ✅ Toast (Sonner)
- 🔄 More components can be added as needed

### Adding More shadcn Components

```bash
npx shadcn-ui@latest add [component-name]
```

Example:
```bash
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add select
npx shadcn-ui@latest add table
```

---

## 🔐 Authentication Flow

1. **User logs in** → JWT token stored in `localStorage`
2. **Axios interceptor** adds token to all API requests
3. **Protected routes** check authentication status
4. **Role-based access** redirects users to appropriate dashboards
5. **401 responses** automatically clear token and redirect to login

---

## 🌐 API Integration

All API calls are centralized in `src/services/`:

- `auth.service.ts` - Authentication
- `batch.service.ts` - Batch management
- `cooperative.service.ts` - Cooperatives
- `processing.service.ts` - Processing records
- `payment.service.ts` - Payments
- `export.service.ts` - Export records
- `certificate.service.ts` - Certificates
- `report.service.ts` - NAEB reports

React Query hooks in `src/hooks/` provide:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading & error states

---

## 🔧 Troubleshooting

### Frontend won't start

**Error:** `Module not found`
```bash
cd frontend
rm -rf node_modules package-lock.json
npm install
```

### Backend connection failed

**Error:** `Network Error` or `ERR_CONNECTION_REFUSED`

1. Check backend is running: `cd backend && npm run dev`
2. Verify `NEXT_PUBLIC_API_URL` in `.env.local`
3. Check backend port in `backend/.env`

### Database connection failed

**Error:** `Can't reach database server`

1. Ensure PostgreSQL is running
2. Check `DATABASE_URL` in `backend/.env`
3. Verify database exists: `psql -l`
4. Create database if needed: `createdb cuptrace_dev`

### Prisma errors

**Error:** `Prisma Client not generated`
```bash
cd backend
npx prisma generate
```

**Error:** `Migration failed`
```bash
npx prisma migrate reset
npx prisma migrate dev
npx ts-node prisma/seed.ts
```

### Login fails

1. Check backend logs for errors
2. Verify user exists in database: `npx prisma studio`
3. Ensure password is correct (see test credentials above)
4. Check JWT_SECRET is set in `backend/.env`

---

## 📦 Production Build

### Build Frontend

```bash
cd frontend
npm run build
npm run start
```

### Build Backend

```bash
cd backend
npm run build
npm run start
```

### Environment Variables for Production

**Frontend `.env.production`:**
```env
NEXT_PUBLIC_API_URL=https://api.cuptrace.rw
NEXT_PUBLIC_APP_NAME=CupTrace
```

**Backend `.env`:**
```env
DATABASE_URL="postgresql://user:password@host:5432/cuptrace_prod"
JWT_SECRET="your-production-secret-key"
PORT=3001
NODE_ENV=production
```

---

## 🔮 Next Steps

### Blockchain Integration (Aiken)

The UI has placeholders for blockchain functionality:
- `BlockchainStatus` component
- `RecordOnChainButton` component
- Transaction hash display

To integrate Aiken smart contracts:

1. Compile Aiken validators
2. Create `blockchain.service.ts`
3. Integrate Cardano wallet (Nami, Eternl)
4. Update backend to submit transactions
5. Poll for transaction confirmation

### Additional Features

- [ ] QR Code scanner for batch verification
- [ ] Batch detail page with timeline
- [ ] Payment management
- [ ] Export records management
- [ ] Certificate upload & display
- [ ] NAEB report generation
- [ ] Analytics dashboard with charts
- [ ] User profile management
- [ ] Notifications system

---

## 📞 Support

For issues or questions:
- Check backend logs: `cd backend && npm run dev`
- Check frontend console: Open browser DevTools
- Review Prisma Studio: `cd backend && npx prisma studio`

---

## 🎉 Success!

If you can:
1. ✅ Access http://localhost:3000
2. ✅ Login with test credentials
3. ✅ See the farmer/admin dashboard
4. ✅ View sample batches

**Your CupTrace application is ready!** 🚀☕🍵
