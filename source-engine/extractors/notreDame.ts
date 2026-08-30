import type { HtmlExtractor, ExtractedHtmlEvent } from '../adapters/structuredHtml';
import { absoluteUrl, blocks, firstHref, firstMatch, parseLocalDateTime, statusFromText, stripTags } from './htmlPrimitives';

export const extractNotreDameEvents: HtmlExtractor = (html, pageUrl): ExtractedHtmlEvent[] => {
  const eventBlocks = [
    ...blocks(html, 'article', 'event'),
    ...blocks(html, 'li', 'event'),
  ];
  const seen = new Set<string>();
  const output: ExtractedHtmlEvent[] = [];

  for (const block of eventBlocks) {
    const title = firstMatch(block, /<h[1-4][^>]*>([\s\S]*?)<\/h[1-4]>/i) || firstMatch(block, /class=["'][^"']*(?:event-title|title)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const href = absoluteUrl(pageUrl, firstHref(block));
    const date = firstMatch(block, /(?:class=["'][^"']*(?:date|event-date)[^"']*["'][^>]*>|<time[^>]*>)([\s\S]*?)(?:<\/time>|<\/[^>]+>)/i);
    const time = firstMatch(block, /class=["'][^"']*(?:time|event-time)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const location = firstMatch(block, /class=["'][^"']*(?:location|venue)[^"']*["'][^>]*>([\s\S]*?)<\//i);
    const text = stripTags(block);
    const start = date ? parseLocalDateTime(date, time) : null;
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
