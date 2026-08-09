import type { TheMealDbMeal, TheMealDbCategory } from '../types/meal';

// ============================================================================
// THEMEALDB CLIENT
// ----------------------------------------------------------------------------
// TheMealDB's free-tier "test key" (the literal string "1" in the URL) needs
// no signup and has no secret to protect, so it's safe to call directly from
// the browser — no backend needed. Docs: https://www.themealdb.com/api.php
//
// This client only fetches a PHOTO + INSTRUCTIONS for a meal we already
// know about (from data/mealCatalog.ts). Macros never come from here —
// TheMealDB has no nutrition data, which is why the catalog carries its
// own estimatedMacros.
//
// TWO-TIER LOOKUP: TheMealDB only has ~300 recipes total, so an exact name
// search (e.g. "Rice Cakes") often finds nothing. getMealImage() tries the
// exact search first, then falls back to browsing the meal's category
// (Chicken, Seafood, Vegetarian, etc.) and picking one of those recipes'
// photos instead — a real, on-theme food photo beats no photo at all.
// ============================================================================

const BASE_URL = 'https://www.themealdb.com/api/json/v1/1';

// Raw shape of a single meal object as TheMealDB returns it. We only type
// the fields we actually use (searchMealByName maps this down to
// TheMealDbMeal), since the real response has ~30 fields we don't need
// (20 individual ingredient/measure fields, YouTube link, etc).
interface TheMealDbApiMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions?: string;
  strCategory?: string;
  strArea?: string;
}

interface TheMealDbListResponse {
  meals: TheMealDbApiMeal[] | null;
}

/**
 * Searches TheMealDB by exact-ish name and returns the first match, or
 * null if nothing matched or the request failed. Never throws.
 */
export async function searchMealByName(
  term: string
): Promise<TheMealDbMeal | null> {
  try {
    const url = `${BASE_URL}/search.php?s=${encodeURIComponent(term)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data: TheMealDbListResponse = await response.json();
    if (!data.meals || data.meals.length === 0) return null;

    return toMealDbMeal(data.meals[0]);
  } catch {
    return null;
  }
}

/**
 * Browses a whole category (filter.php only returns id/name/thumb — no
 * instructions, which is fine, MealCard doesn't show instructions) and
 * deterministically picks one entry based on `seed` (the catalog meal's
 * own search term). Deterministic rather than random so the same catalog
 * meal always gets the same fallback photo instead of changing on every
 * refresh, which would look broken/inconsistent.
 */
export async function getMealByCategory(
  category: TheMealDbCategory,
  seed: string
): Promise<TheMealDbMeal | null> {
  try {
    const url = `${BASE_URL}/filter.php?c=${encodeURIComponent(category)}`;
    const response = await fetch(url);
    if (!response.ok) return null;

    const data: TheMealDbListResponse = await response.json();
    if (!data.meals || data.meals.length === 0) return null;

    const index = hashStringToIndex(seed, data.meals.length);
    return toMealDbMeal(data.meals[index]);
  } catch {
    return null;
  }
}

/**
 * Orchestrates the two-tier lookup: exact name search first, category
 * browse as fallback. This is what components should actually call.
 */
export async function getMealImage(
  searchTerm: string,
  category: TheMealDbCategory
): Promise<TheMealDbMeal | null> {
  const exactMatch = await searchMealByName(searchTerm);
  if (exactMatch) return exactMatch;

  return getMealByCategory(category, searchTerm);
}

/** Maps the raw API shape down to our TheMealDbMeal type, filling gaps. */
function toMealDbMeal(meal: TheMealDbApiMeal): TheMealDbMeal {
  return {
    idMeal: meal.idMeal,
    strMeal: meal.strMeal,
    strMealThumb: meal.strMealThumb,
    strInstructions: meal.strInstructions ?? '',
    strCategory: meal.strCategory ?? '',
    strArea: meal.strArea ?? '',
  };
}

/** Simple deterministic string hash, used to pick a stable "random" index. */
function hashStringToIndex(input: string, listLength: number): number {
  let hash = 0;
  for (let i = 0; i < input.length; i++) {
    hash = (hash << 5) - hash + input.charCodeAt(i);
    hash |= 0; // keep as 32-bit int
  }
  return Math.abs(hash) % listLength;
}