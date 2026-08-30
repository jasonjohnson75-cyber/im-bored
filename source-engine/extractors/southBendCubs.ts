import type { HtmlExtractor, ExtractedHtmlEvent } from '../adapters/structuredHtml';
import { absoluteUrl, blocks, firstHref, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';
import { extractJsonLdEvents } from './jsonLdEvents';

function embeddedEvents(html: string, pageUrl: string): ExtractedHtmlEvent[] {
  const out: ExtractedHtmlEvent[] = [];
  const seen = new Set<string>();
  const objectPattern = /\{[^{}]{0,4000}(?:"name"|"title")\s*:\s*"([^"]+)"[^{}]{0,4000}(?:"startDate"|"startTime"|"dateTime"|"gameDate")\s*:\s*"([^"]+)"[^{}]{0,4000}\}/gi;
  for (const match of html.matchAll(objectPattern)) {
    const raw = match[0];
    const title = match[1]?.replace(/\\u0026/g, '&').replace(/\\"/g, '"').trim();
    const start = match[2];
    if (!title || !start || Number.isNaN(new Date(start).getTime())) continue;
    const hrefMatch = raw.match(/"(?:url|link|eventUrl|ticketsUrl)"\s*:\s*"([^"]+)"/i);
    const href = absoluteUrl(pageUrl, hrefMatch?.[1]?.replace(/\\\//g, '/') || null) || pageUrl;
    const key = `${title.toLowerCase()}:${new Date(start).toISOString()}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push({
      externalId: key,
      sourceUrl: href,
      title,
      startTime: new Date(start).toISOString(),
      venueName: 'Four Winds Field',
      city: 'South Bend',
      state: 'IN',
      tags: ['Sports'],
      status: 'active',
      rawPayload: { embedded: raw.slice(0, 1200) },
    });
  }
  return out;
}

export const extractSouthBendCubsEvents: HtmlExtractor = (html, pageUrl): ExtractedHtmlEvent[] => {
  const jsonLd = extractJsonLdEvents(html, pageUrl).map((event) => ({
    ...event,
    venueName: event.venueName || 'Four Winds Field',
    city: event.city || 'South Bend',
    state: event.state || 'IN',
    tags: [...new Set([...(event.tags || []), 'Sports'])],
  }));
  if (jsonLd.length) return jsonLd;

  const eventBlocks = [
    ...blocks(html, 'article', 'event'),
    ...blocks(html, 'div', 'event'),
    ...blocks(html, 'li', 'event'),
  ];
  const output: ExtractedHtmlEvent[] = [];
  const seen = new Set<string>();

  for (const block of eventBlocks) {
    const title = firstMatch(block, /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) || firstMatch(block, /class=["'][^"']*(?:event-title|title)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const date = firstMatch(block, /class=["'][^"']*(?:date|event-date)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const time = firstMatch(block, /class=["'][^"']*(?:time|event-time)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const href = absoluteUrl(pageUrl, firstHref(block));
    const text = stripTags(block);
    const start = date ? parseLocalDateTime(date, time) : null;
    if (!title || !start) continue;
    const canonicalUrl = href || pageUrl;
    const externalId = `${title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}:${start.slice(0,10)}`;
    if (seen.has(externalId)) continue;
    seen.add(externalId);
    output.push({
      externalId,
      sourceUrl: canonicalUrl,
      title,
      description: firstMatch(block, /<p[^>]*>([\s\S]*?)<\/p>/i),
      startTime: start,
      venueName: 'Four Winds Field',
      city: 'South Bend',
      state: 'IN',
      ticketUrl: absoluteUrl(pageUrl, firstHref(block, /ticket/i)),
      tags: [/fireworks|giveaway|theme night|promotion/i.test(text) ? 'Promotion' : null, 'Sports'].filter(Boolean) as string[],
      status: statusFromText(text),
      rawPayload: { listingText: text },
    });
  }
  if (output.length) return output;
  return embeddedEvents(html, pageUrl);
};
