
import { useState } from 'react';
import { UserProfileProvider, useUserProfile } from './context/UserProfileContext';
import UserProfileForm from './components/forms/UserProfileForm';
import ResultsDashboard from './components/dashboard/ResultsDashboard';

// Three possible screens: fill in the form, view targets, view the meal
// plan. `view` only ever matters once targets exist — if targets are
// cleared (Start over), we fall back to the form regardless of `view`.
type View = 'results' | 'mealPlan';

function AppContent() {
  const { targets } = useUserProfile();
  const [view, setView] = useState<View>('results');

  if (!targets) {
    return <UserProfileForm />;
  }

  if (view === 'mealPlan') {
    // WeeklyMealPlan isn't built yet — temporary placeholder so the
    // "See my meal plan" button has somewhere to go in the meantime.
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-8">
        <div className="text-center">
          <p className="font-display text-2xl text-ink mb-4">
            Weekly meal plan coming next step
          </p>
          <button
            onClick={() => setView('results')}
            className="font-body text-sm text-muted underline"
          >
            ← Back to targets
          </button>
        </div>
      </div>
    );
  }

  return <ResultsDashboard onViewMealPlan={() => setView('mealPlan')} />;
}

function App() {
  return (
    <UserProfileProvider>
      <AppContent />
    </UserProfileProvider>
  );
}

export default App;