import type { AdapterContext, AdapterResult, EventSourceAdapter } from '../types';
import { createStructuredHtmlAdapter, type HtmlExtractor } from './structuredHtml';

export function createNotreDameAdapter(extractor: HtmlExtractor): EventSourceAdapter {
  return createStructuredHtmlAdapter({
    sourceId: 'notre-dame-events',
    confidence: 94,
    listingUrls: (context) => {
      const urls: string[] = [];
      for (let offset = 0; offset < Math.min(context.horizonDays, 90); offset += 14) {
        const day = new Date(context.now.getTime() + offset * 86400000).toISOString().slice(0, 10);
        urls.push(`https://events.nd.edu/events/calendar/${day}/`);
      }
      return urls;
    },
    extractor,
    filter: (event) => {
      const haystack = `${event.category || ''} ${(event.tags || []).join(' ')} ${event.description || ''}`.toLowerCase();
      return haystack.includes('open to the public') || !haystack.includes('private');
    },
  });
}

export function createSouthBendCubsAdapter(extractor: HtmlExtractor): EventSourceAdapter {
  return createStructuredHtmlAdapter({
    sourceId: 'south-bend-cubs',
    confidence: 96,
    listingUrls: () => [
      'https://www.milb.com/south-bend/schedule',
      'https://www.milb.com/south-bend/ballpark/upcoming-events',
    ],
    extractor,
  });
}

export function createElkhartLibraryAdapter(extractor: HtmlExtractor): EventSourceAdapter {
  return createStructuredHtmlAdapter({
    sourceId: 'elkhart-public-library',
    confidence: 94,
    listingUrls: (context) => {
      const urls: string[] = [];
      for (let offset = 0; offset < Math.min(context.horizonDays, 60); offset += 14) {
        const day = new Date(context.now.getTime() + offset * 86400000).toISOString().slice(0, 10);
        urls.push(`https://www.myepl.org/events/?tribe-bar-date=${day}`);
      }
      return urls;
    },
    extractor,
  });
}

export const visitSouthBendDiscoveryAdapter: EventSourceAdapter = {
  sourceId: 'visit-south-bend-mishawaka',
  enabled: false,
  async fetchEvents(_context: AdapterContext): Promise<AdapterResult> {
    const now = new Date().toISOString();
    return {
      sourceId: 'visit-south-bend-mishawaka',
      startedAt: now,
      finishedAt: now,
      fetchedCount: 0,
      normalizedCount: 0,
      skippedCount: 0,
      errors: ['Adapter intentionally disabled pending permitted endpoint discovery and terms validation.'],
      events: [],
    };
  },
};
