# Bolt.new Master Build Prompt

Use this after importing this GitHub repository into Bolt.new.

---

You are extending the existing **I'm Bored** React/TypeScript repository. Do not restart from a generic template and do not rename the product.

## Product

**I'm Bored** is a mobile-first hyperlocal decision engine that answers:

> What can I do near me right now?

Launch context is ZIP 46637 with a default 30-mile radius, but code architecture must support any location later.

## Non-negotiable visual direction

Read `docs/PRODUCT_SPEC.md` and `docs/DESIGN_BIBLE.md` before editing.

Blend cinematic confidence, bright/social friendliness, and premium-local restraint. Broad appeal is mandatory. Do not make the product feel optimized for nightlife, children, families, young adults, tourists, luxury users, or any single group.

Avoid stock shadcn appearance and generic event-calendar UI.

## First task: runtime stability

1. Install dependencies.
2. Run the current project.
3. Fix all TypeScript, Vite, dependency, route, and runtime errors.
4. Confirm the app renders at the root route before doing visual expansion.
5. Run a production build after changes and fix all errors.

## Build the five functional MVP routes

### `/` Home
- I'm Bored.
- Let's fix that.
- location/radius control
- primary FIND SOMETHING CTA
- NOW / TONIGHT / WEEKEND
- quick filters
- strong featured experience
- two teaser recommendations

### `/results` Results
Show five curated recommendations first:
- Best Bet
- Free Pick
- Family Pick
- Something Different
- Worth the Drive

Allow filtering and a See Everything action.

### `/event/:id` Event Detail
Include:
- strong image area
- title
- date/time
- distance
- price/free status
- venue/address
- tags
- directions CTA
- original source/tickets CTA
- save
- share
- demo-source notice while using mock data

### `/explore` Explore
- map/list toggle
- convincing map placeholder until a real map provider is connected
- radius: 5 / 10 / 15 / 30 miles
- categories
- location context
- event cards/list

### `/saved` Saved
- saved demo events
- persistence using localStorage for prototype stage
- excellent empty state

Also provide a simple `/me` placeholder/profile preferences screen so the bottom navigation is complete.

## Interaction requirements

- Home FIND SOMETHING routes to Results.
- Event cards open detail pages.
- Save state persists locally.
- Filters visibly change result sets.
- Bottom navigation works on every screen.
- Back navigation is obvious on detail views.
- No dead buttons in the primary user journey.

## Responsive requirements

Test 360px, 390px, 430px, tablet, and desktop widths.

- no horizontal overflow
- safe-area support
- minimum 44px tap targets
- visible focus states
- readable type
- bottom nav must not cover content

## States

Create polished:
- loading/skeleton state
- no-results state
- error state
- saved empty state

## Demo data

Keep all local examples clearly marked as demo data. Use realistic Michiana-style titles, distances, categories, and venues, but do not claim demo listings are live or current.

## Do not do yet

- no paid APIs
- no scraping integrations
- no production Supabase writes
- no authentication requirement
- no payment system
- no ads
- no publishing without review

## Backend readiness

Structure event types and data access so mock data can later be replaced by Supabase/PostGIS without redesigning screens.

## Quality gate

Before stopping:
1. Run production build successfully.
2. Check each route.
3. Check mobile overflow.
4. Check primary buttons and navigation.
5. Audit against `docs/DESIGN_BIBLE.md`.
6. Improve anything that feels like a template.

Target visual score: **95/100**.

Return a concise summary of routes completed, runtime/build status, and anything that still needs human approval.
