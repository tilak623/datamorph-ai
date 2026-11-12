# DataMorph AI 🪄📊
> **Turn user-uploaded datasets into interactive, AI-powered editorial websites and push them directly to GitHub.**

DataMorph AI is a full-stack platform inspired by *The Pudding* and *The New York Times* data journalism. It empowers anyone to upload a CSV, XLSX, or JSON dataset and immediately generates an independent, high-performance scrollytelling web application featuring data-first animated metrics, pinned scroll visualizations, deep-dive bento analytics, and an integrated, grounded AI chatbot.

Users can preview the generated website, download it as a self-contained ZIP, or publish it directly to their personal GitHub account as a brand new repository.

---

## 🌟 Key Features

1. **Instant Dataset Ingestion & Profiling**
   - Supports `.csv`, `.xlsx`, `.xls`, and `.json` files.
   - Computes statistical profiles (mean, median, standard deviations, distributions, outliers, Pearson correlations).
   - Calculates comprehensive Data Quality Score (missing values, duplicates, anomalies).

2. **Editorial Scrollytelling Generation**
   - **Data-First Hero**: Dynamic headline and giant animated metric counter.
   - **Pinned Scrollytelling**: Interactive pinned charts that morph as the user scrolls through analytical chapters.
   - **Bento Grid Insights**: Highlighting key category rankings, distributions, and outliers.
   - **Filterable Explorer**: Paginated data grid with search, sort, and column filters.

3. **Grounded AI Chatbot**
   - Zero-hallucination architecture: Natural language questions are translated into deterministic mathematical aggregations against the real dataset.
   - Explains trends, compares categories, and highlights anomalies with exact verified numbers.

4. **Independent GitHub Publishing & ZIP Export**
   - Pushes clean, standalone Next.js 14 source code into a new GitHub repository in the user's account using `@octokit/rest`.
   - Download as a self-contained ZIP ready to run locally with `npm install && npm run dev`.

5. **Modern, Responsive Tech Stack**
   - Next.js 14 (App Router, Server Actions, TypeScript)
   - Tailwind CSS, Framer Motion, Recharts, Lucide Icons
   - Dual Database: Zero-config local embedded store + PostgreSQL compatibility for Render deployment.

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- Node.js 18+ (Node.js 20+ or 24+ recommended)
- Git

### 2. Installation
```bash
# Clone the repository
git clone <your-repo-url>
cd dmw_and_ml

# Install dependencies
npm install

# Start the development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) in your browser.

---

## ⚙️ Configuration (.env.local)

Copy `.env.example` to `.env.local` to configure optional integrations:

```env
# Session Encryption Key
SESSION_SECRET=super_secret_session_encryption_key_min_32_characters

# GitHub Integration (Required for real GitHub OAuth login and pushing repos)
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret

# AI Grounding Key (Optional - built-in deterministic query engine operates without keys)
GEMINI_API_KEY=your_gemini_api_key

# Database (Optional - defaults to embedded zero-config store)
DATABASE_URL=
```

*Note: For local development without GitHub credentials, DataMorph includes a built-in "Simulated / Developer" session mode so you can test all upload, analysis, scrollytelling generation, and ZIP export features immediately!*

---

## 📦 Deployment to Render

DataMorph AI is fully compatible with Render:

1. Create a new **Web Service** on Render connected to your GitHub repository.
2. Select **Node** environment.
3. Build Command: `npm install && npm run build`
4. Start Command: `npm run start`
5. Configure Environment Variables (`SESSION_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, etc.).

---

## 📄 License
MIT License.
