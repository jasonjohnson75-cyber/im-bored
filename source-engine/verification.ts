import type { AdapterResult, NormalizedSourceEvent } from './types';

export type AdapterVerification = {
  sourceId: string;
  parserSuccessRate: number;
  validStartRate: number;
  venueRateWhenPresent: number;
  provenanceRate: number;
  cancellationCases: number;
  passed: boolean;
  failures: string[];
};

function percent(numerator: number, denominator: number): number {
  if (denominator === 0) return 100;
  return Math.round((numerator / denominator) * 10000) / 100;
}

function validStart(event: NormalizedSourceEvent): boolean {
  return !Number.isNaN(new Date(event.startTime).getTime());
}

export function verifyAdapterResult(result: AdapterResult): AdapterVerification {
  const total = result.fetchedCount || result.normalizedCount;
  const parserSuccessRate = percent(result.normalizedCount, total);
  const validStartCount = result.events.filter(validStart).length;
  const validStartRate = percent(validStartCount, result.events.length);
  const venueEligible = result.events.filter((event) => event.venueName || event.address || event.latitude != null || event.longitude != null);
  const venueValid = venueEligible.filter((event) => Boolean(event.venueName || (event.latitude != null && event.longitude != null))).length;
  const venueRateWhenPresent = percent(venueValid, venueEligible.length);
  const provenanceRate = percent(result.events.filter((event) => Boolean(event.sourceUrl)).length, result.events.length);
  const cancellationCases = result.events.filter((event) => event.status === 'cancelled').length;
  const failures: string[] = [];

  if (parserSuccessRate < 98) failures.push(`Parser success ${parserSuccessRate}% is below 98%.`);
  if (validStartRate < 100) failures.push(`Valid start-date rate ${validStartRate}% is below 100%.`);
  if (venueRateWhenPresent < 95) failures.push(`Venue/location rate ${venueRateWhenPresent}% is below 95%.`);
  if (provenanceRate < 100) failures.push(`Provenance rate ${provenanceRate}% is below 100%.`);
  if (result.errors.length) failures.push(`${result.errors.length} adapter errors were reported.`);

  return {
    sourceId: result.sourceId,
    parserSuccessRate,
    validStartRate,
    venueRateWhenPresent,
    provenanceRate,
    cancellationCases,
    passed: failures.length === 0,
    failures,
  };
}

export function verifyFourteenDaySample(results: AdapterResult[]): AdapterVerification[] {
  return results.map(verifyAdapterResult);
}
