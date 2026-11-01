# FINORA AI — Autonomous Wealth & Financial Intelligence System

FINORA AI is a full-stack personal finance application and autonomous wealth management dashboard built with React, TypeScript, Vite, Tailwind CSS, Node.js, Express, Supabase (PostgreSQL with Row Level Security), and Google Gemini AI.

The application features a bespoke **Midnight Emerald & Champagne Gold** aesthetic designed for private wealth management, family office surveillance, and personal capital allocation.

---

## Key Features

- **Executive Wealth Dashboard**: Real-time financial summary cards (Balance, Income, Expenses, Net Savings Rate) computed with zero hardcoding directly from the verified ledger.
- **Enterprise Transaction Management**: Full CRUD operations for income and expense transactions with search, multi-factor filtering (by type, category, and date range), details modal, and CSV export.
- **Discretionary & Operational Budgets**: Set aggregate monthly spending caps and category-level envelopes. Live progress bars feature automatic threshold alerts at **75%** (approaching cap), **90%** (critical warning), and **100%** (budget breach).
- **Strategic Savings Goals**: Horizon-based milestones (target amount, current progress, target completion date, category, and custom color accents).
- **Quantitative Financial Analytics**:
  - Income vs. Expenses multi-month comparisons (Emerald & Champagne Gold bar chart)
  - Category-wise capital allocation breakdown (Donut chart with custom legend)
  - Cumulative spending trajectory vs. benchmark envelope (Smooth area chart)
  - Savings growth and projections (Line chart)
  - Weekly spending rhythms mapped across days of the week (Mon–Sun)
  - Top 5 expense concentrations & highest individual outflows
  - Month-over-month variances and growth deltas
- **Google Gemini AI Integration**:
  - **Smart Categorization**: Recommends appropriate expense or income categories based on transaction title and description.
  - **Financial Intelligence Insights**: Generates structured observations on spending pace, unusual transactions, and wealth preservation opportunities.
  - **Interactive AI Assistant**: Q&A assistant providing answers based strictly on verified user ledger records.
  - **AI Budget Containment**: Analyzes monthly burn rates against historical cycles to suggest tactical containment measures.
- **Security & Data Isolation**:
  - Built-in Supabase authentication (email/password with automatic session persistence).
  - PostgreSQL **Row Level Security (RLS)** active on all tables (`transactions`, `budgets`, `savings_goals`).
  - Backend rate limiting on AI endpoints (30 queries / 15-minute window) and sanitized error handling.
  - Zero client-side API key exposure.

---

## Technology Stack

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 8 (Rolldown engine)
- **Styling**: Tailwind CSS v4 (theme variable design system)
- **Data Visualization**: Recharts (responsive SVG charts)
- **Icons**: Lucide React
- **Client Database**: Supabase JS Client with local-cache fallback
- **Linter**: Oxlint (0 warnings, 0 errors)

### Backend
- **Runtime**: Node.js (ES Modules)
- **Server Framework**: Express 4
- **AI SDK**: `@google/generative-ai` (Google Gemini 1.5 Flash)
- **Middleware**: CORS, `express-rate-limit`, centralized sanitized error handler
- **Configuration**: Dotenv

### Database & Auth
- **Database**: Supabase PostgreSQL
- **Security**: Row Level Security (RLS) policies per authenticated user
- **Extensions**: `uuid-ossp`, `pgcrypto`

---

## Project Structure

```
finora-ai/
├── .gitignore               # Root git ignore rules
├── .env.example             # Consolidated environment template
├── README.md                # Project documentation
├── backend/                 # Node.js + Express API server
│   ├── .env.example         # Backend environment template
│   ├── .gitignore           # Backend git ignore rules
│   ├── package.json
│   └── src/
│       ├── index.js         # Express app entry point
│       ├── config/          # Environment configuration
│       ├── controllers/     # AI and business logic controllers
│       ├── middleware/      # Rate limiter, CORS, error handling
│       ├── routes/          # Health and AI API routes
│       └── services/        # Gemini AI generative models & prompt services
├── frontend/                # React + Vite frontend application
│   ├── .env.example         # Frontend environment template
│   ├── .gitignore           # Frontend git ignore rules
│   ├── package.json
│   ├── vite.config.ts
│   └── src/
│       ├── App.tsx          # Main application orchestrator
│       ├── components/      # UI components (dashboard, transactions, budgets, analytics, auth)
│       ├── context/         # Authentication context and hooks
│       ├── services/        # Supabase, transaction, budget, goal, and AI services
│       ├── types/           # TypeScript data models and interfaces
│       └── utils/           # Formatters (INR currency, dates, chart mathematical derivations)
└── supabase/
    └── schema.sql           # Database schema, tables, triggers, indexes, and RLS policies
```

