import type { NutritionTargets } from '../types/nutrition';
import type {
  MealCatalogEntry,
  PlannedMeal,
  WeeklyMealPlan,
  DayOfWeek,
  MealSlot,
} from '../types/meal';

// ============================================================================
// WEEKLY MEAL PLAN GENERATOR
// ----------------------------------------------------------------------------
// Two passes per day:
//   1. SELECTION — pick one meal per slot (breakfast/lunch/dinner/snack)
//      that best fits that slot's rough share of the daily targets, while
//      penalising meals already used earlier in the week for variety.
//   2. SCALING — the catalog's fixed single-serving sizes won't exactly
//      match any given person's targets (a 2000kcal target and a 3000kcal
//      target both need real meals, just different portion sizes). So once
//      a day's meals are picked, we scale their portions up or down so the
//      day's total actually lands on target — the same idea as adjusting
//      servings on a recipe.
//
// Saturday's dinner slot is swapped for a cheat meal, which is NOT scaled
// (a cheat meal is a fixed indulgence, not a target-fitting portion) —
// the day's other meals are scaled instead to fit whatever budget remains
// after the cheat meal.
// ============================================================================

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Roughly how much of the day's calories/macros each slot should carry.
// These don't need to be exact — they just steer the picker toward a
// sensible split (e.g. dinner is the biggest meal, snacks are the smallest).
const SLOT_PROPORTIONS: Record<MealSlot, number> = {
  breakfast: 0.25,
  lunch: 0.3,
  dinner: 0.35,
  snack: 0.1,
};

// How heavily we penalise re-using a meal that's already appeared earlier
// in the week. Higher = stronger push toward variety, at the cost of
// slightly worse macro accuracy on repeat-heavy slots (e.g. snacks, where
// the catalog has fewer options than there are days).
const REPEAT_PENALTY = 40;

// Portion scaling is clamped to this range so we never suggest something
// unrealistic like "eat 3x this recipe" or "eat a third of this recipe".
const MIN_PORTION_MULTIPLIER = 0.6;
const MAX_PORTION_MULTIPLIER = 2.0;

// If a day still falls short of target by more than this many calories
// even after max-scaling every meal (common for very high-calorie targets,
// e.g. a heavy, very active person building muscle), we add one extra
// snack rather than pushing portions past a realistic size.
const TOP_UP_THRESHOLD_KCAL = 150;

