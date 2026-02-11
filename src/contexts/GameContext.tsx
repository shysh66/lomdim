import { createContext, useContext, useState, useEffect, type ReactNode } from 'react';

interface Trophy {
  id: string;
  name: string;
  description: string;
  emoji: string;
  earnedAt?: string;
}

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
  trophies: string[];
}

interface GameState {
  profiles: Profile[];
  currentProfile: Profile | null;
  setCurrentProfile: (profile: Profile | null) => void;
  addProfile: (name: string, avatar: string) => void;
  addXP: (amount: number, subject?: string, correct?: boolean) => void;
  unlockLevel: (gameId: string, level: number) => void;
  getRank: () => { name: string; emoji: string; nextRankXP: number; minXP: number };
  awardTrophy: (trophyId: string) => boolean;
  getTrophies: () => Trophy[];
}

const RANKS = [
  { name: 'מתחיל', emoji: '🌟', minXP: 0 },
  { name: 'חוקר', emoji: '🔍', minXP: 50 },
  { name: 'ארד', emoji: '🥉', minXP: 150 },
  { name: 'כסף', emoji: '🥈', minXP: 300 },
  { name: 'זהב', emoji: '🥇', minXP: 500 },
  { name: 'פלטינה', emoji: '💎', minXP: 800 },
  { name: 'יהלום', emoji: '💠', minXP: 1200 },
  { name: 'אלוף', emoji: '🏆', minXP: 1800 },
  { name: 'גאון', emoji: '🧠', minXP: 2500 },
  { name: 'אגדה', emoji: '👑', minXP: 3500 },
];

const AVATARS = ['🦁', '🐱', '🐶', '🦊', '🐰', '🐻', '🐼', '🦄', '🐸', '🐵'];

const TROPHIES: Record<string, Trophy> = {
  'first-game': { id: 'first-game', name: 'צעד ראשון', description: 'סיימת את המשחק הראשון', emoji: '🎯' },
  'streak5': { id: 'streak5', name: 'על גלגל', description: '5 תשובות נכונות ברצף', emoji: '🔥' },
  'streak10': { id: 'streak10', name: 'בלתי ניתן לעצירה', description: '10 תשובות נכונות ברצף', emoji: '⚡' },
  'streak20': { id: 'streak20', name: 'מכונה', description: '20 תשובות נכונות ברצף', emoji: '🚀' },
  'addition-master': { id: 'addition-master', name: 'אלוף החיבור', description: 'סיימת את כל שלבי החיבור', emoji: '➕' },
  'subtraction-master': { id: 'subtraction-master', name: 'אלוף החיסור', description: 'סיימת את כל שלבי החיסור', emoji: '➖' },
  'multiplication-master': { id: 'multiplication-master', name: 'אלוף הכפל', description: 'סיימת את כל שלבי הכפל', emoji: '✖️' },
  'division-master': { id: 'division-master', name: 'אלוף החילוק', description: 'סיימת את כל שלבי החילוק', emoji: '➗' },
  'math-legend': { id: 'math-legend', name: 'אגדת המתמטיקה', description: 'סיימת את כל שלבי החשבון', emoji: '🏅' },
  'xp-100': { id: 'xp-100', name: 'מאה ראשונה', description: 'צברת 100 נקודות XP', emoji: '💯' },
  'xp-500': { id: 'xp-500', name: 'חמש מאות', description: 'צברת 500 נקודות XP', emoji: '🌟' },
  'xp-1000': { id: 'xp-1000', name: 'אלף!', description: 'צברת 1000 נקודות XP', emoji: '🎆' },
  'daily-player': { id: 'daily-player', name: 'שחקן יומי', description: 'שיחקת 7 ימים', emoji: '📅' },
  'memory-master': { id: 'memory-master', name: 'זיכרון פיל', description: 'סיימת משחק זיכרון ב-10 מהלכים', emoji: '🐘' },
  'english-star': { id: 'english-star', name: 'כוכב אנגלית', description: '20 מילים נכונות באנגלית', emoji: '🇬🇧' },
  'logic-genius': { id: 'logic-genius', name: 'גאון לוגי', description: '15 תשובות נכונות בחשיבה', emoji: '🧩' },
};

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
      trophies: [],
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

  const awardTrophy = (trophyId: string): boolean => {
    if (!currentProfile) return false;
    if (currentProfile.trophies?.includes(trophyId)) return false;
    
    const trophies = [...(currentProfile.trophies || []), trophyId];
    updateProfile({ ...currentProfile, trophies });
    return true;
  };

  const getTrophies = (): Trophy[] => {
    if (!currentProfile) return [];
    return (currentProfile.trophies || [])
      .map(id => TROPHIES[id])
      .filter(Boolean);
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
      awardTrophy,
      getTrophies,
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

export { AVATARS, RANKS, TROPHIES };
