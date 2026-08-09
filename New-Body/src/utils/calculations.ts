import {
  ACTIVITY_MULTIPLIERS,
  GOAL_INTENSITY_DEFICIT,
  type UserProfile,
} from '../types/user';
import type { NutritionTargets } from '../types/nutrition';

/**
 * Mifflin-St Jeor equation — most accurate general-purpose BMR formula.
 * Male:   10*kg + 6.25*cm - 5*age + 5
 * Female: 10*kg + 6.25*cm - 5*age - 161
 */
export function calculateBMR(profile: UserProfile): number {
  const base = 10 * profile.weightKg + 6.25 * profile.heightCm - 5 * profile.age;
  const genderOffset = profile.gender === 'male' ? 5 : -161;
  return Math.round(base + genderOffset);
}

/** BMR * activity multiplier = total daily energy expenditure. */
export function calculateTDEE(bmr: number, profile: UserProfile): number {
  return Math.round(bmr * ACTIVITY_MULTIPLIERS[profile.activityLevel]);
}

/**
 * TDEE minus the goal-intensity deficit. Floored at BMR + 10% so we never
 * recommend eating below what the body burns at rest — that range causes
 * disproportionate muscle loss and isn't a sustainable target.
 */
export function calculateTargetCalories(
  tdee: number,
  profile: UserProfile
): number {
  const bmr = calculateBMR(profile);
  const deficitFraction = GOAL_INTENSITY_DEFICIT[profile.goalIntensity];
  const raw = tdee * (1 - deficitFraction);
  const safeFloor = bmr * 1.1;
  return Math.round(Math.max(raw, safeFloor));
}

/**
 * Protein and fat are set relative to bodyweight (the levers that actually
 * matter for body recomposition), carbs fill whatever calories remain, and
 * fiber is set relative to total calories per standard dietary guidelines.
 *
 * Protein scales up with goal intensity: the bigger the deficit, the more
 * protein is needed to protect lean muscle mass.
 */
export function calculateMacros(
  targetCalories: number,
  profile: UserProfile
): NutritionTargets['macros'] {
  const proteinPerKg =
    profile.goalIntensity === 'aggressive'
      ? 2.2
      : profile.goalIntensity === 'moderate'
        ? 2.0
        : 1.8;
  const fatPerKg = 0.9; // fixed floor for hormonal health regardless of goal

  const proteinG = Math.round(profile.weightKg * proteinPerKg);
  const fatG = Math.round(profile.weightKg * fatPerKg);

  const proteinCalories = proteinG * 4;
  const fatCalories = fatG * 9;
  const remainingCalories = Math.max(
    0,
    targetCalories - proteinCalories - fatCalories
  );
  const carbsG = Math.round(remainingCalories / 4);

  // ~14g fiber per 1000 kcal (US/EU dietary guideline), capped at total carbs
  // since fiber is itself a subset of total carb grams.
  const fiberG = Math.min(carbsG, Math.round((targetCalories / 1000) * 14));

  return { proteinG, carbsG, fatG, fiberG };
}

/**
 * ~35ml per kg bodyweight (standard hydration baseline), plus an add-on
 * for higher activity levels to cover sweat/exercise losses.
 */
export function calculateWaterIntake(profile: UserProfile): number {
  const baseMl = profile.weightKg * 35;
  const activityAddOnMl: Record<UserProfile['activityLevel'], number> = {
    sedentary: 0,
    light: 250,
    moderate: 500,
    active: 700,
    very_active: 1000,
  };
  const totalMl = baseMl + activityAddOnMl[profile.activityLevel];
  return Math.round((totalMl / 1000) * 10) / 10; // litres, 1 decimal place
}

/** Orchestrator: runs all of the above and returns the full result set. */
export function calculateNutritionTargets(
  profile: UserProfile
): NutritionTargets {
  const bmr = calculateBMR(profile);
  const tdee = calculateTDEE(bmr, profile);
  const targetCalories = calculateTargetCalories(tdee, profile);
  const macros = calculateMacros(targetCalories, profile);
  const waterLitres = calculateWaterIntake(profile);

  return {
    bmr,
    tdee,
    targetCalories,
    calorieDeficit: tdee - targetCalories,
    macros,
    waterLitres,
  };
}