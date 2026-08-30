import { describe, expect, it } from 'vitest';
import { wave2Adapters } from '../adapters/wave2Sources';

const context = { center: { latitude: 41.737, longitude: -86.221 }, radiusMiles: 30 } as any;

describe('Wave 2 live dry run', () => {
  for (const adapter of wave2Adapters) {
    it(`${adapter.sourceId} is reachable and parses without adapter failure`, async () => {
      const result = await adapter.fetchEvents(context);
      expect(result.errors).toEqual([]);
      expect(result.fetchedCount).toBeGreaterThanOrEqual(0);
      for (const event of result.events) {
        expect(event.title.trim().length).toBeGreaterThan(0);
        expect(Number.isNaN(Date.parse(event.startTime))).toBe(false);
        expect(event.sourceUrl.startsWith('http')).toBe(true);
        expect(event.sourceEventId.length).toBeGreaterThan(0);
      }
    }, 30000);
  }
});
