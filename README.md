# Stake Service

Simple QR-code-driven web app for logging service hours during a stake service event.

- **Public form** (`/`) — full-width, mobile-first multi-step form for unit, project, hours, story, photos, name.
- **Admin dashboard** (`/admin`) — password-gated metrics, charts, submissions table, photo previews.
- **CSV export** (`/api/admin/export`) — one-click download of all submissions.
- **Carnival sign-ups** (`/carnival`) — booth volunteer sign-up for the Summer of Service Carnival; admin view at `/admin/carnival`.

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

## Local Supabase (recommended for development)

To develop without touching the production database, run a full local Supabase stack.
It uses Docker; on macOS [Colima](https://github.com/abiosoft/colima) is a lightweight,
headless alternative to Docker Desktop:

```bash
brew install colima docker            # container runtime + docker CLI
brew install supabase/tap/supabase    # Supabase CLI
colima start --cpu 4 --memory 6       # boot the Docker VM
supabase start                        # boot Postgres/Studio/Storage locally
```

The schema lives in `supabase/migrations/` (applied automatically by `supabase start` /
`supabase db reset`). `supabase start` prints local URLs and keys — put them in
`.env.local` (keep production keys in a gitignored `.env.prod.local`):

```
NEXT_PUBLIC_SUPABASE_URL=http://127.0.0.1:54321
NEXT_PUBLIC_SUPABASE_ANON_KEY=<local anon key>
SUPABASE_SERVICE_ROLE_KEY=<local service_role key>
```

- Local Studio: http://127.0.0.1:54323
- To copy production **row data** into local (uses the service key from `.env.prod.local`):
  `node scripts/pull-prod-data.mjs`. Storage photo files are not copied.
- `analytics` is disabled in `supabase/config.toml` because its log collector can't
  bind-mount the Docker socket under Colima.

## Database schema changes

Schema is version-controlled as migrations. Add one with:

```bash
supabase migration new <name>   # writes supabase/migrations/<ts>_<name>.sql
supabase db reset               # re-applies all migrations locally
```

New tables need `grant all on public.<table> to anon, authenticated, service_role;` so the
API roles can read/write them (see the existing migrations). To apply pending migrations to
production later: `supabase link --project-ref <ref>` then `supabase db push`.

## Deploying

Push to GitHub, import into Vercel, set the four production env vars (from
`.env.prod.local`). After deploy, generate a QR code pointing at the URL (e.g.
qr-code-generator.com) and put it on the flyer.

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
  carnival/page.tsx           public booth sign-up (Summer of Service Carnival)
  admin/carnival/page.tsx     admin view of booth sign-ups
  api/carnival/route.ts       sign-up submission
lib/
  supabase.ts                 service + browser clients, types
  units.ts                    list of wards
  carnival.ts                 carnival event + booth definitions
proxy.ts                      guards /admin and /api/admin
supabase/
  migrations/                 version-controlled schema
  config.toml                 local stack config
scripts/
  pull-prod-data.mjs          copy prod row data into local Supabase
```
