-- Sign-ups for the Summer of Service Carnival (Hillcrest 2nd Ward, Aug 15).
-- One row per volunteer per booth. Open sign-up: no capacity limits.

create table if not exists public.carnival_signups (
  id uuid primary key,
  created_at timestamptz not null default now(),
  booth text not null,
  name text not null,
  phone text not null,
  cookie_count int,
  own_prizes boolean not null default false,
  notes text
);
create index if not exists carnival_signups_created_at_idx on public.carnival_signups (created_at desc);
create index if not exists carnival_signups_booth_idx on public.carnival_signups (booth);

-- Kody Johnson already volunteered for the popcorn machine.
insert into public.carnival_signups (id, booth, name, phone)
values (gen_random_uuid(), 'popcorn', 'Kody Johnson', '');

grant all on public.carnival_signups to anon, authenticated, service_role;
