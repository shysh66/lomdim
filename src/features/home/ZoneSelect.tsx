import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { Sparkles, Rocket, Settings, ArrowRight } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Card, ProgressBar } from '@/components/ui';

interface ZoneSelectProps {
  onBack: () => void;
}

export const ZoneSelect = ({ onBack }: ZoneSelectProps) => {
  const navigate = useNavigate();
  const { currentProfile, getRank, setCurrentProfile } = useGame();
  const rank = getRank();

  const handleZoneSelect = (zone: 'a' | 'b') => {
    navigate(`/zone-${zone}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 flex flex-col p-6">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={onBack}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowRight size={24} />
          <span>החלפת שחקן</span>
        </button>
        
        <button
          onClick={() => navigate('/parents')}
          className="p-3 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
        >
          <Settings size={24} />
        </button>
      </div>

      <motion.div
        initial={{ y: -30, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        className="text-center mb-8"
      >
        <div className="inline-flex items-center gap-3 bg-white/10 rounded-full px-6 py-3 mb-4">
          <span className="text-4xl">{currentProfile?.avatar}</span>
          <div className="text-right">
            <p className="text-white font-bold text-xl">{currentProfile?.name}</p>
            <p className="text-white/70 text-sm">
              {rank.emoji} {rank.name} • {currentProfile?.totalXP} XP
            </p>
          </div>
        </div>

        <div className="max-w-xs mx-auto">
          <ProgressBar
            value={currentProfile?.totalXP || 0}
            max={rank.nextRankXP}
            color="purple"
          />
          <p className="text-white/50 text-xs mt-1">
            {rank.nextRankXP - (currentProfile?.totalXP || 0)} XP לדרגה הבאה
          </p>
        </div>
      </motion.div>

      <div className="flex-1 flex flex-col md:flex-row gap-6 items-center justify-center max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ x: -100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-full md:w-1/2"
        >
          <Card
            variant="zone-a"
            className="h-full min-h-[300px] flex flex-col items-center justify-center text-center"
            onClick={() => handleZoneSelect('a')}
          >
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 2 }}
            >
              <Sparkles className="text-orange-500 mb-4" size={80} />
            </motion.div>
            <h2 className="text-3xl font-bold text-orange-700 mb-2">
              החוקרים הקטנים 🧸
            </h2>
            <p className="text-orange-600">גילאי 4-5</p>
            <p className="text-orange-500/70 text-sm mt-2">
              משחקים צבעוניים עם הרבה כיף!
            </p>
          </Card>
        </motion.div>

        <motion.div
          initial={{ x: 100, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="w-full md:w-1/2"
        >
          <Card
            variant="zone-b"
            className="h-full min-h-[300px] flex flex-col items-center justify-center text-center"
            onClick={() => handleZoneSelect('b')}
          >
            <motion.div
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ repeat: Infinity, duration: 3 }}
            >
              <Rocket className="text-purple-600 mb-4" size={80} />
            </motion.div>
            <h2 className="text-3xl font-bold text-purple-700 mb-2">
              אלופי הכיתה 🚀
            </h2>
            <p className="text-purple-600">גילאי 6+</p>
            <p className="text-purple-500/70 text-sm mt-2">
              אתגרים, נקודות והרבה למידה!
            </p>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};
