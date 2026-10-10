# VYBE — Premium Social Experience Platform
### Powered by Y Series

**VYBE** is a modern, responsive, production-ready social experience platform where friends create quizzes, discover who knows them best, collect anonymous answers, participate in This or That polls, and share scores to social media (WhatsApp, Instagram, Snapchat, X, and Telegram).

Backed by **Y Series**, VYBE is designed with a Gen-Z aesthetic, electric violet, vibrant pink, and cyan accents, dark/light theme support, and strict cybersecurity standards.

---

## ⚡ Core Features

1. **Know Your Friend Quiz**
   - 3 to 30 custom questions with multiple-choice options.
   - **Zero Client Leaks**: Correct answer keys are stored privately on the server and are NEVER sent to the browser in public quiz payloads.
   - Server-authoritative score calculation.
   - Dynamic results page with score badges ("Soulmate Tier 🏆", "Best Friend 💖", "Close Friend ⭐"), percentage breakdown, and celebratory confetti.
   - Real-time creator leaderboard and submissions dashboard.

2. **Anonymous Answers Box**
   - Dedicated question box supporting short-text answers.
   - **Mode A (Admin-Audited)**: Anonymous to the creator. Responders may optionally provide a name with explicit consent solely for platform safety investigations. Never visible to creators.
   - **Mode B (Full Anonymity)**: Anonymous to both the creator and the platform. Zero identity or device tracking retained.
   - Immediate delivery confirmation with unique reference tokens.

3. **This or That Polls**
   - Two choices, instant voting.
   - Duplicate vote prevention using idempotent voter references.
   - Real-time animated percentage bars and community vote counts.

4. **Creator Dashboard (`/dashboard`)**
   - **Overview**: Real metrics (total experiences, published counts, total responses, average quiz scores).
   - **My Experiences**: Filter by format (quizzes, anonymous, polls) and status (published, drafts, archived).
   - **Responses & Results**: Detailed submissions breakdown. Anonymity rules are strictly enforced: creator endpoints never expose anonymous responder identities.
   - **Settings & Profile**: Custom display name, username, and avatar URL.

5. **Platform Administration Console (`/admin`)**
   - **Server-Side Authorization**: Administrative routes and APIs verify permissions on the server. Never bypassable via client-side tampering.
   - **User Directory**: Search accounts, inspect roles, and suspend/reactivate violating users.
   - **Experience Moderation**: Review all published experiences, flag inappropriate items, or restore content.
   - **Anonymous Records**: Moderation view with clear privacy mode tagging. Any access to identity-bearing records is logged to the audit log.
   - **Safety Reports**: Review reports submitted by users (harassment, spam, inappropriate content) with status workflows (`New` -> `Under Review` -> `Action Taken` -> `Resolved`).
   - **Audit Trail**: Tamper-proof, append-only log recording actor, action, target record, and timestamps.
   - **Platform Configuration**: Manage feature availability flags and platform defaults.

6. **Social Sharing & Visual Result Cards**
   - Native Web Share API integration with automatic fallback to clipboard copy.
   - Pre-formatted sharing links for WhatsApp, Twitter/X, and Telegram.
   - Interactive result cards tailored for Instagram and mobile stories.

7. **Theme & Accessibility**
   - Full dark mode and light mode support with seamless toggle.
   - Accessible keyboard focus states, WCAG contrast ratios, and responsive mobile drawers.

---

## 🛠️ Technology Stack

- **Frontend**: React 19, TypeScript, Vite, Tailwind CSS v4, React Router v7, Lucide Icons, Canvas Confetti.
- **Backend**: Node.js, Express, RESTful APIs, Vite middleware development server (`server.ts`).
- **Database**: Supabase PostgreSQL with complete Row Level Security (RLS) migrations and seed data.
- **Authentication**: Clerk ready (with local role sandbox switcher for instant preview testing).
- **Security**: Server-authoritative scoring, private answer-key isolation, administrative audit logging, rate limiting, and input validation.

---

## 📂 Project Architecture

