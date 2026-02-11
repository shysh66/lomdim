import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { GameProvider } from '@/contexts/GameContext';
import { VersionBadge } from '@/components/ui/VersionBadge';
import { HomePage } from '@/features/home/HomePage';
import { ZoneAMenu } from '@/features/zone-a/ZoneAMenu';
import { SorterGame } from '@/features/zone-a/games/SorterGame';
import { FeedGame } from '@/features/zone-a/games/FeedGame';
import { JuniorMathGame } from '@/features/zone-a/games/JuniorMathGame';
import { FirstWordGame } from '@/features/zone-a/games/FirstWordGame';
import { ZoneBMenu } from '@/features/zone-b/ZoneBMenu';
import { MathChallenge } from '@/features/zone-b/games/MathChallenge';
import { EnglishGame } from '@/features/zone-b/games/EnglishGame';
import { LogicGame } from '@/features/zone-b/games/LogicGame';
import { MemoryGame } from '@/features/zone-b/games/MemoryGame';
import { ParentsZone } from '@/features/parents/ParentsZone';

export const App = () => {
  return (
    <GameProvider>
      <BrowserRouter>
        <VersionBadge />
        <Routes>
          <Route path="/" element={<HomePage />} />
          
          {/* Zone A - Little Explorers */}
          <Route path="/zone-a" element={<ZoneAMenu />} />
          <Route path="/zone-a/sorter" element={<SorterGame />} />
          <Route path="/zone-a/feed" element={<FeedGame />} />
          <Route path="/zone-a/math" element={<JuniorMathGame />} />
          <Route path="/zone-a/words" element={<FirstWordGame />} />
          
          {/* Zone B - Ace Academy */}
          <Route path="/zone-b" element={<ZoneBMenu />} />
          <Route path="/zone-b/math" element={<MathChallenge />} />
          <Route path="/zone-b/english" element={<EnglishGame />} />
          <Route path="/zone-b/logic" element={<LogicGame />} />
          <Route path="/zone-b/memory" element={<MemoryGame />} />
          
          {/* Parents Zone */}
          <Route path="/parents" element={<ParentsZone />} />
        </Routes>
      </BrowserRouter>
    </GameProvider>
  );
};

export default App;