---

## Setup & Installation Instructions

### Prerequisites
- [Node.js](https://nodejs.org/) (version 18 or later recommended)
- [npm](https://www.npmjs.com/) or yarn / pnpm
- A free [Supabase](https://supabase.com/) account
- A free [Google AI Studio](https://aistudio.google.com/app/apikey) Gemini API key

---

### Step 1: Database Setup (Supabase)

1. Create a new project in your [Supabase Dashboard](https://supabase.com/dashboard).
2. Open the **SQL Editor** from the left navigation bar.
3. Open [`supabase/schema.sql`](supabase/schema.sql), copy the entire SQL script, paste it into the SQL Editor, and click **Run**.
4. This will create:
   - `transactions` table with indexes and update trigger
   - `budgets` table with unique constraint on `(user_id, month)`
   - `savings_goals` table
   - Row Level Security policies ensuring authenticated users can only access their own records.
5. In your Supabase Dashboard, go to **Project Settings** → **API**:
   - Copy the **Project URL**
   - Copy the **anon / public** API key

---

### Step 2: Backend Setup

1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Edit `backend/.env` with your credentials:
   ```env
   PORT=5000
   NODE_ENV=development
   CLIENT_URL=http://localhost:5173
   GEMINI_API_KEY=your_gemini_api_key_from_google_ai_studio
   ```
5. Start the backend server:
   ```bash
   # Development mode (with auto-reload)
   npm run dev

   # Or standard production mode
   npm start
   ```
6. Verify the server is running by opening:
   - Root status: [http://localhost:5000/](http://localhost:5000/)
   - Health check: [http://localhost:5000/api/health](http://localhost:5000/api/health)

---

### Step 3: Frontend Setup

1. In a new terminal window, navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Create your `.env` file from the template:
   ```bash
   cp .env.example .env
   ```
4. Edit `frontend/.env` with your Supabase credentials:
   ```env
   VITE_API_URL=http://localhost:5000/api
   VITE_SUPABASE_URL=https://your-project-id.supabase.co
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_publishable_key
   ```
5. Start the development server:
   ```bash
   npm run dev
   ```
6. Open your browser and navigate to:
   [http://localhost:5173](http://localhost:5173)

---

## Environment Variables Reference

| Variable | Location | Required | Description |
| :--- | :--- | :--- | :--- |
| `VITE_API_URL` | `frontend/.env` | Yes | URL of the backend API (defaults to `http://localhost:5000/api`) |
| `VITE_SUPABASE_URL` | `frontend/.env` | Yes | Supabase project URL (`https://xyz.supabase.co`) |
| `VITE_SUPABASE_ANON_KEY` | `frontend/.env` | Yes | Supabase public publishable anon key (safe for browser) |
| `PORT` | `backend/.env` | Optional | Port for the Express backend (default: `5000`) |
| `NODE_ENV` | `backend/.env` | Optional | `development` or `production` |
| `CLIENT_URL` | `backend/.env` | Yes | Allowed frontend origin for CORS (e.g. `http://localhost:5173`) |
| `GEMINI_API_KEY` | `backend/.env` | Yes | Google Gemini API Key from Google AI Studio |

> **Security Notice**: Never put `GEMINI_API_KEY` or Supabase `service_role` keys into the frontend `.env`. All AI queries route through the authenticated Node.js backend.

---

## Development Scripts

### Frontend (`cd frontend`)
- `npm run dev`: Launch Vite hot-reloading development server
- `npm run build`: Typecheck with `tsc -b` and produce optimized production bundle with Vite
- `npm run lint`: Fast linting using `oxlint` (enforces purity, hook rules, and TypeScript standards)
- `npm run preview`: Preview the production build locally

### Backend (`cd backend`)
- `npm run dev`: Run Express server with Nodemon file watcher
- `npm start`: Start Express server with standard Node.js

---

## Testing & Quality Assurance

- **Frontend Linter**: Oxlint passes with `0 warnings and 0 errors` across all 37 files.
- **Production Build**: Full TypeScript compilation and asset bundling passes with `0 errors`.
- **Backend API Endpoints**: All health, categorization, insights, and budget endpoints tested with secure fallback handling.

---

## License

This project is licensed under the MIT License.

