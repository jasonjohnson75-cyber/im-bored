import { createStructuredHtmlAdapter } from './structuredHtml';
import { extractJsonLdEvents } from '../extractors/jsonLdEvents';

const withinLaunchRegion = (event: any) => {
  const state = String(event.state || '').toUpperCase();
  return !state || state === 'IN' || state === 'MI' || state === 'INDIANA' || state === 'MICHIGAN';
};

export const mishawakaAdapter = createStructuredHtmlAdapter({
  sourceId: 'city-of-mishawaka',
  listingUrls: () => ['https://mishawaka.in.gov/things-to-do/city-calendar/'],
  extractor: extractJsonLdEvents,
  confidence: 0.93,
  filter: withinLaunchRegion,
});

export const downtownSouthBendAdapter = createStructuredHtmlAdapter({
  sourceId: 'downtown-south-bend',
  listingUrls: () => ['https://www.downtownsouthbend.com/celebrate-summer'],
  extractor: extractJsonLdEvents,
  confidence: 0.9,
  filter: withinLaunchRegion,
});

export const buchananCityAdapter = createStructuredHtmlAdapter({
  sourceId: 'city-of-buchanan',
  listingUrls: () => ['https://www.cityofbuchanan.com/calendar'],
  extractor: extractJsonLdEvents,
  confidence: 0.9,
  filter: withinLaunchRegion,
});

export const nilesMainStreetAdapter = createStructuredHtmlAdapter({
  sourceId: 'niles-main-street',
  listingUrls: () => ['https://www.niles.org/nmsa-calendar-of-events'],
  extractor: extractJsonLdEvents,
  confidence: 0.9,
  filter: withinLaunchRegion,
});

export const wave2Adapters = [mishawakaAdapter, downtownSouthBendAdapter, buchananCityAdapter, nilesMainStreetAdapter];
