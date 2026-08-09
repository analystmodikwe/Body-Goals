// days of the week
export type DayOfWeek =
  | 'monday'
  | 'tuesday'
  | 'wednesday'
  | 'thursday'
  | 'friday'
  | 'saturday'
  | 'sunday';

//   meal slot
export type MealSlot = 'breakfast' | 'lunch' | 'dinner' | 'snack';

// level protien,fibre, carb intake
export type MacroProfile =
  | 'high_protein'
  | 'high_carb'
  | 'balanced'
  | 'low_carb'
  | 'high_fiber';

//   the meal catalog
export interface MealCatalogEntry{
    id: string;
    name: string;
    mealDbSearchTerm: string;
    slot: MacroProfile;
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

// meal database
export interface TheMealDbMeal {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
  strInstructions: string;
  strCategory: string;
  strArea: string;
}

// the images with meal catalog entry 
export interface MealWithDetails extends MealCatalogEntry {
  imageUrl: string | null;
  instructions: string | null;
  isLoadingDetails: boolean;
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