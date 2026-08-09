
import { UserProfileProvider, useUserProfile } from './context/UserProfileContext';
import UserProfileForm from './components/forms/UserProfileForm';

// Switches between the intake form and the results view based on whether
// targets have been calculated yet. ResultsDashboard isn't built yet
// (that's next), so this shows a temporary summary in the meantime purely
// so the full form -> calculation flow can be tested end to end.
function AppContent() {
  const { targets, reset } = useUserProfile();

  if (!targets) {
    return <UserProfileForm />;
  }

  return (
    <div className="min-h-screen bg-paper flex items-center justify-center p-8">
      <div className="max-w-md w-full bg-paper-soft border border-ink/15 rounded-xl p-8">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-gold mb-4">
          Targets calculated
        </p>
        <dl className="space-y-2 font-mono text-sm text-ink">
          <div className="flex justify-between"><dt>BMR</dt><dd>{targets.bmr} kcal</dd></div>
          <div className="flex justify-between"><dt>TDEE</dt><dd>{targets.tdee} kcal</dd></div>
          <div className="flex justify-between"><dt>Target calories</dt><dd>{targets.targetCalories} kcal</dd></div>
          <div className="flex justify-between"><dt>Protein</dt><dd>{targets.macros.proteinG}g</dd></div>
          <div className="flex justify-between"><dt>Carbs</dt><dd>{targets.macros.carbsG}g</dd></div>
          <div className="flex justify-between"><dt>Fat</dt><dd>{targets.macros.fatG}g</dd></div>
          <div className="flex justify-between"><dt>Fiber</dt><dd>{targets.macros.fiberG}g</dd></div>
          <div className="flex justify-between"><dt>Water</dt><dd>{targets.waterLitres}L</dd></div>
        </dl>
        <button onClick={reset} className="mt-6 font-body text-xs text-muted underline">
          Start over
        </button>
        <p className="mt-4 font-body text-xs text-muted">
          (Real ResultsDashboard + meal plan button coming next step)
        </p>
      </div>
    </div>
  );
}

function App() {
  return (
    <UserProfileProvider>
      <AppContent />
    </UserProfileProvider>
  );
}

export default App;
