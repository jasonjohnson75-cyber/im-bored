import type { NormalizedSourceEvent } from '../types';
import { absoluteUrl, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';

function chunks(html: string): string[] {
  const starts = [...html.matchAll(/class=["'][^"']*event-page-block[^"']*["']/gi)].map((m) => m.index || 0);
  if (!starts.length) return [];
  return starts.map((start, i) => html.slice(start, starts[i + 1] ?? Math.min(html.length, start + 12000)));
}

export function extractDebartoloEvents(html: string, sourceUrl: string): NormalizedSourceEvent[] {
  const fetchedAt = new Date().toISOString();
  const output: NormalizedSourceEvent[] = [];
  const seen = new Set<string>();

  for (const block of chunks(html)) {
    const eventLink = block.match(/href=["']([^"']*\/event\/\d+\/?)["']/i)?.[1] || null;
    const href = absoluteUrl(sourceUrl, eventLink);
    const anchorTitle = block.match(/<a\b[^>]*href=["'][^"']*\/event\/\d+\/?["'][^>]*>([\s\S]*?)<\/a>/i)?.[1] || null;
    const title = (anchorTitle ? stripTags(anchorTitle) : null)
      || firstMatch(block, /<h[1-6][^>]*>([\s\S]*?)<\/h[1-6]>/i)
      || firstMatch(block, /class=["'][^"']*(?:event-title|title)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const date = firstMatch(block, /class=["'][^"']*date[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const time = firstMatch(block, /class=["'][^"']*(?:time|event-time)[^"']*["'][^>]*>([\s\S]*?)<\//i)
      || firstMatch(block, /\b(\d{1,2}:\d{2}\s*(?:a\.?m\.?|p\.?m\.?))/i);
    if (!href || !title || !date) continue;
    const startTime = parseLocalDateTime(date, time);
    if (!startTime || seen.has(href + startTime)) continue;
    seen.add(href + startTime);
    const genre = firstMatch(block, /class=["'][^"']*event-genre[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const text = stripTags(block);

    output.push({
      sourceId: 'debartolo-performing-arts-center',
      sourceEventId: href.match(/\/event\/(\d+)/i)?.[1] || href,
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
      imageUrl: block.match(/(?:data-src|src)=["']([^"']+)["']/i)?.[1] ? absoluteUrl(sourceUrl, block.match(/(?:data-src|src)=["']([^"']+)["']/i)![1]) : null,
      ticketUrl: null,
      status: statusFromText(text),
      rawPayload: { href, title, date, time, genre },
      confidence: 0.94,
    });
  }

  return output;
}
