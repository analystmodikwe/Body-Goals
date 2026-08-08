
// nutrients
export interface MacroTargets {
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number; 
}

// nutients target
export interface NutritionTargets {
    bmr: number;
    tdee: number;
    targetCalories: number;
    calorieDeficit: number;
    macros: MacroTargets;
    waterLitres: number;
}