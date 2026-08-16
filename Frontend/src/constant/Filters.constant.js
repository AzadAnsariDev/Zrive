// Single source of truth for anything filter/sort related that's shared
// across product-listing pages (AllProducts, NewArrivals, etc).
// Import CATEGORIES / SORT_OPTIONS / NEW_BADGE_WINDOW_DAYS from HERE in
// every listing page — don't redeclare them locally.

import { CATEGORIES } from "./Categories";

export { CATEGORIES };

export const SORT_OPTIONS = [
  { id: "newest", label: "Newest First" },
  { id: "price-asc", label: "Price: Low to High" },
  { id: "price-desc", label: "Price: High to Low" },
];

// A product is tagged "New" if it's younger than this, in days.
export const NEW_BADGE_WINDOW_DAYS = 14;