export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

export type MacroProfile =
  | 'high_protein'
  | 'high_carb'
  | 'balanced'
  | 'low_carb'
  | 'high_fiber';

export interface MealCatalogEntry {
  id: string;
  name: string;
  mealDbSearchTerm: string;
  slot: MealSlot;
  profile: MacroProfile;
  isCheatMeal: boolean;
  estimatedMacros: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
}

export interface TheMealDbMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strCategory: string;
  strArea: string;
}

// A catalog entry as it actually appears in a generated day's plan. The
// generator scales portion sizes up or down (`portionMultiplier`) so each
// day's totals land on the user's targets — `plannedMacros` are the
// already-scaled numbers to display; `estimatedMacros` (inherited) stays
// as the original single-serving reference values.
export interface PlannedMeal extends MealCatalogEntry {
  portionMultiplier: number;
  plannedMacros: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
}

export interface DayMealPlan {
  day: DayOfWeek;
  meals: PlannedMeal[];
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
}

export type WeeklyMealPlan = Record<DayOfWeek, DayMealPlan>;