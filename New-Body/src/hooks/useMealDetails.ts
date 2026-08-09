// ============================================================================
// useMealDetails
// ----------------------------------------------------------------------------
// Fetches image + instructions for one meal from TheMealDB, given its
// mealDbSearchTerm. Same meal can appear more than once across the week
// (e.g. a repeated snack), so results are cached in memory by search term —
// each unique meal is only fetched once per app session, not once per card.
// ============================================================================
import { useEffect, useState } from 'react';
import { searchMealByName } from '../api/mealDbClient';
import type { TheMealDbMeal } from '../types/meal';

interface MealDetailsState {
  imageUrl: string | null;
  instructions: string | null;
  isLoading: boolean;
  hasError: boolean;
}

// Module-level cache, shared across every component using this hook —
// survives for the lifetime of the page (not persisted between sessions).
const detailsCache = new Map<string, TheMealDbMeal | null>();

export function useMealDetails(searchTerm: string): MealDetailsState {
  const [state, setState] = useState<MealDetailsState>(() => {
    const cached = detailsCache.get(searchTerm);
    if (cached === undefined) {
      // Not fetched yet.
      return { imageUrl: null, instructions: null, isLoading: true, hasError: false };
    }
    // Already fetched this session (cached === null means "fetched, but no match").
    return {
      imageUrl: cached?.strMealThumb ?? null,
      instructions: cached?.strInstructions ?? null,
      isLoading: false,
      hasError: cached === null,
    };
  });

  useEffect(() => {
    // Already resolved from cache in the initial state above — nothing to do.
    if (detailsCache.has(searchTerm)) {
      return;
    }

    let cancelled = false;

    searchMealByName(searchTerm).then((result) => {
      detailsCache.set(searchTerm, result);

      // Avoid setting state if the component unmounted (e.g. user switched
      // days) before the fetch resolved.
      if (cancelled) return;

      setState({
        imageUrl: result?.strMealThumb ?? null,
        instructions: result?.strInstructions ?? null,
        isLoading: false,
        hasError: result === null,
      });
    });

    return () => {
      cancelled = true;
    };
  }, [searchTerm]);

  return state;
}