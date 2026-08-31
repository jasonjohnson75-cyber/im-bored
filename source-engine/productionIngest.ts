import { createClient } from '@supabase/supabase-js';
import { createNotreDameAdapter, createElkhartLibraryAdapter, createSouthBendCubsAdapter } from './adapters/wave1HtmlSources';
import { wave2Adapters } from './adapters/wave2Sources';
import { wave3Adapters } from './adapters/wave3Sources';
import { runAdapters, flattenResults } from './orchestrator';
import type { NormalizedSourceEvent } from './types';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) throw new Error('SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required');

const supabase = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });

const allAdapters = [
  createNotreDameAdapter(),
  createElkhartLibraryAdapter(),
  createSouthBendCubsAdapter(),
  ...wave2Adapters,
  ...wave3Adapters,
];

function inferCategory(event: NormalizedSourceEvent): string {
  if (event.category) {
    const raw = event.category.toLowerCase();
    if (/music|concert|jazz|orchestra|band/.test(raw)) return 'Music';
    if (/sport|athletic|baseball|football|basketball|soccer|hockey/.test(raw)) return 'Sports';
    if (/outdoor|park|nature|trail|garden/.test(raw)) return 'Outdoors';
    if (/art|theatre|theater|film|museum|culture|dance/.test(raw)) return 'Arts';
    if (/family|kids|children|youth/.test(raw)) return 'Family';
  }
  const text = `${event.title} ${event.description || ''} ${(event.tags || []).join(' ')}`.toLowerCase();
  if (/concert|music|jazz|orchestra|symphony|band|live music/.test(text)) return 'Music';
  if (/baseball|football|basketball|soccer|hockey|game|athletic|sports/.test(text)) return 'Sports';
  if (/park|nature|trail|outdoor|garden|hike|wildlife/.test(text)) return 'Outdoors';
  if (/theatre|theater|film|movie|museum|art|gallery|dance|ballet/.test(text)) return 'Arts';
  if (/family|kids|children|child|youth|storytime|baby|teen/.test(text)) return 'Family';
  return 'Community';
}

const now = new Date();
const { data: sources, error: sourceError } = await supabase
  .from('sources')
  .select('id,slug,adapter_key,name,active,refresh_minutes')
  .eq('active', true);
if (sourceError) throw sourceError;

const sourceByKey = new Map<string, any>();
for (const source of sources || []) {
  if (source.slug) sourceByKey.set(source.slug, source);
  if (source.adapter_key) sourceByKey.set(source.adapter_key, source);
}

const adapters = allAdapters.filter((adapter) => sourceByKey.has(adapter.sourceId));
const results = await runAdapters(adapters, {
  now,
  horizonDays: 60,
  latitude: 41.6764,
  longitude: -86.2520,
  radiusMiles: 30,
});

const events = flattenResults(results).filter((event) => {
  const start = new Date(event.startTime);
  return event.status !== 'unknown' && !Number.isNaN(start.getTime()) && start >= new Date(now.getTime() - 86400000);
});

let upserted = 0;
for (const event of events) {
  const source = sourceByKey.get(event.sourceId);
  if (!source) continue;
  const canonicalKey = `${event.sourceId}:${event.sourceEventId}`;
  const row = {
    canonical_key: canonicalKey,
    external_id: event.sourceEventId,
    title: event.title,
    description: event.description || null,
    category: inferCategory(event),
    subcategory: event.subcategory || null,
    tags: event.tags || [],
    start_time: event.startTime,
    end_time: event.endTime || null,
    timezone: event.timezone || 'America/Indiana/Indianapolis',
    venue_name: event.venueName || null,
    address: event.address || null,
    city: event.city || null,
    state: event.state || null,
    zip: event.zip || null,
    price_min: event.priceMin ?? null,
    price_max: event.priceMax ?? null,
    is_free: event.isFree ?? null,
    family_friendly: event.familyFriendly ?? null,
    image_url: event.imageUrl || null,
    ticket_url: event.ticketUrl || null,
    source_url: event.sourceUrl,
    source_id: source.id,
    source_name: source.name,
    source_method: 'source-engine',
    status: event.status === 'cancelled' ? 'cancelled' : event.status === 'postponed' ? 'postponed' : 'active',
    confidence_score: Math.max(0, Math.min(100, event.confidence <= 1 ? event.confidence * 100 : event.confidence)),
    last_checked: event.fetchedAt,
    verified_at: event.fetchedAt,
    source_payload: event.rawPayload,
    dedupe_status: 'clear',
    updated_at: new Date().toISOString(),
  };
  const { error } = await supabase.from('events').upsert(row, { onConflict: 'canonical_key' });
  if (error) {
    console.error('UPSERT_ERROR', event.sourceId, event.title, error.message);
  } else {
    upserted += 1;
  }
}

for (const result of results) {
  const source = sourceByKey.get(result.sourceId);
  if (!source) continue;
  const refresh = Number(source.refresh_minutes || 120);
  await supabase.from('sources').update({
    last_checked: new Date().toISOString(),
    next_check_at: new Date(Date.now() + refresh * 60000).toISOString(),
  }).eq('id', source.id);
}

console.log(JSON.stringify({
  sourcesRun: results.length,
  normalized: events.length,
  upserted,
  errors: results.flatMap((r) => r.errors.map((error) => ({ source: r.sourceId, error }))),
}, null, 2));
