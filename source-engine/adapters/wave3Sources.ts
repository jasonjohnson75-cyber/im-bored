import { createStructuredHtmlAdapter } from './structuredHtml';
import { extractJsonLdEvents } from '../extractors/jsonLdEvents';

const regional = (event: any) => {
  const state = String(event.state || '').toUpperCase();
  return !state || ['IN', 'MI', 'INDIANA', 'MICHIGAN'].includes(state);
};

const source = (sourceId: string, urls: string[], confidence = 0.9) =>
  createStructuredHtmlAdapter({ sourceId, listingUrls: () => urls, extractor: extractJsonLdEvents, confidence, filter: regional });

export const southBendVpaAdapter = source('south-bend-vpa', ['https://sbvpa.org/events/'], 0.93);
export const debartoloAdapter = source('debartolo-performing-arts-center', ['https://performingarts.nd.edu/events/'], 0.94);
export const morrisAdapter = source('morris-performing-arts-center', ['https://morriscenter.org/events/'], 0.94);
export const civicTheatreAdapter = source('south-bend-civic-theatre', ['https://sbct.org/events/'], 0.92);
export const centuryCenterAdapter = source('century-center', ['https://centurycenter.org/events/'], 0.9);
export const studebakerAdapter = source('studebaker-national-museum', ['https://www.studebakermuseum.org/events/'], 0.92);
export const historyMuseumAdapter = source('the-history-museum', ['https://www.historymuseumsb.org/events/'], 0.92);
export const elkhartParksAdapter = source('city-of-elkhart-parks', ['https://www.cityofelkhartin.gov/departments/parks-and-recreation/events/'], 0.92);
export const elkhartCountyParksAdapter = source('elkhart-county-parks', ['https://elkhartcountyparks.org/events/'], 0.94);
export const lernerAdapter = source('the-lerner', ['https://thelerner.com/events/'], 0.94);
export const nilesLibraryAdapter = source('niles-district-library', ['https://nileslibrary.com/events/'], 0.92);
export const potawatomiZooAdapter = source('potawatomi-zoo', ['https://www.potawatomizoo.org/events/'], 0.92);
export const howardParkAdapter = source('howard-park', ['https://visithowardpark.com/events/'], 0.9);
export const stockroomEastAdapter = source('stockroom-east', ['https://stockroomeast.com/events/'], 0.88);

export const wave3Adapters = [
  southBendVpaAdapter, debartoloAdapter, morrisAdapter, civicTheatreAdapter,
  centuryCenterAdapter, studebakerAdapter, historyMuseumAdapter,
  elkhartParksAdapter, elkhartCountyParksAdapter, lernerAdapter,
  nilesLibraryAdapter, potawatomiZooAdapter, howardParkAdapter, stockroomEastAdapter,
];
