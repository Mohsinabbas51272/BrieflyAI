# BrieflyAI – AI Summary Hub

A modern, production-ready AI SaaS application built with **React, TypeScript, Vite, Tailwind CSS, NestJS, PostgreSQL, Prisma, Google Gemini, and OpenAI**.

BrieflyAI distills long articles, complex YouTube video keynotes, and dense PDF documents into structured executive intelligence: **5 high-impact key points, concise overview, strategic insights, and actionable next steps**.

---

## 🌟 Tech Stack

- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, Lucide Icons, Canvas Confetti.
- **Backend:** NestJS 10, REST APIs, Passport JWT, Class Validator, Cheerio, Multer, PDF-Parse, YouTube-Transcript.
- **Database & ORM:** PostgreSQL with Prisma ORM.
- **AI Integrations:** Google Gemini API (`gemini-1.5-flash`, `gemini-1.5-pro`), OpenAI API (`gpt-4o-mini`, `gpt-4o`), and high-performance built-in NLP statistical summarization engine.

---

## 🚀 Core Features

1. **Website & Article Summarization:**
   - Real-time web scraping with DOM noise reduction (removes ads, headers, tracking scripts, navigation).
   - Extracts structured 5 key points, executive overview, reading time, and domain category.

2. **YouTube Video Summarization:**
   - Parses video ID from any YouTube URL format (`watch?v=`, `youtu.be/`, `/shorts/`).
   - Fetches video metadata via oEmbed and closed-caption transcripts.

3. **PDF Document Summarization:**
   - Multipart file upload with binary PDF parser (`pdf-parse`).
   - Handles multi-page documents, whitepapers, and reports with page-count analytics.

4. **Structured Summary Architecture:**
   - **5 Key Takeaway Points:** Numbered cards presenting the core thesis points.
   - **Executive Overview:** Concise synthesis paragraph.
   - **Important Strategic Insights:** Non-obvious implications and second-order effects.
   - **Action Items Checklist:** Direct next steps for teams and individuals.
   - **Export Options:** Copy to clipboard (Markdown), Export `.md`, Export `.json`, and print.

5. **Authentication & Multi-Tenant Dashboard:**
   - Secure JWT authentication with bcrypt password hashing.
   - 1-Click Demo Persona Switcher (Free User, Pro User, Admin).
   - Real-time daily quota tracker (Free: 5/day; Pro: Unlimited).

6. **History & Search Library:**
   - Full-text search across titles, overview content, and topics.
   - Source type filters (`ALL`, `URL`, `YOUTUBE`, `PDF`) and favorites toggle.
   - Fullscreen interactive modal viewer and deletion management.

7. **Subscriptions & Pricing:**
   - **Starter Free Plan ($0/forever):** 5 summaries/day, standard length.
   - **BrieflyAI Pro ($19/month):** Unlimited summaries, priority AI models, custom tone/depth, and export features.
   - Live 1-click upgrade simulation with celebration animations.

8. **Admin Dashboard & Usage Analytics:**
   - KPI metrics: Total Users, Total Summaries, Conversion Rate, AI Tokens Processed.
   - Visual breakdown bar by source type.
   - User management table with live role (`USER`/`ADMIN`) and plan (`FREE`/`PRO`) toggles.

9. **Bring Your Own Keys (BYO-AI):**
   - Users can configure their personal Google Gemini or OpenAI API keys directly in the Settings tab.

---

## ⚡ Quick Start & Running Locally

### 1. Prerequisites
- Node.js 18+ (tested on Node 20)
- PostgreSQL (running on `localhost:5432`)

### 2. Backend Setup
```bash
cd backend
npm install
npx prisma db push
npx ts-node prisma/seed.ts
npm run start:dev
```
Backend will start on: `http://localhost:3000/api`

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
Frontend will be live on: `http://localhost:5173`

---

## 👥 Seeded Demo Accounts (1-Click Login in UI)

| Persona | Email | Password | Role | Plan |
|---|---|---|---|---|
| **Free User** | `demo@brieflyai.com` | `DemoPass123!` | `USER` | `FREE` (5/day) |
| **Pro User** | `pro@brieflyai.com` | `ProPass123!` | `USER` | `PRO` (Unlimited) |
| **Admin User** | `admin@brieflyai.com` | `AdminPass123!` | `ADMIN` | `PRO` (Full Control) |

---

## 📡 API Overview

- `POST /api/auth/register` - Create new user
- `POST /api/auth/login` - Authenticate & get JWT token
- `GET /api/auth/me` - Current user profile & quotas
- `PUT /api/auth/keys` - Update user's personal Gemini / OpenAI keys
- `POST /api/summarize/url` - Scrape & summarize webpage
- `POST /api/summarize/youtube` - Extract transcript & summarize video
- `POST /api/summarize/pdf` - Multipart upload & summarize PDF
- `GET /api/history` - List, search & filter summaries
- `GET /api/history/:id` - Get specific summary
- `PATCH /api/history/:id/favorite` - Toggle favorite
- `DELETE /api/history/:id` - Delete summary
- `GET /api/subscription/status` - Quota & plan status
- `POST /api/subscription/upgrade` - Upgrade to Pro
- `POST /api/subscription/downgrade` - Downgrade to Free
- `GET /api/admin/metrics` - Admin platform metrics
- `GET /api/admin/users` - Admin user list & management
- `PATCH /api/admin/users/:id/plan` - Admin change user plan
- `PATCH /api/admin/users/:id/role` - Admin change user role
