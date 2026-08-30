import type { AdapterContext, AdapterResult, EventSourceAdapter, NormalizedSourceEvent } from '../types';
import { clampConfidence, safeIso } from '../utils';

const SOURCE_ID = 'ticketmaster';
const API_BASE = 'https://app.ticketmaster.com/discovery/v2/events.json';

type TicketmasterEvent = {
  id: string;
  name: string;
  url?: string;
  info?: string;
  pleaseNote?: string;
  dates?: {
    start?: { dateTime?: string; localDate?: string; localTime?: string };
    end?: { dateTime?: string };
    status?: { code?: string };
    timezone?: string;
  };
  classifications?: Array<{ segment?: { name?: string }; genre?: { name?: string }; subGenre?: { name?: string } }>;
  images?: Array<{ url: string; width?: number; height?: number }>;
  priceRanges?: Array<{ min?: number; max?: number }>;
  _embedded?: {
    venues?: Array<{
      name?: string;
      address?: { line1?: string };
      city?: { name?: string };
      state?: { stateCode?: string };
      postalCode?: string;
      location?: { latitude?: string; longitude?: string };
    }>;
  };
};

function mapStatus(code?: string): NormalizedSourceEvent['status'] {
  if (!code) return 'unknown';
  if (code === 'cancelled') return 'cancelled';
  if (code === 'postponed' || code === 'rescheduled') return 'postponed';
  if (code === 'onsale' || code === 'offsale') return 'active';
  return 'unknown';
}

function bestImage(images?: TicketmasterEvent['images']): string | null {
  if (!images?.length) return null;
  return [...images].sort((a, b) => ((b.width || 0) * (b.height || 0)) - ((a.width || 0) * (a.height || 0)))[0]?.url || null;
}

function normalize(item: TicketmasterEvent, fetchedAt: string): NormalizedSourceEvent | null {
  const start = safeIso(item.dates?.start?.dateTime);
  if (!start) return null;
  const venue = item._embedded?.venues?.[0];
  const classification = item.classifications?.[0];
  const price = item.priceRanges?.[0];
  return {
    sourceId: SOURCE_ID,
    sourceEventId: item.id,
    sourceUrl: item.url || `https://www.ticketmaster.com/event/${item.id}`,
    fetchedAt,
    title: item.name,
    description: item.info || item.pleaseNote || null,
    startTime: start,
    endTime: safeIso(item.dates?.end?.dateTime),
    timezone: item.dates?.timezone || 'America/Indiana/Indianapolis',
    venueName: venue?.name || null,
    address: venue?.address?.line1 || null,
    city: venue?.city?.name || null,
    state: venue?.state?.stateCode || null,
    zip: venue?.postalCode || null,
    latitude: venue?.location?.latitude ? Number(venue.location.latitude) : null,
    longitude: venue?.location?.longitude ? Number(venue.location.longitude) : null,
    category: classification?.segment?.name || null,
    subcategory: classification?.genre?.name || classification?.subGenre?.name || null,
    tags: [classification?.segment?.name, classification?.genre?.name, classification?.subGenre?.name].filter(Boolean) as string[],
    priceMin: typeof price?.min === 'number' ? price.min : null,
    priceMax: typeof price?.max === 'number' ? price.max : null,
    isFree: typeof price?.min === 'number' ? price.min === 0 : null,
    familyFriendly: null,
    imageUrl: bestImage(item.images),
    ticketUrl: item.url || null,
    status: mapStatus(item.dates?.status?.code),
    rawPayload: item,
    confidence: clampConfidence(98),
  };
}

export const ticketmasterAdapter: EventSourceAdapter = {
  sourceId: SOURCE_ID,
  enabled: true,
  async fetchEvents(context: AdapterContext): Promise<AdapterResult> {
    const startedAt = new Date().toISOString();
    const errors: string[] = [];
    const apiKey = context.secrets?.TICKETMASTER_API_KEY;
    if (!apiKey) {
      return { sourceId: SOURCE_ID, startedAt, finishedAt: new Date().toISOString(), fetchedCount: 0, normalizedCount: 0, skippedCount: 0, errors: ['TICKETMASTER_API_KEY is not configured'], events: [] };
    }
    const fetchImpl = context.fetchImpl || fetch;
    const end = new Date(context.now.getTime() + context.horizonDays * 86400000);
    const params = new URLSearchParams({
      apikey: apiKey,
      latlong: `${context.latitude},${context.longitude}`,
      radius: String(context.radiusMiles),
      unit: 'miles',
      countryCode: 'US',
      startDateTime: context.now.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      endDateTime: end.toISOString().replace(/\.\d{3}Z$/, 'Z'),
      size: '200',
      sort: 'date,asc',
    });
    const response = await fetchImpl(`${API_BASE}?${params}`);
    if (!response.ok) throw new Error(`Ticketmaster request failed: ${response.status}`);
    const payload = await response.json() as { _embedded?: { events?: TicketmasterEvent[] } };
    const raw = payload._embedded?.events || [];
    const events = raw.map((item) => normalize(item, new Date().toISOString())).filter(Boolean) as NormalizedSourceEvent[];
    return {
      sourceId: SOURCE_ID,
      startedAt,
      finishedAt: new Date().toISOString(),
      fetchedCount: raw.length,
      normalizedCount: events.length,
      skippedCount: raw.length - events.length,
      errors,
      events,
    };
  },
};
