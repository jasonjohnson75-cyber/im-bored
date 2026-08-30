import type { NormalizedSourceEvent } from './types';

export function normalizeWhitespace(value?: string | null): string | null {
  if (!value) return null;
  const cleaned = value.replace(/\s+/g, ' ').trim();
  return cleaned || null;
}

export function normalizeTitle(value: string): string {
  return value
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export function clampConfidence(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value * 100) / 100));
}

export function safeIso(value?: string | Date | null): string | null {
  if (!value) return null;
  const date = value instanceof Date ? value : new Date(value);
  return Number.isNaN(date.getTime()) ? null : date.toISOString();
}

export function eventKey(event: Pick<NormalizedSourceEvent, 'sourceId' | 'sourceEventId'>): string {
  return `${event.sourceId}:${event.sourceEventId}`;
}

export function minutesBetween(a: string, b: string): number {
  return Math.abs(new Date(a).getTime() - new Date(b).getTime()) / 60000;
}

function tokenSet(value: string): Set<string> {
  return new Set(normalizeTitle(value).split(' ').filter(Boolean));
}

export function titleSimilarity(a: string, b: string): number {
  const left = tokenSet(a);
  const right = tokenSet(b);
  if (!left.size || !right.size) return 0;
  const overlap = [...left].filter((token) => right.has(token)).length;
  const union = new Set([...left, ...right]).size;
  return overlap / union;
}

export function haversineMiles(
  lat1?: number | null,
  lon1?: number | null,
  lat2?: number | null,
  lon2?: number | null,
): number | null {
  if ([lat1, lon1, lat2, lon2].some((v) => typeof v !== 'number')) return null;
  const r = 3958.7613;
  const toRad = (n: number) => (n * Math.PI) / 180;
  const dLat = toRad(lat2! - lat1!);
  const dLon = toRad(lon2! - lon1!);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1!)) * Math.cos(toRad(lat2!)) * Math.sin(dLon / 2) ** 2;
  return 2 * r * Math.asin(Math.sqrt(a));
}

export function duplicateScore(a: NormalizedSourceEvent, b: NormalizedSourceEvent): number {
  const timeScore = minutesBetween(a.startTime, b.startTime) <= 30 ? 1 : 0;
  const coordDistance = haversineMiles(a.latitude, a.longitude, b.latitude, b.longitude);
  const venueText = normalizeTitle(a.venueName || '') === normalizeTitle(b.venueName || '') && !!a.venueName && !!b.venueName;
  const venueScore = coordDistance !== null ? (coordDistance <= 0.25 ? 1 : coordDistance <= 1 ? 0.5 : 0) : (venueText ? 1 : 0);
  const titleScore = titleSimilarity(a.title, b.title);
  const urlScore = !!a.ticketUrl && !!b.ticketUrl && a.ticketUrl === b.ticketUrl ? 1 : 0;
  return (timeScore * 0.35) + (venueScore * 0.30) + (titleScore * 0.25) + (urlScore * 0.10);
}

export function duplicateDecision(score: number): 'auto_merge' | 'review' | 'separate' {
  if (score >= 0.9) return 'auto_merge';
  if (score >= 0.75) return 'review';
  return 'separate';
}