```
/
├── server.ts                    # Full-stack entry point (Express + Vite middlewares)
├── server/
│   ├── db.ts                    # Database abstraction (Supabase client + memory engine)
│   ├── auth.ts                  # Authentication and administrator authorization middleware
│   └── routes/
│       ├── experiences.ts       # Public experience browsing, single details, and creation
│       ├── submissions.ts       # Server-side score validation, anonymous responses, and poll voting
│       ├── dashboard.ts         # Creator dashboard APIs (strict identity filtering)
│       ├── admin.ts             # Protected administrative console endpoints
│       └── reports.ts           # Public safety reporting
├── supabase/
│   ├── migrations/
│   │   └── 20261010_initial_schema.sql # Complete PostgreSQL schema with RLS policies
│   └── seed.sql                 # Initial seed data for platform settings and profiles
├── src/
│   ├── config/brand.ts          # Centralized VYBE & Y Series branding configuration
│   ├── context/
│   │   ├── AuthContext.tsx      # Auth state & quick role switcher for preview
│   │   └── ThemeContext.tsx     # Dark / light theme management
│   ├── lib/api.ts               # Typed client API service
│   ├── components/
│   │   ├── layout/              # Navbar, Footer
│   │   └── common/              # ShareModal, ReportModal
│   ├── pages/
│   │   ├── public/              # Landing, Explore, Create, QuizPlay, AnonymousPlay, PollPlay, About, Legal
│   │   ├── dashboard/           # Creator Overview, Experiences, Responses, Settings
│   │   └── admin/               # Admin Overview, Users, Moderation, Submissions, Reports, Audit Logs
│   ├── App.tsx                  # Main router and route definitions
│   ├── main.tsx                 # React DOM root entry
│   └── index.css                # Tailwind styling and brand theme tokens
├── .env.example                 # Documented configuration variables
├── metadata.json                # AI Studio application metadata
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- Node.js >= 18
- npm or pnpm

### 1. Installation

```bash
npm install
```

### 2. Environment Configuration

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Key environment variables:
- `PUBLIC_APP_URL`: Your deployed URL (used in generated share links).
- `VITE_CLERK_PUBLISHABLE_KEY`: Clerk frontend publishable key (`pk_test_...`).
- `CLERK_SECRET_KEY`: Clerk backend secret key (`sk_test_...`).
- `VITE_SUPABASE_URL`: Supabase project URL (`https://xyz.supabase.co`).
- `VITE_SUPABASE_ANON_KEY`: Supabase anon key (`eyJ...`).
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (backend only).
- `ADMIN_USER_IDS`: Comma-separated list of Clerk User IDs granted super-admin rights.
- `ADMIN_SECRET_KEY`: Administrative secret token for backend authorization.

### 3. Run Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view VYBE.

---

## 🗄️ Supabase PostgreSQL Setup

1. Create a new project at [supabase.com](https://supabase.com).
2. Navigate to **SQL Editor**.
3. Run the migration file: `supabase/migrations/20261010_initial_schema.sql`.
4. Run the seed data file: `supabase/seed.sql`.
5. Retrieve your project URL and service keys from **Project Settings > API** and add them to your `.env` file.

---

## 🔐 Administrative Role Assignment

To grant administrator privileges to a user:
1. Copy the user's Clerk user identifier (e.g. `user_2vybe_superadmin`).
2. Add the identifier to `ADMIN_USER_IDS` in your `.env` or server environment:
   ```env
   ADMIN_USER_IDS="user_2vybe_superadmin,user_admin_vybe"
   ```
3. Alternatively, update the user's record in Supabase:
   ```sql
   UPDATE profiles SET role = 'admin' WHERE clerk_user_id = 'user_2vybe_superadmin';
   ```

*Note: In the development preview, you can use the top-right Role Switcher to toggle between Creator, Admin, and Visitor to inspect each experience.*

---

## 🛡️ Trust & Safety Philosophy

- **Zero Deanonymization**: We do not sell user data, track cross-site cookies, or fingerprint devices.
- **Reporting System**: Every published quiz, question box, and poll contains an integrated reporting flow for swift community safety actions.
- **Audit Logs**: Every administrative moderation action is recorded in `admin_audit_logs`.

---

© 2026 VYBE. Powered by Y Series.
