# Floor Runner

CNC machine shop job tracking and scheduling SaaS.

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Supabase (PostgreSQL + Auth + Realtime)
- **Styling**: Tailwind CSS
- **Drag & Drop**: @dnd-kit
- **Auth**: Supabase Auth

## Features

- **Job Board**: Kanban-style drag-and-drop board (Quoting → Scheduled → In Progress → Complete)
- **Job Tracking**: Per-job operations, notes, and photo uploads
- **Machine Management**: Track machine status and assign to operations
- **Team Management**: Invite operators, manage roles
- **Customer Portal**: Shareable magic-link portal for customers to track job progress
- **Auth**: Email/password + magic link + OAuth (GitHub)

## Setup

### 1. Clone and install

```bash
npm install
```

### 2. Supabase

Create a project at [supabase.com](https://supabase.com), then:

```bash
# Apply the schema (using Supabase CLI or the SQL editor at supabase.com)
npx supabase db push
# or paste the contents of supabase/migrations/001_initial_schema.sql
```

### 3. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Run

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Key Routes

| Route | Description |
|---|---|
| `/auth/login` | Login |
| `/auth/signup` | Create account |
| `/board` | Kanban job board |
| `/jobs/[id]` | Job detail + operations |
| `/machines` | Machine management |
| `/team` | Team management |
| `/settings` | Shop settings |
| `/portal/[code]` | Customer portal (no auth required) |

## Supabase Schema

10 tables: `shops`, `users`, `machines`, `customers`, `jobs`, `job_operations`, `operation_time_entries`, `job_notes`, `job_photos`, `portal_codes`.

Row Level Security (RLS) is enabled on all tables. Service Role key bypasses RLS — use it only in server-side contexts.
