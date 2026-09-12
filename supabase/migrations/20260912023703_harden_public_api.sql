-- Explicit Data API grants. RLS remains the row-level authority.
grant usage on schema public to anon, authenticated;
grant select on public.events, public.venues, public.places to anon, authenticated;
grant select, insert, update on public.profiles to authenticated;
grant select, insert, delete on public.saved_events to authenticated;
grant select, insert on public.event_submissions to authenticated;

-- Reduce duplicate saves and improve common discovery queries.
create index if not exists events_active_start_idx
  on public.events (start_time)
  where status = 'active';
create index if not exists events_city_category_idx
  on public.events (lower(city), category)
  where status = 'active';
create index if not exists places_active_city_category_idx
  on public.places (lower(city), category)
  where active = true;

-- Keep public submissions bounded before moderation.
alter table public.event_submissions
  drop constraint if exists event_submissions_title_length;
alter table public.event_submissions
  add constraint event_submissions_title_length check (char_length(title) between 3 and 140);
alter table public.event_submissions
  drop constraint if exists event_submissions_description_length;
alter table public.event_submissions
  add constraint event_submissions_description_length check (description is null or char_length(description) <= 2000);

-- Nearby events is intentionally public read-only discovery functionality.
grant execute on function public.nearby_events(double precision, double precision, double precision, timestamptz, timestamptz)
  to anon, authenticated;
