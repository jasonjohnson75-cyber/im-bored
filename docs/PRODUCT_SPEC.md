# I'm Bored Product Spec

## Promise

I'm Bored answers: **What can I do near me right now?**

It is a decision engine, not a calendar.

## Audience

Broad by design. Do not over-index toward nightlife, families, young adults, tourists, couples, or any other single group.

## Visual direction

Blend:
- cinematic imagery and confidence
- bright/social energy
- premium local restraint

Avoid:
- generic community-calendar UI
- childish rainbow design
- nightclub-dark dominance
- luxury exclusivity
- stock shadcn appearance

## Launch context

- Default ZIP: 46637
- Default radius: 30 miles
- Radius options: 5, 10, 15, 30 miles
- Future architecture: any location

## Five MVP screens

### 1. Home
- I'm Bored.
- Let's fix that.
- location/radius
- FIND SOMETHING
- NOW / TONIGHT / WEEKEND
- Free / Family / Food / Music / Sports / Date Night / Arts / Outdoors
- featured recommendation

### 2. Results
Return 5 recommendations first:
- Best Bet
- Free Pick
- Family Pick
- Something Different
- Worth the Drive

Then allow users to see all results.

### 3. Event Detail
- imagery
- event title
- date/time
- distance
- price/free
- venue/address
- tags
- directions
- source/tickets
- save/share
- last verified/source attribution when real data is enabled

### 4. Explore
- map/list toggle
- 5/10/15/30 mile filters
- categories
- current location

### 5. Saved
- saved events
- useful empty state
- future calendar/reminder hooks

## Data direction

Event fields:
- id
- title
- description
- category
- subcategory
- tags
- start_time
- end_time
- venue_name
- address
- city
- state
- zip
- latitude
- longitude
- price_min
- price_max
- is_free
- family_friendly
- age_min
- age_max
- indoor_outdoor
- accessibility
- image_url
- ticket_url
- source_url
- source_name
- source_method
- status
- confidence_score
- last_checked
- created_at
- updated_at

Place/activity fields add:
- regular_hours
- temporary_hours
- admission
- open_now
- typical_visit_length

## Backend direction

Supabase + Postgres + PostGIS.

Use PostGIS for radius filtering and nearest-neighbor ordering. Use RLS for any user-owned data. Do not expose service-role credentials to the client.

## Source engine direction

Ingestion classes:
1. Official APIs
2. Structured calendars
3. ICS/RSS/JSON-LD feeds
4. Permitted monitored public pages
5. Organizer/community submissions

Normalize, geocode, radius-check, deduplicate, classify, score confidence, then publish to the canonical event table.

## Quality gate

Before production data integration, prototype should target 95/100 across:
- visual hierarchy
- typography
- spacing
- imagery
- mobile usability
- navigation
- consistency
- accessibility
- perceived product quality
- willingness to use/download

## Bolt master instruction

When imported into Bolt.new: preserve the product direction above, extend the starter into five functional routes, keep demo data clearly marked as demo, do not connect paid APIs, do not publish without review, and prioritize mobile visual quality and runtime stability before backend integration.
