import { describe, expect, it } from 'vitest';
import { extractNotreDameEvents } from '../extractors/notreDame';
import { extractElkhartLibraryEvents } from '../extractors/elkhartLibrary';
import { extractSouthBendCubsEvents } from '../extractors/southBendCubs';
import { extractJsonLdEvents } from '../extractors/jsonLdEvents';

const UA = 'ImBoredSourceEngine/0.1 (+https://imbored.us; verification-only)';

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  const response = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' }, redirect: 'follow' });
  return { status: response.status, text: await response.text() };
}

function diagnostics(html: string) {
  const classNames = [...html.matchAll(/class=["']([^"']+)["']/gi)].map((m) => m[1]).filter((v) => /(event|date|time|location|venue|calendar|card|list)/i.test(v));
  const uniqueClasses = [...new Set(classNames)].slice(0, 40);
  const eventHrefPrefixes = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]).filter((v) => /event/i.test(v)).map((v) => v.replace(/[?#].*$/, '').replace(/\/[^/]+\/?$/, '/'));
  console.log(`LIVE_DIAGNOSTICS ${JSON.stringify({ uniqueClasses, uniqueHrefPrefixes: [...new Set(eventHrefPrefixes)].slice(0, 20) })}`);
}

function summarize(name: string, status: number, htmlBytes: number, extracted: any[]) {
  console.log(`LIVE_DRY_RUN ${JSON.stringify({ source: name, httpStatus: status, htmlBytes, extractedCount: extracted.length, sample: extracted.slice(0, 3).map((e) => ({ title: e.title, startTime: e.startTime, venueName: e.venueName, city: e.city, status: e.status, sourceUrl: e.sourceUrl })) })}`);
}

async function validateJsonLdSource(name: string, url: string, requireEvents = false) {
  const { status, text } = await fetchText(url);
  const events = extractJsonLdEvents(text, url);
  summarize(name, status, text.length, events);
  if (events.length === 0) diagnostics(text);
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(400);
  expect(text.length).toBeGreaterThan(1000);
  if (requireEvents) expect(events.length).toBeGreaterThan(0);
  if (events.length) expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
}

describe('Wave 1 live-source dry run', () => {
  it('Notre Dame current public calendar is reachable and parser finds events', async () => {
    const url = 'https://events.nd.edu/events/'; const { status, text } = await fetchText(url); const events = extractNotreDameEvents(text, url); summarize('notre-dame-events', status, text.length, events); if (!events.length) diagnostics(text); expect(status).toBeGreaterThanOrEqual(200); expect(status).toBeLessThan(400); expect(text.length).toBeGreaterThan(1000); expect(events.length).toBeGreaterThan(0); expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
  }, 30_000);
  it('Elkhart Public Library current calendar is reachable and parser finds events', async () => {
    const url = 'https://www.myepl.org/events/'; const { status, text } = await fetchText(url); const events = extractElkhartLibraryEvents(text, url); summarize('elkhart-public-library', status, text.length, events); expect(status).toBeGreaterThanOrEqual(200); expect(status).toBeLessThan(400); expect(text.length).toBeGreaterThan(1000); expect(events.length).toBeGreaterThan(0); expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
  }, 30_000);
  it('South Bend Cubs/Four Winds events page is reachable', async () => {
    const url = 'https://www.milb.com/south-bend/ballpark/upcoming-events'; const { status, text } = await fetchText(url); const events = extractSouthBendCubsEvents(text, url); summarize('south-bend-cubs', status, text.length, events); if (!events.length) diagnostics(text); expect(status).toBeGreaterThanOrEqual(200); expect(status).toBeLessThan(400); expect(text.length).toBeGreaterThan(1000); expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
  }, 30_000);
});

describe('Wave 3 live-source dry run', () => {
  const sources: Array<[string,string,boolean]> = [
    ['south-bend-vpa','https://sbvpa.org/events/',false],
    ['debartolo-performing-arts-center','https://performingarts.nd.edu/events/',false],
    ['morris-performing-arts-center','https://morriscenter.org/events/',false],
    ['the-lerner','https://thelerner.com/events/',false],
    ['elkhart-county-parks','https://elkhartcountyparks.org/events/',false],
    ['potawatomi-zoo','https://www.potawatomizoo.org/events/',false],
    ['niles-district-library','https://nileslibrary.com/events/',false],
  ];
  for (const [name,url,requireEvents] of sources) it(`${name} is reachable and parseable`, async () => validateJsonLdSource(name,url,requireEvents), 30_000);
});
