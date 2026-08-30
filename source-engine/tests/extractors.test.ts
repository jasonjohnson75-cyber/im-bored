import { describe, expect, it } from 'vitest';
import { extractNotreDameEvents } from '../extractors/notreDame';
import { extractElkhartLibraryEvents } from '../extractors/elkhartLibrary';
import { extractSouthBendCubsEvents } from '../extractors/southBendCubs';
import { cubsFixture, elkhartFixture, notreDameFixture } from './fixtures';

describe('Wave 1 extractors', () => {
  it('extracts a public Notre Dame event', () => {
    const events = extractNotreDameEvents(notreDameFixture, 'https://events.nd.edu/events/');
    expect(events).toHaveLength(1);
    expect(events[0].title).toBe('Public Lecture');
    expect(events[0].venueName).toContain('DeBartolo');
    expect(events[0].tags).toContain('Open to the Public');
  });

  it('extracts Elkhart events and cancellation status', () => {
    const events = extractElkhartLibraryEvents(elkhartFixture, 'https://www.myepl.org/events/');
    expect(events).toHaveLength(2);
    expect(events[0].isFree).toBe(true);
    expect(events[0].city).toBe('Elkhart');
    expect(events[1].status).toBe('cancelled');
  });

  it('extracts a Four Winds Field event and ticket link', () => {
    const events = extractSouthBendCubsEvents(cubsFixture, 'https://www.milb.com/south-bend/ballpark/upcoming-events');
    expect(events).toHaveLength(1);
    expect(events[0].venueName).toBe('Four Winds Field');
    expect(events[0].city).toBe('South Bend');
    expect(events[0].ticketUrl).toContain('tickets.example');
  });
});
