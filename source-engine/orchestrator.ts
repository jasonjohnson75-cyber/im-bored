import type { AdapterContext, AdapterResult, EventSourceAdapter, NormalizedSourceEvent } from './types';
import { duplicateDecision, duplicateScore, eventKey } from './utils';

export type CanonicalCandidate = {
  primary: NormalizedSourceEvent;
  provenance: NormalizedSourceEvent[];
  mergeDecisions: Array<{
    left: string;
    right: string;
    score: number;
    decision: 'auto_merge' | 'review' | 'separate';
  }>;
};

export async function runAdapters(adapters: EventSourceAdapter[], context: AdapterContext): Promise<AdapterResult[]> {
  const enabled = adapters.filter((adapter) => adapter.enabled);
  return Promise.all(enabled.map(async (adapter) => {
    try {
      return await adapter.fetchEvents(context);
    } catch (error) {
      const now = new Date().toISOString();
      return {
        sourceId: adapter.sourceId,
        startedAt: now,
        finishedAt: now,
        fetchedCount: 0,
        normalizedCount: 0,
        skippedCount: 0,
        errors: [error instanceof Error ? error.message : String(error)],
        events: [],
      };
    }
  }));
}

export function flattenResults(results: AdapterResult[]): NormalizedSourceEvent[] {
  const seen = new Set<string>();
  const output: NormalizedSourceEvent[] = [];
  for (const event of results.flatMap((result) => result.events)) {
    const key = eventKey(event);
    if (seen.has(key)) continue;
    seen.add(key);
    output.push(event);
  }
  return output;
}

export function buildCanonicalCandidates(events: NormalizedSourceEvent[]): CanonicalCandidate[] {
  const consumed = new Set<number>();
  const candidates: CanonicalCandidate[] = [];

  for (let i = 0; i < events.length; i += 1) {
    if (consumed.has(i)) continue;
    const base = events[i];
    const provenance = [base];
    const decisions: CanonicalCandidate['mergeDecisions'] = [];

    for (let j = i + 1; j < events.length; j += 1) {
      if (consumed.has(j)) continue;
      const comparison = events[j];
      const score = duplicateScore(base, comparison);
      const decision = duplicateDecision(score);
      decisions.push({
        left: eventKey(base),
        right: eventKey(comparison),
        score,
        decision,
      });
      if (decision === 'auto_merge') {
        provenance.push(comparison);
        consumed.add(j);
      }
    }

    consumed.add(i);
    const primary = [...provenance].sort((a, b) => b.confidence - a.confidence)[0];
    candidates.push({ primary, provenance, mergeDecisions: decisions });
  }

  return candidates;
}

export function summarizeRun(results: AdapterResult[]) {
  return {
    sourcesRun: results.length,
    fetched: results.reduce((sum, result) => sum + result.fetchedCount, 0),
    normalized: results.reduce((sum, result) => sum + result.normalizedCount, 0),
    skipped: results.reduce((sum, result) => sum + result.skippedCount, 0),
    errors: results.flatMap((result) => result.errors.map((error) => ({ sourceId: result.sourceId, error }))),
  };
}
