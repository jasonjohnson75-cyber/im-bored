export function decodeHtml(value: string): string {
  return value
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;|&apos;/gi, "'")
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>');
}

export function stripTags(value: string): string {
  return decodeHtml(value.replace(/<script[\s\S]*?<\/script>/gi, ' ').replace(/<style[\s\S]*?<\/style>/gi, ' ').replace(/<[^>]+>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

export function attr(tag: string, name: string): string | null {
  const match = tag.match(new RegExp(`${name}=["']([^"']+)["']`, 'i'));
  return match ? decodeHtml(match[1]) : null;
}

export function firstMatch(value: string, pattern: RegExp): string | null {
  const match = value.match(pattern);
  return match?.[1] ? stripTags(match[1]) : null;
}

export function firstHref(value: string, pattern?: RegExp): string | null {
  const candidates = [...value.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>([\s\S]*?)<\/a>/gi)];
  for (const match of candidates) {
    const href = decodeHtml(match[1]);
    const text = stripTags(match[2]);
    if (!pattern || pattern.test(`${text} ${href}`)) return href;
  }
  return null;
}

export function absoluteUrl(base: string, href: string | null): string | null {
  if (!href) return null;
  try { return new URL(href, base).toString(); } catch { return href; }
}

export function blocks(html: string, tagName: string, classToken?: string): string[] {
  const escaped = tagName.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  const regex = new RegExp(`<${escaped}\\b[^>]*>[\\s\\S]*?<\\/${escaped}>`, 'gi');
  return (html.match(regex) || []).filter((block) => !classToken || new RegExp(`class=["'][^"']*${classToken}[^"']*["']`, 'i').test(block));
}

export function parseLocalDateTime(dateText: string, timeText?: string | null): string | null {
  const text = `${dateText} ${timeText || ''}`.replace(/\s+/g, ' ').trim();
  const parsed = new Date(text);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

export function statusFromText(text: string): 'active'|'cancelled'|'postponed'|'unknown' {
  const normalized = text.toLowerCase();
  if (/cancelled|canceled/.test(normalized)) return 'cancelled';
  if (/postponed|rescheduled/.test(normalized)) return 'postponed';
  return 'active';
}
