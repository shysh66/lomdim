import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2 } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui';
import { speak, shuffleArray, getRandomInt } from '@/lib/utils';

interface WordItem {
  word: string;
  emoji: string;
}

const WORDS: WordItem[] = [
  { word: 'בָּנָנָה', emoji: '🍌' },
  { word: 'תַּפּוּחַ', emoji: '🍎' },
  { word: 'כֶּלֶב', emoji: '🐶' },
  { word: 'חָתוּל', emoji: '🐱' },
  { word: 'שֶׁמֶשׁ', emoji: '☀️' },
  { word: 'יָרֵחַ', emoji: '🌙' },
  { word: 'כּוֹכָב', emoji: '⭐' },
  { word: 'פֶּרַח', emoji: '🌸' },
  { word: 'דָּג', emoji: '🐟' },
  { word: 'צִפּוֹר', emoji: '🐦' },
  { word: 'בַּיִת', emoji: '🏠' },
  { word: 'עֵץ', emoji: '🌳' },
  { word: 'גֶּשֶׁם', emoji: '🌧️' },
  { word: 'לֵב', emoji: '❤️' },
  { word: 'אַרְיֵה', emoji: '🦁' },
];

export const FirstWordGame = () => {
  const navigate = useNavigate();
  const { addXP } = useGame();
  const [currentWord, setCurrentWord] = useState<WordItem | null>(null);
  const [options, setOptions] = useState<string[]>([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [wrongAnswer, setWrongAnswer] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [usedWords, setUsedWords] = useState<string[]>([]);

  useEffect(() => {
    newWord();
  }, []);

  const newWord = () => {
    const available = WORDS.filter(w => !usedWords.includes(w.word));
    if (available.length === 0) {
      setUsedWords([]);
    }

    const words = available.length > 0 ? available : WORDS;
    const selected = words[getRandomInt(0, words.length - 1)];
    setCurrentWord(selected);
    setUsedWords(prev => [...prev, selected.word]);

    const otherEmojis = WORDS
      .filter(w => w.emoji !== selected.emoji)
      .map(w => w.emoji);
    const wrongOptions = shuffleArray(otherEmojis).slice(0, 3);
    setOptions(shuffleArray([selected.emoji, ...wrongOptions]));
    setShowCorrect(false);
    setWrongAnswer(null);

    setTimeout(() => {
      speak(selected.word.replace(/[ַָּּּּ]/g, ''));
    }, 500);
  };

  const handleAnswer = (emoji: string) => {
    if (!currentWord) return;

    if (emoji === currentWord.emoji) {
      speak('נכון! יופי!');
      setShowCorrect(true);
      addXP(15, 'reading', true);
      setScore(score + 1);
      setTimeout(newWord, 1500);
    } else {
      speak('נסה שוב');
      setWrongAnswer(emoji);
      addXP(0, 'reading', false);
      setTimeout(() => setWrongAnswer(null), 500);
    }
  };

  const speakWord = () => {
    if (currentWord) {
      speak(currentWord.word.replace(/[ַָּּּּ]/g, ''));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-200 to-pink-200 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/zone-a')}
          className="flex items-center gap-2 text-purple-700"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-purple-800">📖 המילה הראשונה</h1>
        <div className="bg-white/50 rounded-full px-4 py-2">
          <span className="font-bold">{score} ⭐</span>
        </div>
      </div>

      {currentWord && (
        <div className="max-w-lg mx-auto">
          <motion.div
            key={currentWord.word}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-3xl p-8 shadow-xl mb-8 text-center"
          >
            <button
              onClick={speakWord}
              className="mb-4 p-4 rounded-full bg-purple-100 hover:bg-purple-200 transition-colors inline-flex"
            >
              <Volume2 size={32} className="text-purple-500" />
            </button>

            <motion.p
              className="text-6xl font-bold text-purple-800 cursor-pointer"
              onClick={speakWord}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {currentWord.word}
            </motion.p>

            <p className="text-gray-500 mt-4">לחצו על המילה לשמיעה</p>
          </motion.div>

          <p className="text-center text-xl font-bold text-purple-700 mb-4">
            מצאו את התמונה המתאימה:
          </p>

          <div className="grid grid-cols-2 gap-4">
            {options.map((emoji) => {
              const isCorrect = showCorrect && emoji === currentWord.emoji;
              const isWrong = wrongAnswer === emoji;

              return (
                <motion.button
                  key={emoji}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={isWrong ? { x: [-10, 10, -10, 10, 0] } : {}}
                  onClick={() => handleAnswer(emoji)}
                  className={`py-8 rounded-2xl text-7xl transition-all
                    ${isCorrect ? 'bg-green-400 ring-4 ring-green-500' : ''}
                    ${isWrong ? 'bg-red-200' : ''}
                    ${!isCorrect && !isWrong ? 'bg-white shadow-lg hover:shadow-xl' : ''}
                  `}
                >
                  {emoji}
                </motion.button>
              );
            })}
          </div>
        </div>
      )}

      <AnimatePresence>
        {showCorrect && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl"
          >
            🎉
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
