import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, Globe, Brain, Grid3X3 } from 'lucide-react';
import { Card, ProgressBar } from '@/components/ui';
import { useGame } from '@/contexts/GameContext';

const GAMES = [
  { id: 'math', name: 'חשבון', icon: Calculator, color: 'from-blue-500 to-cyan-500', emoji: '🔢' },
  { id: 'english', name: 'אנגלית', icon: Globe, color: 'from-green-500 to-emerald-500', emoji: '🌍' },
  { id: 'logic', name: 'חשיבה', icon: Brain, color: 'from-purple-500 to-pink-500', emoji: '🧠' },
  { id: 'memory', name: 'זיכרון חכם', icon: Grid3X3, color: 'from-orange-500 to-red-500', emoji: '🎴' },
];

export const ZoneBMenu = () => {
  const navigate = useNavigate();
  const { currentProfile, getRank } = useGame();
  const rank = getRank();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-white/80 hover:text-white transition-colors"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-3xl font-bold text-white">אלופי הכיתה 🚀</h1>
      </div>

      <div className="max-w-md mx-auto mb-8">
        <div className="bg-white/10 rounded-2xl p-4 backdrop-blur">
          <div className="flex items-center gap-3 mb-3">
            <span className="text-4xl">{currentProfile?.avatar}</span>
            <div>
              <p className="text-white font-bold">{currentProfile?.name}</p>
              <p className="text-white/60 text-sm">{rank.emoji} {rank.name}</p>
            </div>
            <div className="mr-auto text-left">
              <p className="text-2xl font-bold text-yellow-400">{currentProfile?.totalXP}</p>
              <p className="text-white/60 text-xs">XP</p>
            </div>
          </div>
          <ProgressBar
            value={currentProfile?.totalXP || 0}
            max={rank.nextRankXP}
            color="purple"
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
          >
            <Card
              className={`bg-gradient-to-br ${game.color} text-white text-center min-h-[180px] flex flex-col items-center justify-center`}
              onClick={() => navigate(`/zone-b/${game.id}`)}
            >
              <motion.span
                className="text-6xl mb-3 block"
                whileHover={{ rotate: [0, -10, 10, 0] }}
              >
                {game.emoji}
              </motion.span>
              <h2 className="text-xl font-bold">{game.name}</h2>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
