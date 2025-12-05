# 🚀 CupTrace - Quick Start Guide

## ⚡ Installation (5 Minutes)

### 1. Install Frontend Dependencies
```bash
cd frontend
npm install
```

### 2. Setup Backend Database
```bash
cd ../backend

# Create .env file
echo 'DATABASE_URL="postgresql://postgres:YOUR_PASSWORD@localhost:5432/cuptrace_dev"' > .env
echo 'JWT_SECRET="your-secret-key-change-in-production"' >> .env
echo 'PORT=3001' >> .env

# Run migrations and seed
npx prisma generate
npx prisma migrate dev --name init
npx ts-node prisma/seed.ts
```

### 3. Start Both Servers
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend  
cd frontend
npm run dev
```

### 4. Access Application
- **Frontend**: http://localhost:3000
- **Login**: `jean.farmer@cuptrace.rw` / `farmer123`

---

## 📝 Test Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@cuptrace.rw | admin123 |
| Farmer | jean.farmer@cuptrace.rw | farmer123 |
| Washing Station | huye.station@cuptrace.rw | station123 |
| Exporter | rwanda.exports@cuptrace.rw | exporter123 |

---

## ✅ What's Included

### Pages
- ✅ Landing page with features
- ✅ Login & Register
- ✅ Farmer Dashboard
- ✅ Admin Dashboard  
- ✅ Public Batch Verification

### Features
- ✅ JWT Authentication (localStorage)
- ✅ Role-based access control
- ✅ Protected routes
- ✅ API integration with React Query
- ✅ Form validation with Zod
- ✅ Toast notifications
- ✅ Responsive design
- ✅ Database seed with test data

### Tech Stack
- Next.js 14 + TypeScript
- TailwindCSS + shadcn/ui
- React Query + Axios
- Zod validation
- Prisma ORM

---

## 📚 Documentation

- **SETUP_GUIDE.md** - Detailed setup instructions
- **DIRECTORY_STRUCTURE.md** - Project structure
- **walkthrough.md** - Complete implementation overview

---

## 🎯 Next Steps

1. **Create Batch Form** - Allow farmers to register batches
2. **Batch Detail Page** - View full batch timeline
3. **More Dashboards** - Washing station, exporter, etc.
4. **Blockchain Integration** - Connect Aiken smart contracts

---

## 🆘 Troubleshooting

**Frontend won't start?**
```bash
cd frontend
rm -rf node_modules .next
npm install
```

**Database errors?**
```bash
cd backend
npx prisma migrate reset
npx ts-node prisma/seed.ts
```

**Can't login?**
- Check backend is running on port 3001
- Verify database has seed data: `npx prisma studio`
- Check browser console for errors

---

**Need help?** See SETUP_GUIDE.md for detailed instructions.

**Ready to code!** 🚀☕🍵
