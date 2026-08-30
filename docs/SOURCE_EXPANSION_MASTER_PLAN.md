# I'm Bored — Source Expansion Master Plan

Launch center: ZIP 46637, approximately 30-mile radius.
Goal: broad, balanced coverage rather than favoring one demographic or event category.

## Operating rule
Wave 1 proves the ingestion patterns. After that, sources advance continuously in batches without waiting for a separate approval for every wave. A source only reaches production after policy/terms review, extraction validation, provenance checks, date/time checks, duplicate handling, and source-quality validation.

## Current Wave 1
1. Ticketmaster Discovery API — API — implemented, live validation awaits server-side API key.
2. Notre Dame Events — structured HTML — live verified.
3. Elkhart Public Library — structured HTML — live verified; venue completeness under review.
4. South Bend Cubs / Four Winds Field — structured HTML/schedule — reachable; event extraction not yet proven.
5. Visit South Bend Mishawaka — dynamic destination calendar — held pending stable permitted endpoint review.

## Expansion registry — 55 recurring source targets

### Regional aggregators and civic calendars
6. City of South Bend / Venues Parks & Arts
7. Downtown South Bend
8. City of Mishawaka
9. Mishawaka Parks & Recreation
10. St. Joseph County
11. St. Joseph County Parks
12. St. Joseph County 4-H Fairgrounds / Fair
13. City of Elkhart
14. Elkhart County
15. City of Goshen
16. Downtown Goshen
17. City of Niles, Michigan
18. Niles Main Street / downtown events
19. City of Buchanan, Michigan
20. Buchanan Area Chamber of Commerce
21. Southwest Michigan Regional Chamber
22. Eventbrite regional discovery

### Universities and colleges
23. University of Notre Dame Events
24. Notre Dame Athletics
25. DeBartolo Performing Arts Center
26. Saint Mary's College events
27. Holy Cross College events
28. Indiana University South Bend events
29. IUSB Athletics
30. Bethel University events
31. Goshen College events

### Libraries, museums, arts and culture
32. St. Joseph County Public Library
33. Mishawaka-Penn-Harris Public Library
34. Elkhart Public Library
35. Niles District Library
36. Buchanan District Library
37. The History Museum / Oliver Mansion
38. Studebaker National Museum
39. South Bend Museum of Art
40. Potawatomi Zoo
41. Indiana Dinosaur Museum
42. Morris Performing Arts Center
43. South Bend Civic Theatre
44. The Lerner Theatre
45. Ruthmere Museum
46. Wellfield Botanic Gardens

### Sports, family and entertainment venues
47. South Bend Cubs / Four Winds Field
48. Notre Dame sports schedules
49. Howard Park
50. Ironworks Plaza
51. Century Center
52. South Bend Farmers Market
53. Mishawaka Market
54. St. Patrick's County Park
55. Potato Creek State Park

### Music, nightlife and recurring community programming
56. The Garage Arcade Bar / event programming
57. Stockroom East
58. LangLab
59. Merrimans' Playhouse
60. Goshen Theater
61. Buchanan Common / Common Concert Series
62. Fire Arts Inc.
63. South Bend First Fridays / DTSB programming
64. Fusion Fest / City cultural festivals
65. Art Beat / DTSB

## Wave sequence

### Wave 2 — civic and high-volume local calendars
City of Mishawaka, Downtown South Bend, South Bend VPA, St. Joseph County Public Library, Mishawaka-Penn-Harris Public Library, City of Buchanan, Buchanan Area Chamber, DeBartolo Performing Arts Center.

### Wave 3 — universities, museums and major venues
Notre Dame Athletics, Saint Mary's, Holy Cross, IUSB, Bethel, Studebaker Museum, History Museum, Potawatomi Zoo, Morris Performing Arts Center, Century Center.

### Wave 4 — Elkhart/Goshen/Niles expansion
City of Elkhart, Elkhart County, Goshen, Downtown Goshen, Goshen College, Niles civic/downtown, Niles District Library, Lerner Theatre, Ruthmere, Wellfield.

### Wave 5 — long-tail local discovery
Markets, parks, music venues, theaters, recurring festivals, arts organizations and other reliable public calendars in the radius.

## Coverage targets
We do not stop because the registry reaches a specific count. The target is useful coverage. Production should aim for:
- 40–60+ healthy recurring feeds.
- Balanced categories: family, free, arts, music, sports, food, nightlife, outdoors, learning/community, festivals.
- Geographic diversity across South Bend, Mishawaka, Notre Dame/Granger, Elkhart/Goshen, Niles/Buchanan and nearby communities within the launch radius.
- No single aggregator should dominate results when direct organizer sources are available.
- Direct organizer/venue provenance should be preferred over copied aggregator records.

## Promotion gates
A source can be promoted only when:
1. access method is permitted and stable;
2. parser/API success >= 98% over validation sample;
3. valid start dates = 100%;
4. provenance/source URLs = 100%;
5. venue/location >= 95% when the source provides location data;
6. duplicate behavior is tested;
7. cancellation/update behavior is tested where applicable;
8. source health can be monitored automatically.

## Domain/public launch
The public app can move to imbored.us before all source waves are complete. Source expansion remains isolated from production canonical events until each source clears its gate.