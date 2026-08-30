-- I'm Bored initial database schema
-- Design target: Supabase Postgres + PostGIS
-- Do not run against production until reviewed.

create extension if not exists postgis with schema extensions;

create table if not exists public.sources (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  homepage_url text,
  method text not null check (method in ('api','structured_calendar','feed','public_page','submission')),
  priority smallint not null default 2 check (priority between 1 and 3),
  active boolean not null default true,
  refresh_minutes integer,
  reliability_score numeric(5,2) not null default 80 check (reliability_score between 0 and 100),
  last_checked timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.venues (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  address text,
  city text,
  state text,
  zip text,
  location extensions.geography(point,4326),
  website_url text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists venues_location_gix on public.venues using gist(location);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  canonical_key text unique,
  title text not null,
  description text,
  category text,
  subcategory text,
  tags text[] not null default '{}',
  start_time timestamptz not null,
  end_time timestamptz,
  timezone text not null default 'America/Indiana/Indianapolis',
  venue_id uuid references public.venues(id) on delete set null,
  venue_name text,
  address text,
  city text,
  state text,
  zip text,
  location extensions.geography(point,4326),
  price_min numeric(10,2),
  price_max numeric(10,2),
  is_free boolean not null default false,
  family_friendly boolean,
  age_min smallint,
  age_max smallint,
  indoor_outdoor text check (indoor_outdoor in ('indoor','outdoor','mixed','unknown')) default 'unknown',
  accessibility jsonb not null default '{}'::jsonb,
  image_url text,
  ticket_url text,
  source_url text,
  source_id uuid references public.sources(id) on delete set null,
  source_name text,
  source_method text,
  status text not null default 'active' check (status in ('draft','active','cancelled','postponed','expired','hidden')),
  confidence_score numeric(5,2) not null default 70 check (confidence_score between 0 and 100),
  duplicate_group text,
  last_checked timestamptz,
  source_payload jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists events_location_gix on public.events using gist(location);
create index if not exists events_start_time_idx on public.events(start_time);
create index if not exists events_status_idx on public.events(status);
create index if not exists events_category_idx on public.events(category);
create index if not exists events_source_idx on public.events(source_id);

create table if not exists public.places (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  category text,
  tags text[] not null default '{}',
  address text,
  city text,
  state text,
  zip text,
  location extensions.geography(point,4326),
  regular_hours jsonb not null default '{}'::jsonb,
  temporary_hours jsonb not null default '{}'::jsonb,
  admission jsonb not null default '{}'::jsonb,
  typical_visit_minutes integer,
  website_url text,
  image_url text,
  source_id uuid references public.sources(id) on delete set null,
  confidence_score numeric(5,2) not null default 70 check (confidence_score between 0 and 100),
  last_checked timestamptz,
  active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists places_location_gix on public.places using gist(location);

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  home_zip text,
  default_radius_miles integer not null default 30 check (default_radius_miles in (5,10,15,30)),
  interests text[] not null default '{}',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.saved_events (
  user_id uuid not null references auth.users(id) on delete cascade,
  event_id uuid not null references public.events(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(user_id,event_id)
);

create table if not exists public.event_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid references auth.users(id) on delete set null,
  title text not null,
  description text,
  start_time timestamptz not null,
  end_time timestamptz,
  venue_name text,
  address text,
  city text,
  state text,
  zip text,
  price_text text,
  source_url text,
  contact_email text,
  status text not null default 'pending' check (status in ('pending','approved','rejected')),
  created_at timestamptz not null default now(),
  reviewed_at timestamptz
);

alter table public.sources enable row level security;
alter table public.venues enable row level security;
alter table public.events enable row level security;
alter table public.places enable row level security;
alter table public.profiles enable row level security;
alter table public.saved_events enable row level security;
alter table public.event_submissions enable row level security;

-- Public discovery data is readable by visitors.
create policy "public can read active events" on public.events for select to anon, authenticated using (status = 'active');
create policy "public can read venues" on public.venues for select to anon, authenticated using (true);
create policy "public can read active places" on public.places for select to anon, authenticated using (active = true);

-- User-owned records.
create policy "users read own profile" on public.profiles for select to authenticated using ((select auth.uid()) = id);
create policy "users update own profile" on public.profiles for update to authenticated using ((select auth.uid()) = id) with check ((select auth.uid()) = id);
create policy "users insert own profile" on public.profiles for insert to authenticated with check ((select auth.uid()) = id);

create policy "users read own saves" on public.saved_events for select to authenticated using ((select auth.uid()) = user_id);
create policy "users create own saves" on public.saved_events for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "users delete own saves" on public.saved_events for delete to authenticated using ((select auth.uid()) = user_id);

create policy "users submit events" on public.event_submissions for insert to authenticated with check ((select auth.uid()) = submitted_by);
create policy "users read own submissions" on public.event_submissions for select to authenticated using ((select auth.uid()) = submitted_by);

-- Sources and moderation remain server-side only by default. No anon/authenticated write policy is granted.

create or replace function public.nearby_events(
  user_lat double precision,
  user_lng double precision,
  radius_miles double precision default 30,
  from_time timestamptz default now(),
  to_time timestamptz default now() + interval '7 days'
)
returns table (
  id uuid,
  title text,
  category text,
  start_time timestamptz,
  venue_name text,
  is_free boolean,
  confidence_score numeric,
  distance_miles double precision
)
set search_path = ''
language sql
stable
as $$
  select
    e.id,
    e.title,
    e.category,
    e.start_time,
    e.venue_name,
    e.is_free,
    e.confidence_score,
    extensions.st_distance(
      e.location,
      extensions.st_point(user_lng,user_lat)::extensions.geography
    ) / 1609.344 as distance_miles
  from public.events e
  where e.status = 'active'
    and e.location is not null
    and e.start_time between from_time and to_time
    and extensions.st_dwithin(
      e.location,
      extensions.st_point(user_lng,user_lat)::extensions.geography,
      radius_miles * 1609.344
    )
  order by e.location operator(extensions.<->) extensions.st_point(user_lng,user_lat)::extensions.geography;
$$;
