import { useMealDetails } from '../../hooks/useMealDetails';
import type { PlannedMeal } from '../../types/meal';
import Spinner from '../ui/Spinner';
import CheatMealBadge from './CheatMealBadge';

// Slot labels shown as a small tag on each card.
const SLOT_LABELS: Record<PlannedMeal['slot'], string> = {
  breakfast: 'Breakfast',
  lunch: 'Lunch',
  dinner: 'Dinner',
  snack: 'Snack',
};

interface MealCardProps {
  meal: PlannedMeal;
}

export default function MealCard({ meal }: MealCardProps) {
  const { imageUrl, isLoading, hasError } = useMealDetails(
  meal.mealDbSearchTerm,
  meal.mealDbCategory
 );
  const { plannedMacros } = meal;




  // Only worth mentioning portion size when it's meaningfully different
  // from a standard single serving.
  const showPortionNote = meal.portionMultiplier < 0.9 || meal.portionMultiplier > 1.1;

  return (
    <div className="bg-paper-soft border border-ink/10 rounded-xl overflow-hidden">
      {/* Image / loading / fallback ------------------------------------ */}
      <div className="aspect-[4/3] bg-ink/5 flex items-center justify-center">
        {isLoading && <Spinner />}
        {!isLoading && imageUrl && (
          <img
            src={imageUrl}
            alt={meal.name}
            className="w-full h-full object-cover"
          />
        )}
        {!isLoading && (!imageUrl || hasError) && <PlaceholderIcon />}
      </div>

      <div className="p-5">
        <div className="flex items-center justify-between gap-2 mb-2">
          <span className="font-mono text-xs uppercase tracking-wide text-muted">
            {SLOT_LABELS[meal.slot]}
          </span>
          {meal.isCheatMeal && <CheatMealBadge />}
        </div>

        <h3 className="font-display text-xl text-ink mb-1 leading-snug">{meal.name}</h3>

        {showPortionNote && (
          <p className="font-body text-xs text-muted mb-3">
            {meal.portionMultiplier}x serving
          </p>
        )}

        {/* Macro grid ---------------------------------------------------- */}
        <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-ink/10">
          <MacroStat label="kcal" value={plannedMacros.calories} />
          <MacroStat label="P" value={plannedMacros.proteinG} unit="g" colorClass="text-brick" />
          <MacroStat label="C" value={plannedMacros.carbsG} unit="g" colorClass="text-gold" />
          <MacroStat label="F" value={plannedMacros.fatG} unit="g" colorClass="text-clay" />
        </div>
      </div>
    </div>
  );
}

interface MacroStatProps {
  label: string;
  value: number;
  unit?: string;
  colorClass?: string;
}

function MacroStat({ label, value, unit = '', colorClass = 'text-ink' }: MacroStatProps) {
  return (
    <div>
      <p className={`font-mono text-sm font-semibold ${colorClass}`}>
        {value}
        {unit}
      </p>
      <p className="font-mono text-[10px] text-muted uppercase">{label}</p>
    </div>
  );
}

// Shown when TheMealDB has no match for a meal's search term, or while
// there's genuinely nothing to display yet — a simple plate icon rather
// than a broken image.
function PlaceholderIcon() {
  return (
    <svg viewBox="0 0 24 24" className="w-10 h-10 text-ink/20" fill="none" stroke="currentColor" strokeWidth="1.5">
      <circle cx="12" cy="12" r="9" />
      <circle cx="12" cy="12" r="4" />
    </svg>
  );
}