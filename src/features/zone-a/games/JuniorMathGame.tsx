import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Volume2 } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button } from '@/components/ui';
import { speak, getRandomInt, shuffleArray } from '@/lib/utils';

const EMOJIS = ['🦕', '🐶', '⭐', '🎈', '🍎', '🌸'];

interface Question {
  num1: number;
  num2: number;
  operator: '+' | '-';
  answer: number;
  emoji: string;
}

const generateQuestion = (): Question => {
  const emoji = EMOJIS[getRandomInt(0, EMOJIS.length - 1)];
  const operator = Math.random() > 0.3 ? '+' : '-';
  let num1: number, num2: number, answer: number;

  if (operator === '+') {
    num1 = getRandomInt(1, 5);
    num2 = getRandomInt(1, 5);
    answer = num1 + num2;
  } else {
    answer = getRandomInt(1, 5);
    num2 = getRandomInt(1, answer);
    num1 = answer + num2;
    answer = num1 - num2;
  }

  return { num1, num2, operator, answer, emoji };
};

const generateOptions = (answer: number): number[] => {
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = getRandomInt(-3, 3);
    const option = Math.max(0, answer + offset);
    if (option !== answer) options.add(option);
  }
  return shuffleArray([...options]);
};

export const JuniorMathGame = () => {
  const navigate = useNavigate();
  const { addXP } = useGame();
  const [question, setQuestion] = useState<Question>(generateQuestion());
  const [options, setOptions] = useState<number[]>([]);
  const [errors, setErrors] = useState(0);
  const [disabledOptions, setDisabledOptions] = useState<number[]>([]);
  const [showHint, setShowHint] = useState(false);
  const [showCorrect, setShowCorrect] = useState(false);
  const [score, setScore] = useState(0);

  useEffect(() => {
    newQuestion();
  }, []);

  const newQuestion = () => {
    const q = generateQuestion();
    setQuestion(q);
    setOptions(generateOptions(q.answer));
    setErrors(0);
    setDisabledOptions([]);
    setShowHint(false);
    setShowCorrect(false);

    setTimeout(() => {
      const text = q.operator === '+' 
        ? `כמה זה ${q.num1} ועוד ${q.num2}?`
        : `כמה זה ${q.num1} פחות ${q.num2}?`;
      speak(text);
    }, 300);
  };

  const handleAnswer = (selected: number) => {
    if (disabledOptions.includes(selected)) return;
    
    if (selected === question.answer) {
      speak('נכון! כל הכבוד!');
      setShowCorrect(true);
      const xp = Math.max(10, 20 - errors * 5);
      addXP(xp, 'math', true);
      setScore(score + 1);
      setTimeout(newQuestion, 1500);
    } else {
      speak('נסה שוב');
      addXP(0, 'math', false);
      const newErrors = errors + 1;
      setErrors(newErrors);
      setDisabledOptions([...disabledOptions, selected]);

      if (newErrors >= 2) {
        setShowHint(true);
      }
    }
  };

  const speakQuestion = () => {
    const text = question.operator === '+' 
      ? `כמה זה ${question.num1} ועוד ${question.num2}?`
      : `כמה זה ${question.num1} פחות ${question.num2}?`;
    speak(text);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-200 to-indigo-300 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/zone-a')}
          className="flex items-center gap-2 text-blue-700"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-blue-800">🔢 חשבון לקטנטנים</h1>
        <div className="bg-white/50 rounded-full px-4 py-2">
          <span className="font-bold">{score} ⭐</span>
        </div>
      </div>

      <div className="max-w-lg mx-auto">
        <motion.div
          key={`${question.num1}-${question.num2}`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-3xl p-8 shadow-xl mb-8"
        >
          <button
            onClick={speakQuestion}
            className="absolute top-4 left-4 p-2 rounded-full hover:bg-gray-100"
          >
            <Volume2 size={24} className="text-blue-500" />
          </button>

          <div className="flex items-center justify-center gap-4 flex-wrap" dir="ltr">
            <div className="flex flex-col items-center">
              <div className={`flex flex-wrap justify-center gap-1 max-w-[120px] ${showHint ? 'animate-bounce' : ''}`}>
                {Array.from({ length: question.num1 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: i * 0.1 }}
                    className="text-4xl"
                  >
                    {question.emoji}
                  </motion.span>
                ))}
              </div>
              <span className="text-3xl font-bold mt-2">{question.num1}</span>
            </div>

            <span className="text-5xl font-bold text-blue-600">
              {question.operator === '+' ? '+' : '−'}
            </span>

            <div className="flex flex-col items-center">
              <div className={`flex flex-wrap justify-center gap-1 max-w-[120px] ${showHint ? 'animate-bounce' : ''}`}>
                {Array.from({ length: question.num2 }).map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: (question.num1 + i) * 0.1 }}
                    className="text-4xl"
                  >
                    {question.emoji}
                  </motion.span>
                ))}
              </div>
              <span className="text-3xl font-bold mt-2">{question.num2}</span>
            </div>

            <span className="text-5xl font-bold text-blue-600">=</span>
            <span className="text-5xl font-bold text-blue-600">?</span>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 gap-4">
          {options.map((option) => {
            const isDisabled = disabledOptions.includes(option);
            const isCorrect = showCorrect && option === question.answer;

            return (
              <motion.button
                key={option}
                whileHover={!isDisabled ? { scale: 1.05 } : undefined}
                whileTap={!isDisabled ? { scale: 0.95 } : undefined}
                onClick={() => !isDisabled && handleAnswer(option)}
                disabled={isDisabled}
                className={`py-6 rounded-2xl text-3xl font-bold transition-all
                  ${isCorrect ? 'bg-green-500 text-white' : ''}
                  ${isDisabled ? 'bg-gray-200 text-gray-400' : 'bg-white shadow-lg hover:shadow-xl'}
                `}
              >
                <span className="block">{option}</span>
                <div className="flex justify-center gap-0.5 mt-2">
                  {Array.from({ length: option }).map((_, i) => (
                    <span key={i} className="w-2 h-2 rounded-full bg-current opacity-50" />
                  ))}
                </div>
              </motion.button>
            );
          })}
        </div>
      </div>

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
