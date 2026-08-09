import type { NutritionTargets } from '../../types/nutrition';

// The hero stat: target calories, front and center, with BMR/TDEE/deficit
// shown as supporting context underneath rather than competing for
// attention — the target is the number someone actually needs day to day.
interface CalorieSummaryProps {
  targets: NutritionTargets;
}

export default function CalorieSummary({ targets }: CalorieSummaryProps) {
  return (
    <div className="bg-ink text-paper rounded-xl p-8">
      <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-3">
        Daily target
      </p>
      <p className="font-display text-6xl leading-none mb-1">
        {targets.targetCalories}
        <span className="text-2xl text-paper/60 ml-2">kcal</span>
      </p>
      <p className="font-body text-sm text-paper/60 mb-6">
        {targets.calorieDeficit} kcal below maintenance
      </p>

      <div className="grid grid-cols-2 gap-4 pt-4 border-t border-paper/15">
        <div>
          <p className="font-mono text-xs text-paper/50 uppercase tracking-wide">Resting burn</p>
          <p className="font-mono text-lg">{targets.bmr} kcal</p>
        </div>
        <div>
          <p className="font-mono text-xs text-paper/50 uppercase tracking-wide">Total daily burn</p>
          <p className="font-mono text-lg">{targets.tdee} kcal</p>
        </div>
      </div>
    </div>
  );
}