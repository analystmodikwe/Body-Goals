import type { DayOfWeek, WeeklyMealPlan } from '../../types/meal';

const DAYS_OF_WEEK: DayOfWeek[] = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
];

// Short labels so seven tabs fit comfortably on mobile without wrapping.
const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Mon',
  tuesday: 'Tue',
  wednesday: 'Wed',
  thursday: 'Thu',
  friday: 'Fri',
  saturday: 'Sat',
  sunday: 'Sun',
};

interface DayTabsProps {
  weeklyPlan: WeeklyMealPlan;
  selectedDay: DayOfWeek;
  onSelectDay: (day: DayOfWeek) => void;
}

export default function DayTabs({ weeklyPlan, selectedDay, onSelectDay }: DayTabsProps) {
  return (
    <div className="flex gap-1.5 overflow-x-auto pb-1">
      {DAYS_OF_WEEK.map((day) => {
        // Derived from the actual plan rather than hardcoding "saturday",
        // so the tab still shows the right indicator even if the
        // generator's cheat-day logic changes later.
        const isCheatDay = weeklyPlan[day].meals.some((meal) => meal.isCheatMeal);
        const isSelected = day === selectedDay;

        return (
          <button
            key={day}
            onClick={() => onSelectDay(day)}
            className={`relative shrink-0 px-4 py-2.5 rounded-lg font-body text-sm font-semibold transition-colors ${
              isSelected
                ? 'bg-ink text-paper'
                : 'bg-paper-soft text-ink border border-ink/15 hover:border-ink/30'
            }`}
          >
            {DAY_LABELS[day]}
            {isCheatDay && (
              <span
                className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-brick rounded-full border-2 border-paper"
                aria-label="Cheat day"
                title="Cheat day"
              />
            )}
          </button>
        );
      })}
    </div>
  );
}