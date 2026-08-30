# Wave 2 Source Validation Registry

Status: discovery and adapter qualification. No production promotion until quality gates pass.

## Priority sources

1. City of Mishawaka City Calendar
   - URL: https://mishawaka.in.gov/things-to-do/city-calendar/
   - Observed: active structured calendar, 42 events found on 2026-08-30.
   - Candidate method: structured HTML / calendar event detail pages.
   - Priority: P0.

2. Downtown South Bend
   - URL: https://www.downtownsouthbend.com/celebrate-summer
   - Observed: detailed seasonal event listings with dates, times, venues and descriptions.
   - Candidate method: structured HTML plus individual event pages where available.
   - Priority: P0.

3. Visit South Bend Mishawaka
   - URL: https://www.visitsouthbend.com/events/
   - Observed: regional event aggregator; listings are JS-backed in parts of the site. Annual/event editorial pages expose usable event information.
   - Candidate method: endpoint discovery / permitted structured data. Do not rely on brittle DOM scraping.
   - Priority: P0, conditional.

4. City of Buchanan
   - URL: https://www.cityofbuchanan.com/calendar
   - Observed: structured monthly calendar with community events, concerts, theater, civic events and all-day entries.
   - Candidate method: structured HTML/calendar detail pages.
   - Priority: P1.

5. Niles Main Street Association
   - URL: https://www.niles.org/nmsa-calendar-of-events
   - Observed: dated event listings with times, venues, ticket information and Google Calendar ICS links.
   - Candidate method: structured HTML and/or ICS where permitted.
   - Priority: P1.

6. Buchanan Area Chamber of Commerce
   - URL: https://buchananareachamber.com/events
   - Observed: dated event pages with time, venue/map and Google Calendar ICS links.
   - Candidate method: structured HTML and/or ICS where permitted.
   - Priority: P1.

7. South Bend Regional Chamber
   - URL: https://web.sbrchamber.com/events/eventresults.aspx
   - Observed: recurring event lister with dates and categories.
   - Candidate method: structured HTML/detail pages.
   - Priority: P2 because some listings are member/business focused rather than general entertainment.

8. Michiana Renaissance Festival
   - URL: https://www.michianarenfest.com/
   - Observed: annual public festival with explicit dates, hours, location and ticket prices.
   - Candidate method: seasonal/annual source adapter.
   - Priority: P2. Low frequency, high local relevance.

## Promotion gates

Each source must preserve provenance and pass:
- HTTP/source availability checks
- title capture
- valid local date/time handling
- venue/location capture when supplied
- stable canonical source URL
- cancellation/update handling where exposed
- duplicate comparison against canonical events
- parser regression fixture
- live dry-run
- source-quality validation
- policy/terms review

## Expansion policy

Proceed through waves without per-wave approval. Favor coverage diversity over raw source count. Maintain a balanced mix of family, adult, arts, sports, food, community, nightlife, education, outdoors and free events. A source can remain discovery-only if it is useful for finding events but not suitable for automated ingestion.
