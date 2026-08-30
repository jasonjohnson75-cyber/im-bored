# I'm Bored Consolidated Pre-Launch Audit

Run once the active engineering wave is complete.

## Product
- Published app loads without runtime errors.
- Home -> Find Something -> Results -> Event Detail works.
- Save/Saved, Explore, Profile, navigation/back behavior work.
- Now/Tonight/Weekend, categories and 5/10/15/30 mile controls behave correctly.
- Mobile 360/390/430 and desktop pass layout checks.
- Empty/loading/error states and basic keyboard/focus/contrast checks pass.

## Data
- All promoted sources pass quality gate.
- Direct-source provenance retained.
- Duplicate merge tested across direct and aggregator sources.
- Cancellation/postponement propagation tested.
- Geographic/category/audience balance reviewed.
- No source is promoted solely because it is reachable.

## Security and operations
- Dependency audit reviewed and critical/high findings remediated or explicitly accepted before public launch.
- Secrets remain server-side.
- Source failures are isolated and logged.
- Production writes remain disabled until promotion decision.

## Domain
- imbored.us resolves to the verified production deployment.
- HTTPS works and canonical URLs use imbored.us.
- Replit hostname is not the primary public-facing URL.

## Final gate
Target score: 95+/100 with no critical failures before declaring MVP VERIFIED.
