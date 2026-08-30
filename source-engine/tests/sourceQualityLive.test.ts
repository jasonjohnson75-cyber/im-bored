import { describe, expect, it } from 'vitest';
import type { ExtractedHtmlEvent, HtmlExtractor } from '../adapters/structuredHtml';
import { extractNotreDameEvents } from '../extractors/notreDame';
import { extractElkhartLibraryEvents } from '../extractors/elkhartLibrary';
import { extractSouthBendCubsEvents } from '../extractors/southBendCubs';

const UA = 'ImBoredSourceEngine/0.1 (+https://imbored.us; source-quality-validation)';

type SourceCase = {
  sourceId: string;
  url: string;
  extractor: HtmlExtractor;
  requireEvents: boolean;
};

const SOURCES: SourceCase[] = [
  {
    sourceId: 'notre-dame-events',
    url: 'https://events.nd.edu/events/',
    extractor: extractNotreDameEvents,
    requireEvents: true,
  },
  {
    sourceId: 'elkhart-public-library',
    url: 'https://www.myepl.org/events/',
    extractor: extractElkhartLibraryEvents,
    requireEvents: true,
  },
  {
    sourceId: 'south-bend-cubs',
    url: 'https://www.milb.com/south-bend/ballpark/upcoming-events',
    extractor: extractSouthBendCubsEvents,
    requireEvents: false,
  },
];

async function fetchText(url: string) {
  const response = await fetch(url, {
    headers: {
      'user-agent': UA,
      accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  return { status: response.status, text: await response.text() };
}

function percent(numerator: number, denominator: number): number {
  if (!denominator) return 100;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function uniqueBy<T>(items: T[], key: (item: T) => string): number {
  return new Set(items.map(key)).size;
}

function quality(sourceId: string, events: ExtractedHtmlEvent[]) {
  const validStart = events.filter((event) => !Number.isNaN(new Date(event.startTime).getTime())).length;
  const titles = events.filter((event) => Boolean(event.title?.trim())).length;
  const provenance = events.filter((event) => /^https?:\/\//i.test(event.sourceUrl || '')).length;
  const venues = events.filter((event) => Boolean(event.venueName || event.address || event.city)).length;
  const cancellations = events.filter((event) => event.status === 'cancelled').length;
  const uniqueIds = uniqueBy(events, (event) => event.externalId);
  const uniqueUrls = uniqueBy(events, (event) => event.sourceUrl);

  const report = {
    sourceId,
    observedAt: new Date().toISOString(),
    extractedCount: events.length,
    titleRate: percent(titles, events.length),
    validStartRate: percent(validStart, events.length),
    provenanceRate: percent(provenance, events.length),
    venueCoverageRate: percent(venues, events.length),
    uniqueIdRate: percent(uniqueIds, events.length),
    uniqueUrlRate: percent(uniqueUrls, events.length),
    cancellationCases: cancellations,
    sample: events.slice(0, 3).map((event) => ({
      title: event.title,
      startTime: event.startTime,
      venueName: event.venueName,
      status: event.status,
      sourceUrl: event.sourceUrl,
    })),
  };

  console.log(`SOURCE_QUALITY ${JSON.stringify(report)}`);
  return report;
}

describe('Wave 1 source-quality validation', () => {
  for (const source of SOURCES) {
    it(`${source.sourceId} meets live baseline quality checks`, async () => {
      const { status, text } = await fetchText(source.url);
      expect(status).toBeGreaterThanOrEqual(200);
      expect(status).toBeLessThan(400);
      expect(text.length).toBeGreaterThan(1000);

      const events = source.extractor(text, source.url);
      const report = quality(source.sourceId, events);

      if (source.requireEvents) expect(events.length).toBeGreaterThan(0);
      if (events.length > 0) {
        expect(report.titleRate).toBe(100);
        expect(report.validStartRate).toBe(100);
        expect(report.provenanceRate).toBe(100);
        expect(report.uniqueIdRate).toBe(100);
        expect(report.uniqueUrlRate).toBe(100);
      }
    }, 30_000);
  }
});
