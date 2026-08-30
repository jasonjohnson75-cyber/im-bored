import { describe, expect, it } from 'vitest';
import { extractNotreDameEvents } from '../extractors/notreDame';
import { extractElkhartLibraryEvents } from '../extractors/elkhartLibrary';
import { extractSouthBendCubsEvents } from '../extractors/southBendCubs';
import { extractJsonLdEvents } from '../extractors/jsonLdEvents';
import { extractDebartoloEvents } from '../extractors/debartolo';
import { extractElkhartCountyParksEvents } from '../extractors/elkhartCountyParks';

const UA = 'ImBoredSourceEngine/0.1 (+https://imbored.us; verification-only)';

type Extractor = (html: string, url: string) => any[];

async function fetchText(url: string): Promise<{ status: number; text: string }> {
  const response = await fetch(url, { headers: { 'user-agent': UA, accept: 'text/html,application/xhtml+xml' }, redirect: 'follow' });
  return { status: response.status, text: await response.text() };
}

function diagnostics(html: string) {
  const classNames = [...html.matchAll(/class=["']([^"']+)["']/gi)].map((m) => m[1]).filter((v) => /(event|date|time|location|venue|calendar|card|list)/i.test(v));
  const eventHrefPrefixes = [...html.matchAll(/href=["']([^"']+)["']/gi)].map((m) => m[1]).filter((v) => /event/i.test(v)).map((v) => v.replace(/[?#].*$/, '').replace(/\/[^/]+\/?$/, '/'));
  console.log(`LIVE_DIAGNOSTICS ${JSON.stringify({ uniqueClasses: [...new Set(classNames)].slice(0, 40), uniqueHrefPrefixes: [...new Set(eventHrefPrefixes)].slice(0, 20) })}`);
}

function summarize(name: string, status: number, htmlBytes: number, extracted: any[], challenged = false) {
  console.log(`LIVE_DRY_RUN ${JSON.stringify({ source: name, httpStatus: status, htmlBytes, challenged, extractedCount: extracted.length, sample: extracted.slice(0, 3).map((e) => ({ title: e.title, startTime: e.startTime, venueName: e.venueName, city: e.city, status: e.status, sourceUrl: e.sourceUrl })) })}`);
}

async function validateSource(name: string, url: string, extractor: Extractor, requireEvents = false) {
  const { status, text } = await fetchText(url);
  const challenged = status === 202 && text.length < 1000;
  const events = challenged ? [] : extractor(text, url);
  summarize(name, status, text.length, events, challenged);
  if (!events.length && !challenged) diagnostics(text);
  expect(status).toBeGreaterThanOrEqual(200);
  expect(status).toBeLessThan(400);
  expect(text.length).toBeGreaterThan(challenged ? 250 : 500);
  if (requireEvents && !challenged) expect(events.length).toBeGreaterThan(0);
  if (events.length) expect(events.every((event) => Boolean(event.title && event.startTime && event.sourceUrl))).toBe(true);
}

describe('Wave 1 live-source dry run', () => {
  it('Notre Dame current public calendar is reachable and parser finds events', async () => validateSource('notre-dame-events','https://events.nd.edu/events/',extractNotreDameEvents,true), 30_000);
  it('Elkhart Public Library current calendar is reachable and parser finds events', async () => validateSource('elkhart-public-library','https://www.myepl.org/events/',extractElkhartLibraryEvents,true), 30_000);
  it('South Bend Cubs/Four Winds events page is reachable', async () => validateSource('south-bend-cubs','https://www.milb.com/south-bend/ballpark/upcoming-events',extractSouthBendCubsEvents,false), 30_000);
});

describe('Wave 3 live-source dry run', () => {
  const sources: Array<[string,string,Extractor,boolean]> = [
    ['south-bend-vpa','https://sbvpa.org/',extractJsonLdEvents,false],
    ['debartolo-performing-arts-center','https://performingarts.nd.edu/events/',extractDebartoloEvents,true],
    ['morris-performing-arts-center','https://morriscenter.org/events/',extractJsonLdEvents,true],
    ['the-lerner','https://thelerner.com/events/',extractJsonLdEvents,false],
    ['elkhart-county-parks','https://elkhartcountyparks.org/events/',extractElkhartCountyParksEvents,true],
    ['potawatomi-zoo','https://www.potawatomizoo.org/events/',extractJsonLdEvents,true],
    ['niles-district-library','https://nileslibrary.com/events/',extractJsonLdEvents,true],
  ];
  for (const [name,url,extractor,requireEvents] of sources) it(`${name} is reachable and parseable`, async () => validateSource(name,url,extractor,requireEvents), 30_000);
});
