# I'm Bored

A mobile-first hyperlocal discovery app that answers one question: **What can I do near me right now?**

## Launch market

- Default ZIP: `46637`
- Default radius: `30 miles`
- Region: Michiana
- Architecture goal: any ZIP/location and selectable radius

## Product principles

- Decision engine, not another calendar
- Broad appeal across adults, families, couples, students, seniors, and visitors
- Mix cinematic energy, bright/social friendliness, and premium-local polish
- Mobile first
- Show a few strong recommendations first, then let users explore everything
- Keep data complexity invisible

## Core screens

1. Home
2. I'm Bored Results
3. Event Detail
4. Explore / Map
5. Saved

## Core experience

Home headline: **I'm Bored.**
Supporting line: **Let's fix that.**
Primary CTA: **FIND SOMETHING**

Time controls: `NOW` `TONIGHT` `WEEKEND`

Quick filters: `Free` `Family` `Food` `Music` `Sports` `Date Night` `Arts` `Outdoors`

## Technical direction

- React + TypeScript + Vite
- Tailwind CSS
- Supabase for database/auth/favorites/submissions
- PostGIS for distance/radius queries
- GitHub as source of truth
- Bolt.new as primary AI builder
- Cloudflare planned for production hosting

## Current implementation

- Live Supabase-backed events and local places
- Today, seven-day, and weekend filters
- Search, category filters, and city filters
- Device favorites, with account-ready database policies
- Moderated event-submission schema
- Automated ingestion and source-quality workflows
- Production build and source-engine tests in GitHub Actions

No paid APIs are required for the core experience. Public frontend code uses only a
Supabase publishable key. Never expose a Supabase secret or service-role key in a
`VITE_` variable.

## Local verification

```bash
npm ci
npm run build
npm run test:source-engine
```
