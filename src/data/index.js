export { FEATURES } from './features.js';
export { DESTINATIONS } from './destinations.js';
export { VENUE_STYLES } from './venueStyles.js';
export { TABS } from './tabs.js';
export { EVENTS } from './events.js';
export { BUDGET_TIERS } from './budgetTiers.js';
export { FOOD_BUDGET_TIERS } from './foodBudgetTiers.js';
export { CHECKLIST_PHASES } from './checklistPhases.js';
export { DECOR_ITEMS } from './decorItems.js';
export { CELEBRITY_ARTISTS } from './celebrityArtists.js';
export { ARTISTS } from './artists.js';
export { SFX_ITEMS } from './sfxItems.js';
export { BUDGET_CATEGORIES } from './budgetCategories.js';
export { BAR_TYPES } from './barTypes.js';
export { SPECIALTY_COUNTERS } from './specialtyCounters.js';
export { FOOD_CATEGORIES } from './foodCategories.js';
export { TESTIMONIALS } from './testimonials.js';
export { CHECKLIST_TASKS } from './checklistTasks.js';
export { WEDDING_TYPES } from './weddingTypes.js';
export { MEAL_TYPES } from './mealTypes.js';
export { CITY_VENUES } from './cityVenues.js';
export { FALLBACK_VENUES } from './fallbackVenues.js';
export { DISH_MAP } from './dishesByMeal.js';
export { DISH_PRICES } from './dishPrices.js';
export { SITE } from './site.js';
export { CITY_RATES, defaultCityRate } from './cityRates.js';

import { CITY_RATES, defaultCityRate } from './cityRates.js';

// Helpers ported from the original bundle (Zg / Ot / Qg lookups).
export function cityRatesFor(city) {
  const key = Object.keys(CITY_RATES).find(
    (c) => city && (city.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(c.toLowerCase())),
  );
  return CITY_RATES[key] || defaultCityRate;
}

export function venueTypeOf(v) {
  const name = (v.name || '').toLowerCase();
  const type = (v.venue_type || v.type || '').toLowerCase();
  if (name.includes('palace') || type.includes('palace') || type.includes('heritage')) return 'Palace';
  if (name.includes('resort') || type.includes('resort')) return 'Resort';
  if (name.includes('hotel') || type.includes('hotel')) return 'Hotel';
  return 'Banquet Hall';
}

export function venuePriceEstimate(city, rating, dateStr) {
  const rate = cityRatesFor(city);
  let total = rate.base;
  const d = dateStr ? new Date(dateStr) : new Date();
  const day = d.getDay();
  const isWeekend = [0, 5, 6].includes(day);
  let weekendAdd = 0;
  if (isWeekend) {
    weekendAdd = total * 0.2;
    total += weekendAdd;
  }
  const month = d.getMonth();
  const highDemand = [10, 11, 0, 1].includes(month);
  let demandAdd = 0;
  if (highDemand) {
    demandAdd = total * 0.3;
    total += demandAdd;
  }
  let ratingAdd = 0;
  const premium = rating && rating > 4.5;
  if (premium) {
    ratingAdd = total * 0.15;
    total += ratingAdd;
  }
  return {
    min: Math.floor((total * 0.9) / 1000) * 1000,
    max: Math.floor((total * 1.2) / 1000) * 1000,
    current: Math.floor(total / 1000) * 1000,
    basePrice: rate.base,
    breakdown: { base: rate.base, weekend: weekendAdd, demand: demandAdd, rating: ratingAdd, total },
    modifiers: { isWeekend, isHighDemand: highDemand, isPremium: premium },
    cityLabel: rate.label,
  };
}

export { DEFAULT_WEDDING } from './defaultWedding.js';
export { M } from './stylesM.js';
export { I } from './theme.js';
export { Jo } from './palette.js';
export { Pe } from './footerStyles.js';
export { yt } from './testimonialStyles.js';
