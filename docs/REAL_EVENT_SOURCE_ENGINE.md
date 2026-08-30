# I'm Bored — Real Event Source Engine

## Goal

Build a trustworthy hyperlocal event inventory for the launch market around ZIP 46637, filtered by actual event coordinates rather than city boundaries. The engine should answer: **What can I do near me right now?**

This document separates verified source capabilities from planned ingestion work. No paid API is required for the first wave.

## Launch rules

- Launch anchor: ZIP 46637
- Default radius: 30 miles
- User-selectable radius target: 5 / 10 / 15 / 30 miles
- Store every event with latitude/longitude and source attribution
- Filter on coordinates at query time
- Prefer authoritative organizer/venue sources over aggregators
- Preserve source URL and last-checked timestamp
- Never publish a stale or cancelled event as active when the authoritative source says otherwise

## Ingestion classes

### A — Official API
Machine-readable provider API with documented access and terms.

### B — Public calendar/feed
Public ICS, RSS, Google Calendar, or other explicit feed. Use incremental sync when supported.

### C — Structured event calendar
Public event pages with predictable event records suitable for a source-specific adapter. Investigate JSON-LD/embedded structured data before parsing rendered text.

### D — Curated public page
Authoritative public page with useful event data but less regular structure. Use only where technically and legally appropriate.

### E — First-party submission
Organizer/community submission into I'm Bored with moderation and verification.

## Confidence policy

Suggested starting confidence values before cross-source corroboration:

- 98 — official API or authoritative venue calendar
- 95 — authoritative city/university/library calendar
- 90 — organizer-submitted verified listing
- 85 — regional tourism/calendar source
- 75 — reputable secondary aggregator
- below 70 — hold for verification before prominent recommendation

Corroborating independent sources may raise confidence. A contradiction from an authoritative source lowers confidence and may suppress the listing.

## Refresh policy

- Event occurring within 24 hours: recheck every 2–4 hours
- Event occurring within 7 days: recheck every 6–12 hours
- Event occurring 8–30 days out: recheck daily
- Event more than 30 days out: recheck every 2–3 days
- Source with explicit incremental sync token: use incremental sync when possible
- Expired events: mark ended, do not delete immediately

## First-wave source registry

| Priority | Source | Coverage / value | Verified current evidence | Ingestion class | Initial refresh | Status |
|---|---|---|---|---|---|---|
| P0 | Ticketmaster Discovery API | Major concerts, sports, comedy, performances | Official Discovery API supports event search by location/date and 230K+ events, default 5,000 calls/day | A | 6h near-term / daily future | READY FOR API KEY |
| P0 | Notre Dame Events | Very high local volume: arts, films, lectures, campus events, major stadium events | Public event calendar currently exposes title, date/time, location, categories and upcoming records | C, investigate feed first | 6h | READY FOR ADAPTER RESEARCH |
| P0 | Visit South Bend Mishawaka | Broad regional tourism/community event inventory | Current site exposes featured events with dates, venue/address and event status | C/D | 6h | READY FOR ADAPTER RESEARCH |
| P0 | South Bend Cubs / Four Winds Field | Baseball plus promotions and non-game events | Official MiLB pages expose season schedule, promotions and separate upcoming-event listings | C/D | 6h in season | READY FOR ADAPTER RESEARCH |
| P0 | Elkhart Public Library | High-volume free/community/family events | Current public calendar exposes event search, list/month/day views, recurring events, title/time/venue | C, likely calendar plugin structure | 12h | READY FOR ADAPTER RESEARCH |
| P1 | Downtown South Bend | Downtown festivals, First Fridays, concerts and local activities | Previously verified as active local event source; exact feed method still unverified | C/D | 12h | METHOD TO VERIFY |
| P1 | South Bend Venues Parks & Arts | Parks, concerts, recreation and public programming | Previously verified as active public programming source; exact machine-readable method still unverified | C/D | 12h | METHOD TO VERIFY |
| P1 | St. Joseph County Public Library | Free/community programming across branches | Known high-value local calendar; exact feed method still unverified in this audit pass | C | 12h | METHOD TO VERIFY |
| P1 | City of Mishawaka | City/community/parks events | Previously verified structured city calendar; exact feed method still unverified | C | 12h | METHOD TO VERIFY |
| P1 | Mishawaka-Penn-Harris Public Library | Library/community programming | High-value local library source; exact calendar method still unverified | C | 12h | METHOD TO VERIFY |
| P1 | Morris Performing Arts Center | Major performing arts and shows | Previously verified public upcoming-events calendar | C | 6h | METHOD TO VERIFY |
| P1 | Potawatomi Zoo | Family, seasonal and special events | Previously verified public zoo event calendar | C | 12h | METHOD TO VERIFY |
| P1 | Visit Elkhart County | Regional tourism/community events | High regional coverage candidate; exact method to verify | C/D | 12h | METHOD TO VERIFY |
| P1 | The Lerner Theatre | Elkhart performances and entertainment | High-value venue calendar candidate; exact method to verify | C | 6h | METHOD TO VERIFY |
| P1 | Wellfield Botanic Gardens | Family, nature, seasonal experiences | High-value attraction calendar candidate; exact method to verify | C | 12h | METHOD TO VERIFY |
| P1 | Niles District Library | Free/community events north of state line | High-value local calendar candidate; exact method to verify | C | 12h | METHOD TO VERIFY |
| P2 | DeBartolo Performing Arts Center | Arts/film/performance | Many events already appear through Notre Dame Events, so ingesting separately risks duplicates | C | 6h | DEFER UNTIL ND DEDUPE TEST |
| P2 | Raclin Murphy Museum of Art | Arts/exhibitions | Many records can appear through Notre Dame Events | C | 12h | DEFER UNTIL ND DEDUPE TEST |
| P2 | Notre Dame Athletics | Sports | Useful but should be separated from general ND events if official schedule source is better | A/C | 6h game week | METHOD TO VERIFY |
| P2 | Century Center | Conventions, expos, community events | Venue source useful for events not captured elsewhere | C/D | 12h | METHOD TO VERIFY |
| P2 | Indiana University South Bend | College/community/arts | Supplemental coverage | C | daily | METHOD TO VERIFY |
| P2 | Saint Mary's College | College/arts/community | Supplemental coverage | C | daily | METHOD TO VERIFY |
| P2 | City of Niles / Niles Main Street | Festivals/community events | Supplemental southwest-Michigan coverage | C/D | 12h | METHOD TO VERIFY |
| P2 | City of Buchanan / Buchanan Common | Concerts/community/festivals | Supplemental southwest-Michigan coverage | C/D | 12h | METHOD TO VERIFY |
| P2 | Local organizer submissions | Long-tail churches, schools, bars, restaurants, nonprofits, pop-ups | First-party path avoids dependence on scraping every small source | E | immediate moderation | BUILD AFTER MVP VISUAL GATE |

