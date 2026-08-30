import type { HtmlExtractor, ExtractedHtmlEvent } from '../adapters/structuredHtml';
import { absoluteUrl, blocks, firstHref, firstMatch, statusFromText, stripTags } from './htmlPrimitives';

function parseNotreDameStart(timeText: string | null, href: string | null): string | null {
  if (!timeText) return null;

  const hrefDate = href?.match(/\/events\/(\d{4})\/(\d{2})\/(\d{2})\//);
  const year = hrefDate ? Number(hrefDate[1]) : new Date().getFullYear();
  const monthFromHref = hrefDate ? Number(hrefDate[2]) : null;
  const dayFromHref = hrefDate ? Number(hrefDate[3]) : null;

  if (/all day/i.test(timeText) && monthFromHref && dayFromHref) {
    return new Date(Date.UTC(year, monthFromHref - 1, dayFromHref, 0, 0, 0)).toISOString();
  }

  const monthDay = timeText.match(/\b(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+(\d{1,2})\b/i);
  const clock = timeText.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (!clock) return null;

  const months: Record<string, number> = {
    jan: 0, feb: 1, mar: 2, apr: 3, may: 4, jun: 5,
    jul: 6, aug: 7, sep: 8, oct: 9, nov: 10, dec: 11,
  };
  const month = monthDay ? months[monthDay[1].slice(0, 3).toLowerCase()] : (monthFromHref ? monthFromHref - 1 : null);
  const day = monthDay ? Number(monthDay[2]) : dayFromHref;
  if (month == null || !day) return null;

  let hour = Number(clock[1]);
  const minute = Number(clock[2] || 0);
  const meridiem = clock[3].toLowerCase();
  if (meridiem === 'pm' && hour !== 12) hour += 12;
  if (meridiem === 'am' && hour === 12) hour = 0;

  const localIso = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}T${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}:00-04:00`;
  const parsed = new Date(localIso);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

function metaText(block: string, classToken: string): string | null {
  for (const tag of ['div', 'li', 'p', 'span']) {
    const match = blocks(block, tag, classToken)[0];
    if (match) {
      return stripTags(match).replace(/^\s*(?:Time|Location|Date):\s*/i, '').trim();
    }
  }
  return null;
}

export const extractNotreDameEvents: HtmlExtractor = (html, pageUrl): ExtractedHtmlEvent[] => {
  const eventBlocks = [
    ...blocks(html, 'article', 'event'),
    ...blocks(html, 'li', 'event'),
  ];
  const seen = new Set<string>();
  const output: ExtractedHtmlEvent[] = [];

  for (const block of eventBlocks) {
    const title = firstMatch(block, /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) || firstMatch(block, /class=["'][^"']*(?:event-title|title)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const href = absoluteUrl(pageUrl, firstHref(block, /\/events\/\d{4}\/\d{2}\/\d{2}\//i) || firstHref(block));
    const timeText = metaText(block, 'event-time');
    const location = metaText(block, 'event-location') || metaText(block, 'venue');
    const text = stripTags(block);
    const start = parseNotreDameStart(timeText, href);
    if (!title || !href || !start) continue;
    const externalId = new URL(href).pathname.replace(/\/$/, '') || href;
    if (seen.has(externalId)) continue;
    seen.add(externalId);
    const isPublic = /open to the public/i.test(text);
    output.push({
      externalId,
      sourceUrl: href,
      title,
      startTime: start,
      venueName: location,
      tags: isPublic ? ['Open to the Public'] : [],
      status: statusFromText(text),
      rawPayload: { listingText: text },
    });
  }
  return output;
};
