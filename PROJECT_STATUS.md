# Project Status: DataMorph AI

## 1. Project Overview
DataMorph AI is an enterprise-grade, full-stack application built with Next.js 14, TypeScript, Tailwind CSS, Framer Motion, Recharts, and Octokit. It turns user-uploaded datasets (CSV, XLSX, JSON) into publication-ready, interactive scrollytelling websites inspired by *The Pudding* and *The New York Times*. Users can preview the generated data story, query it via an integrated zero-hallucination AI chatbot, export the project as a standalone ZIP archive, or publish it directly into their personal GitHub account as a brand new repository.

---

## 2. Completed Phases
- **Phase 1: Foundation & Architecture Setup** (Complete)
  - Next.js 14 App Router, TypeScript strict mode, Tailwind CSS editorial themes, Lucide icons, Framer Motion.
  - Zero-config local embedded storage (`lib/db.ts`) + PostgreSQL dual compatibility.
  - Global navigation and layout with glassmorphic aesthetics.
- **Phase 2: Authentication & GitHub Integration** (Complete)
  - GitHub OAuth 2.0 flow with cryptographic state verification (`/api/auth/github`, `/api/auth/callback`).
  - AES-256 encrypted HTTP-only session cookies (`lib/session.ts`).
  - Instant Local Explorer / Demo authentication mode for zero-setup local development (`/api/auth/demo`).
- **Phase 3: Dataset Ingestion & Deep Analysis Engine** (Complete)
  - Drag-and-drop uploader supporting CSV, Excel (.xlsx, .xls), and JSON with 25MB validation (`app/upload/page.tsx`).
  - Deep statistical profiling (`lib/analyzer.ts`): column type classification, outlier bounds (1.5 * IQR), Pearson correlation matrix, data quality scoring (0-100%), and automatic insight discovery.
  - Bundled sample datasets (`data/samples/saas_metrics.json` and `climate_carbon.csv`) for 1-click testing.
- **Phase 4: Scrollytelling Generation & Live Preview** (Complete)
  - Design system generator (`lib/designThemes.ts`): domain-based typography and color palettes.
  - Data-first hero section with animated metric counters and editorial narrative hooks (`components/preview/PreviewHero.tsx`).
  - Pinned scrollytelling chapters with dynamic perspective transitions (`components/preview/PreviewScrollytelling.tsx`).
  - Bento analytics grid highlighting correlations, outliers, and quality scores (`components/preview/PreviewBento.tsx`).
  - Searchable, sortable, paginated data explorer table (`components/preview/PreviewExplorer.tsx`).
  - Step-by-step synthesis progress pipeline (`app/generate/[id]/page.tsx`).
- **Phase 5: Grounded AI Chatbot Engine** (Complete)
  - In-memory dataset query engine (`lib/queryEngine.ts`) executing deterministic mathematical aggregations (SUM, AVG, MIN, MAX, COUNT, category comparisons).
  - Modular AI service layer (`lib/aiService.ts`) with Gemini / OpenAI support and deterministic fallback.
  - Interactive floating chatbot UI with suggested question chips and grounded evidence pills (`components/preview/PreviewChatbot.tsx`).
- **Phase 6: Standalone Code Synthesizer & GitHub Publishing** (Complete)
  - Automated project compiler (`lib/codeGenerator.ts`) that synthesizes 19 standalone source files for each dataset.
  - In-memory ZIP archive streaming export (`lib/zipExporter.ts`, `/api/projects/[id]/export-zip`).
  - Direct GitHub repository publisher using `@octokit/rest` with Git Data API blob/tree/commit pipeline (`lib/githubPublisher.ts`, `app/publish/[id]/page.tsx`).
- **Phase 7: Testing, Quality Control & Deployment Readiness** (Complete)
  - E2E automated test suite (`scripts/test_workflow.ts`): 24/24 passing tests.
  - Render production configuration (`render.yaml`).
  - Production build compiled and verified: 14/14 static & dynamic routes optimized.

---

## 3. Implemented Features
- Complete multi-page SaaS application: Landing Page, Upload Studio, Generation Pipeline, Live Preview, GitHub Publishing, Workspace Dashboard, Settings, Login.
- True standalone generated projects: each generated website can run independently (`npm install && npm run dev`) without any dependency on the main platform.
- Zero credential barriers: Includes local explorer mode and bundled test datasets.

---

