import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Zap, Trophy } from 'lucide-react';
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

interface LevelConfig {
  name: string;
  description: string;
  maxNum: number;
  maxNum2?: number;
  operators: Operator[];
  questionsToPass: number;
}

const LEVELS: LevelConfig[] = [
  // Addition levels
  { name: 'חיבור 1', description: 'חיבור עד 5', maxNum: 5, operators: ['+'], questionsToPass: 5 },
  { name: 'חיבור 2', description: 'חיבור עד 10', maxNum: 10, operators: ['+'], questionsToPass: 6 },
  { name: 'חיבור 3', description: 'חיבור עד 20', maxNum: 20, operators: ['+'], questionsToPass: 7 },
  { name: 'חיבור 4', description: 'חיבור עד 50', maxNum: 50, operators: ['+'], questionsToPass: 8 },
  // Subtraction levels
  { name: 'חיסור 1', description: 'חיסור עד 5', maxNum: 5, operators: ['-'], questionsToPass: 5 },
  { name: 'חיסור 2', description: 'חיסור עד 10', maxNum: 10, operators: ['-'], questionsToPass: 6 },
  { name: 'חיסור 3', description: 'חיסור עד 20', maxNum: 20, operators: ['-'], questionsToPass: 7 },
  { name: 'חיסור 4', description: 'חיסור עד 50', maxNum: 50, operators: ['-'], questionsToPass: 8 },
  // Mixed addition & subtraction
  { name: 'מעורב 1', description: 'חיבור וחיסור עד 10', maxNum: 10, operators: ['+', '-'], questionsToPass: 8 },
  { name: 'מעורב 2', description: 'חיבור וחיסור עד 20', maxNum: 20, operators: ['+', '-'], questionsToPass: 8 },
  // Multiplication levels
  { name: 'כפל 1', description: 'לוח הכפל עד 2', maxNum: 2, maxNum2: 10, operators: ['×'], questionsToPass: 5 },
  { name: 'כפל 2', description: 'לוח הכפל עד 3', maxNum: 3, maxNum2: 10, operators: ['×'], questionsToPass: 6 },
  { name: 'כפל 3', description: 'לוח הכפל עד 5', maxNum: 5, maxNum2: 10, operators: ['×'], questionsToPass: 7 },
  { name: 'כפל 4', description: 'לוח הכפל עד 7', maxNum: 7, maxNum2: 10, operators: ['×'], questionsToPass: 8 },
  { name: 'כפל 5', description: 'לוח הכפל עד 10', maxNum: 10, maxNum2: 10, operators: ['×'], questionsToPass: 10 },
  // Division levels
  { name: 'חילוק 1', description: 'חילוק עד 2', maxNum: 2, maxNum2: 10, operators: ['÷'], questionsToPass: 5 },
  { name: 'חילוק 2', description: 'חילוק עד 5', maxNum: 5, maxNum2: 10, operators: ['÷'], questionsToPass: 6 },
  { name: 'חילוק 3', description: 'חילוק עד 10', maxNum: 10, maxNum2: 10, operators: ['÷'], questionsToPass: 8 },
  // Advanced mixed
  { name: 'אתגר 1', description: 'כל הפעולות עד 10', maxNum: 10, operators: ['+', '-', '×'], questionsToPass: 10 },
  { name: 'אתגר 2', description: 'כל הפעולות עד 20', maxNum: 20, maxNum2: 10, operators: ['+', '-', '×', '÷'], questionsToPass: 12 },
  { name: 'מאסטר', description: 'כל הפעולות - מומחה!', maxNum: 50, maxNum2: 12, operators: ['+', '-', '×', '÷'], questionsToPass: 15 },
];

