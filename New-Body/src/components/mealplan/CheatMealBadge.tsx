// Small pill badge shown on a cheat meal's card, so it's visually obvious
// at a glance why this meal's macros don't match the day's targets.
export default function CheatMealBadge() {
  return (
    <span className="inline-flex items-center gap-1 bg-brick text-paper text-xs font-body font-semibold px-2.5 py-1 rounded-full">
      🔥 Cheat meal
    </span>
  );
}