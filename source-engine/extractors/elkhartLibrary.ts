import type { HtmlExtractor, ExtractedHtmlEvent } from '../adapters/structuredHtml';
import { absoluteUrl, blocks, firstHref, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';

export const extractElkhartLibraryEvents: HtmlExtractor = (html, pageUrl): ExtractedHtmlEvent[] => {
  const candidates = [
    ...blocks(html, 'article', 'tribe-events-calendar-list__event-row'),
    ...blocks(html, 'article', 'type-tribe_events'),
    ...blocks(html, 'div', 'tribe-events-calendar-list__event-row'),
  ];
  const output: ExtractedHtmlEvent[] = [];
  const seen = new Set<string>();

  for (const block of candidates) {
    const title = firstMatch(block, /<h[2-4][^>]*>([\s\S]*?)<\/h[2-4]>/i);
    const href = absoluteUrl(pageUrl, firstHref(block));
    const dateTime = firstMatch(block, /<time[^>]*datetime=["']([^"']+)["'][^>]*>/i);
    const displayedDate = firstMatch(block, /class=["'][^"']*(?:tribe-event-date-start|tribe-events-calendar-list__event-datetime)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const venue = firstMatch(block, /class=["'][^"']*(?:tribe-venue|tribe-events-calendar-list__event-venue-title)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const address = firstMatch(block, /class=["'][^"']*(?:tribe-address|tribe-events-calendar-list__event-venue-address)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const text = stripTags(block);
    const start = dateTime ? new Date(dateTime).toISOString() : displayedDate ? parseLocalDateTime(displayedDate) : null;
    if (!title || !href || !start) continue;
    const externalId = `${href.replace(/\/$/, '')}:${start}`;
    if (seen.has(externalId)) continue;
    seen.add(externalId);
    output.push({
      externalId,
      sourceUrl: href,
      title,
      description: firstMatch(block, /class=["'][^"']*(?:description|event-description)[^"']*["'][^>]*>([\s\S]*?)<\//i),
      startTime: start,
      venueName: venue,
      address,
      city: /Elkhart/i.test(text) ? 'Elkhart' : null,
      state: /\bIN\b|Indiana/i.test(text) ? 'IN' : null,
      isFree: /\bfree\b/i.test(text) ? true : null,
      tags: /recurring event|\brecurring\b/i.test(text) ? ['Recurring'] : [],
      status: statusFromText(text),
      rawPayload: { listingText: text },
    });
  }
  return output;
};
