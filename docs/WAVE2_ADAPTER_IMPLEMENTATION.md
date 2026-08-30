# Wave 2 Adapter Implementation

Status: implementation branch
Branch: wave2-adapters
Launch region: 30 miles around 46637

## First adapter set

### City of Mishawaka
- Source: official City Calendar
- Current public calendar exposes event title, date/time, venue/address, description, featured status, and event detail links.
- Adapter class: structured calendar / HTML.
- Priority: P0.
- Filtering rule: ingest public activities, markets, concerts, festivals, recreation and community events. Civic meetings may be retained but ranked below leisure events.

### Downtown South Bend
- Source: official Downtown South Bend event programming pages.
- Current 2026 programming exposes event title, date/time, venue, description and ticket/registration indicators.
- Adapter class: curated structured HTML.
- Priority: P0.

### City of Buchanan
- Source: official city calendar.
- Calendar exposes dated community, theater, concert, civic and seasonal events.
- Adapter class: structured calendar / HTML.
- Priority: P1.
- Filtering rule: retain public leisure/community events; de-prioritize routine administrative meetings and service reminders.

### Niles Main Street Association
- Source: official NMSA event calendar.
- Adapter class: calendar / event detail / ICS where stable.
- Priority: P1.

## Shared quality requirements
- Preserve source URL and source name for every event.
- Normalize all timestamps to America/Indiana/Indianapolis while retaining source-local semantics.
- Capture venue and address when supplied.
- Preserve free/paid/ticket-required signals when supplied.
- Preserve cancellation/postponement state.
- Generate deterministic source event IDs.
- Run duplicate scoring against existing canonical candidates.
- Never silently merge below the existing 0.90 auto-merge threshold.
- Do not write production canonical events until the source-quality gate passes.

## Fixture plan
Each source gets fixtures for:
1. normal timed event,
2. all-day event when supported,
3. event with venue/address,
4. ticketed or registration event when supported,
5. recurring event when supported,
6. cancellation/postponement when observable,
7. non-leisure civic/admin item to verify ranking/filter classification.

## Live dry-run gate
For each adapter:
- HTTP/source reachable,
- parser produces events from a current live page,
- 100% non-empty titles,
- 100% valid dates for emitted events,
- 100% provenance links,
- >=95% venue/location capture when source supplies it,
- deterministic unique IDs,
- no unhandled parser errors,
- duplicate test against Wave 1 and other Wave 2 sources.

## Activation order
1. Mishawaka
2. Downtown South Bend
3. Buchanan
4. Niles Main Street
5. remaining Wave 2 qualified sources

This branch is intentionally separate from the production visual build and production canonical-event writes.