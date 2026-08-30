import type { NormalizedSourceEvent } from '../types';
import { absoluteUrl, blocks, firstHref, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';

export function extractElkhartCountyParksEvents(html: string, sourceUrl: string): NormalizedSourceEvent[] {
  const fetchedAt = new Date().toISOString();
  const candidates = blocks(html, 'div', 'single-event');
  const output: NormalizedSourceEvent[] = [];

  for (const block of candidates) {
    const href = absoluteUrl(sourceUrl, firstHref(block, /events?\//i));
    const title = firstMatch(block, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)
      || firstMatch(block, /class=["'][^"']*event-title[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const date = firstMatch(block, /class=["'][^"']*event-date-label[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const time = firstMatch(block, /class=["'][^"']*event-time[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const venue = firstMatch(block, /class=["'][^"']*(?:event-location|event-meta-value)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    if (!href || !title || !date) continue;
    const startTime = parseLocalDateTime(date, time);
    if (!startTime) continue;
    const text = stripTags(block);

    output.push({
      sourceId: 'elkhart-county-parks',
      sourceEventId: href.split('/').filter(Boolean).pop() || href,
      sourceUrl: href,
      fetchedAt,
      title,
      description: null,
      startTime,
      endTime: null,
      timezone: 'America/Indiana/Indianapolis',
      venueName: venue,
      address: null,
      city: 'Elkhart',
      state: 'IN',
      zip: null,
      latitude: null,
      longitude: null,
      category: 'Outdoors',
      subcategory: null,
      tags: ['Outdoors', 'Parks'],
      priceMin: null,
      priceMax: null,
      isFree: null,
      familyFriendly: true,
      imageUrl: null,
      ticketUrl: null,
      status: statusFromText(text),
      rawPayload: { href, title, date, time, venue },
      confidence: 0.94,
    });
  }

  return output;
}
