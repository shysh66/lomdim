import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2, Zap } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button, ProgressBar } from '@/components/ui';
import { speak, shuffleArray, getRandomInt } from '@/lib/utils';

interface WordItem {
  word: string;
  emoji: string;
  category: string;
}

const WORDS: WordItem[] = [
  { word: 'Dog', emoji: '🐶', category: 'animals' },
  { word: 'Cat', emoji: '🐱', category: 'animals' },
  { word: 'Bird', emoji: '🐦', category: 'animals' },
  { word: 'Fish', emoji: '🐟', category: 'animals' },
  { word: 'Lion', emoji: '🦁', category: 'animals' },
  { word: 'Apple', emoji: '🍎', category: 'food' },
  { word: 'Banana', emoji: '🍌', category: 'food' },
  { word: 'Orange', emoji: '🍊', category: 'food' },
  { word: 'Red', emoji: '🔴', category: 'colors' },
  { word: 'Blue', emoji: '🔵', category: 'colors' },
  { word: 'Green', emoji: '🟢', category: 'colors' },
  { word: 'Yellow', emoji: '🟡', category: 'colors' },
  { word: 'One', emoji: '1️⃣', category: 'numbers' },
  { word: 'Two', emoji: '2️⃣', category: 'numbers' },
  { word: 'Three', emoji: '3️⃣', category: 'numbers' },
  { word: 'Sun', emoji: '☀️', category: 'nature' },
  { word: 'Moon', emoji: '🌙', category: 'nature' },
  { word: 'Star', emoji: '⭐', category: 'nature' },
  { word: 'House', emoji: '🏠', category: 'objects' },
  { word: 'Car', emoji: '🚗', category: 'objects' },
];

const LEVELS = [
  { name: 'חיות', filter: 'animals' },
  { name: 'צבעים ומספרים', filter: 'colors,numbers' },
  { name: 'הכל!', filter: 'all' },
];

export const EnglishGame = () => {
  const navigate = useNavigate();
  const { addXP } = useGame();
  const [level, setLevel] = useState(0);
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  const getAvailableWords = () => {
    const config = LEVELS[level];
    if (config.filter === 'all') return WORDS;
    const categories = config.filter.split(',');
    return WORDS.filter(w => categories.includes(w.category));
  };

  useEffect(() => {
    newWord();
  }, [level]);

  const newWord = () => {
    const available = getAvailableWords();
    const word = available[getRandomInt(0, available.length - 1)];
    setCurrentWord(word);

    const otherEmojis = WORDS
      .filter(w => w.emoji !== word.emoji)
      .map(w => w.emoji);
    const wrongOptions = shuffleArray(otherEmojis).slice(0, 3);
    setOptions(shuffleArray([word.emoji, ...wrongOptions]));
    setSelectedAnswer(null);
    setIsCorrect(null);

    setTimeout(() => speak(word.word, 'en-US'), 500);
  };

  const speakWord = () => {
    if (currentWord) {
      speak(currentWord.word, 'en-US');
    }
  };

  const handleAnswer = (emoji: string) => {
    if (!currentWord || selectedAnswer !== null) return;

    setSelectedAnswer(emoji);
    const correct = emoji === currentWord.emoji;
    setIsCorrect(correct);

    if (correct) {
      const xp = 15 + level * 5 + streak * 2;
      addXP(xp, 'english', true);
      setScore(score + xp);
      setStreak(streak + 1);
      setTimeout(newWord, 1000);
    } else {
      addXP(0, 'english', false);
      setStreak(0);
      setTimeout(newWord, 1500);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-900 via-emerald-900 to-teal-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/zone-b')}
          className="flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-white">🌍 אנגלית</h1>
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <Zap className="text-yellow-400" size={20} />
          <span className="font-bold text-white">{score}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <div className="flex justify-between items-center text-white/60 text-sm mb-2">
          <span>שלב {level + 1}: {LEVELS[level].name}</span>
          {streak > 0 && <span className="text-orange-400">🔥 {streak}</span>}
        </div>
        <div className="flex gap-2">
          {LEVELS.map((_, i) => (
            <button
              key={i}
              onClick={() => setLevel(i)}
              className={`flex-1 h-2 rounded-full transition-all ${
                i <= level ? 'bg-green-400' : 'bg-white/20'
              }`}
            />
          ))}
        </div>
      </div>

      {currentWord && (
        <motion.div
          key={currentWord.word}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-6 text-center">
            <button
              onClick={speakWord}
              className="mb-4 p-4 rounded-full bg-green-500/20 hover:bg-green-500/30 transition-colors inline-flex"
            >
              <Volume2 size={40} className="text-green-400" />
            </button>

            <motion.p
              className="text-5xl font-bold text-white cursor-pointer"
              onClick={speakWord}
              whileHover={{ scale: 1.05 }}
            >
              {currentWord.word}
            </motion.p>

            <p className="text-white/50 mt-4">לחצו לשמיעה מחדש</p>
          </div>

          <p className="text-center text-lg font-bold text-white/80 mb-4">
            מצאו את התמונה המתאימה:
          </p>

          <div className="grid grid-cols-2 gap-4">
            {options.map((emoji) => {
              const isSelected = selectedAnswer === emoji;
              const showCorrect = isCorrect !== null && emoji === currentWord.emoji;
              const showWrong = isSelected && !isCorrect;

              return (
                <motion.button
                  key={emoji}
                  whileHover={selectedAnswer === null ? { scale: 1.05 } : undefined}
                  whileTap={selectedAnswer === null ? { scale: 0.95 } : undefined}
                  onClick={() => handleAnswer(emoji)}
                  disabled={selectedAnswer !== null}
                  className={`py-8 rounded-2xl text-6xl transition-all
                    ${showCorrect ? 'bg-green-500 ring-4 ring-green-300' : ''}
                    ${showWrong ? 'bg-red-500' : ''}
                    ${!showCorrect && !showWrong ? 'bg-white/20 hover:bg-white/30' : ''}
                  `}
                >
                  {emoji}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {isCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl pointer-events-none"
          >
            ✅
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