const generateQuestion = (level: number): Question => {
  const config = LEVELS[Math.min(level, LEVELS.length - 1)];
  const operator = config.operators[getRandomInt(0, config.operators.length - 1)];
  const maxNum2 = config.maxNum2 || config.maxNum;
  let num1: number, num2: number, answer: number;

  switch (operator) {
    case '+':
      num1 = getRandomInt(1, config.maxNum);
      num2 = getRandomInt(1, maxNum2);
      answer = num1 + num2;
      break;
    case '-':
      answer = getRandomInt(0, config.maxNum);
      num2 = getRandomInt(1, Math.min(maxNum2, config.maxNum));
      num1 = answer + num2;
      break;
    case '×':
      num1 = getRandomInt(1, config.maxNum);
      num2 = getRandomInt(1, maxNum2);
      answer = num1 * num2;
      break;
    case '÷':
      num2 = getRandomInt(1, config.maxNum);
      answer = getRandomInt(1, maxNum2);
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
  const { addXP, unlockLevel, awardTrophy, currentProfile } = useGame();
  const [level, setLevel] = useState(0);
  const [question, setQuestion] = useState<Question | null>(null);
  const [options, setOptions] = useState<number[]>([]);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [correctInLevel, setCorrectInLevel] = useState(0);
  const [showLevelUp, setShowLevelUp] = useState(false);
  const [showLevelSelect, setShowLevelSelect] = useState(true);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [newTrophy, setNewTrophy] = useState<string | null>(null);

  const currentLevelConfig = LEVELS[level];
  const unlockedLevels = currentProfile?.unlockedLevels?.['math-challenge'] || [1];
  const maxUnlockedLevel = Math.max(...unlockedLevels);

  useEffect(() => {
    if (!showLevelSelect) {
      newQuestion();
    }
  }, [level, showLevelSelect]);

  const newQuestion = () => {
    const q = generateQuestion(level);
    setQuestion(q);
    setOptions(generateOptions(q.answer));
    setSelectedAnswer(null);
    setIsCorrect(null);
  };

  const startLevel = (selectedLevel: number) => {
    setLevel(selectedLevel);
    setCorrectInLevel(0);
    setShowLevelSelect(false);
  };

  const handleAnswer = (selected: number) => {
    if (!question || selectedAnswer !== null) return;
    
    setSelectedAnswer(selected);
    const correct = selected === question.answer;
    setIsCorrect(correct);

    if (correct) {
      const xp = 10 + Math.floor(level / 2) * 5 + streak * 2;
      addXP(xp, 'math', true);
      setScore(score + xp);
      setStreak(streak + 1);
      const newCorrectCount = correctInLevel + 1;
      setCorrectInLevel(newCorrectCount);

      // Check for streak trophies
      if (streak + 1 === 5) {
        const earned = awardTrophy('streak5');
        if (earned) setNewTrophy('streak5');
      } else if (streak + 1 === 10) {
        const earned = awardTrophy('streak10');
        if (earned) setNewTrophy('streak10');
      }

      // Check if level complete
      if (newCorrectCount >= currentLevelConfig.questionsToPass) {
        setTimeout(() => {
          // Award level-specific trophies
          if (level === 3) awardTrophy('addition-master');
          if (level === 7) awardTrophy('subtraction-master');
          if (level === 14) awardTrophy('multiplication-master');
          if (level === 17) awardTrophy('division-master');
          if (level === LEVELS.length - 1) {
            const earned = awardTrophy('math-legend');
            if (earned) setNewTrophy('math-legend');
          }
          
          if (level < LEVELS.length - 1) {
            unlockLevel('math-challenge', level + 2);
            setShowLevelUp(true);
          } else {
            setShowLevelSelect(true);
          }
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
    setCorrectInLevel(0);
    setShowLevelUp(false);
  };

  if (showLevelSelect) {
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
          <h1 className="text-2xl font-bold text-white">🔢 חשבון - בחר שלב</h1>
          <div className="flex items-center gap-2 bg-white/10 rounded-full px-4 py-2">
            <Trophy className="text-yellow-400" size={20} />
            <span className="font-bold text-white">{currentProfile?.trophies?.length || 0}</span>
          </div>
        </div>

        <div className="max-w-2xl mx-auto">
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
            {LEVELS.map((lvl, i) => {
              const isUnlocked = i < maxUnlockedLevel;
              const isCurrent = i === maxUnlockedLevel - 1;
              return (
                <motion.button
                  key={i}
                  whileHover={isUnlocked ? { scale: 1.05 } : undefined}
                  whileTap={isUnlocked ? { scale: 0.95 } : undefined}
                  onClick={() => isUnlocked && startLevel(i)}
                  disabled={!isUnlocked}
                  className={`p-3 rounded-xl text-center transition-all ${
                    isUnlocked 
                      ? isCurrent
                        ? 'bg-yellow-500 text-white ring-2 ring-yellow-300'
                        : 'bg-white/20 text-white hover:bg-white/30'
                      : 'bg-white/5 text-white/30 cursor-not-allowed'
                  }`}
                >
                  <span className="text-2xl block mb-1">
                    {isUnlocked ? (i < maxUnlockedLevel - 1 ? '⭐' : '🎯') : '🔒'}
                  </span>
                  <span className="text-xs font-bold block">{lvl.name}</span>
                  <span className="text-[10px] opacity-70 block">{lvl.description}</span>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>
    );
  }

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
          <span>שלב {level + 1}: {currentLevelConfig.name}</span>
          <span className="flex items-center gap-1">
            {streak > 0 && <span className="text-orange-400">🔥 {streak}</span>}
          </span>
        </div>
        <ProgressBar value={correctInLevel} max={currentLevelConfig.questionsToPass} color="blue" />
        <p className="text-white/40 text-xs text-center mt-1">
          {correctInLevel} / {currentLevelConfig.questionsToPass} תשובות נכונות
        </p>
      </div>

      {question && (
        <motion.div
          key={`${question.num1}-${question.num2}`}
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="max-w-md mx-auto"
        >
          <div className="bg-white/10 backdrop-blur rounded-3xl p-8 mb-6">
            <p className="text-6xl font-bold text-white text-center" dir="ltr">
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
              <h2 className="text-3xl font-bold text-white mb-2">שלב הושלם!</h2>
              <p className="text-xl text-white/80 mb-2">סיימת את {currentLevelConfig.name}</p>
              <p className="text-lg text-white/60 mb-6">שלב הבא: {LEVELS[level + 1]?.name}</p>
              <div className="flex gap-3 justify-center">
                <Button variant="secondary" size="lg" onClick={() => setShowLevelSelect(true)}>
                  בחירת שלב
                </Button>
                <Button variant="primary" size="lg" onClick={handleLevelUp}>
                  המשך!
                </Button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {newTrophy && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/70 flex items-center justify-center z-50"
            onClick={() => setNewTrophy(null)}
          >
            <motion.div
              initial={{ scale: 0, y: 50 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0, y: 50 }}
              className="bg-gradient-to-br from-amber-400 to-yellow-600 rounded-3xl p-8 text-center"
            >
              <motion.span 
                className="text-8xl block mb-4"
                animate={{ rotate: [0, -10, 10, -10, 0], scale: [1, 1.2, 1] }}
                transition={{ duration: 0.5 }}
              >
                🏆
              </motion.span>
              <h2 className="text-3xl font-bold text-white mb-2">גביע חדש!</h2>
              <p className="text-xl text-white/90 mb-6">קיבלת הישג חדש!</p>
              <Button variant="secondary" size="lg" onClick={() => setNewTrophy(null)}>
                יופי!
              </Button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
