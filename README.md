# Planora — AI-Powered Celebration Planner

> **"Plan beautifully. Celebrate effortlessly."**

Planora is an AI-powered celebration and event planning platform designed to help users organize unforgettable celebrations, coordinate budgets, track critical timelines, compare vendor quotes, and receive context-aware planning intelligence with explicit user approval gates.

---

## ✨ Features

- **🎯 Adaptive Event Creation Wizard**: Structured 3-step intake capturing event occasion (Weddings, Birthdays, Community Galas), guest counts, total budget, priority hierarchies, and aesthetic constraints.
- **💰 Guaranteed Deterministic Budgeting**: Clear allocation breakdowns, real-time variance detection, contingency reserves, and deterministic recalculations ensuring financial transparency.
- **📅 Visual Timeline & Task Tracker**: Categorized milestone countdowns, dependency tracking, automated status toggles, and responsive task filters.
- **🏪 Vendor Intelligence & Comparison**: Side-by-side quotation evaluation, per-guest normalization, feature scoring, contract status tracking, and notes.
- **🤖 Context-Aware AI Planning Assistant**: Powered by Google Gemini with strict guardrails—proposes adaptive reallocations and timeline recommendations that require explicit human approval before any plan is altered.
- **🎨 Distinctive Visual Identity**: Elegant purple/lavender/pink palette with asymmetric curved corner styling (`rounded-asym`), typography combining Alex Brush script and clean Nunito Sans.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, TypeScript, Tailwind CSS, Vite, Lucide React, React Router v6
- **Backend**: Node.js, Express, TypeScript, Zod schema validation, Helmet security headers, Express Rate Limiting
- **AI Engine**: Google Gemini API (`@google/genai`) with verified deterministic fallback simulation
- **Database / Auth**: Supabase PostgreSQL & Auth with local in-memory fallback store

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm 9+

### Installation & Running

```bash
# Clone the repository
git clone <repo-url>
cd planora

# Start both client and server in development mode
npm run dev
```

The application will be available at:
- **Client (Frontend)**: [http://localhost:5173](http://localhost:5173)
- **API Server (Backend)**: [http://localhost:5000](http://localhost:5000)
- **Health Check**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

## 🧪 Testing & Verification

```bash
# Run TypeScript typechecks
npm run typecheck

# Run linter
npm run lint

# Run unit and integration tests
npm run test

# Build for production
npm run build
```

---

## 📄 License

© 2026 Planora — AI-Powered Celebration Planner. All rights reserved.

