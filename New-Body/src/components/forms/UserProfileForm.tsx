import { useState, type FormEvent } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import type {
  ActivityLevel,
  Gender,
  GoalIntensity,
  UserProfile,
} from '../../types/user';
import Button from '../ui/Button';
import ErrorMessage from '../ui/ErrorMessage';

// ============================================================================
// FORM CONFIG
// ----------------------------------------------------------------------------
// Label + short description for every activity level and goal intensity,
// so the person picking one understands what it actually means rather than
// guessing from a single word.
// ============================================================================
const ACTIVITY_OPTIONS: { value: ActivityLevel; label: string; description: string }[] = [
  { value: 'sedentary', label: 'Sedentary', description: 'Desk job, little to no exercise' },
  { value: 'light', label: 'Light', description: 'Light exercise 1-3 days a week' },
  { value: 'moderate', label: 'Moderate', description: 'Moderate exercise 3-5 days a week' },
  { value: 'active', label: 'Active', description: 'Hard exercise 6-7 days a week' },
  { value: 'very_active', label: 'Very active', description: 'Physical job or 2x/day training' },
];

const GOAL_OPTIONS: { value: GoalIntensity; label: string; description: string }[] = [
  { value: 'mild', label: 'Mild', description: '~10% deficit — slow, best muscle retention' },
  { value: 'moderate', label: 'Moderate', description: '~17.5% deficit — balanced recomposition' },
  { value: 'aggressive', label: 'Aggressive', description: '~25% deficit — fastest fat loss' },
];

// Sane real-world bounds — catches typos (e.g. "7500" for weight) without
// being so strict it rejects legitimate outliers.
const LIMITS = {
  weightKg: { min: 30, max: 250 },
  heightCm: { min: 100, max: 250 },
  age: { min: 13, max: 100 },
};

interface FormErrors {
  weightKg?: string;
  heightCm?: string;
  age?: string;
  gender?: string;
}

