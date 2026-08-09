import Button from '../ui/Button';

// Triggers the switch to the weekly meal plan view. The actual navigation
// logic lives in App.tsx (which view is showing) — this component just
// renders the button and forwards the click.
interface MealPlanButtonProps {
  onClick: () => void;
}

export default function MealPlanButton({ onClick }: MealPlanButtonProps) {
  return (
    <Button onClick={onClick} className="w-full sm:w-auto">
      See my meal plan →
    </Button>
  );
}