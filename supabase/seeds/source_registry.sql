-- I'm Bored first-wave source registry seed
-- Prepared only. Review URLs/terms before running.

insert into public.sources (name, slug, homepage_url, method, priority, active, refresh_minutes, reliability_score, adapter_key, authoritative, geographic_scope, notes)
values
  ('Ticketmaster Discovery API', 'ticketmaster', 'https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/', 'api', 1, true, 360, 98, 'ticketmaster_discovery_v2', true, 'Regional via coordinates', 'Official API. Requires server-side API key.'),
  ('Notre Dame Events', 'notre-dame-events', 'https://events.nd.edu/', 'structured_calendar', 1, true, 360, 95, 'notre_dame_events', true, 'Notre Dame / South Bend', 'Investigate explicit feed or structured data before rendered-page parsing.'),
  ('Visit South Bend Mishawaka', 'visit-south-bend-mishawaka', 'https://www.visitsouthbend.com/', 'structured_calendar', 1, true, 360, 85, 'visit_south_bend', false, 'St. Joseph County regional', 'Regional tourism aggregator. Preserve organizer attribution.'),
  ('South Bend Cubs / Four Winds Field', 'south-bend-cubs', 'https://www.milb.com/south-bend', 'public_page', 1, true, 360, 98, 'south_bend_cubs', true, 'South Bend', 'Official team source for games, promotions and ballpark special events.'),
  ('Elkhart Public Library', 'elkhart-public-library', 'https://www.myepl.org/events/', 'structured_calendar', 1, true, 720, 95, 'elkhart_public_library', true, 'Elkhart', 'Structured public event calendar with recurring-event support.')
on conflict (slug) do update set
  name = excluded.name,
  homepage_url = excluded.homepage_url,
  method = excluded.method,
  priority = excluded.priority,
  refresh_minutes = excluded.refresh_minutes,
  reliability_score = excluded.reliability_score,
  adapter_key = excluded.adapter_key,
  authoritative = excluded.authoritative,
  geographic_scope = excluded.geographic_scope,
  notes = excluded.notes,
  updated_at = now();
