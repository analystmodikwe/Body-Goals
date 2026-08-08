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

export interface DayMealPlan {
  day: DayOfWeek;
  meals: MealCatalogEntry[];
  totals: {
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
  };
}
export type WeeklyMealPlan = Record<DayOfWeek, DayMealPlan>;