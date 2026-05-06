# Stake Service

Simple QR-code-driven web app for logging service hours during a stake service event.

- **Public form** (`/`) — full-width, mobile-first multi-step form for unit, project, hours, story, photos, name.
- **Admin dashboard** (`/admin`) — password-gated metrics, charts, submissions table, photo previews.
- **CSV export** (`/api/admin/export`) — one-click download of all submissions.

## Stack

- Next.js (App Router) + TypeScript + Tailwind
- Supabase Postgres + Storage
- Recharts for graphs
- Deployed on Vercel

## Setup

### 1. Create Supabase project

1. Go to https://supabase.com → new project.
2. In the SQL editor, run:

```sql
create table public.submissions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  unit text not null,
  name text,
  hours numeric not null,
  project text not null,
  story text,
  photo_paths text[] not null default '{}'
);

create index on public.submissions (created_at desc);
create index on public.submissions (unit);
```

3. In **Storage**, create a bucket named `service-photos`, mark it **Public**.

### 2. Environment variables

Copy `.env.local.example` to `.env.local` and fill in:

```
NEXT_PUBLIC_SUPABASE_URL=...        # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=...   # anon public key
SUPABASE_SERVICE_ROLE_KEY=...       # service role (server only)
ADMIN_PASSWORD=...                  # any string — guards /admin
```

The service role key is used server-side only (insert + storage upload). The form bypasses RLS via the service client, so RLS can stay off for v1.

### 3. Run locally

```bash
npm install
npm run dev
```

- Public form: http://localhost:3000
- Admin: http://localhost:3000/admin

## Deploying

Push to GitHub, import into Vercel, set the four env vars from `.env.local.example`. After deploy, generate a QR code pointing at the URL (e.g. qr-code-generator.com) and put it on the flyer.

## Project layout

```
app/
  page.tsx                    public multi-step form
  admin/
    page.tsx                  dashboard
    charts.tsx                Recharts client component
    login/page.tsx            password screen
  api/
    submit/route.ts           form submission + photo upload
    admin/login/route.ts      sets admin cookie
    admin/export/route.ts     CSV export
lib/
  supabase.ts                 service + browser clients, types
  units.ts                    list of wards
proxy.ts                      guards /admin and /api/admin
```
