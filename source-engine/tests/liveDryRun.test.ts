import { describe, expect, it } from 'vitest';
import { extractNotreDameEvents } from '../extractors/notreDame';
import { extractElkhartLibraryEvents } from '../extractors/elkhartLibrary';
import { extractSouthBendCubsEvents } from '../extractors/southBendCubs';

const UA = 'ImBoredSourceEngine/0.1 (+https://imbored.us; verification-only)';

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  const response = await fetch(url, {
    headers: {
      'user-agent': UA,
      accept: 'text/html,application/xhtml+xml',
    },
    redirect: 'follow',
  });
  return { status: response.status, text: await response.text() };
}

function summarize(name: string, status: number, htmlBytes: number, extracted: ReturnType<typeof extractNotreDameEvents>) {
  const summary = {
    source: name,
    httpStatus: status,
    htmlBytes,
    extractedCount: extracted.length,
    sample: extracted.slice(0, 3).map((event) => ({
      title: event.title,
      startTime: event.startTime,
      venueName: event.venueName,
      city: event.city,
      status: event.status,
      sourceUrl: event.sourceUrl,
    })),
  };
  console.log(`LIVE_DRY_RUN ${JSON.stringify(summary)}`);
}

describe('Wave 1 live-source dry run', () => {
  it('Notre Dame current public calendar is reachable and parser finds events', async () => {
    const url = 'https://events.nd.edu/events/';
    const { status, text } = await fetchText(url);
    const events = extractNotreDameEvents(text, url);
    summarize('notre-dame-events', status, text.length, events);
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(400);
    expect(text.length).toBeGreaterThan(1000);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
  }, 30_000);

  it('Elkhart Public Library current calendar is reachable and parser finds events', async () => {
    const url = 'https://www.myepl.org/events/';
    const { status, text } = await fetchText(url);
    const events = extractElkhartLibraryEvents(text, url);
    summarize('elkhart-public-library', status, text.length, events);
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(400);
    expect(text.length).toBeGreaterThan(1000);
    expect(events.length).toBeGreaterThan(0);
    expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
  }, 30_000);

  it('South Bend Cubs/Four Winds current events page is reachable and parser finds events when listed', async () => {
    const url = 'https://www.milb.com/south-bend/ballpark/upcoming-events';
    const { status, text } = await fetchText(url);
    const events = extractSouthBendCubsEvents(text, url);
    summarize('south-bend-cubs', status, text.length, events);
    expect(status).toBeGreaterThanOrEqual(200);
    expect(status).toBeLessThan(400);
    expect(text.length).toBeGreaterThan(1000);
    expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
  }, 30_000);
});
