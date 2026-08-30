# Wave 2 Execution Gate

Standing approval: continue source expansion without per-wave approval. Do not write unvalidated events to production.

## Priority live sources
1. City of Mishawaka calendar
2. Downtown South Bend events
3. City of Buchanan calendar
4. Niles Main Street events

## Required adapter behavior
- Normalize title, start/end time, venue, address, description, source URL, ticket URL, category, status.
- Preserve provenance for every event.
- Generate deterministic source IDs.
- Detect recurring events and avoid duplicate instances.
- Detect cancellation/postponement when source exposes it.
- Filter routine government/service entries from consumer discovery unless explicitly useful.
- Apply 30-mile launch-region eligibility around 46637.

## Validation gate
A source cannot be production-promoted until:
- live endpoint/page returns successfully;
- parser fixtures pass;
- live dry-run yields valid normalized records;
- valid dates = 100%;
- provenance links = 100%;
- deterministic IDs = 100%;
- venue/location >=95% when source supplies it;
- duplicate behavior tested;
- cancellation behavior tested where available;
- source policy/terms reviewed;
- no production Supabase writes during verification.

## Current observations
- Mishawaka exposes a rich list/month calendar with current events, times, venues and addresses. Consumer filtering is required because civic meetings are mixed with entertainment/community events.
- Downtown South Bend exposes a broad seasonal event list with dates, times, venues and descriptions.
- Buchanan exposes community entertainment alongside government/service calendar items, so consumer filtering is required.
- Niles remains queued for adapter validation.

## Final audit
After all feasible waves are implemented, run one consolidated audit covering source count, geographic/category balance, parser health, duplicate rate, stale/expired events, cancellation accuracy, provenance, mobile app integration readiness, security/dependencies, and production promotion status.