interface SlotTargets {
  calories: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

/**
 * Scores how well a candidate meal fits a slot's portion of the daily
 * targets. Lower is better. Uses percentage difference (not raw grams) so
 * calories, protein, carbs and fat are weighted comparably even though
 * their absolute values are very different (e.g. 500 kcal vs 40g protein).
 */
function scoreMealFit(meal: MealCatalogEntry, slotTargets: SlotTargets): number {
  const pctDiff = (actual: number, target: number) =>
    target === 0 ? 0 : Math.abs(actual - target) / target;

  return (
    pctDiff(meal.estimatedMacros.calories, slotTargets.calories) +
    pctDiff(meal.estimatedMacros.proteinG, slotTargets.proteinG) +
    pctDiff(meal.estimatedMacros.carbsG, slotTargets.carbsG) +
    pctDiff(meal.estimatedMacros.fatG, slotTargets.fatG)
  );
}

/**
 * Picks the best meal for a slot: closest macro fit, adjusted by how many
 * times each candidate has already been used this week.
 */
function pickMealForSlot(
  candidates: MealCatalogEntry[],
  slotTargets: SlotTargets,
  usageCount: Map<string, number>
): MealCatalogEntry {
  let best = candidates[0];
  let bestScore = Infinity;

  for (const meal of candidates) {
    const timesUsedAlready = usageCount.get(meal.id) ?? 0;
    const score = scoreMealFit(meal, slotTargets) + timesUsedAlready * REPEAT_PENALTY;

    if (score < bestScore) {
      bestScore = score;
      best = meal;
    }
  }

  return best;
}

/** Picks the least-used cheat meal available for a slot (macros ignored). */
function pickCheatMeal(
  candidates: MealCatalogEntry[],
  usageCount: Map<string, number>
): MealCatalogEntry {
  return candidates.reduce((leastUsed, meal) => {
    const mealUses = usageCount.get(meal.id) ?? 0;
    const leastUsedUses = usageCount.get(leastUsed.id) ?? 0;
    return mealUses < leastUsedUses ? meal : leastUsed;
  });
}

/**
 * Turns a selected meal into a PlannedMeal by scaling its macros by the
 * given multiplier (clamped to a realistic portion range).
 */
function scaleMeal(meal: MealCatalogEntry, rawMultiplier: number): PlannedMeal {
  const multiplier = Math.min(
    MAX_PORTION_MULTIPLIER,
    Math.max(MIN_PORTION_MULTIPLIER, rawMultiplier)
  );

  return {
    ...meal,
    portionMultiplier: Math.round(multiplier * 100) / 100,
    plannedMacros: {
      calories: Math.round(meal.estimatedMacros.calories * multiplier),
      proteinG: Math.round(meal.estimatedMacros.proteinG * multiplier),
      carbsG: Math.round(meal.estimatedMacros.carbsG * multiplier),
      fatG: Math.round(meal.estimatedMacros.fatG * multiplier),
      fiberG: Math.round(meal.estimatedMacros.fiberG * multiplier),
    },
  };
}

/** Adds up plannedMacros across a day's already-scaled meals. */
function sumPlannedMacros(meals: PlannedMeal[]) {
  return meals.reduce(
    (totals, meal) => ({
      calories: totals.calories + meal.plannedMacros.calories,
      proteinG: totals.proteinG + meal.plannedMacros.proteinG,
      carbsG: totals.carbsG + meal.plannedMacros.carbsG,
      fatG: totals.fatG + meal.plannedMacros.fatG,
      fiberG: totals.fiberG + meal.plannedMacros.fiberG,
    }),
    { calories: 0, proteinG: 0, carbsG: 0, fatG: 0, fiberG: 0 }
  );
}

/**
 * Builds a Monday-Sunday plan where each day's meals sum close to the
 * daily targets, picking a different combination per day so the week
 * doesn't repeat. Saturday swaps in a cheat meal (macros ignored that day,
 * and NOT scaled — the other meals scale down to make room for it instead).
 */
export function generateWeeklyMealPlan(
  targets: NutritionTargets,
  catalog: MealCatalogEntry[]
): WeeklyMealPlan {
  // Tracks how many times each meal ID has been used so far this week, so
  // later days can be steered away from repeats.
  const usageCount = new Map<string, number>();

  const regularMeals = catalog.filter((meal) => !meal.isCheatMeal);
  const cheatDinners = catalog.filter(
    (meal) => meal.isCheatMeal && meal.slot === 'dinner'
  );

  // Built up day by day, then cast to the full WeeklyMealPlan shape once
  // every day of the week has been filled in.
  const plan = {} as WeeklyMealPlan;

  for (const day of DAYS_OF_WEEK) {
    const isCheatDay = day === 'saturday';
    const slots: MealSlot[] = ['breakfast', 'lunch', 'dinner', 'snack'];

    // --- PASS 1: SELECTION -------------------------------------------
    // Pick a raw (unscaled) meal for every slot first, so we know the
    // day's base calorie total before deciding how much to scale it.
    let cheatMeal: MealCatalogEntry | null = null;
    const selectedBySlot: Partial<Record<MealSlot, MealCatalogEntry>> = {};

    for (const slot of slots) {
      if (isCheatDay && slot === 'dinner') {
        cheatMeal = pickCheatMeal(cheatDinners, usageCount);
        usageCount.set(cheatMeal.id, (usageCount.get(cheatMeal.id) ?? 0) + 1);
        continue;
      }

      const proportion = SLOT_PROPORTIONS[slot];
      const chosen = pickMealForSlot(
        regularMeals.filter((meal) => meal.slot === slot),
        {
          calories: targets.targetCalories * proportion,
          proteinG: targets.macros.proteinG * proportion,
          carbsG: targets.macros.carbsG * proportion,
          fatG: targets.macros.fatG * proportion,
        },
        usageCount
      );
      selectedBySlot[slot] = chosen;
      usageCount.set(chosen.id, (usageCount.get(chosen.id) ?? 0) + 1);
    }

    // --- PASS 2: SCALING ------------------------------------------------
    // The cheat meal (if any) eats into the day's calorie budget as-is.
    // Everything else scales to fill whatever budget is left, so the day's
    // total lands close to target regardless of how big the catalog's
    // fixed serving sizes happen to be.
    const cheatCalories = cheatMeal?.estimatedMacros.calories ?? 0;
    const remainingBudget = Math.max(0, targets.targetCalories - cheatCalories);

    const scalableMeals = Object.values(selectedBySlot) as MealCatalogEntry[];
    const baseCalories = scalableMeals.reduce(
      (sum, meal) => sum + meal.estimatedMacros.calories,
      0
    );
    const scaleFactor = baseCalories === 0 ? 1 : remainingBudget / baseCalories;

    const dayMeals: PlannedMeal[] = slots.map((slot) => {
      if (isCheatDay && slot === 'dinner' && cheatMeal) {
        // Cheat meal always served at its normal size — no scaling.
        return scaleMeal(cheatMeal, 1);
      }
      return scaleMeal(selectedBySlot[slot]!, scaleFactor);
    });

    // --- PASS 3: TOP-UP ---------------------------------------------
    // If we're still meaningfully short of target even after max-scaling
    // every meal (typical for very high-calorie targets), add one extra
    // snack rather than pushing any single portion past a realistic size.
    let totals = sumPlannedMacros(dayMeals);
    const stillShortBy = targets.targetCalories - totals.calories;

    if (stillShortBy > TOP_UP_THRESHOLD_KCAL) {
      const alreadyUsedSnackId = selectedBySlot.snack?.id;
      const topUpCandidates = regularMeals.filter(
        (meal) => meal.slot === 'snack' && meal.id !== alreadyUsedSnackId
      );

      if (topUpCandidates.length > 0) {
        const topUpMeal = pickMealForSlot(
          topUpCandidates,
          {
            calories: stillShortBy,
            proteinG: targets.macros.proteinG * SLOT_PROPORTIONS.snack,
            carbsG: targets.macros.carbsG * SLOT_PROPORTIONS.snack,
            fatG: targets.macros.fatG * SLOT_PROPORTIONS.snack,
          },
          usageCount
        );
        const topUpScale = stillShortBy / topUpMeal.estimatedMacros.calories;
        dayMeals.push(scaleMeal(topUpMeal, topUpScale));
        usageCount.set(topUpMeal.id, (usageCount.get(topUpMeal.id) ?? 0) + 1);
        totals = sumPlannedMacros(dayMeals);
      }
    }

    plan[day] = {
      day,
      meals: dayMeals,
      totals,
    };
  }

  return plan;
}