# I’m Bored Source Engine

This folder is the implementation layer for Wave 1 event ingestion. It is intentionally disconnected from production Supabase and from the public UI until the visual MVP passes verification.

## Implemented now

- Shared normalized event contract
- Ticketmaster Discovery API adapter
- Reusable structured-HTML adapter factory
- Source-specific factories for Notre Dame Events, South Bend Cubs/Four Winds Field, and Elkhart Public Library
- Visit South Bend Mishawaka adapter intentionally disabled pending endpoint/terms validation
- Adapter runner with error isolation
- Duplicate scoring and canonical-candidate grouping
- 14-day verification gate calculations

## Deliberate safety boundary

The HTML source factories require an explicit extraction function. This prevents the project from silently relying on brittle or unreviewed scraping logic. Once each source extractor is implemented and tested against fixtures, the factory can be activated without changing the rest of the pipeline.

## Wave 1 activation order

1. Ticketmaster
2. Notre Dame Events extractor
3. South Bend Cubs/Four Winds Field extractor
4. Elkhart Public Library extractor
5. Visit South Bend Mishawaka only after a permitted stable endpoint is confirmed

## Verification requirement

No adapter should write to production canonical events until a 14-day sample meets the gate in `docs/WAVE1_ADAPTER_SPECS.md`:

- parser success >= 98%
- valid start dates = 100%
- venue/location >= 95% when provided by source
- provenance links = 100%
- cancellation behavior tested where applicable
- cross-source duplicate tests completed
- source-policy/robots concerns resolved

## Environment

Ticketmaster expects `TICKETMASTER_API_KEY` in server-side secrets. Never expose it in the browser bundle.
