// Generates (and memoizes) the weekly meal plan once nutrition targets
// exist. Regenerates only when targets change, not on every render.
import { useMemo } from 'react';
import type { NutritionTargets } from '../types/nutrition';
import { mealCatalog } from '../data/mealCatalog';
import { generateWeeklyMealPlan } from '../utils/mealPlanGenerator';

export function useMealPlan(targets: NutritionTargets | null) {
  return useMemo(() => {
    if (!targets) return null;
    return generateWeeklyMealPlan(targets, mealCatalog);
  }, [targets]);
}