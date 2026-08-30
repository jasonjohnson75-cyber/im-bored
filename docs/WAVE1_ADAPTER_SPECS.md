# I'm Bored — Wave 1 Adapter Specifications

Status: research-complete enough to implement adapters after MVP verification. No production ingestion is enabled yet.

## 1. Ticketmaster Discovery API

**Classification:** Official API
**Confidence:** High
**Priority:** P1
**Refresh target:** 30 minutes for next 72 hours, 4 hours for later events

### Verified capabilities
- Official Discovery API supports event search by location, date, radius, venue, category/classification, country/state, and source.
- API key required.
- Default quota: 5,000 calls/day, 5 requests/second.
- Radius searches should use geographic parameters rather than postalCode-only filtering.
- Event detail endpoint provides venue/location and purchase URL.

### Adapter contract
Input:
- launch center coordinates for 46637
- radius = 30 miles
- startDateTime = now
- endDateTime = configurable horizon (initially 90 days)
- countryCode = US

Output mapping:
- source_event_id <- Ticketmaster event id
- title <- event name
- start/end <- dates.start / relevant end data when present
- venue <- embedded venue
- location <- venue latitude/longitude
- category/subcategory <- classifications
- image <- best available event image
- ticket_url <- event URL
- status <- cancellation/postponement metadata when available
- source_payload <- original JSON

### Operational rules
- Store API key only as a server secret.
- Use event id as immutable external id.
- Re-check near-term events frequently for status/time changes.
- Do not duplicate Ticketmaster records when the same event is found through a local calendar. Ticketmaster remains provenance, not necessarily canonical owner.

## 2. University of Notre Dame Events

**Classification:** Structured public calendar HTML
**Confidence:** High for HTML extraction; no public ICS/API verified in this audit
**Priority:** P1
**Refresh target:** 2 hours; 30 minutes for events in next 24 hours

### Verified structure
- Main calendar publishes title, date/time and location directly in server-readable event listings.
- Individual event pages publish exact date/time, location, description, categories, image when available, and ticket/action links when applicable.
- Calendar includes an explicit "Open to the Public" category, useful for eligibility filtering.
- No ICS/ical marker or JSON-LD event block was verified on the tested pages.

### Adapter strategy
1. Crawl only the public upcoming-events listing and public event detail URLs.
2. Collect event links from the listing.
3. Fetch detail page for canonical attributes.
4. Prefer events tagged "Open to the Public" for consumer discovery.
5. Retain other events only when clearly public-facing and relevant.

Output mapping:
- source_event_id <- stable event detail URL/path
- title <- page H1
- start/end <- displayed Time field
- venue_name <- displayed Location field
- description <- event body summary
- category/tags <- Posted In / calendar categories
- image_url <- event image when present
- ticket_url <- action/ticket link when present
- source_url <- canonical detail page

### Safety/quality rules
- Do not ingest private/internal student or staff events solely because they appear on the broader calendar.
- Open-to-public tag receives a confidence boost.
- For recurring series, preserve occurrence date/time as separate occurrence identity while linking a series key.

## 3. Visit South Bend Mishawaka

**Classification:** JavaScript-rendered regional event calendar / public-page source
**Confidence:** Medium pending endpoint discovery and terms review
**Priority:** P1
**Refresh target:** 2 hours

### Verified structure
- Official regional tourism site has Events, This Weekend, Annual Events, Live Music, Notre Dame Events, Sports, Holiday Events, and an organizer submission flow.
- The site explicitly says its Event Listings require JavaScript.
- The static page does not expose the event listing records in the server-rendered HTML tested.
- Event information is described as accurate at time of posting, with users directed to organizer sites for the latest information.

### Adapter strategy
Phase A implementation discovery:
1. Inspect browser network requests made by the Event Listings component.
2. Identify whether the listing is backed by a documented/public JSON endpoint, vendor feed, or HTML response.
3. Review site terms/robots and vendor access terms before automated ingestion.
4. If a stable permitted endpoint exists, use it.
5. Otherwise treat Visit South Bend primarily as a discovery/provenance source and ingest organizer-linked records from authoritative sources when available.

### Quality rules
- Because Visit South Bend can duplicate Notre Dame, Morris, Cubs, and other venues, local-source records should enrich existing canonical records rather than create duplicates.
- Organizer URL should be preferred as the final verification URL when supplied.

