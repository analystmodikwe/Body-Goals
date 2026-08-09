import { useState } from 'react';
import { UserProfileProvider, useUserProfile } from './context/UserProfileContext';
import UserProfileForm from './components/forms/UserProfileForm';
import ResultsDashboard from './components/dashboard/ResultsDashboard';
import WeeklyMealPlan from './components/mealplan/WeeklyMealPlan';

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
    return <WeeklyMealPlan onBack={() => setView('results')} />;
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