import type { NormalizedSourceEvent } from '../types';
import { absoluteUrl, blocks, firstHref, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';

export function extractDebartoloEvents(html: string, sourceUrl: string): NormalizedSourceEvent[] {
  const fetchedAt = new Date().toISOString();
  const candidates = blocks(html, 'div', 'event-block-innerwrap');
  const output: NormalizedSourceEvent[] = [];

  for (const block of candidates) {
    const href = absoluteUrl(sourceUrl, firstHref(block, /\/event\//i));
    const title = firstMatch(block, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)
      || firstMatch(block, /class=["'][^"']*event-title[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const date = firstMatch(block, /class=["'][^"']*date[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const time = firstMatch(block, /class=["'][^"']*(?:time|event-time)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    if (!href || !title || !date) continue;
    const startTime = parseLocalDateTime(date, time);
    if (!startTime) continue;
    const genre = firstMatch(block, /class=["'][^"']*event-genre[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const text = stripTags(block);

    output.push({
      sourceId: 'debartolo-performing-arts-center',
      sourceEventId: href.split('/').filter(Boolean).pop() || href,
      sourceUrl: href,
      fetchedAt,
      title,
      description: null,
      startTime,
      endTime: null,
      timezone: 'America/Indiana/Indianapolis',
      venueName: 'DeBartolo Performing Arts Center',
      address: null,
      city: 'Notre Dame',
      state: 'IN',
      zip: null,
      latitude: null,
      longitude: null,
      category: genre || 'Arts',
      subcategory: null,
      tags: genre ? [genre] : ['Arts'],
      priceMin: null,
      priceMax: null,
      isFree: null,
      familyFriendly: null,
      imageUrl: null,
      ticketUrl: null,
      status: statusFromText(text),
      rawPayload: { href, title, date, time, genre },
      confidence: 0.94,
    });
  }

  return output;
}
