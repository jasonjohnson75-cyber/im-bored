import type { NormalizedSourceEvent } from '../types';
import { absoluteUrl, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';

function chunks(html: string): string[] {
  const starts = [...html.matchAll(/class=["'][^"']*single-event[^"']*["']/gi)].map((m) => m.index || 0);
  if (!starts.length) return [];
  return starts.map((start, i) => html.slice(start, starts[i + 1] ?? Math.min(html.length, start + 9000)));
}

export function extractElkhartCountyParksEvents(html: string, sourceUrl: string): NormalizedSourceEvent[] {
  const fetchedAt = new Date().toISOString();
  const output: NormalizedSourceEvent[] = [];
  const seen = new Set<string>();

  for (const block of chunks(html)) {
    const linkMatch = block.match(/href=["']([^"']*\/events?\/[^"'#?]+\/?)["']/i);
    const href = absoluteUrl(sourceUrl, linkMatch?.[1] || null);
    const linkedTitle = block.match(/<a\b[^>]*href=["'][^"']*\/events?\/[^"']+["'][^>]*>([\s\S]*?)<\/a>/i)?.[1] || null;
    const title = (linkedTitle ? stripTags(linkedTitle) : null)
      || firstMatch(block, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)
      || firstMatch(block, /class=["'][^"']*(?:event-title|event-info)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const date = firstMatch(block, /class=["'][^"']*event-date-label[^"']*["'][^>]*>([\s\S]*?)<\//i)
      || firstMatch(block, /\b((?:Mon|Tue|Wed|Thu|Fri|Sat|Sun)[a-z]*,?\s+[A-Z][a-z]+\s+\d{1,2}(?:,\s+\d{4})?)/i);
    const time = firstMatch(block, /class=["'][^"']*event-time[^"']*["'][^>]*>([\s\S]*?)<\//i)
      || firstMatch(block, /\b(\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?))/i);
    const venue = firstMatch(block, /class=["'][^"']*event-location[^"']*["'][^>]*>([\s\S]*?)<\//i);
    if (!href || !title || !date) continue;
    const startTime = parseLocalDateTime(date, time);
    if (!startTime || seen.has(href + startTime)) continue;
    seen.add(href + startTime);
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
