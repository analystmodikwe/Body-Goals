import { createContext, useContext, useState, type ReactNode } from 'react';
import type { UserProfile } from '../types/user';
import type { NutritionTargets } from '../types/nutrition';
import { calculateNutritionTargets } from '../utils/calculations';

interface UserProfileContextValue {
  profile: UserProfile | null;
  targets: NutritionTargets | null;
  setProfile: (profile: UserProfile) => void;
  reset: () => void;
}

const UserProfileContext = createContext<UserProfileContextValue | undefined>(
  undefined
);

export function UserProfileProvider({ children }: { children: ReactNode }) {
  const [profile, setProfileState] = useState<UserProfile | null>(null);
  const [targets, setTargets] = useState<NutritionTargets | null>(null);

  function setProfile(newProfile: UserProfile) {
    setProfileState(newProfile);
    setTargets(calculateNutritionTargets(newProfile));
  }

  function reset() {
    setProfileState(null);
    setTargets(null);
  }

  return (
    <UserProfileContext.Provider value={{ profile, targets, setProfile, reset }}>
      {children}
    </UserProfileContext.Provider>
  );
}

export function useUserProfile() {
  const ctx = useContext(UserProfileContext);
  if (!ctx) {
    throw new Error('useUserProfile must be used within UserProfileProvider');
  }
  return ctx;
}