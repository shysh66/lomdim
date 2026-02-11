import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Calculator, Globe, Brain, Grid3X3, Trophy, X } from 'lucide-react';
import { Card, ProgressBar, Modal } from '@/components/ui';
import { useGame, TROPHIES } from '@/contexts/GameContext';

const GAMES = [
  { id: 'math', name: 'חשבון', icon: Calculator, color: 'from-blue-500 to-cyan-500', emoji: '🔢' },
  { id: 'english', name: 'אנגלית', icon: Globe, color: 'from-green-500 to-emerald-500', emoji: '🌍' },
  { id: 'logic', name: 'חשיבה', icon: Brain, color: 'from-purple-500 to-pink-500', emoji: '🧠' },
  { id: 'memory', name: 'זיכרון חכם', icon: Grid3X3, color: 'from-orange-500 to-red-500', emoji: '🎴' },
];

export const ZoneBMenu = () => {
  const navigate = useNavigate();
  const { currentProfile, getRank, getTrophies } = useGame();
  const rank = getRank();
  const [showTrophies, setShowTrophies] = useState(false);
  const earnedTrophies = getTrophies();
  const allTrophyIds = Object.keys(TROPHIES);

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
            value={(currentProfile?.totalXP || 0) - rank.minXP}
            max={rank.nextRankXP - rank.minXP}
            color="purple"
          />
          <p className="text-white/40 text-xs text-center mt-1">
            {rank.nextRankXP - (currentProfile?.totalXP || 0)} XP לדרגה הבאה
          </p>
        </div>

        <button
          onClick={() => setShowTrophies(true)}
          className="w-full mt-3 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-2xl p-3 flex items-center justify-center gap-2 hover:from-amber-600 hover:to-yellow-600 transition-all"
        >
          <Trophy className="text-white" size={24} />
          <span className="text-white font-bold">הגביעים שלי ({earnedTrophies.length}/{allTrophyIds.length})</span>
        </button>
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

      <AnimatePresence>
        {showTrophies && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
            onClick={() => setShowTrophies(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-3xl p-6 max-w-lg w-full max-h-[80vh] overflow-y-auto"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Trophy className="text-yellow-400" />
                  הגביעים שלי
                </h2>
                <button
                  onClick={() => setShowTrophies(false)}
                  className="p-2 rounded-full hover:bg-white/10 text-white/60 hover:text-white"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="grid grid-cols-3 gap-3">
                {allTrophyIds.map((id) => {
                  const trophy = TROPHIES[id];
                  const isEarned = currentProfile?.trophies?.includes(id);
                  return (
                    <motion.div
                      key={id}
                      whileHover={{ scale: 1.05 }}
                      className={`p-3 rounded-xl text-center transition-all ${
                        isEarned
                          ? 'bg-gradient-to-br from-amber-500/20 to-yellow-500/20 border border-yellow-500/50'
                          : 'bg-white/5 opacity-50'
                      }`}
                    >
                      <span className={`text-4xl block mb-1 ${!isEarned && 'grayscale'}`}>
                        {trophy.emoji}
                      </span>
                      <p className="text-white text-xs font-bold">{trophy.name}</p>
                      <p className="text-white/50 text-[10px]">{trophy.description}</p>
                    </motion.div>
                  );
                })}
              </div>

              <p className="text-center text-white/40 text-sm mt-4">
                {earnedTrophies.length} מתוך {allTrophyIds.length} גביעים
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
