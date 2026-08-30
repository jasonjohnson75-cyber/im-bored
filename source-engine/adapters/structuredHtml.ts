import type { AdapterContext, AdapterResult, EventSourceAdapter, NormalizedSourceEvent } from '../types';
import { clampConfidence, safeIso } from '../utils';

export type ExtractedHtmlEvent = {
  externalId: string;
  sourceUrl: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  timezone?: string | null;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  subcategory?: string | null;
  tags?: string[];
  isFree?: boolean | null;
  familyFriendly?: boolean | null;
  imageUrl?: string | null;
  ticketUrl?: string | null;
  status?: NormalizedSourceEvent['status'];
  rawPayload?: unknown;
};

export type HtmlExtractor = (html: string, pageUrl: string) => ExtractedHtmlEvent[];

export type StructuredHtmlAdapterOptions = {
  sourceId: string;
  listingUrls: (context: AdapterContext) => string[];
  extractor: HtmlExtractor;
  confidence: number;
  enabled?: boolean;
  filter?: (event: ExtractedHtmlEvent) => boolean;
};

export function createStructuredHtmlAdapter(options: StructuredHtmlAdapterOptions): EventSourceAdapter {
  return {
    sourceId: options.sourceId,
    enabled: options.enabled ?? true,
    async fetchEvents(context: AdapterContext): Promise<AdapterResult> {
      const startedAt = new Date().toISOString();
      const fetchImpl = context.fetchImpl || fetch;
      const errors: string[] = [];
      const extracted: ExtractedHtmlEvent[] = [];
      for (const url of options.listingUrls(context)) {
        try {
          const response = await fetchImpl(url, { headers: { 'user-agent': 'ImBoredSourceEngine/0.1 (+https://imbored.us)' } });
          if (!response.ok) {
            errors.push(`${url}: HTTP ${response.status}`);
            continue;
          }
          const html = await response.text();
          extracted.push(...options.extractor(html, url));
        } catch (error) {
          errors.push(`${url}: ${error instanceof Error ? error.message : String(error)}`);
        }
      }
      const filtered = options.filter ? extracted.filter(options.filter) : extracted;
      const fetchedAt = new Date().toISOString();
      const events = filtered.map((item): NormalizedSourceEvent | null => {
        const start = safeIso(item.startTime);
        if (!start) return null;
        return {
          sourceId: options.sourceId,
          sourceEventId: item.externalId,
          sourceUrl: item.sourceUrl,
          fetchedAt,
          title: item.title,
          description: item.description || null,
          startTime: start,
          endTime: safeIso(item.endTime),
          timezone: item.timezone || 'America/Indiana/Indianapolis',
          venueName: item.venueName || null,
          address: item.address || null,
          city: item.city || null,
          state: item.state || null,
          zip: item.zip || null,
          latitude: item.latitude ?? null,
          longitude: item.longitude ?? null,
          category: item.category || null,
          subcategory: item.subcategory || null,
          tags: item.tags || [],
          priceMin: null,
          priceMax: null,
          isFree: item.isFree ?? null,
          familyFriendly: item.familyFriendly ?? null,
          imageUrl: item.imageUrl || null,
          ticketUrl: item.ticketUrl || null,
          status: item.status || 'active',
          rawPayload: item.rawPayload ?? item,
          confidence: clampConfidence(options.confidence),
        };
      }).filter(Boolean) as NormalizedSourceEvent[];
      return {
        sourceId: options.sourceId,
        startedAt,
        finishedAt: new Date().toISOString(),
        fetchedCount: extracted.length,
        normalizedCount: events.length,
        skippedCount: extracted.length - events.length,
        errors,
        events,
      };
    },
  };
}