export default function UserProfileForm() {
  const { setProfile } = useUserProfile();

  // Kept as strings while editing (so the field can be empty / mid-typing),
  // parsed to numbers only on submit.
  const [weightKg, setWeightKg] = useState('');
  const [heightCm, setHeightCm] = useState('');
  const [age, setAge] = useState('');
  const [gender, setGender] = useState<Gender | null>(null);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderate');
  const [goalIntensity, setGoalIntensity] = useState<GoalIntensity>('moderate');
  const [errors, setErrors] = useState<FormErrors>({});

  function validate(): FormErrors {
    const nextErrors: FormErrors = {};
    const weightNum = Number(weightKg);
    const heightNum = Number(heightCm);
    const ageNum = Number(age);

    if (!weightKg || weightNum < LIMITS.weightKg.min || weightNum > LIMITS.weightKg.max) {
      nextErrors.weightKg = `Enter a weight between ${LIMITS.weightKg.min}-${LIMITS.weightKg.max}kg`;
    }
    if (!heightCm || heightNum < LIMITS.heightCm.min || heightNum > LIMITS.heightCm.max) {
      nextErrors.heightCm = `Enter a height between ${LIMITS.heightCm.min}-${LIMITS.heightCm.max}cm`;
    }
    if (!age || ageNum < LIMITS.age.min || ageNum > LIMITS.age.max) {
      nextErrors.age = `Enter an age between ${LIMITS.age.min}-${LIMITS.age.max}`;
    }
    if (!gender) {
      nextErrors.gender = 'Select one';
    }

    return nextErrors;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length > 0) {
      return;
    }

    // `gender` is guaranteed non-null here — validate() already checked it.
    const profile: UserProfile = {
      weightKg: Number(weightKg),
      heightCm: Number(heightCm),
      age: Number(age),
      gender: gender!,
      activityLevel,
      goalIntensity,
    };

    setProfile(profile);
  }

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-[2fr_3fr]">
      {/* ------------------------------------------------------------ */}
      {/* LEFT PANEL — intro + signature ring graphic                  */}
      {/* ------------------------------------------------------------ */}
      <div className="bg-ink text-paper px-8 py-12 md:px-12 md:py-16 flex flex-col justify-between md:sticky md:top-0 md:h-screen">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-6">
            New Body
          </p>
          <h1 className="font-display text-4xl md:text-5xl leading-[1.05] mb-6">
            Know exactly what your body needs.
          </h1>
          <p className="font-body text-paper/70 text-base leading-relaxed max-w-sm">
            A few numbers is all it takes to work out your daily calories,
            macros and water target for losing fat while building muscle —
            then a full week of meals to match.
          </p>
        </div>

        <TargetRingsGraphic />
      </div>

      {/* ------------------------------------------------------------ */}
      {/* RIGHT PANEL — the actual form                                 */}
      {/* ------------------------------------------------------------ */}
      <div className="bg-paper px-6 py-12 md:px-16 md:py-16">
        <form onSubmit={handleSubmit} className="max-w-xl mx-auto space-y-10">
          {/* Body metrics ------------------------------------------------ */}
          <fieldset>
            <legend className="font-display text-2xl text-ink mb-1">Body metrics</legend>
            <p className="font-body text-sm text-muted mb-6">
              Used to work out your resting calorie burn (BMR).
            </p>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <label htmlFor="weightKg" className="font-body text-xs font-medium text-ink block mb-1">
                  Weight (kg)
                </label>
                <input
                  id="weightKg"
                  type="number"
                  inputMode="decimal"
                  value={weightKg}
                  onChange={(e) => setWeightKg(e.target.value)}
                  className="w-full font-mono text-lg bg-paper-soft border border-ink/15 rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="80"
                />
                {errors.weightKg && <ErrorMessage message={errors.weightKg} />}
              </div>

              <div>
                <label htmlFor="heightCm" className="font-body text-xs font-medium text-ink block mb-1">
                  Height (cm)
                </label>
                <input
                  id="heightCm"
                  type="number"
                  inputMode="decimal"
                  value={heightCm}
                  onChange={(e) => setHeightCm(e.target.value)}
                  className="w-full font-mono text-lg bg-paper-soft border border-ink/15 rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="178"
                />
                {errors.heightCm && <ErrorMessage message={errors.heightCm} />}
              </div>

              <div>
                <label htmlFor="age" className="font-body text-xs font-medium text-ink block mb-1">
                  Age
                </label>
                <input
                  id="age"
                  type="number"
                  inputMode="numeric"
                  value={age}
                  onChange={(e) => setAge(e.target.value)}
                  className="w-full font-mono text-lg bg-paper-soft border border-ink/15 rounded-lg px-3 py-2.5 focus:outline-none focus:border-gold focus:ring-1 focus:ring-gold"
                  placeholder="25"
                />
                {errors.age && <ErrorMessage message={errors.age} />}
              </div>
            </div>

            {/* Gender — segmented control */}
            <div className="mt-4">
              <span className="font-body text-xs font-medium text-ink block mb-1">Gender</span>
              <div className="inline-flex rounded-lg border border-ink/15 overflow-hidden">
                {(['male', 'female'] as Gender[]).map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setGender(option)}
                    className={`px-6 py-2 font-body text-sm capitalize transition-colors ${
                      gender === option
                        ? 'bg-ink text-paper'
                        : 'bg-paper-soft text-ink hover:bg-ink/5'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
              {errors.gender && <ErrorMessage message={errors.gender} />}
            </div>
          </fieldset>

          {/* Activity level ------------------------------------------------ */}
          <fieldset>
            <legend className="font-display text-2xl text-ink mb-1">Activity level</legend>
            <p className="font-body text-sm text-muted mb-4">
              Used to scale your resting burn up to your total daily burn (TDEE).
            </p>

            <div className="space-y-2">
              {ACTIVITY_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`flex items-start gap-3 rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    activityLevel === option.value
                      ? 'border-gold bg-gold/10'
                      : 'border-ink/15 bg-paper-soft hover:border-ink/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={option.value}
                    checked={activityLevel === option.value}
                    onChange={() => setActivityLevel(option.value)}
                    className="mt-1 accent-gold"
                  />
                  <span>
                    <span className="font-body text-sm font-semibold text-ink block">
                      {option.label}
                    </span>
                    <span className="font-body text-xs text-muted">{option.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          {/* Goal intensity ------------------------------------------------ */}
          <fieldset>
            <legend className="font-display text-2xl text-ink mb-1">Goal intensity</legend>
            <p className="font-body text-sm text-muted mb-4">
              How aggressively to cut calories while still protecting muscle.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {GOAL_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className={`rounded-lg border px-4 py-3 cursor-pointer transition-colors ${
                    goalIntensity === option.value
                      ? 'border-gold bg-gold/10'
                      : 'border-ink/15 bg-paper-soft hover:border-ink/30'
                  }`}
                >
                  <input
                    type="radio"
                    name="goalIntensity"
                    value={option.value}
                    checked={goalIntensity === option.value}
                    onChange={() => setGoalIntensity(option.value)}
                    className="sr-only"
                  />
                  <span className="font-body text-sm font-semibold text-ink block mb-1">
                    {option.label}
                  </span>
                  <span className="font-body text-xs text-muted">{option.description}</span>
                </label>
              ))}
            </div>
          </fieldset>

          <Button type="submit" className="w-full sm:w-auto">
            Calculate my targets
          </Button>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// SIGNATURE GRAPHIC — concentric target rings
// ----------------------------------------------------------------------------
// Static/illustrative here on the form. The same ring language returns on
// the results dashboard, animated and filled with real protein/carbs/fat
// progress — this is a preview of what the numbers become.
// ============================================================================
function TargetRingsGraphic() {
  return (
    <svg viewBox="0 0 200 200" className="w-40 h-40 opacity-90" aria-hidden="true">
      <circle cx="100" cy="100" r="88" fill="none" stroke="#3a4a3d" strokeWidth="10" />
      <circle
        cx="100"
        cy="100"
        r="88"
        fill="none"
        stroke="var(--color-gold)"
        strokeWidth="10"
        strokeDasharray="553"
        strokeDashoffset="140"
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
      />
      <circle cx="100" cy="100" r="64" fill="none" stroke="#3a4a3d" strokeWidth="10" />
      <circle
        cx="100"
        cy="100"
        r="64"
        fill="none"
        stroke="var(--color-brick)"
        strokeWidth="10"
        strokeDasharray="402"
        strokeDashoffset="230"
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
      />
      <circle cx="100" cy="100" r="40" fill="none" stroke="#3a4a3d" strokeWidth="10" />
      <circle
        cx="100"
        cy="100"
        r="40"
        fill="none"
        stroke="var(--color-paper)"
        strokeWidth="10"
        strokeDasharray="251"
        strokeDashoffset="90"
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
      />
    </svg>
  );
}