-- Baseline schema for the Stake Service app.
-- Reconstructed from the production project (ykgnpttzlfxydkoulfsa): the existing
-- submissions/events/opportunities tables and the public service-photos storage bucket.
-- RLS is intentionally left OFF — all writes go through the service-role client.

create table if not exists public.submissions (
  id uuid primary key,
  created_at timestamptz not null default now(),
  unit text not null,
  name text,
  hours numeric not null,
  project text not null,
  story text,
  photo_paths text[] not null default '{}'
);
create index if not exists submissions_created_at_idx on public.submissions (created_at desc);
create index if not exists submissions_unit_idx on public.submissions (unit);

create table if not exists public.events (
  id uuid primary key,
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  location text,
  starts_at timestamptz not null,
  ends_at timestamptz,
  unit text
);
create index if not exists events_starts_at_idx on public.events (starts_at);

create table if not exists public.opportunities (
  id uuid primary key,
  created_at timestamptz not null default now(),
  title text not null,
  description text,
  contact_name text,
  contact_info text,
  availability text,
  location text
);
create index if not exists opportunities_created_at_idx on public.opportunities (created_at desc);

-- Public bucket for service photos (matches PHOTOS_BUCKET in lib/supabase.ts).
insert into storage.buckets (id, name, public)
values ('service-photos', 'service-photos', true)
on conflict (id) do nothing;

-- Grant the API roles access (matches Supabase's default table privileges).
grant all on public.submissions to anon, authenticated, service_role;
grant all on public.events to anon, authenticated, service_role;
grant all on public.opportunities to anon, authenticated, service_role;
