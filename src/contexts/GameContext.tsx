import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Profile {
  id: string;
  name: string;
  avatar: string;
  totalXP: number;
  currentZone: 'a' | 'b' | null;
  unlockedLevels: Record<string, number[]>;
  themePreference: 'space' | 'dino' | 'unicorn';
  activityHistory: { date: string; xp: number }[];
  accuracyBySubject: Record<string, { correct: number; total: number }>;
}

interface GameState {
  profiles: Profile[];
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  addProfile: (name: string, avatar: string) => void;
  addXP: (amount: number, subject?: string, correct?: boolean) => void;
  unlockLevel: (gameId: string, level: number) => void;
  getRank: () => { name: string; emoji: string; nextRankXP: number };
}

const RANKS = [
  { name: 'מתחיל', emoji: '🌟', minXP: 0 },
  { name: 'ארד', emoji: '🥉', minXP: 100 },
  { name: 'כסף', emoji: '🥈', minXP: 300 },
  { name: 'זהב', emoji: '🥇', minXP: 600 },
  { name: 'פלטינה', emoji: '💎', minXP: 1000 },
  { name: 'אלוף', emoji: '🏆', minXP: 1500 },
  { name: 'אגדה', emoji: '👑', minXP: 2500 },
];

const AVATARS = ['🦁', '🐱', '🐶', '🦊', '🐰', '🐻', '🐼', '🦄', '🐸', '🐵'];

const GameContext = createContext<GameState | null>(null);

const STORAGE_KEY = 'lomdim_profiles';

export const GameProvider = ({ children }: { children: ReactNode }) => {
  const [profiles, setProfiles] = useState<Profile[]>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [currentProfile, setCurrentProfile] = useState<Profile | null>(null);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(profiles));
  }, [profiles]);

  const addProfile = (name: string, avatar: string) => {
    const newProfile: Profile = {
      id: Date.now().toString(),
      name,
      avatar,
      totalXP: 0,
      currentZone: null,
      unlockedLevels: {},
      themePreference: 'space',
      activityHistory: [],
      accuracyBySubject: {},
    };
    setProfiles([...profiles, newProfile]);
    setCurrentProfile(newProfile);
  };

  const updateProfile = (updated: Profile) => {
    setProfiles(profiles.map(p => p.id === updated.id ? updated : p));
    setCurrentProfile(updated);
  };

  const addXP = (amount: number, subject?: string, correct?: boolean) => {
    if (!currentProfile) return;
    
    const today = new Date().toISOString().split('T')[0];
    const history = [...currentProfile.activityHistory];
    const todayEntry = history.find(h => h.date === today);
    
    if (todayEntry) {
      todayEntry.xp += amount;
    } else {
      history.push({ date: today, xp: amount });
    }
    
    const accuracy = { ...currentProfile.accuracyBySubject };
    if (subject && correct !== undefined) {
      if (!accuracy[subject]) {
        accuracy[subject] = { correct: 0, total: 0 };
      }
      accuracy[subject].total++;
      if (correct) accuracy[subject].correct++;
    }

    updateProfile({
      ...currentProfile,
      totalXP: currentProfile.totalXP + amount,
      activityHistory: history.slice(-30),
      accuracyBySubject: accuracy,
    });
  };

  const unlockLevel = (gameId: string, level: number) => {
    if (!currentProfile) return;
    const unlocked = { ...currentProfile.unlockedLevels };
    if (!unlocked[gameId]) unlocked[gameId] = [1];
    if (!unlocked[gameId].includes(level)) {
      unlocked[gameId].push(level);
    }
    updateProfile({ ...currentProfile, unlockedLevels: unlocked });
  };

  const getRank = () => {
    const xp = currentProfile?.totalXP || 0;
    let current = RANKS[0];
    let nextRankXP = RANKS[1]?.minXP || 0;
    
    for (let i = RANKS.length - 1; i >= 0; i--) {
      if (xp >= RANKS[i].minXP) {
        current = RANKS[i];
        nextRankXP = RANKS[i + 1]?.minXP || current.minXP;
        break;
      }
    }
    
    return { ...current, nextRankXP };
  };

  return (
    <GameContext.Provider value={{
      profiles,
      currentProfile,
      setCurrentProfile,
      addProfile,
      addXP,
      unlockLevel,
      getRank,
    }}>
      {children}
    </GameContext.Provider>
  );
};

export const useGame = () => {
  const context = useContext(GameContext);
  if (!context) throw new Error('useGame must be used within GameProvider');
  return context;
};

export { AVATARS, RANKS };
