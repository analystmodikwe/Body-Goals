// One stat card for a single macro (protein/carbs/fat/fiber). Shows the
// gram target plus a horizontal bar representing that macro's share of
// total daily calories — so at a glance you can see the balance, not just
// four disconnected numbers.
interface MacroCardProps {
  label: string;
  grams: number;
  colorClass: string; // Tailwind bg-* class, e.g. "bg-brick"
  calorieShare: number; // 0-1, this macro's % of total daily calories
}

export default function MacroCard({ label, grams, colorClass, calorieShare }: MacroCardProps) {
  const percentLabel = Math.round(calorieShare * 100);

  return (
    <div className="bg-paper-soft border border-ink/10 rounded-xl p-5">
      <p className="font-body text-xs uppercase tracking-wide text-muted mb-2">{label}</p>
      <p className="font-mono text-3xl text-ink mb-3">
        {grams}
        <span className="text-base text-muted ml-1">g</span>
      </p>
      <div className="h-1.5 w-full bg-ink/10 rounded-full overflow-hidden">
        <div
          className={`h-full rounded-full ${colorClass}`}
          style={{ width: `${Math.min(100, percentLabel)}%` }}
        />
      </div>
      <p className="font-mono text-xs text-muted mt-1.5">{percentLabel}% of calories</p>
    </div>
  );
}