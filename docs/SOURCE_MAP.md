# I'm Bored Source Map

Launch market: ZIP 46637, default 30-mile event radius.

This is the working source inventory. Individual event coordinates must determine inclusion. A source may publish events outside the launch radius.

## Classification key

- **API**: official machine-readable API
- **Structured calendar**: predictable public event records
- **Feed**: ICS, RSS, JSON-LD, or similar structured feed
- **Public page**: monitored page only where permitted and appropriate
- **Submission**: first-party organizer/community form

Priority: P1 = launch-critical, P2 = useful expansion, P3 = long-tail.

| # | Source | Area | Content | Target method | Priority |
|---|---|---|---|---|---|
| 1 | Visit South Bend Mishawaka | Regional | General | Structured calendar/feed investigation | P1 |
| 2 | Downtown South Bend | South Bend | Festivals/community | Structured calendar | P1 |
| 3 | City of South Bend | South Bend | Civic/community | Structured calendar | P2 |
| 4 | South Bend VPA | South Bend | Parks/recreation | Structured calendar | P1 |
| 5 | St. Joseph County Public Library | County | Library/community | Structured calendar | P1 |
| 6 | Notre Dame Events | Notre Dame | Broad campus/public | Structured calendar | P1 |
| 7 | DeBartolo Performing Arts Center | Notre Dame | Arts/performance | Structured calendar | P1 |
| 8 | Raclin Murphy Museum | Notre Dame | Arts/museum | Structured calendar | P2 |
| 9 | Notre Dame Athletics | Notre Dame | Sports | Schedule/feed investigation | P1 |
| 10 | City of Mishawaka | Mishawaka | Civic/community | Structured calendar | P1 |
| 11 | Mishawaka Parks | Mishawaka | Recreation | Structured calendar | P1 |
| 12 | Mishawaka-Penn-Harris Public Library | Mishawaka/Granger | Community | Structured calendar | P1 |
| 13 | Potawatomi Zoo | South Bend | Family/attraction | Structured calendar | P1 |
| 14 | Morris Performing Arts Center | South Bend | Shows/music | Structured calendar | P1 |
| 15 | South Bend Symphony | South Bend | Music | Structured calendar | P2 |
| 16 | South Bend Cubs | South Bend | Sports | Schedule/API/feed investigation | P1 |
| 17 | Four Winds Field | South Bend | Stadium | Venue/schedule | P2 |
| 18 | Studebaker National Museum | South Bend | Museum | Structured calendar/page | P2 |
| 19 | The History Museum | South Bend | Museum/community | Structured calendar/page | P2 |
| 20 | South Bend Farmers Market | South Bend | Food/market | Feed/page | P2 |
| 21 | Howard Park | South Bend | Recreation/events | SBVPA source | P1 |
| 22 | LangLab | South Bend | Music/arts | Structured page | P1 |
| 23 | Century Center | South Bend | Conventions/events | Structured calendar | P1 |
| 24 | Indiana University South Bend | South Bend | College/community | Structured calendar | P2 |
| 25 | Saint Mary's College | Notre Dame | College/arts | Structured calendar | P2 |
| 26 | Holy Cross College | Notre Dame | College/community | Structured calendar | P3 |
| 27 | Visit Elkhart County | Elkhart County | General | Structured calendar | P1 |
| 28 | City of Elkhart | Elkhart | Civic/community | Structured calendar | P2 |
| 29 | The Lerner Theatre | Elkhart | Entertainment | Structured calendar | P1 |
| 30 | Wellfield Botanic Gardens | Elkhart | Outdoors/family | Structured calendar | P1 |
| 31 | Ruthmere Museum | Elkhart | Culture/history | Structured calendar | P2 |
| 32 | Elkhart County Parks | County | Outdoors/family | Structured calendar | P2 |
| 33 | Elkhart Public Library | Elkhart | Community/library | Structured calendar | P1 |
| 34 | Downtown Goshen | Goshen area | Festivals/community | Structured calendar | P2 |
| 35 | Goshen First Fridays | Goshen area | Festivals/community | Structured page | P2 |
| 36 | City of Niles | Niles | Civic/community | Structured calendar | P1 |
| 37 | Niles District Library | Niles | Community/library | Structured calendar | P1 |
| 38 | Niles Main Street | Niles | Downtown/community | Feed/page | P2 |
| 39 | Fernwood Botanical Garden | Niles area | Nature/family | Structured calendar | P1 |
| 40 | City of Buchanan | Buchanan | Civic/community | Structured calendar | P2 |
| 41 | Buchanan Common | Buchanan | Music/festivals | Structured calendar/page | P2 |
| 42 | Berrien County Parks | SW Michigan | Outdoors | Structured calendar | P2 |
| 43 | St. Joseph Today | SW Michigan | Regional | Structured calendar | P2 |
| 44 | Ticketmaster Discovery | Regional | Major ticketed events | API | P1 |
| 45 | Eventbrite | Regional | Ticketed/community | Link/integration investigation | P1 |
| 46 | Meetup | Regional | Clubs/social | Integration investigation | P2 |
| 47 | Facebook Events | Regional | Community | Discovery/link only initially | P2 |
| 48 | Google event discovery | Regional | Broad discovery | Supplemental verification only | P2 |
| 49 | Churches/community groups | Regional | Community/festivals | Submission + selected feeds | P2 |
| 50 | Schools/community organizations | Regional | Family/community | Submission + selected feeds | P2 |
| 51 | Restaurants/breweries/venues | Regional | Music/trivia/food | Organizer submission | P1 |
| 52 | Local arts organizations | Regional | Arts/music | Feed/submission | P1 |
| 53 | Farmers markets | Regional | Food/community | Multi-source aggregation | P1 |
| 54 | Local festivals | Regional | Festivals | Multi-source aggregation | P1 |
| 55 | I'm Bored submissions | Regional | All categories | Submission | P1 |

## First 25 integration target

1. Visit South Bend Mishawaka
2. Downtown South Bend
3. South Bend VPA
4. St. Joseph County Public Library
5. Notre Dame Events
6. DeBartolo Performing Arts Center
7. Notre Dame Athletics
8. Morris Performing Arts Center
9. South Bend Civic Theatre
10. Potawatomi Zoo
11. City of Mishawaka
12. Mishawaka Parks
13. Mishawaka-Penn-Harris Public Library
14. South Bend Cubs
15. Century Center
16. Indiana University South Bend
17. Saint Mary's College
18. Visit Elkhart County
19. Elkhart Public Library
20. The Lerner Theatre
21. Wellfield Botanic Gardens
22. City of Niles/community calendar
23. Niles District Library
24. Ticketmaster Discovery API
25. I'm Bored submissions

## Ingestion rules

For each adapter capture:
- source ID/name
- source event ID when available
- original URL
- title
- description
- start/end
- venue/address
- price
- image
- category hints
- last checked
- raw payload when legally/technically appropriate

Then:
1. normalize
2. geocode
3. calculate radius
4. deduplicate
5. classify
6. confidence score
7. status/expiry check
8. publish canonical event

## Coverage KPI

The key metric is not number of feeds. It is **percentage of legitimate public events within the selected radius that I'm Bored discovers without duplicate clutter**.

Initial target: 90%+ useful event discovery coverage before broad promotion.
