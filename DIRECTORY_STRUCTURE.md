# CupTrace Frontend - Directory Structure

This document provides an overview of the complete frontend directory structure.

## 📁 Complete Directory Tree

```
frontend/
├── .env.example                 # Environment variables template
├── .env.local                   # Local environment variables (gitignored)
├── .next/                       # Next.js build output (gitignored)
├── components.json              # shadcn/ui configuration
├── next.config.js               # Next.js configuration
├── node_modules/                # Dependencies (gitignored)
├── package.json                 # Project dependencies and scripts
├── package-lock.json            # Locked dependency versions
├── postcss.config.js            # PostCSS configuration
├── public/                      # Static assets
│   ├── favicon.ico
│   └── logo.svg
├── src/
│   ├── app/                     # Next.js App Router pages
│   │   ├── (auth)/             # Authentication route group
│   │   │   ├── forgot-password/
│   │   │   │   └── page.tsx    # Forgot password page
│   │   │   ├── login/
│   │   │   │   └── page.tsx    # Login page
│   │   │   ├── register/
│   │   │   │   └── page.tsx    # Registration page
│   │   │   └── layout.tsx      # Auth layout (centered form)
│   │   ├── (dashboard)/        # Protected dashboard route group
│   │   │   ├── admin/
│   │   │   │   ├── analytics/
│   │   │   │   ├── batches/
│   │   │   │   ├── cooperatives/
│   │   │   │   ├── reports/
│   │   │   │   ├── users/
│   │   │   │   └── page.tsx    # Admin dashboard
│   │   │   ├── exporter/
│   │   │   │   ├── certificates/
│   │   │   │   ├── exports/
│   │   │   │   └── page.tsx    # Exporter dashboard
│   │   │   ├── farmer/
│   │   │   │   ├── batches/
│   │   │   │   ├── payments/
│   │   │   │   ├── profile/
│   │   │   │   └── page.tsx    # Farmer dashboard
│   │   │   ├── washing-station/
│   │   │   │   ├── batches/
│   │   │   │   ├── processing/
│   │   │   │   └── page.tsx    # Washing station dashboard
│   │   │   └── layout.tsx      # Dashboard layout with sidebar
│   │   ├── verify/
│   │   │   └── page.tsx        # Public batch verification
│   │   ├── layout.tsx          # Root layout
│   │   ├── page.tsx            # Landing page
│   │   └── providers.tsx       # React Query provider
│   ├── components/
│   │   ├── auth/
│   │   │   └── ProtectedRoute.tsx  # Route protection wrapper
│   │   ├── layout/
│   │   │   └── DashboardLayout.tsx # Dashboard layout component
│   │   ├── shared/
│   │   │   └── StatsCard.tsx   # Dashboard stats card
│   │   └── ui/                 # shadcn/ui components
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── toaster.tsx
│   ├── contexts/               # React contexts (future)
│   ├── hooks/                  # React Query hooks
│   │   ├── useAuth.ts          # Authentication hooks
│   │   ├── useBatches.ts       # Batch management hooks
│   │   └── useCooperatives.ts  # Cooperative hooks
│   ├── lib/                    # Utilities and configuration
│   │   ├── validations/        # Zod validation schemas
│   │   │   ├── auth.schema.ts
│   │   │   ├── batch.schema.ts
│   │   │   └── processing.schema.ts
│   │   ├── axios.ts            # Axios instance with interceptors
│   │   ├── constants.ts        # App constants
│   │   ├── react-query.ts      # React Query configuration
│   │   └── utils.ts            # Utility functions
│   ├── services/               # API service layer
│   │   ├── auth.service.ts
│   │   ├── batch.service.ts
│   │   ├── certificate.service.ts
│   │   ├── cooperative.service.ts
│   │   ├── export.service.ts
│   │   ├── payment.service.ts
│   │   ├── processing.service.ts
│   │   └── report.service.ts
│   ├── styles/
│   │   └── globals.css         # Global styles with Tailwind
│   └── types/
│       └── index.ts            # TypeScript type definitions
├── tailwind.config.js          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
```

## 📝 Key Files Explained

### Configuration Files

- **`components.json`**: shadcn/ui configuration for component installation
- **`next.config.js`**: Next.js framework configuration
- **`tailwind.config.js`**: TailwindCSS theme and plugin configuration
- **`tsconfig.json`**: TypeScript compiler options and path aliases
- **`.env.local`**: Environment variables (API URL, app name)

### Application Structure

#### `src/app/` - Next.js App Router

- **`(auth)/`**: Route group for authentication pages (login, register)
- **`(dashboard)/`**: Route group for protected dashboard pages
- **`verify/`**: Public batch verification page
- **`layout.tsx`**: Root layout with providers and global styles
- **`page.tsx`**: Landing page
- **`providers.tsx`**: Client-side providers (React Query)

#### `src/components/`

- **`auth/`**: Authentication-related components
- **`layout/`**: Layout components (dashboard, sidebar, header)
- **`shared/`**: Reusable components across the app
- **`ui/`**: shadcn/ui base components

#### `src/hooks/`

React Query hooks for data fetching and mutations:
- Automatic caching
- Background refetching
- Optimistic updates
- Loading and error states

#### `src/lib/`

- **`validations/`**: Zod schemas for form validation
- **`axios.ts`**: Configured axios instance with auth interceptors
- **`constants.ts`**: Application constants (roles, statuses, navigation)
- **`react-query.ts`**: React Query client configuration
- **`utils.ts`**: Utility functions (formatting, colors, etc.)

#### `src/services/`

API service layer - each file handles API calls for a specific domain:
- Clean separation of concerns
- Easy to test and mock
- Centralized error handling

#### `src/types/`

TypeScript type definitions mirroring the Prisma schema:
- Enums (UserRole, BatchStatus, etc.)
- Interfaces (User, ProductBatch, etc.)
- API request/response types

### Styles

- **`globals.css`**: Global styles, Tailwind directives, CSS variables for theming

## 🎯 File Naming Conventions

- **Pages**: `page.tsx` (Next.js App Router convention)
- **Layouts**: `layout.tsx` (Next.js App Router convention)
- **Components**: PascalCase (e.g., `DashboardLayout.tsx`)
- **Hooks**: camelCase with `use` prefix (e.g., `useAuth.ts`)
- **Services**: camelCase with `.service.ts` suffix
- **Types**: `index.ts` for barrel exports
- **Schemas**: camelCase with `.schema.ts` suffix

## 🔄 Data Flow

```
User Action
    ↓
Component (uses hook)
    ↓
React Query Hook (from src/hooks/)
    ↓
Service Function (from src/services/)
    ↓
Axios Instance (from src/lib/axios.ts)
    ↓
Backend API
    ↓
Response flows back up the chain
    ↓
React Query caches and updates UI
```

## 🚀 Adding New Features

### 1. Add a new page

Create `src/app/(dashboard)/[role]/[feature]/page.tsx`

### 2. Add API service

Create `src/services/[feature].service.ts`

### 3. Add React Query hooks

Create `src/hooks/use[Feature].ts`

### 4. Add validation schema

Create `src/lib/validations/[feature].schema.ts`

### 5. Add types

Update `src/types/index.ts`

### 6. Add UI components

Create in `src/components/[category]/[Component].tsx`

---

This structure follows Next.js 14 App Router best practices and provides a scalable foundation for the CupTrace application.