## 4. Current Architecture
- **Framework**: Next.js 14 (App Router, Server Actions, Route Handlers)
- **Language**: TypeScript 5.5
- **Styling**: Tailwind CSS with custom editorial fonts (`Fraunces`, `Playfair Display`, `Space Grotesk`, `Syne`, `JetBrains Mono`, `Inter`)
- **Visualizations**: Recharts + Framer Motion
- **Database**: `lib/db.ts` (Embedded atomic file store for local dev; PostgreSQL via `DATABASE_URL` in production)
- **Session Security**: AES-256 encrypted HTTP-only cookies (`lib/session.ts`)
- **Git / GitHub Integration**: `@octokit/rest` via GitHub OAuth or Personal Access Tokens

---

## 5. Important File Locations
- `lib/analyzer.ts` - Core statistical and heuristic analysis engine
- `lib/queryEngine.ts` - Deterministic dataset aggregation query engine
- `lib/aiService.ts` - Grounded AI chat service (Gemini / OpenAI / Deterministic fallback)
- `lib/codeGenerator.ts` - Standalone Next.js 14 project code synthesizer
- `lib/githubPublisher.ts` - Octokit GitHub repository creation & code commit pipeline
- `lib/zipExporter.ts` - JSZip in-memory ZIP archive packager
- `lib/db.ts` - Local/Production database abstraction
- `app/upload/page.tsx` - Dataset ingestion studio
- `app/preview/[id]/page.tsx` - Live editorial scrollytelling preview
- `app/publish/[id]/page.tsx` - GitHub repository publishing interface
- `app/dashboard/page.tsx` - User workspace
- `render.yaml` - 1-Click Render deployment configuration

---

## 6. Database Structure
- `data/db.json`:
  - `users`: `{ id, githubId, username, name, avatarUrl, email, accessToken, isDemo }`
  - `projects`: `{ id, userId, title, description, datasetName, fileType, rowCount, columnCount, analysis, status, githubRepoUrl, githubRepoName, createdAt, updatedAt }`
- `data/datasets/[id].json`: Raw parsed rows for each project.

---

## 7. Environment Variables Required
```env
# Session Encryption Key (Required, defaults to dev secret)
SESSION_SECRET=datamorph_dev_secret_key_32chars_long_minimum!

# GitHub OAuth Integration (Optional for local testing; required for live OAuth login)
GITHUB_CLIENT_ID=
GITHUB_CLIENT_SECRET=

# Advanced Conversational Reasoning (Optional - fallback answers operate deterministically)
GEMINI_API_KEY=
OPENAI_API_KEY=

# Base URL (for production OAuth redirects)
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Optional Managed Database
DATABASE_URL=
```

---

## 8. Bugs Identified & Fixed
- *Issue*: PowerShell execution policy blocks `.ps1` wrapper scripts.
  *Fix*: Used `npm.cmd` and `npx.cmd` directly.
- *Issue*: Route segment config deprecation in Next.js 14 App Router for upload route.
  *Fix*: Replaced legacy config with `export const dynamic = 'force-dynamic'`.
- *Issue*: Next.js Webpack file/directory collision between `app/api/auth/route.ts` and `app/api/auth/*`.
  *Fix*: Consolidated into dedicated sub-routes (`/api/auth/demo`, `/api/auth/me`, `/api/auth/logout`, etc.).
- *Issue*: Node.js Buffer typing in App Router Fetch Response for ZIP download.
  *Fix*: Wrapped Buffer in `new Uint8Array(zipBuffer)`.
- *Issue*: Indian locale formatting difference (`3,42,000` vs `342,000`) in test assertions.
  *Fix*: Generalized assertion to match semantic intent.

---

## 9. Features Remaining
All 7 master phases are fully implemented, verified, and tested! Future extension ideas:
- Direct Vercel / Netlify 1-click deploy webhooks.
- Multi-dataset relational joins.

---

## 10. Commands Needed to Resume or Run Application
```bash
# Start development server
npm.cmd run dev

# Run automated end-to-end verification suite
npx.cmd tsc scripts/test_workflow.ts --target es2022 --module commonjs --esModuleInterop --skipLibCheck --outDir ./dist_test
node ./dist_test/scripts/test_workflow.js

# Build production bundle
npm.cmd run build

# Start production server
npm.cmd run start
```
Open [http://localhost:3000](http://localhost:3000)
