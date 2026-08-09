import { useEffect, useState } from 'react';
import { useUserProfile } from '../../context/UserProfileContext';
import CalorieSummary from './CalorieSummary';
import MacroCard from './MacroCard';
import MealPlanButton from '../mealplan/MealPlanButton';

interface ResultsDashboardProps {
  onViewMealPlan: () => void;
}

export default function ResultsDashboard({ onViewMealPlan }: ResultsDashboardProps) {
  const { targets, reset } = useUserProfile();

  // Guarded by App.tsx (only rendered once targets exist), but TypeScript
  // doesn't know that from here, so bail out cleanly just in case.
  if (!targets) return null;

  const { macros, targetCalories } = targets;

  // Each macro's share of total daily calories, used to size both the
  // MacroCard bars and the ring graphic. Protein/carbs = 4 kcal/g, fat =
  // 9 kcal/g. Fiber isn't counted separately (it's already a subset of
  // carbsG) — its "share" here is just for the visual bar, not additive.
  const proteinShare = (macros.proteinG * 4) / targetCalories;
  const carbsShare = (macros.carbsG * 4) / targetCalories;
  const fatShare = (macros.fatG * 9) / targetCalories;
  const fiberShare = (macros.fiberG * 2) / targetCalories;

  return (
    <div className="min-h-screen bg-paper px-6 py-12 md:px-16 md:py-16">
      <div className="max-w-3xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-2">
              New Body
            </p>
            <h1 className="font-display text-3xl md:text-4xl text-ink">Your daily targets</h1>
          </div>
          <button
            onClick={reset}
            className="font-body text-xs text-muted underline shrink-0"
          >
            Start over
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-[2fr_3fr] gap-6 mb-6">
          <CalorieSummary targets={targets} />
          <MacroRings
            proteinShare={proteinShare}
            carbsShare={carbsShare}
            fatShare={fatShare}
          />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <MacroCard label="Protein" grams={macros.proteinG} colorClass="bg-brick" calorieShare={proteinShare} />
          <MacroCard label="Carbs" grams={macros.carbsG} colorClass="bg-gold" calorieShare={carbsShare} />
          <MacroCard label="Fat" grams={macros.fatG} colorClass="bg-clay" calorieShare={fatShare} />
          <MacroCard label="Fiber" grams={macros.fiberG} colorClass="bg-moss" calorieShare={fiberShare} />
        </div>

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-paper-soft border border-ink/10 rounded-xl p-6">
          <div>
            <p className="font-body text-xs uppercase tracking-wide text-muted mb-1">
              Water target
            </p>
            <p className="font-mono text-2xl text-ink">{targets.waterLitres}L / day</p>
          </div>
          <MealPlanButton onClick={onViewMealPlan} />
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// MACRO RINGS — animated version of the form's signature graphic
// ----------------------------------------------------------------------------
// Three concentric rings, one per macro (protein/carbs/fat), each filled to
// that macro's share of total daily calories. Animates in on mount by
// starting every ring at 0% and transitioning to its real value shortly
// after — same visual language introduced on the intake form, now carrying
// real data.
// ============================================================================
interface MacroRingsProps {
  proteinShare: number;
  carbsShare: number;
  fatShare: number;
}

function MacroRings({ proteinShare, carbsShare, fatShare }: MacroRingsProps) {
  const [hasAnimatedIn, setHasAnimatedIn] = useState(false);

  useEffect(() => {
    // Tiny delay so the browser paints the 0% state first — without this,
    // the ring would just appear already-filled instead of animating.
    const timeout = setTimeout(() => setHasAnimatedIn(true), 100);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="bg-paper-soft border border-ink/10 rounded-xl p-8 flex items-center justify-center">
      <svg viewBox="0 0 200 200" className="w-44 h-44">
        <Ring radius={88} percent={hasAnimatedIn ? proteinShare : 0} color="var(--color-brick)" />
        <Ring radius={64} percent={hasAnimatedIn ? carbsShare : 0} color="var(--color-gold)" />
        <Ring radius={40} percent={hasAnimatedIn ? fatShare : 0} color="var(--color-clay)" />
      </svg>
    </div>
  );
}

interface RingProps {
  radius: number;
  percent: number; // 0-1
  color: string;
}

function Ring({ radius, percent, color }: RingProps) {
  const circumference = 2 * Math.PI * radius;
  const offset = circumference * (1 - Math.min(1, Math.max(0, percent)));

  return (
    <>
      <circle cx="100" cy="100" r={radius} fill="none" stroke="#d8dccf" strokeWidth="10" />
      <circle
        cx="100"
        cy="100"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="10"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        strokeLinecap="round"
        transform="rotate(-90 100 100)"
        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
      />
    </>
  );
}