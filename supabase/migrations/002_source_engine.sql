-- I'm Bored source-engine support tables
-- Prepared only. Do not run against production until the visual MVP verification gate passes.

create table if not exists public.source_events_raw (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  external_id text,
  source_url text,
  title_raw text,
  starts_at_raw text,
  payload jsonb not null default '{}'::jsonb,
  raw_fingerprint text not null,
  source_updated_at timestamptz,
  first_seen_at timestamptz not null default now(),
  last_seen_at timestamptz not null default now(),
  active_at_source boolean not null default true,
  unique(source_id, raw_fingerprint)
);

create index if not exists source_events_raw_source_idx on public.source_events_raw(source_id);
create index if not exists source_events_raw_external_idx on public.source_events_raw(source_id, external_id);
create index if not exists source_events_raw_last_seen_idx on public.source_events_raw(last_seen_at);

create table if not exists public.event_source_links (
  event_id uuid not null references public.events(id) on delete cascade,
  raw_event_id uuid not null references public.source_events_raw(id) on delete cascade,
  source_id uuid not null references public.sources(id) on delete cascade,
  match_score numeric(5,2) not null default 100 check (match_score between 0 and 100),
  match_reason text,
  authoritative boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key(event_id, raw_event_id)
);

create index if not exists event_source_links_source_idx on public.event_source_links(source_id);
create index if not exists event_source_links_event_idx on public.event_source_links(event_id);

create table if not exists public.adapter_runs (
  id uuid primary key default gen_random_uuid(),
  source_id uuid not null references public.sources(id) on delete cascade,
  run_started_at timestamptz not null default now(),
  run_finished_at timestamptz,
  status text not null default 'running' check (status in ('running','success','partial','failed')),
  fetched_count integer not null default 0,
  inserted_raw_count integer not null default 0,
  updated_raw_count integer not null default 0,
  normalized_count integer not null default 0,
  suppressed_count integer not null default 0,
  error_count integer not null default 0,
  message text,
  metadata jsonb not null default '{}'::jsonb
);

create index if not exists adapter_runs_source_started_idx on public.adapter_runs(source_id, run_started_at desc);
create index if not exists adapter_runs_status_idx on public.adapter_runs(status);

create table if not exists public.source_health (
  source_id uuid primary key references public.sources(id) on delete cascade,
  last_success_at timestamptz,
  last_failure_at timestamptz,
  consecutive_failures integer not null default 0,
  average_events_per_run numeric(10,2),
  last_event_count integer,
  last_latency_ms integer,
  health_status text not null default 'unknown' check (health_status in ('unknown','healthy','degraded','failing','paused')),
  notes text,
  updated_at timestamptz not null default now()
);

-- Extend source configuration without breaking migration 001.
alter table public.sources
  add column if not exists slug text,
  add column if not exists adapter_key text,
  add column if not exists terms_reviewed boolean not null default false,
  add column if not exists authoritative boolean not null default false,
  add column if not exists geographic_scope text,
  add column if not exists notes text;

create unique index if not exists sources_slug_uidx on public.sources(slug) where slug is not null;

-- Additional normalized provenance fields.
alter table public.events
  add column if not exists external_id text,
  add column if not exists source_updated_at timestamptz,
  add column if not exists verified_at timestamptz,
  add column if not exists dedupe_status text not null default 'clear' check (dedupe_status in ('clear','candidate','merged','conflict'));

-- Source-engine tables remain server-side only.
alter table public.source_events_raw enable row level security;
alter table public.event_source_links enable row level security;
alter table public.adapter_runs enable row level security;
alter table public.source_health enable row level security;

-- No anon/authenticated policies are granted for raw ingestion or health tables.
-- Server-side service-role/controlled workers are expected to manage them.
