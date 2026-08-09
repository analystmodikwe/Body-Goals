export type Gender = "male" | "female";

export type ActivityLevel = "sedentary"|
"light"|
"moderate"|
"active"|
"very_active";

// the fatloss goal intensity
export type GoalIntensity = "mild" | "moderate" | "aggressive";

// what the user will fill in before the app can calculate anything for them
export interface UserProfile {
  weightKg: number;
  heightCm: number;
  age: number;
  gender: Gender;
  activityLevel: ActivityLevel;
  goalIntensity: GoalIntensity;
}

// will show how active the user is based on the number
export const ACTIVITY_MULTIPLIERS: Record <ActivityLevel, number> = {
    sedentary: 1.2,
    light: 1.375,
    moderate: 1.55,
    active: 1.725,
    very_active: 1.9,
};


export const GOAL_INTENSITY_DEFICIT: Record<GoalIntensity, number> = {
  mild: 0.1,
  moderate: 0.175,
  aggressive: 0.25,
};