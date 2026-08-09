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

// TheMealDB's actual category list (from their categories.php endpoint).
// Used as a fallback: if searching by exact meal name finds nothing, we
// browse this category instead so a real food photo still shows up rather
// than a blank placeholder.
export type TheMealDbCategory =
  | 'Beef'
  | 'Chicken'
  | 'Dessert'
  | 'Lamb'
  | 'Miscellaneous'
  | 'Pasta'
  | 'Pork'
  | 'Seafood'
  | 'Side'
  | 'Starter'
  | 'Vegan'
  | 'Vegetarian'
  | 'Breakfast'
  | 'Goat';

// A single curated entry in our local meal catalog. `mealDbSearchTerm` is
// what we search TheMealDB with first; `mealDbCategory` is the fallback if
// that exact search finds nothing (TheMealDB only has ~300 recipes total,
// so plenty of our search terms won't match anything by name).
export interface MealCatalogEntry {
  id: string;
  name: string;
  mealDbSearchTerm: string;
  mealDbCategory: TheMealDbCategory;
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

// Shape returned by TheMealDB's search.php?s= endpoint (fields we care about).
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