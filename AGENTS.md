# AGENTS.md

## 🧭 Project Overview
- Framework: Next.js 15.3.0 (App Router)
- Language: TypeScript 5
- UI Library: React 19.0.0
- Styling: Tailwind CSS 4.1.3 (with daisyUI plugin)
- Data Fetching: SWR 2.3.3 (using `axios` for HTTP requests)
- Logging: Pino 9.6.0
- Payment Integration: VivaWallet
- Deployment: Vercel

## 📁 Project Structure
```
/frontend
├── public/
│   ├── icons/
│   ├── images/
│   └── videos/
├── src/
│   ├── app/          # Next.js App Router pages
│   ├── components/   # Reusable React components
│   ├── hooks/        # Custom React hooks
│   ├── lib/          # Utility functions and helpers
│   ├── types/        # TypeScript type definitions
│   ├── config/       # Application constants and configuration
│   ├── context/      # React Context providers
│   ├── data/         # Static data and fixtures
│   ├── middleware/   # Next.js middleware
│   ├── services/     # API service modules (e.g., VivaWallet)
│   └── utils/        # Additional utility functions
├── tailwind.config.js
├── postcss.config.js
├── next.config.js
├── jest.config.js
├── package.json
├── pnpm-lock.yaml
├── tsconfig.json
├── vercel.json
└── .env.local        # Local env vars (gitignored)
```

## 🎨 Coding Standards
- **TypeScript** with `strict` mode enabled
- **Tailwind CSS** (utility-first) + daisyUI
- **React Components**: Functional components with Hooks
- **File Naming**: `PascalCase` for components, `camelCase` for functions/variables
- **Logging**: Structured logging via Pino
- **Data Fetching**: SWR for caching + `axios` for HTTP

## 🧪 Testing Guidelines
- **Framework**: Jest + React Testing Library
- **Location**: colocate test files in `__tests__` next to code or create a `/tests` directory mirroring `src/`
- **Run Tests**: `pnpm test`
- **Coverage Report**: `pnpm test -- --coverage`

## 🔧 Development Scripts
- Install deps: `pnpm install`
- Dev (Turbopack): `pnpm dev:turbo`
- Dev: `pnpm dev` (port 3001)
- Build: `pnpm build`
- Start: `pnpm start`
- Lint: `pnpm lint`
- Test: `pnpm test`
- Type-check: `npx tsc --noEmit`

## 🚀 Deployment
- **Platform**: Vercel
- **Build Command**: `pnpm build`
- **Output Dir**: `.next`
- **Env Vars**: set in Vercel dashboard

## 📄 Pull Request Guidelines
- **Branch**: `feature/`, `fix/`, `chore/` prefixes
- **PR Title**: `[Feature] Descriptive title`
- **Description**: explain purpose, reference issues, include screenshots
- **Checklist**:
  - Code follows standards
  - All tests pass
  - No lint errors
  - Ready for review

## 🔐 Payment Integration
- **Provider**: VivaWallet
- Use official SDK to process payments
- Follow PCI DSS security guidelines
- **Testing**: mock VivaWallet APIs to prevent real transactions
