import { describe, expect, it } from 'vitest';
import { extractJsonLdEvents } from '../extractors/jsonLdEvents';

describe('extractJsonLdEvents', () => {
  it('normalizes a schema.org Event with venue and ticket data', () => {
    const html = `<script type="application/ld+json">{"@context":"https://schema.org","@type":"Event","@id":"evt-1","name":"Summer Concert","startDate":"2026-09-01T19:00:00-04:00","endDate":"2026-09-01T21:00:00-04:00","url":"/events/summer-concert","location":{"@type":"Place","name":"Ironworks Plaza","address":{"@type":"PostalAddress","streetAddress":"100 Center St","addressLocality":"Mishawaka","addressRegion":"IN","postalCode":"46544"}},"offers":{"@type":"Offer","price":"0","url":"/tickets/1"}}</script>`;
    const events = extractJsonLdEvents(html, 'https://example.org/calendar');
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Summer Concert');
    expect(events[0].venueName).toBe('Ironworks Plaza');
    expect(events[0].city).toBe('Mishawaka');
    expect(events[0].isFree).toBe(true);
    expect(events[0].sourceUrl).toBe('https://example.org/events/summer-concert');
  });

  it('detects cancelled events inside @graph', () => {
    const html = `<script type="application/ld+json">{"@graph":[{"@type":"Event","name":"Market","startDate":"2026-09-06T10:00:00-04:00","eventStatus":"https://schema.org/EventCancelled"}]}</script>`;
    const events = extractJsonLdEvents(html, 'https://example.org/');
    expect(events[0].status).toBe('cancelled');
  });
});
