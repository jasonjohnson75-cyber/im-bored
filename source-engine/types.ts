export type SourceStatus = 'active' | 'cancelled' | 'postponed' | 'expired' | 'unknown';

export type NormalizedSourceEvent = {
  sourceId: string;
  sourceEventId: string;
  sourceUrl: string;
  fetchedAt: string;
  title: string;
  description?: string | null;
  startTime: string;
  endTime?: string | null;
  timezone: string;
  venueName?: string | null;
  address?: string | null;
  city?: string | null;
  state?: string | null;
  zip?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  category?: string | null;
  subcategory?: string | null;
  tags: string[];
  priceMin?: number | null;
  priceMax?: number | null;
  isFree?: boolean | null;
  familyFriendly?: boolean | null;
  imageUrl?: string | null;
  ticketUrl?: string | null;
  status: SourceStatus;
  rawPayload: unknown;
  confidence: number;
};

export type AdapterContext = {
  now: Date;
  horizonDays: number;
  latitude: number;
  longitude: number;
  radiusMiles: number;
  fetchImpl?: typeof fetch;
  secrets?: Record<string, string | undefined>;
};

export type AdapterResult = {
  sourceId: string;
  startedAt: string;
  finishedAt: string;
  fetchedCount: number;
  normalizedCount: number;
  skippedCount: number;
  errors: string[];
  events: NormalizedSourceEvent[];
};

export interface EventSourceAdapter {
  sourceId: string;
  enabled: boolean;
  fetchEvents(context: AdapterContext): Promise<AdapterResult>;
}
