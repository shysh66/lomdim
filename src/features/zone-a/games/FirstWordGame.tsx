import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2, RotateCcw } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button, ProgressBar } from '@/components/ui';
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
  { word: 'פַּרְפַּר', emoji: '🦋' },
  { word: 'תּוּת', emoji: '🍓' },
  { word: 'עֲנָבִים', emoji: '🍇' },
  { word: 'מַכּוֹנִית', emoji: '🚗' },
  { word: 'אוֹטוֹבּוּס', emoji: '🚌' },
];

const WORDS_PER_STAGE = 5;

export const FirstWordGame = () => {
  const navigate = useNavigate();
  const { addXP } = useGame();
  const [stageWords, setStageWords] = useState<WordItem[]>([]);
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [options, setOptions] = useState<string[]>([]);
  const [showCorrect, setShowCorrect] = useState(false);
  const [disabledOptions, setDisabledOptions] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [stageComplete, setStageComplete] = useState(false);
  const [stageNumber, setStageNumber] = useState(1);

  const currentWord = stageWords[currentWordIndex];

  useEffect(() => {
    startNewStage();
  }, []);

  const startNewStage = () => {
    const shuffledWords = shuffleArray([...WORDS]);
    const selected = shuffledWords.slice(0, WORDS_PER_STAGE);
    setStageWords(selected);
    setCurrentWordIndex(0);
    setStageComplete(false);
    setupWord(selected[0]);
  };

  const setupWord = (word: WordItem) => {
    const otherEmojis = WORDS
      .filter(w => w.emoji !== word.emoji)
      .map(w => w.emoji);
    const wrongOptions = shuffleArray(otherEmojis).slice(0, 3);
    setOptions(shuffleArray([word.emoji, ...wrongOptions]));
    setShowCorrect(false);
    setDisabledOptions([]);

    setTimeout(() => {
      speak(word.word.replace(/[ַָּּּּ]/g, ''));
    }, 500);
  };

  const nextWord = () => {
    const nextIndex = currentWordIndex + 1;
    if (nextIndex >= stageWords.length) {
      setStageComplete(true);
      speak('כל הכבוד! סיימת את השלב!');
      addXP(30);
    } else {
      setCurrentWordIndex(nextIndex);
      setupWord(stageWords[nextIndex]);
    }
  };

  const handleAnswer = (emoji: string) => {
    if (!currentWord || disabledOptions.includes(emoji)) return;

    if (emoji === currentWord.emoji) {
      speak('נכון! יופי!');
      setShowCorrect(true);
      addXP(15, 'reading', true);
      setScore(score + 1);
      setTimeout(nextWord, 1500);
    } else {
      speak('נסה שוב');
      setDisabledOptions([...disabledOptions, emoji]);
      addXP(0, 'reading', false);
    }
  };

  const speakWord = () => {
    if (currentWord) {
      speak(currentWord.word.replace(/[ַָּּּּ]/g, ''));
    }
  };

  const handleRetryStage = () => {
    startNewStage();
  };

  const handleNextStage = () => {
    setStageNumber(stageNumber + 1);
    startNewStage();
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

      <div className="max-w-lg mx-auto mb-4">
        <div className="flex justify-between items-center text-purple-700 text-sm mb-2">
          <span>שלב {stageNumber}</span>
          <span>{currentWordIndex + 1} / {WORDS_PER_STAGE}</span>
        </div>
        <ProgressBar value={currentWordIndex} max={WORDS_PER_STAGE} color="purple" />
      </div>

      {currentWord && !stageComplete && (
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
              const isDisabled = disabledOptions.includes(emoji);

              return (
                <motion.button
                  key={emoji}
                  whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                  whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                  onClick={() => handleAnswer(emoji)}
                  disabled={isDisabled}
                  className={`py-8 rounded-2xl text-7xl transition-all
                    ${isCorrect ? 'bg-green-400 ring-4 ring-green-500' : ''}
                    ${isDisabled && !isCorrect ? 'bg-gray-200 opacity-40' : ''}
                    ${!isCorrect && !isDisabled ? 'bg-white shadow-lg hover:shadow-xl' : ''}
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
        {showCorrect && !stageComplete && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0 }}
            className="fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl pointer-events-none"
          >
            🎉
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {stageComplete && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              className="bg-white rounded-3xl p-8 text-center max-w-sm mx-4"
            >
              <span className="text-8xl block mb-4">🌟</span>
              <h2 className="text-3xl font-bold text-purple-800 mb-2">כל הכבוד!</h2>
              <p className="text-xl text-purple-600 mb-6">סיימת את שלב {stageNumber}!</p>
              
              <div className="flex flex-col gap-3">
                <Button variant="zone-a" size="lg" onClick={handleNextStage}>
                  שלב הבא 🚀
                </Button>
                <Button variant="secondary" size="lg" onClick={handleRetryStage}>
                  <RotateCcw size={20} className="ml-2" />
                  שחק שוב עם מילים חדשות
                </Button>
                <Button variant="secondary" size="md" onClick={() => navigate('/zone-a')}>
                  חזרה לתפריט
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
