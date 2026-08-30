import type { HtmlExtractor, ExtractedHtmlEvent } from '../adapters/structuredHtml';
import { absoluteUrl, blocks, firstHref, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';

export const extractSouthBendCubsEvents: HtmlExtractor = (html, pageUrl): ExtractedHtmlEvent[] => {
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
      tags: /fireworks|giveaway|theme night|promotion/i.test(text) ? ['Promotion'] : [],
      status: statusFromText(text),
      rawPayload: { listingText: text },
    });
  }
  return output;
};