### Current decision
**Do not implement an aggressive scraper yet.** Endpoint discovery and permission/terms validation are required first.

## 4. South Bend Cubs / Four Winds Field

**Classification:** Structured official schedule HTML + official upcoming-events page
**Confidence:** High
**Priority:** P1
**Refresh target:** 6 hours normally; 1 hour on game/event days

### Verified structure
- Official MiLB South Bend Cubs site provides a season schedule with dates, start times, opponents and home/away status.
- Official schedule is explicitly subject to change.
- Official Upcoming Events at Four Winds Field separately lists non-baseball stadium events with dates, descriptions and ticket links.
- Promotional/theme-night information is published separately and can enrich a game event.
- A downloadable-schedule page exists, but a machine-readable calendar feed URL was not verified by this audit.

### Adapter strategy
Use two sub-adapters:

**A. Game schedule adapter**
- Fetch official South Bend schedule pages.
- Keep home games at Four Winds Field as local events.
- Record opponent, start time, home venue and ticket link.
- Enrich with promotion/theme data where a date match exists.

**B. Four Winds special-events adapter**
- Fetch official Upcoming Events page.
- Parse date, title, description and ticket link for non-game stadium events.

### Identity rules
- game external key: `sbcubs:{season}:{date}:{opponent}:{home}`
- special event external key: canonical event URL or normalized title+date

### Quality rules
- A promotion attached to a baseball game should generally be metadata/tagging, not a separate duplicate event, unless it is independently ticketed or separately accessible.
- Re-check same-day events because schedules and promotions are explicitly subject to change.

## 5. Elkhart Public Library

**Classification:** Structured calendar HTML, strongly consistent with The Events Calendar-style URL conventions
**Confidence:** High for HTML extraction; API/feed endpoint not yet verified
**Priority:** P1
**Refresh target:** 2 hours

### Verified structure
- Public events pages expose List, Month and Day views.
- Calendar provides title, start/end time, venue/address, description, featured status, free status on some events, categories, recurring-event information, and cancellation text.
- Date-specific and category-specific URLs are crawlable.
- Recurrence descriptions include weekly/monthly frequency and end dates.
- URLs/parameters include patterns such as date views and `tribe-bar-date`, which are consistent with a common WordPress events-calendar implementation, but an official REST/ICS endpoint has not been verified for this site.

### Adapter strategy
1. Fetch list/day/month structured calendar pages using a bounded date horizon.
2. Extract event detail links and occurrence date/time.
3. Fetch details when needed for full description, registration, price/free and cancellation status.
4. Treat each recurrence occurrence as a displayable event occurrence with a shared series identity.
5. Explicit cancellation language maps status to `cancelled`.

Output mapping:
- source_event_id <- detail URL + occurrence date/time where needed
- title <- event title
- start/end <- displayed event occurrence time
- venue/address <- calendar venue fields
- description <- listing/detail description
- is_free <- explicit Free indicator when present
- family/age tags <- inferred only from explicit program/category text; otherwise null
- status <- active/cancelled from source wording

## Canonical normalization shared by all Wave 1 adapters

Each adapter writes first to raw source records. Canonicalization happens afterward.

Required normalized fields:
- source_id
- source_event_id
- source_url
- fetched_at
- title
- description
- start_time
- end_time
- timezone
- venue_name
- address
- city/state/zip
- latitude/longitude when supplied or geocoded
- category/subcategory/tags
- price_min/price_max/is_free
- family_friendly only when supported
- image_url
- ticket_url
- status
- raw payload / extraction snapshot

## Duplicate scoring

Initial duplicate score weights:
- exact/similar start time within 30 minutes: 35%
- same or near-identical venue / coordinates: 30%
- normalized title similarity: 25%
- matching ticket/organizer URL or source cross-link: 10%

Auto-merge threshold: >= 0.90
Review queue: 0.75–0.899
Keep separate: < 0.75

Never auto-merge two separately ticketed sessions merely because the title and venue match.

## Verification gate before these adapters go live

For each source, run a 14-day sample and require:
- >= 98% parser success on fetched event records
- 100% valid start dates
- >= 95% valid venue/location when the source provides one
- cancellation detection test where applicable
- duplicate test against at least two other Wave 1 sources
- provenance link retained on every canonical record
- no source-policy or robots concern left unresolved

Only after that should the adapter be scheduled in production.