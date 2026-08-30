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

This repository starts with demo data only. No paid APIs are connected yet.
