import type { ExtractedHtmlEvent } from '../adapters/structuredHtml';

function absoluteUrl(value: unknown, pageUrl: string): string | null {
  if (typeof value !== 'string' || !value.trim()) return null;
  try { return new URL(value, pageUrl).toString(); } catch { return null; }
}

function eventNodes(value: unknown): any[] {
  if (!value) return [];
  if (Array.isArray(value)) return value.flatMap(eventNodes);
  if (typeof value !== 'object') return [];
  const node = value as any;
  const out: any[] = [];
  const types = Array.isArray(node['@type']) ? node['@type'] : [node['@type']];
  if (types.some((t: unknown) => typeof t === 'string' && t.toLowerCase().includes('event'))) out.push(node);
  if (node['@graph']) out.push(...eventNodes(node['@graph']));
  if (node.itemListElement) out.push(...eventNodes(node.itemListElement));
  if (node.item) out.push(...eventNodes(node.item));
  return out;
}

export function extractJsonLdEvents(html: string, pageUrl: string): ExtractedHtmlEvent[] {
  const scripts = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  const events: ExtractedHtmlEvent[] = [];
  for (const match of scripts) {
    let parsed: unknown;
    try { parsed = JSON.parse(match[1].trim()); } catch { continue; }
    for (const node of eventNodes(parsed)) {
      if (!node.name || !node.startDate) continue;
      const location = node.location || {};
      const address = location.address || {};
      const sourceUrl = absoluteUrl(node.url, pageUrl) || pageUrl;
      const externalId = String(node['@id'] || node.identifier || sourceUrl + '#' + node.startDate + '#' + node.name);
      const offer = Array.isArray(node.offers) ? node.offers[0] : node.offers;
      const statusText = String(node.eventStatus || '').toLowerCase();
      events.push({
        externalId,
        sourceUrl,
        title: String(node.name),
        description: typeof node.description === 'string' ? node.description.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim() : null,
        startTime: String(node.startDate),
        endTime: node.endDate ? String(node.endDate) : null,
        venueName: location.name ? String(location.name) : null,
        address: address.streetAddress ? String(address.streetAddress) : null,
        city: address.addressLocality ? String(address.addressLocality) : null,
        state: address.addressRegion ? String(address.addressRegion) : null,
        zip: address.postalCode ? String(address.postalCode) : null,
        imageUrl: absoluteUrl(Array.isArray(node.image) ? node.image[0] : node.image, pageUrl),
        ticketUrl: absoluteUrl(offer?.url, pageUrl),
        isFree: offer?.price === 0 || offer?.price === '0' ? true : null,
        status: statusText.includes('cancel') ? 'cancelled' : statusText.includes('postpon') ? 'postponed' : 'active',
        rawPayload: node,
      });
    }
  }
  return events;
}
