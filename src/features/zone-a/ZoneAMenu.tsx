import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Shapes, Apple, Calculator, BookOpen } from 'lucide-react';
import { Card } from '@/components/ui';
import { speak } from '@/lib/utils';

const GAMES = [
  { id: 'sorter', name: 'המסדר הקטן', icon: Shapes, color: 'bg-red-400', emoji: '🧩' },
  { id: 'feed', name: 'זמן אוכל', icon: Apple, color: 'bg-green-400', emoji: '🦁' },
  { id: 'math', name: 'חשבון לקטנטנים', icon: Calculator, color: 'bg-blue-400', emoji: '🔢' },
  { id: 'words', name: 'המילה הראשונה', icon: BookOpen, color: 'bg-purple-400', emoji: '📖' },
];

export const ZoneAMenu = () => {
  const navigate = useNavigate();

  const handleGameSelect = (gameId: string, gameName: string) => {
    speak(gameName);
    navigate(`/zone-a/${gameId}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-orange-300 to-pink-300 p-6">
      <div className="flex justify-between items-center mb-8">
        <button
          onClick={() => navigate('/')}
          className="flex items-center gap-2 text-orange-700 hover:text-orange-900 transition-colors"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-3xl font-bold text-orange-800">החוקרים הקטנים 🧸</h1>
      </div>

      <div className="grid grid-cols-2 gap-6 max-w-2xl mx-auto">
        {GAMES.map((game, i) => (
          <motion.div
            key={game.id}
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            transition={{ delay: i * 0.15, type: 'spring' }}
          >
            <Card
              className={`${game.color} text-white text-center min-h-[200px] flex flex-col items-center justify-center`}
              onClick={() => handleGameSelect(game.id, game.name)}
            >
              <motion.span
                className="text-7xl mb-4 block"
                animate={{ scale: [1, 1.1, 1] }}
                transition={{ repeat: Infinity, duration: 2, delay: i * 0.3 }}
              >
                {game.emoji}
              </motion.span>
              <h2 className="text-2xl font-bold">{game.name}</h2>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
};
