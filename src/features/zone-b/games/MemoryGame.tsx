import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, RotateCcw } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui';
import { shuffleArray } from '@/lib/utils';

type GameMode = 'emoji' | 'word' | 'math';

interface Card {
  id: string;
  content: string;
  matchId: string;
  type: 'front' | 'back';
}

const EMOJI_PAIRS = [
  ['🦁', '🦁'], ['🐘', '🐘'], ['🦊', '🦊'], ['🐼', '🐼'],
  ['🦄', '🦄'], ['🐸', '🐸'],
];

const WORD_PAIRS = [
  ['🦁', 'אריה'], ['🐘', 'פיל'], ['🦊', 'שועל'],
  ['🐼', 'פנדה'], ['🦄', 'חד קרן'], ['🐸', 'צפרדע'],
];

const MATH_PAIRS = [
  ['1+1', '2'], ['2+2', '4'], ['3+2', '5'],
  ['4+1', '5'], ['2+3', '5'], ['1+4', '5'],
];

const generateCards = (mode: GameMode): Card[] => {
  let pairs: string[][];
  
  switch (mode) {
    case 'emoji':
      pairs = EMOJI_PAIRS.slice(0, 6);
      break;
    case 'word':
      pairs = WORD_PAIRS.slice(0, 6);
      break;
    case 'math':
      const uniqueMath: string[][] = [];
      const usedResults = new Set<string>();
      for (const pair of MATH_PAIRS) {
        if (!usedResults.has(pair[1])) {
          uniqueMath.push(pair);
          usedResults.add(pair[1]);
        }
        if (uniqueMath.length >= 6) break;
      }
      while (uniqueMath.length < 6) {
        const a = Math.floor(Math.random() * 5) + 1;
        const b = Math.floor(Math.random() * 5) + 1;
        const result = String(a + b);
        if (!usedResults.has(result)) {
          uniqueMath.push([`${a}+${b}`, result]);
          usedResults.add(result);
        }
      }
      pairs = uniqueMath;
      break;
  }

  const cards: Card[] = [];
  pairs.forEach((pair, i) => {
    cards.push({
      id: `${i}-a`,
      content: pair[0],
      matchId: String(i),
      type: 'front',
    });
    cards.push({
      id: `${i}-b`,
      content: pair[1],
      matchId: String(i),
      type: 'back',
    });
  });

  return shuffleArray(cards);
};

export const MemoryGame = () => {
  const navigate = useNavigate();
  const { addXP } = useGame();
  const [mode, setMode] = useState<GameMode | null>(null);
  const [cards, setCards] = useState<Card[]>([]);
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [moves, setMoves] = useState(0);
  const [score, setScore] = useState(0);
  const [isChecking, setIsChecking] = useState(false);

  useEffect(() => {
    if (mode) {
      startGame();
    }
  }, [mode]);

  const startGame = () => {
    setCards(generateCards(mode!));
    setFlipped([]);
    setMatched([]);
    setMoves(0);
  };

  const handleCardClick = (card: Card) => {
    if (isChecking || flipped.includes(card.id) || matched.includes(card.id)) return;

    const newFlipped = [...flipped, card.id];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves(moves + 1);
      setIsChecking(true);

      const [first, second] = newFlipped.map(id => cards.find(c => c.id === id)!);
      
      if (first.matchId === second.matchId) {
        setMatched([...matched, first.id, second.id]);
        addXP(20, 'memory', true);
        setScore(score + 20);
        setFlipped([]);
        setIsChecking(false);

        if (matched.length + 2 === cards.length) {
          setTimeout(() => {
            addXP(50);
          }, 500);
        }
      } else {
        addXP(0, 'memory', false);
        setTimeout(() => {
          setFlipped([]);
          setIsChecking(false);
        }, 1000);
      }
    }
  };

  const isComplete = matched.length === cards.length && cards.length > 0;

  if (!mode) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-6">
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={() => navigate('/zone-b')}
            className="flex items-center gap-2 text-white/80 hover:text-white"
          >
            <ArrowRight size={24} />
            <span className="font-bold">חזרה</span>
          </button>
          <h1 className="text-2xl font-bold text-white">🎴 משחק הזיכרון</h1>
        </div>

        <div className="max-w-md mx-auto mt-12 space-y-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Button variant="zone-b" size="xl" className="w-full" onClick={() => setMode('emoji')}>
              <span className="text-3xl ml-3">🎨</span>
              תמונה לתמונה
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Button variant="zone-b" size="xl" className="w-full" onClick={() => setMode('word')}>
              <span className="text-3xl ml-3">📖</span>
              תמונה למילה
            </Button>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <Button variant="zone-b" size="xl" className="w-full" onClick={() => setMode('math')}>
              <span className="text-3xl ml-3">🔢</span>
              תרגיל לתשובה
            </Button>
          </motion.div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-900 via-red-900 to-pink-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => setMode(null)}
          className="flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-white">🎴 זיכרון חכם</h1>
        <div className="flex items-center gap-4">
          <button onClick={startGame} className="p-2 rounded-full bg-white/10 hover:bg-white/20">
            <RotateCcw size={20} className="text-white" />
          </button>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <Zap className="text-yellow-400" size={20} />
            <span className="font-bold text-white">{score}</span>
          </div>
        </div>
      </div>

      <div className="text-center text-white/60 mb-4">
        מהלכים: {moves} | נמצאו: {matched.length / 2} / {cards.length / 2}
      </div>

      <div className="grid grid-cols-3 md:grid-cols-4 gap-3 max-w-lg mx-auto">
        {cards.map((card) => {
          const isFlipped = flipped.includes(card.id) || matched.includes(card.id);
          const isMatched = matched.includes(card.id);

          return (
            <motion.button
              key={card.id}
              whileHover={!isFlipped ? { scale: 1.05 } : undefined}
              whileTap={!isFlipped ? { scale: 0.95 } : undefined}
              onClick={() => handleCardClick(card)}
              className={`aspect-square rounded-2xl text-3xl font-bold transition-all
                ${isMatched ? 'bg-green-500/50 text-white' : ''}
                ${isFlipped && !isMatched ? 'bg-white text-gray-800' : ''}
                ${!isFlipped ? 'bg-gradient-to-br from-orange-500 to-red-500 text-white' : ''}
              `}
            >
              <AnimatePresence mode="wait">
                {isFlipped ? (
                  <motion.span
                    key="front"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                  >
                    {card.content}
                  </motion.span>
                ) : (
                  <motion.span
                    key="back"
                    initial={{ rotateY: 90 }}
                    animate={{ rotateY: 0 }}
                    exit={{ rotateY: 90 }}
                  >
                    ❓
                  </motion.span>
                )}
              </AnimatePresence>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center"
            >
              <span className="text-8xl block mb-4">🏆</span>
              <h2 className="text-3xl font-bold text-white mb-2">כל הכבוד!</h2>
              <p className="text-xl text-white/80 mb-2">סיימת ב-{moves} מהלכים</p>
              <p className="text-lg text-white/70 mb-6">+{score + 50} XP</p>
              <div className="flex gap-4">
                <Button variant="secondary" size="lg" onClick={() => setMode(null)}>
                  חזרה
                </Button>
                <Button variant="primary" size="lg" onClick={startGame}>
                  שחק שוב
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