## API facts verified for implementation

### Ticketmaster Discovery API

Use as the first official API adapter.

Capabilities verified from official documentation:

- event, venue and attraction search
- geographic/location filtering
- date filtering
- event details including venue/location and ticket URL
- default quota: 5,000 calls/day
- default rate limit: 5 requests/second
- content may include Ticketmaster, Universe, FrontGate Tickets and Ticketmaster Resale sources

Do not expose the API key in browser code. Call Ticketmaster from a server-side function/worker.

### Google Calendar API

Google Calendar is useful **only when we have a known public calendar ID or explicit calendar connection**. It is not a general “all public events near a ZIP code” API.

Verified capabilities:

- list events from a specified calendar
- timeMin / timeMax filtering
- expand recurring events using singleEvents
- order by start time
- incremental synchronization using nextSyncToken
- public-readonly authorization scope exists

Therefore, if a local organization publishes a Google Calendar, we can use its calendar ID as a clean B-class adapter. We should not treat Google Calendar API as a regional discovery source by itself.

## Normalization contract

Every adapter should output the same normalized payload before database write:

- source_id
- external_id
- source_name
- source_url
- source_method
- title
- description
- start_time
- end_time
- timezone
- venue_name
- address
- city
- state
- zip
- latitude
- longitude
- category
- subcategory
- tags
- price_min
- price_max
- is_free
- age_min
- age_max
- family_friendly
- indoor_outdoor
- accessibility
- image_url
- ticket_url
- status
- source_updated_at
- last_checked_at
- raw_fingerprint

Adapters may leave unknown fields null. They should not invent values.

## Deduplication v1

Create a canonical candidate score using:

1. normalized title similarity
2. start-time proximity
3. venue-name similarity
4. geographic distance between coordinates
5. organizer/source relationship

Suggested rules:

- Same authoritative external ID: exact match
- Same title family + same venue + start within 90 minutes: likely duplicate
- Same coordinates + highly similar title + same calendar date: likely duplicate
- Parent/child listings such as a festival and an individual performance must not be merged automatically

Keep all source records. Merge only presentation into a canonical event. This lets us preserve attribution and recover from a bad merge.

## Staleness and cancellation rules

- If authoritative source returns cancelled/postponed: immediately update canonical status
- If event disappears from one source but remains on authoritative organizer source: keep it
- If event disappears from authoritative source within 7 days of start: flag for recheck, then suppress if still absent
- Events whose end time has passed become `ended`
- Never silently delete source history

## Recommendation eligibility gate

An event may appear in general Explore when:

- status is active/scheduled
- start/end relationship is valid
- coordinates are present or confidently geocoded
- event falls inside selected radius
- confidence >= 70

An event may receive Best Bet / Free Pick / Family Pick / Something Different / Worth the Drive when:

- confidence >= 85
- source was checked within refresh SLA
- event has adequate title/time/location information
- no unresolved duplicate or cancellation conflict

## Build order

### Wave 0 — no-risk groundwork

1. Create source registry table
2. Create raw source-event table
3. Create normalized event table
4. Create adapter-run log
5. Create dedupe link table
6. Add source health metrics

### Wave 1 — first real data

1. Ticketmaster official API
2. Notre Dame Events
3. Visit South Bend Mishawaka
4. South Bend Cubs / Four Winds Field
5. Elkhart Public Library

Goal: prove ingestion + normalization + dedupe with five structurally different sources.

### Wave 2 — local coverage expansion

Add city, library, VPA, zoo, Morris, Elkhart/Niles venue calendars.

### Wave 3 — long tail

Organizer submissions plus approved smaller-source adapters.

## Coverage test

For a chosen Saturday:

1. Collect all I'm Bored events within 30 miles of 46637
2. Search Google event results, Eventbrite, Visit South Bend, local city/library calendars and venue calendars
3. Categorize missed legitimate events
4. Calculate coverage = legitimate events found by I'm Bored / union of legitimate comparison events
5. Target >= 90% coverage before broad public marketing
6. Track duplicate rate and stale-event rate separately

## Current decision

We should **not** build 55 adapters at once. The first engineering proof should be five sources with different ingestion patterns. If those normalize and deduplicate correctly, expanding to 25+ sources becomes a repeatable adapter problem instead of a fragile one-off scraping project.
