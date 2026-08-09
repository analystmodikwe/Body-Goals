import type { TheMealDbMeal } from '../types/meal';

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
  strInstructions: string;
  strCategory: string;
  strArea: string;
}

interface TheMealDbSearchResponse {
  meals: TheMealDbApiMeal[] | null;
}

/**
 * Searches TheMealDB by name and returns the first match, or null if
 * nothing matched or the request failed. Never throws — a failed lookup
 * just means the UI falls back to a placeholder image, it shouldn't break
 * the page.
 */
export async function searchMealByName(
  term: string
): Promise<TheMealDbMeal | null> {
  try {
    const url = `${BASE_URL}/search.php?s=${encodeURIComponent(term)}`;
    const response = await fetch(url);

    if (!response.ok) {
      return null;
    }

    const data: TheMealDbSearchResponse = await response.json();

    if (!data.meals || data.meals.length === 0) {
      return null;
    }

    // Take the first match — good enough for our purposes, we're not
    // letting the user browse every recipe with that name.
    const meal = data.meals[0];

    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
      strInstructions: meal.strInstructions,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
    };
  } catch {
    // Network error, offline, CORS issue, malformed JSON, etc — treat all
    // of these the same way: no details available for this meal right now.
    return null;
  }
}