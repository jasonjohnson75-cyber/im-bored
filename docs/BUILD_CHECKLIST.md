# I'm Bored MVP Build Checklist

## Runtime
- [ ] `npm install` succeeds
- [ ] `npm run dev` renders root route
- [ ] `npm run build` completes without errors
- [ ] No console-breaking runtime errors

## Routes
- [ ] `/` Home
- [ ] `/results` Results
- [ ] `/event/:id` Event detail
- [ ] `/explore` Map/list discovery
- [ ] `/saved` Saved items
- [ ] `/me` Preferences/profile placeholder

## Core flow
- [ ] FIND SOMETHING opens Results
- [ ] Event card opens Detail
- [ ] Save works and persists locally during prototype stage
- [ ] Share control has graceful browser fallback
- [ ] Directions control is wired to a map destination or clearly marked demo
- [ ] Bottom nav works from every main screen

## Discovery controls
- [ ] NOW
- [ ] TONIGHT
- [ ] WEEKEND
- [ ] Free
- [ ] Family
- [ ] Food
- [ ] Music
- [ ] Sports
- [ ] Date Night
- [ ] Arts
- [ ] Outdoors
- [ ] Radius: 5/10/15/30 miles

## Visual QA
- [ ] 360px phone
- [ ] 390px phone
- [ ] 430px phone
- [ ] Tablet
- [ ] Desktop
- [ ] No horizontal overflow
- [ ] Bottom nav does not cover content
- [ ] Minimum 44px primary tap targets
- [ ] Visible keyboard focus
- [ ] Safe-area padding
- [ ] Strong contrast
- [ ] Reduced-motion consideration

## Product QA
- [ ] Clearly demo data until production ingestion begins
- [ ] Broad demographic appeal
- [ ] Not nightlife-centric
- [ ] Not family-only
- [ ] Not tourism-only
- [ ] No generic calendar-first experience
- [ ] Recommendations appear before long event lists

## Empty/error states
- [ ] Loading skeleton
- [ ] No-results screen
- [ ] Network/error state
- [ ] Empty Saved screen

## Backend readiness
- [ ] Event types align with `docs/PRODUCT_SPEC.md`
- [ ] No secret/service key exposed client-side
- [ ] Data access isolated enough to replace mocks with Supabase
- [ ] PostGIS schema reviewed before execution

## Final visual score
Score 1-10 each:
- hierarchy
- typography
- spacing
- imagery
- mobile usability
- navigation
- consistency
- accessibility
- perceived quality
- desire to use

**Required total before production-data integration: 95/100.**
