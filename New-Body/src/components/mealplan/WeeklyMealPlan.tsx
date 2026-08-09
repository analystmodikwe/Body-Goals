import { useState } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import { useMealPlan } from '../../hooks/useMealPlan';
import type { DayOfWeek } from '../../types/meal';
import DayTabs from './DayTabs';
import MealCard from './MealCard';

interface WeeklyMealPlanProps {
  onBack: () => void;
}

export default function WeeklyMealPlan({ onBack }: WeeklyMealPlanProps) {
  const { targets } = useUserProfile();
  const weeklyPlan = useMealPlan(targets);
  const [selectedDay, setSelectedDay] = useState<DayOfWeek>('monday');

  // Guarded by App.tsx (only rendered once targets/plan exist), but
  // TypeScript doesn't know that from in here.
  if (!targets || !weeklyPlan) return null;

  const dayPlan = weeklyPlan[selectedDay];
  const isCheatDay = dayPlan.meals.some((meal) => meal.isCheatMeal);

  return (
    <div className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-16">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-2">
              New Body
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-ink">Your weekly meal plan</h1>
          </div>
          <button onClick={onBack} className="font-body text-xs text-muted underline shrink-0">
            ← Back to targets
          </button>
        </div>

        <DayTabs weeklyPlan={weeklyPlan} selectedDay={selectedDay} onSelectDay={setSelectedDay} />

        {/* Day summary --------------------------------------------------- */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 my-6 py-4 border-y border-ink/10">
          <SummaryStat label="Calories" value={`${dayPlan.totals.calories} kcal`} />
          <SummaryStat label="Protein" value={`${dayPlan.totals.proteinG}g`} />
          <SummaryStat label="Carbs" value={`${dayPlan.totals.carbsG}g`} />
          <SummaryStat label="Fat" value={`${dayPlan.totals.fatG}g`} />
          <SummaryStat label="Fiber" value={`${dayPlan.totals.fiberG}g`} />
          {isCheatDay && (
            <span className="font-body text-xs text-brick font-semibold ml-auto">
              🔥 Cheat day — totals run over target on purpose
            </span>
          )}
        </div>

        {/* Meal cards ------------------------------------------------------ */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {dayPlan.meals.map((meal, index) => (
            // Same meal ID can legitimately appear twice in one day (the
            // generator's top-up pass may add a second snack), so index is
            // included to keep keys unique without changing the data model.
            <MealCard key={`${meal.id}-${index}`} meal={meal} />
          ))}
        </div>
      </div>
    </div>
  );
}

function SummaryStat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="font-mono text-xs text-muted uppercase tracking-wide">{label}</p>
      <p className="font-mono text-base text-ink font-semibold">{value}</p>
    </div>
  );
}