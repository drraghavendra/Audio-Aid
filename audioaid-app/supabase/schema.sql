-- AudioAid — run in Supabase SQL Editor

create table if not exists public.eq_profiles (
  id bigserial primary key,
  name text not null,
  gains jsonb not null,
  created_at timestamptz not null default now()
);

create table if not exists public.hearing_tests (
  id uuid primary key default gen_random_uuid(),
  display_name text,
  thresholds jsonb not null,
  compensation_gains jsonb not null,
  created_at timestamptz not null default now()
);

alter table public.eq_profiles enable row level security;
alter table public.hearing_tests enable row level security;

-- Service role (Express backend) bypasses RLS. Add policies when using anon from browser.