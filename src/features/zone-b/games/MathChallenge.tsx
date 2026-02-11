import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Timer } from 'lucide-react';
import { useGame } from '@/contexts/GameContext';
import { Button, ProgressBar } from '@/components/ui';
import { getRandomInt, shuffleArray } from '@/lib/utils';

type Operator = '+' | '-' | '×' | '÷';

interface Question {
  num1: number;
  num2: number;
  operator: Operator;
  answer: number;
}

const LEVELS = [
  { name: 'קל', maxNum: 10, operators: ['+', '-'] as Operator[] },
  { name: 'בינוני', maxNum: 20, operators: ['+', '-'] as Operator[] },
  { name: 'כפל', maxNum: 10, operators: ['×'] as Operator[] },
  { name: 'חילוק', maxNum: 10, operators: ['÷'] as Operator[] },
  { name: 'מאתגר', maxNum: 100, operators: ['+', '-', '×'] as Operator[] },
];

const generateQuestion = (level: number): Question => {
  const config = LEVELS[Math.min(level, LEVELS.length - 1)];
  const operator = config.operators[getRandomInt(0, config.operators.length - 1)];
  let num1: number, num2: number, answer: number;

  switch (operator) {
    case '+':
      num1 = getRandomInt(1, config.maxNum);
      num2 = getRandomInt(1, config.maxNum);
      answer = num1 + num2;
      break;
    case '-':
      answer = getRandomInt(1, config.maxNum);
      num2 = getRandomInt(1, config.maxNum);
      num1 = answer + num2;
      break;
    case '×':
      num1 = getRandomInt(1, config.maxNum);
      num2 = getRandomInt(1, config.maxNum);
      answer = num1 * num2;
      break;
    case '÷':
      num2 = getRandomInt(1, config.maxNum);
      answer = getRandomInt(1, config.maxNum);
      num1 = num2 * answer;
      break;
    default:
      num1 = 1; num2 = 1; answer = 2;
  }

  return { num1, num2, operator, answer };
};

const generateOptions = (answer: number): number[] => {
  const options = new Set<number>([answer]);
  while (options.size < 4) {
    const offset = getRandomInt(-5, 5);
    const option = Math.max(0, answer + offset);
    if (option !== answer) options.add(option);
  }
  return shuffleArray([...options]);
};

export const MathChallenge = () => {
  const navigate = useNavigate();
  const { addXP, unlockLevel } = useGame();
  const [level, setLevel] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [questionsAnswered, setQuestionsAnswered] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    newQuestion();
  }, [level]);

  const newQuestion = () => {
    const q = generateQuestion(level);
    setQuestion(q);
    setOptions(generateOptions(q.answer));
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const handleAnswer = (selected: number) => {
    if (!question || selectedAnswer !== null) return;
    
    setSelectedAnswer(selected);
    const correct = selected === question.answer;
    setIsCorrect(correct);

    if (correct) {
      const xp = 10 + level * 5 + streak * 2;
      addXP(xp, 'math', true);
      setScore(score + xp);
      setStreak(streak + 1);
      setQuestionsAnswered(questionsAnswered + 1);

      if ((questionsAnswered + 1) % 5 === 0 && level < LEVELS.length - 1) {
        setTimeout(() => {
          setShowLevelUp(true);
          unlockLevel('math-challenge', level + 2);
        }, 500);
      } else {
        setTimeout(newQuestion, 1000);
      }
    } else {
      addXP(0, 'math', false);
      setStreak(0);
      setTimeout(newQuestion, 1500);
    }
  };

  const handleLevelUp = () => {
    setLevel(level + 1);
    setShowLevelUp(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-indigo-900 to-purple-900 p-6">
      <div className="flex justify-between items-center mb-6">
        <button
          onClick={() => navigate('/zone-b')}
          className="flex items-center gap-2 text-white/80 hover:text-white"
        >
          <ArrowRight size={24} />
          <span className="font-bold">חזרה</span>
        </button>
        <h1 className="text-2xl font-bold text-white">🔢 חשבון</h1>
        <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
          <Zap className="text-yellow-400" size={20} />
          <span className="font-bold text-white">{score}</span>
        </div>
      </div>

      <div className="max-w-md mx-auto mb-6">
        <div className="flex justify-between items-center text-white/60 text-sm mb-2">
          <span>שלב {level + 1}: {LEVELS[level].name}</span>
          <span className="flex items-center gap-1">
            {streak > 0 && <span className="text-orange-400">🔥 {streak}</span>}
          </span>
        </div>
        <ProgressBar value={questionsAnswered % 5} max={5} color="blue" />
      </div>

      {question && (
        <motion.div
          key={`${question.num1}-${question.num2}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-6">
            <p className="text-6xl font-bold text-white text-center">
              {question.num1} {question.operator} {question.num2} = ?
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {options.map((option) => {
              const isSelected = selectedAnswer === option;
              const showCorrect = isCorrect !== null && option === question.answer;
              const showWrong = isSelected && !isCorrect;

              return (
                <motion.button
                  key={option}
                  whileHover={selectedAnswer === null ? { scale: 1.05 } : undefined}
                  whileTap={selectedAnswer === null ? { scale: 0.95 } : undefined}
                  onClick={() => handleAnswer(option)}
                  disabled={selectedAnswer !== null}
                  className={`py-6 rounded-2xl text-3xl font-bold transition-all
                    ${showCorrect ? 'bg-green-500 text-white' : ''}
                    ${showWrong ? 'bg-red-500 text-white' : ''}
                    ${!showCorrect && !showWrong ? 'bg-white/20 text-white hover:bg-white/30' : ''}
                  `}
                >
                  {option}
                </motion.button>
              );
            })}
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {showLevelUp && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
          >
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              className="bg-gradient-to-br from-yellow-400 to-orange-500 rounded-3xl p-8 text-center"
            >
              <span className="text-8xl block mb-4">🎉</span>
              <h2 className="text-3xl font-bold text-white mb-2">שלב חדש!</h2>
              <p className="text-xl text-white/80 mb-6">עברת לשלב {level + 2}: {LEVELS[level + 1]?.name}</p>
              <Button variant="secondary" size="lg" onClick={handleLevelUp}>
                המשך!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
